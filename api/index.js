require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const User = require('./models/Users');
const Playlist = require('./models/Playlist');
const Ads = require('./models/Ads');
const Request = require('./models/Request');
const AdsSchedule = require('./models/AdsSchedule');
const PlaylistSchedule = require('./models/PlaylistSchedule');
const ChangeLog = require('./models/Changelog');
const DeletedRequest = require('./models/DeletedRequest');
const sgMail = require('@sendgrid/mail')
const cron = require('node-cron');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const xlsx = require('xlsx');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');


const ObjectId = mongoose.Types.ObjectId;


const moment = require('moment-timezone');

const { verifyToken } = require('./middleware/authmiddleware');

app.use(express.json());
app.use(cors());
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
console.clear()

mongoose.connect(process.env.MONGO_URI, { dbName: 'GWData' })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const PORT = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, '../client/build')));

app.get(['/', '/home'], (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.wasm')) {
      res.setHeader('Content-Type', 'application/wasm');
    }
  }
}));
const checkFileExistence = async (fileName) => {
  const regex = new RegExp('^' + fileName + '$', 'i');  // Case insensitive search
  const playlistExists = await Playlist.findOne({ FileName: regex });
  const adsExists = await Ads.findOne({ FileName: regex });

  let foundIn = [];
  if (playlistExists) foundIn.push('Playlist');
  if (adsExists) foundIn.push('Ads');
  return foundIn;
};


const upload = multer(); // Initialize multer

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (file, folder) => {
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};

app.get('/playlists', async (req, res) => {
  try {
    const playlists = await Playlist.find({});

    const playlistSchedules = await PlaylistSchedule.find({});

    const scheduledItems = new Set(
      playlistSchedules.flatMap(schedule =>
        schedule.items
          .filter(item => item.FileID)  // Ensure FileID is defined
          .map(item => item.FileID.toString())
      )
    );

    const filteredPlaylists = playlists.filter(playlist => playlist._id && !scheduledItems.has(playlist._id.toString()));

    res.json(filteredPlaylists);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const folder = 'gwfolder/gwvideos';
    const fileUrl = await uploadFile(req.file, folder);
    res.status(200).send({ fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send({ error: 'Error uploading file' });
  }
});
// app.get('/ads', async (req, res) => {
//   try {
//     const ads = await Ads.find({});
//     const adsSchedules = await AdsSchedule.find({})
//     const scheduledItems = new Set(
//       adsSchedules.flatMap(schedule =>
//         schedule.items
//           .filter(item => item.FileID)  // Ensure FileID is defined
//           .map(item => item.FileID.toString())
//       )
//     )
//     const filteredAds = ads.filter(ads => ads._id && !scheduledItems.has(ads._id.toString()))
//     res.json(filteredAds);
//   } catch (err) {
//     console.error('Error fetching playlists:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });

app.get('/ads', async (req, res) => {
  try {
    const ads = await Ads.find({});
    res.json(ads);
  } catch (err) {
    console.error('Error fetching ads:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/mediaAll', async (req, res) => {
  try {
    const { type } = req.query;

    if (type === 'Playlist Schedule') {
      const playlists = await Playlist.find({});
      res.json(playlists);
    } else if (type === 'Ads Schedule') {
      const ads = await Ads.find({});
      res.json(ads);
    } else {
      res.status(400).send('Invalid type parameter');
    }
  } catch (err) {
    console.error('Error fetching media:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/adsSchedule', async (req, res) => {
  try {
    const adsSchedule = await AdsSchedule.find({});
    res.json(adsSchedule);
  } catch (err) {
    console.error('Error fetching adsSchedule:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/playlistSchedule', async (req, res) => {
  try {
    const playlistSchedule = await PlaylistSchedule.find({});
    res.json(playlistSchedule);
  } catch (err) {
    console.error('Error fetching playlistSchedule:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/createPlaylistSchedule', verifyToken, async (req, res) => {
  const { items, startDate, endDate, startTime, endTime, notes } = req.body;



  // Validate no overlapping time slots
  if (startTime >= endTime) {
    return res.status(400).json({ message: 'Start time must be earlier than end time.' });
  }

  const itemsFileNamesAndIDs = items.map(item => ({ FileName: item.FileName, FileID: item.FileID }));

  try {
    // Improved folder number calculation
    const latestSchedule = await PlaylistSchedule.findOne().sort({ folder: -1 }).exec();
    const folderNumber = latestSchedule ? latestSchedule.folder + 1 : 1;

    const newPlaylistSchedule = new PlaylistSchedule({
      folder: folderNumber,
      items: itemsFileNamesAndIDs,
      startDate,
      endDate,
      startTime,
      endTime,
      notes
    });

    const savedSchedule = await newPlaylistSchedule.save();

    res.status(201).json(savedSchedule);
  } catch (err) {
    console.error('Error saving new playlist schedule:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/playlistSchedule/:folder', verifyToken, async (req, res) => {
  const { folder } = req.params;
  try {
    const playlistSchedule = await PlaylistSchedule.findOne({ folder });
    if (!playlistSchedule) {
      return res.status(404).json({ message: 'Playlist schedule not found' });
    }
    res.json(playlistSchedule);
  } catch (error) {
    console.error('Error retrieving playlist schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/createAdsSchedule', verifyToken, async (req, res) => {
  const { items, startDate, endDate, startTime, endTime, notes } = req.body;


  if (startTime >= endTime) {
    return res.status(400).json({ message: 'Start time must be earlier than end time.' });
  }

  const itemsFileNamesAndIDs = items.map(item => ({ FileName: item.FileName, FileID: item.FileID }));

  try {
    const latestSchedule = await AdsSchedule.findOne().sort({ folder: -1 }).exec();
    const folderNumber = latestSchedule ? latestSchedule.folder + 1 : 1;
    const newAdsSchedule = new AdsSchedule({
      folder: folderNumber,
      items: itemsFileNamesAndIDs,
      startDate,
      endDate,
      startTime,
      endTime,
      notes
    });
    const savedSchedule = await newAdsSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    console.error('Error saving new ads schedule:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/adsSchedule/:folder', verifyToken, async (req, res) => {
  const { folder } = req.params;
  try {
    const adsSchedule = await AdsSchedule.findOne({ folder });
    if (!adsSchedule) {
      return res.status(404).json({ message: 'Ads schedule not found' });
    }
    res.json(adsSchedule);
  } catch (error) {
    console.error('Error retrieving Ads schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/uploadPlaylist', verifyToken, async (req, res) => {
  const { FileName, PhotoUrl, videoUrl, Type, Tag, Run_Time, Content, Expiry, notes, generalData, videoData, audioData } = req.body;
  console.log('req body', req.body)
  const foundIn = await checkFileExistence(FileName);
  if (foundIn.length > 0) {
    return res.status(400).json({ message: `File name already exists in ${foundIn.join(', ')}.` });
  }

  const newPlaylistItem = new Playlist({
    FileName,
    PhotoUrl,
    videoUrl,
    Type,
    Tag,
    Run_Time,
    Content,
    Expiry,
    notes,
    generalData,
    videoData,
    audioData,
  });

  try {
    const savedItem = await newPlaylistItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error saving new playlist item:', err);
    res.status(500).send('Internal Server Error');
  }
});





app.post('/uploadAds', verifyToken, async (req, res) => {
  const { FileName, PhotoUrl,videoUrl, Type, Tag, Run_Time, Content, Expiry, notes, generalData, videoData, audioData } = req.body;

  const foundIn = await checkFileExistence(FileName);
  if (foundIn.length > 0) {
    return res.status(400).json({ message: `File name already exists in ${foundIn.join(', ')}.` });
  }

  const newAdsItem = new Ads({
    FileName,
    videoUrl,
    PhotoUrl,
    Type,
    Tag,
    Run_Time,
    Content,
    Expiry,
    notes,
    generalData,
    videoData,
    audioData,
  });

  try {
    const savedItem = await newAdsItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error saving new playlist item:', err);
    res.status(500).send('Internal Server Error');
  }
});



app.get('/fileDetails/:fileName', verifyToken, async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const fileDetails = await Playlist.findOne({ FileName: fileName });
    if (!fileDetails) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.status(200).json(fileDetails);
  } catch (error) {
    console.error('Error fetching file details:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.post('/register', async (req, res) => {
  const { username, password, isAdmin, userCompany, Email } = req.body;

  // Validate input
  if (!username || !password || !userCompany) {
    return res.status(400).json({ message: 'Username, password, and company are required' });
  }
  if (typeof isAdmin !== 'boolean') {
    return res.status(400).json({ message: 'Invalid user role specified' });
  }
  if (!Email || !Array.isArray(Email) || Email.some(email => typeof email !== 'string')) {
    return res.status(400).json({ message: 'Invalid or missing email list' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      isAdmin,
      userCompany,
      Email  // Make sure your User model in Mongoose supports this field
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id, role: isAdmin ? 'Admin' : 'User' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});


app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password, isAdmin, userCompany } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(userId, {
      username,
      password: hashedPassword,
      isAdmin,
      userCompany,
    });

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});


const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

app.delete('/deleteData/:category/:fileName', verifyToken, async (req, res) => {
  const { category, fileName } = req.params;

  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
  };

  const Model = categoryModelMap[category.toLowerCase()];

  if (!Model) {
    return res.status(404).send({ error: 'Category not found' });
  }

  try {
    const escapedFileName = escapeRegExp(fileName);
    const regex = new RegExp(`^${escapedFileName}$`, 'i');

    const document = await Model.findOne({ FileName: regex });
    if (!document) {
      return res.status(404).send({ error: 'File not found' });
    }


    const urlsToDelete = [];
    if (document.videoUrl) {
      urlsToDelete.push(document.videoUrl);
    }
    if (document.PhotoUrl) {
      urlsToDelete.push(document.PhotoUrl);
    }
    console.log('document deleted successfully = ', document);

    for (const url of urlsToDelete) {
      const fileKey = decodeURIComponent(url.split('.com/')[1]); // Extract the key after the bucket URL
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileKey,
      };
      const command = new DeleteObjectCommand(params);
      await s3Client.send(command);
    }
    const deletedDocument = await Model.findOneAndDelete({ FileName: regex });
    res.send({ message: 'File deleted successfully', deletedDocument });
  } catch (error) {
    console.error(`Error deleting file in ${category}:`, error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/setExpiry/:category/:fileName', verifyToken, async (req, res) => {
  const { category, fileName } = req.params;
  const { newExpiryDate } = req.body;

  if (!newExpiryDate) {
    return res.status(400).send({ error: 'New expiry date is required.' });
  }

  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
  };

  const Model = categoryModelMap[category.toLowerCase()];
  if (!Model) {
    return res.status(404).send({ error: 'Category not found' });
  }

  try {
    const regex = new RegExp('^' + fileName + '$', 'i'); // 'i' makes it case-insensitive
    const updatedDocument = await Model.findOneAndUpdate(
      { FileName: regex },
      { $set: { Expiry: new Date(newExpiryDate) } },
      { new: true }
    );

    if (!updatedDocument) {
      return res.status(404).send({ error: 'File not found' });
    }

    res.json({
      message: 'Expiry date set successfully',
      fileName: fileName,
      newExpiryDate: updatedDocument.Expiry
    });
  } catch (error) {
    console.error(`Error setting expiry date for file in ${category}:`, error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('Username does not exist, please try again!');
    }



    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send('Incorrect password, please try again!');
    }

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token, message: 'Login successful', isAdmin: user.isAdmin, userCompany: user.userCompany });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/verifyToken', verifyToken, (req, res) => {
  res.status(200).send(req.user);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//notes for files
app.post('/notes/add/:category/:identifier', verifyToken, async (req, res) => {
  const { category, identifier } = req.params;
  const { text, addedOn, user } = req.body;

  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
    playlistschedule: PlaylistSchedule,
    adsschedule: AdsSchedule
  };

  const queryField = ['playlistschedule', 'adsschedule'].includes(category.toLowerCase()) ? 'folder' : 'FileName';
  const Model = categoryModelMap[category.toLowerCase()];

  if (!Model) {
    return res.status(404).json({ error: 'Category not found' });
  }

  let queryCondition;
  if (queryField === 'folder') {
    const folderId = parseInt(identifier); // Parse identifier as number if it's meant to be a folder
    if (isNaN(folderId)) {
      return res.status(400).json({ error: 'Folder identifier must be a number' });
    }
    queryCondition = { folder: folderId };
  } else {
    queryCondition = { FileName: { $regex: new RegExp(`^${identifier}$`, 'i') } }; // Use regex for string matching on FileName
  }

  try {
    const result = await Model.findOneAndUpdate(
      queryCondition,
      { $push: { notes: { text, addedOn: new Date(addedOn), user } } },
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Entity not found' });
    }

    res.status(200).json({ message: 'Note added successfully', data: result });
  } catch (error) {
    console.error('Failed to add note:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
});

app.put('/notes/update/:category/:identifier', verifyToken, async (req, res) => {
  const { category, identifier } = req.params;
  const { noteIndex, updatedText } = req.body;

  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
    playlistschedule: PlaylistSchedule,
    adsschedule: AdsSchedule
  };
  const queryField = ['playlistschedule', 'adsschedule'].includes(category.toLowerCase()) ? 'folder' : 'FileName';

  const Model = categoryModelMap[category.toLowerCase()];
  if (!Model) {
    return res.status(404).json({ error: 'Category not found' });
  }

  if (noteIndex === undefined || updatedText === undefined) {
    return res.status(400).json({ error: 'Note index and updated text are required' });
  }

  let queryCondition;
  if (queryField === 'folder') {
    const folderId = parseInt(identifier);
    if (isNaN(folderId)) {
      return res.status(400).json({ error: 'Folder identifier must be a number' });
    }
    queryCondition = { folder: folderId };
  } else {
    queryCondition = { FileName: { $regex: new RegExp(`^${identifier}$`, 'i') } };
  }

  try {
    const document = await Model.findOne(queryCondition);
    if (!document) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    if (noteIndex < 0 || noteIndex >= document.notes.length) {
      return res.status(404).json({ error: 'Note not found at the provided index' });
    }

    // Update the text and the added on date of the specific note
    document.notes[noteIndex].text = updatedText;
    document.notes[noteIndex].addedOn = new Date();

    await document.save();

    res.status(200).json({ message: 'Note updated successfully', data: document.notes[noteIndex] });
  } catch (error) {
    console.error('Failed to update note:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
});

app.delete('/notes/delete/:category/:identifier/:noteIndex', verifyToken, async (req, res) => {
  const { category, identifier, noteIndex } = req.params;
  const index = parseInt(noteIndex, 10);  // Convert noteIndex to integer

  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
    playlistschedule: PlaylistSchedule,
    adsschedule: AdsSchedule
  };
  const queryField = ['playlistschedule', 'adsschedule'].includes(category.toLowerCase()) ? 'folder' : 'FileName';

  const Model = categoryModelMap[category.toLowerCase()];
  if (!Model) {
    return res.status(404).json({ error: 'Category not found' });
  }

  let queryCondition;
  if (queryField === 'folder') {
    const folderId = parseInt(identifier);  // Ensure the identifier is a number if it's a folder
    if (isNaN(folderId)) {
      return res.status(400).json({ error: 'Folder identifier must be a number' });
    }
    queryCondition = { folder: folderId };
  } else {
    queryCondition = { FileName: { $regex: new RegExp(`^${identifier}$`, 'i') } };  // Use regex for file names
  }

  try {
    const document = await Model.findOne(queryCondition);
    if (!document) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    if (index >= 0 && index < document.notes.length) {
      document.notes.splice(index, 1);  // Remove the note at the specified index
      await document.save();
      res.status(200).json({ message: 'Note deleted successfully', data: document.notes });
    } else {
      return res.status(404).json({ error: 'Note index out of range' });
    }
  } catch (error) {
    console.error('Failed to delete note:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
});

app.get('/notes/:category/:identifier', verifyToken, async (req, res) => {
  const { category, identifier } = req.params;
  const Model = { 'playlist': Playlist, 'ads': Ads }[category.toLowerCase()];
  const queryField = ['playlist', 'ads'].includes(category.toLowerCase()) ? 'FileName' : 'folder';


  if (!Model) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const document = await Model.findOne({ [queryField]: new RegExp(`^${identifier}$`, 'i') });
    if (!document) {
      return res.status(404).json({ error: `${queryField} not found` });
    }
    res.json(document.notes || []);
  } catch (error) {
    console.error(`Failed to fetch notes for file: ${identifier} in category: ${category}`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//folder backend alters
const getModel = (scheduleType) => {
  return scheduleType === 'playlistSchedule' ? PlaylistSchedule : AdsSchedule;
};
app.get('/:scheduleType/:folder', async (req, res) => {
  try {
    const { scheduleType, folder } = req.params;

    let result;
    if (scheduleType === 'Playlist Schedule') {
      result = await Playlist.findOne({ folder });
    } else if (scheduleType === 'Ads Schedule') {
      result = await Ads.findOne({ folder });
    } else {
      return res.status(400).send('Invalid scheduleType parameter');
    }

    if (!result) {
      return res.status(404).send('Folder not found');
    }

    res.json(result.items); // assuming each schedule has an 'items' field that contains the list of items
  } catch (err) {
    console.error('Error fetching media:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/:scheduleType/:folder/add', verifyToken, async (req, res) => {
  const { scheduleType, folder } = req.params;
  const { item } = req.body;

  if (!item) {
    return res.status(400).json({ message: 'Item is required' });
  }



  const Model = getModel(scheduleType);

  try {
    const schedule = await Model.findOne({ folder });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    schedule.items.push(item);
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    console.error(`Error adding item to ${scheduleType} schedule:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/:scheduleType/:folder/:item', verifyToken, async (req, res) => {
  const { scheduleType, folder, item } = req.params;
  const Model = getModel(scheduleType);
  try {
    const decodedItem = JSON.parse(decodeURIComponent(item)); // Parse the item to JSON object
    console.log('Decoded item:', decodedItem);
    const schedule = await Model.findOne({ folder });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    schedule.items = schedule.items.filter(i => i.FileID.toString() !== decodedItem.FileID);
    await schedule.save();
    res.json(schedule);
  } catch (error) {
    console.error(`Error deleting item from ${scheduleType} schedule:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }

});

app.post('/:scheduleType/:folder/move', verifyToken, async (req, res) => {
  const { scheduleType, folder } = req.params;
  const { item, newIndex } = req.body;

  if (!item || newIndex === undefined) {
    return res.status(400).json({ message: 'Item and new index are required' });
  }

  const Model = getModel(scheduleType);
  if (!Model) {
    return res.status(400).json({ message: 'Invalid schedule type' });
  }

  try {
    const schedule = await Model.findOne({ folder });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const index = schedule.items.findIndex(i => i.FileID.toString() === item.FileID.toString());
    if (index === -1) {
      return res.status(404).json({ message: 'Item not found in the schedule' });
    }

    const [movedItem] = schedule.items.splice(index, 1); // Remove the item from its current position
    schedule.items.splice(newIndex, 0, movedItem); // Insert the item at the new position

    await schedule.save();

    res.json(schedule);
  } catch (error) {
    console.error(`Error moving item in ${scheduleType} schedule:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.delete('/set/schedules/:scheduleType/:folder', verifyToken, async (req, res) => {
  const { scheduleType, folder } = req.params;
  const Model = getModel(scheduleType);

  if (!Model) {
    return res.status(400).json({ message: 'Category not found' });
  }

  try {
    const deletedSchedule = await Model.findOneAndDelete({ folder });
    if (!deletedSchedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully', deletedSchedule });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/:scheduleType/:folder/update', verifyToken, async (req, res) => {
  const { scheduleType, folder } = req.params;
  const { startDate, endDate, startTime, endTime } = req.body;

  const Model = getModel(scheduleType); // Utility function to get the model based on scheduleType
  if (!Model) {
    return res.status(400).json({ message: 'Invalid schedule type' });
  }

  try {
    const schedule = await Model.findOne({ folder });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    if (startDate) schedule.startDate = startDate;
    if (endDate) schedule.endDate = endDate;
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;

    await schedule.save();

    res.json(schedule);
  } catch (error) {
    console.error(`Error updating ${scheduleType} schedule:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//need to edit
app.put('/:scheduleType/:scheduleId/items/:itemId', verifyToken, async (req, res) => {
  const { scheduleType, scheduleId, itemId } = req.params;
  const { startTime, endTime } = req.body;

  const Model = getModel(scheduleType);

  if (!Model) {
    return res.status(400).json({ message: 'Invalid schedule type' });
  }

  try {
    const schedule = await Model.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const item = schedule.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.startTime = startTime;
    item.endTime = endTime;
    await schedule.save();


    res.json({ message: 'Item updated successfully', schedule });

  } catch (error) {
    console.error(`Error checking item in ${scheduleType} schedule:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



//requests
app.post('/request', verifyToken, async (req, res) => {
  const { description, username } = req.body;

  if (!description || !username) {
    return res.status(400).json({ message: 'Description and username are required' });
  }

  try {
    const newRequest = new Request({
      description,
      user: username, // Store the username provided in the request
    });

    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//need to view all request data
app.get('/requests', verifyToken, async (req, res) => {
  try {
    const requests = await Request.find({});
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//updating status
app.put('/requests/:id/status', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const updatedRequest = await Request.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//need to be able to delete the request
app.delete('/requests/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {

    // Convert the ID to ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    const objectId = new ObjectId(id);
    const deletedRequest = await Request.findByIdAndDelete(objectId);
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Log the deletion in the DeletedRequest model
    const logDeletion = new DeletedRequest({
      originalRequestId: objectId,
      description: deletedRequest.description,
      user: deletedRequest.user,
      deletedAt: new Date() // Explicitly set to today's date
    });
    await logDeletion.save();


    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



//changelog
app.post('/changelog', async (req, res) => {
  try {
    const { user, message } = req.body;

    if (!message) {
      return res.status(400).send('Message is required');
    }

    if (!message) {
      return res.status(400).send('User is required')
    }

    const changeLog = new ChangeLog({ user, message });
    await changeLog.save();

    res.status(201).send(changeLog);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const sendChangeLogEmail = async () => {
  try {
    // Get the current time in the 'America/New_York' timezone
    const now = moment.tz('America/New_York');

    // Calculate the start of the interval as 45 minutes ago from now
    const startOfInterval = now.clone().subtract(30, 'minutes').toDate();
    const endOfInterval = now.toDate(); // Current time

    // Fetch change logs for the past 45 minutes
    const logs = await ChangeLog.find({
      timestamp: { $gte: startOfInterval, $lt: endOfInterval }
    });

    if (logs.length === 0) {
      console.log('No change logs to send.');
      return;
    }

    // Get current date for the email subject
    const currentDate = now.format('YYYY-MM-DD');

    // Helper function to format date
    const formatDate = (date) => {
      return moment(date).tz('America/New_York').format('YYYY-MM-DD');
    };

    // Helper function to format time
    const formatTime = (date) => {
      return moment(date).tz('America/New_York').format('hh:mm A');
    };

    // Group logs by user
    const groupedLogs = logs.reduce((acc, log) => {
      acc[log.user] = acc[log.user] || [];
      acc[log.user].push(log);
      return acc;
    }, {});

    // Generate a separate table for each user
    const emailBody = Object.keys(groupedLogs).map(user => {
      const userLogs = groupedLogs[user];
      return `
        <h3>Logs for ${user}</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Message</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${userLogs.map(log => `
              <tr>
                <td>${log.user}</td>
                <td>${formatDate(log.timestamp)}</td>
                <td>${log.message}</td>
                <td>${formatTime(log.timestamp)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }).join('<br>');  // Separate each table with a line break for clarity in the email

    const wbOpts = { bookType: 'xlsx', type: 'base64' };
    const attachments = Object.keys(groupedLogs).map(user => {
      const userLogs = groupedLogs[user];
      const wb = xlsx.utils.book_new();
      const wsData = [
        ["User", "Date", "Message", "Time"],
        ...userLogs.map(log => [
          log.user,
          formatDate(log.timestamp),
          log.message,
          formatTime(log.timestamp)
        ])
      ];
      const ws = xlsx.utils.aoa_to_sheet(wsData);
      xlsx.utils.book_append_sheet(wb, ws, user);

      // Generate the Excel file in memory and convert to base64
      const base64Excel = xlsx.write(wb, wbOpts);

      return {
        content: base64Excel,
        filename: `${user}.xlsx`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: 'attachment'
      };
    });

    const recipients = ['tom@commersive.ca', 'remi@commersive.ca', 'richard@commersive.ca'];
    const msg = {
      to: recipients,
      from: process.env.EMAIL_USERNAME,
      subject: `Change Log - ${currentDate} (${formatTime(startOfInterval)} - ${formatTime(endOfInterval)})`,
      text: logs.map(log => `User: ${log.user}\nDate: ${formatDate(log.timestamp)}\nMessage: ${log.message}\nTime: ${formatTime(log.timestamp)}`).join('\n\n'),
      html: emailBody,
      attachments: attachments
    };

    // Send email
    await sgMail.send(msg);
    console.log('Change log email sent successfully.');
  } catch (error) {
    console.error('Error sending change log email:', error);
  }
};

const sendDeletionLogEmailDaily = async () => {
  try {
    // Get the current date in the 'America/New_York' timezone
    const now = moment.tz('America/New_York');

    // Set start and end of the day
    const startOfDay = now.clone().startOf('day').toDate();
    const endOfDay = now.clone().endOf('day').toDate();

    // Fetch deleted requests for the current day
    const deletedRequests = await DeletedRequest.find({
      deletedAt: { $gte: startOfDay, $lt: endOfDay }
    });

    if (deletedRequests.length === 0) {
      console.log('No deleted requests to send.');
      return;
    }

    // Group deleted requests by user string
    const groupedRequests = deletedRequests.reduce((acc, request) => {
      const user = request.user; // 'user' is a string here
      acc[user] = acc[user] || [];
      acc[user].push(request);
      return acc;
    }, {});

    // Array of emails to be CC'd (extracted from the image)
    const ccEmails = ['richard@commersive.ca', 'tom@commersive.ca', 'remi@commersive.ca'];

    // Send an email for each user
    for (let user in groupedRequests) {
      const userRequests = groupedRequests[user];

      // Assume we have some method to resolve email from username
      const userEmail = await getEmailFromUsername(user); // Implement this function based on your application's logic

      const emailBody = `
      <p>Dear ${user},</p>
      <p>The following requests have been completed:</p>
      <ul>
        ${userRequests.map(req => `<li>${req.description} - Completed on ${moment(req.deletedAt).tz('America/New_York').format('YYYY-MM-DD hh:mm A')}</li>`).join('')}
      </ul>
      <br>
      <br>
      <img src="https://samqr.s3.ca-central-1.amazonaws.com/Commersive+Logo+2023+LIGHT.png" alt="Commersive Solutions Logo" style="width: 400px; height: auto;">
      <br>
    `;

      const msg = {
        to: userEmail, // Assuming getEmailFromUsername resolves to the correct email
        cc: ccEmails, // Adding the CC emails here
        from: process.env.EMAIL_USERNAME, // Your email registered with SendGrid
        subject: `Completed Requests Notification - ${moment().format('YYYY-MM-DD')}`,
        html: emailBody
      };

      await sgMail.send(msg);
      console.log(`Deletion log email sent to ${user} successfully.`);
    }
  } catch (error) {
    console.error('Error sending deletion log email:', error);
  }
};

async function getEmailFromUsername(username) {
  // Mock-up function: Fetch the user's email by username from your database or configuration
  const user = await User.findOne({ username: username });
  return user?.Email || []; // Return an array of emails or an empty array
}
const sendDailySummaryEmail = async () => {
  try {
    // Get the current time in the 'America/New_York' timezone
    const now = moment.tz('America/New_York');

    // Calculate the start and end of the current day
    const startOfDay = now.clone().startOf('day').toDate();
    const endOfDay = now.toDate(); // Current time

    // Fetch change logs for the entire day
    const logs = await ChangeLog.find({
      timestamp: { $gte: startOfDay, $lt: endOfDay }
    });

    // Fetch expiry dates from AdsSchedule and PlaylistSchedule
    const adsSchedules = await AdsSchedule.find({});
    const playlistSchedules = await PlaylistSchedule.find({});

    if (logs.length === 0 && adsSchedules.length === 0 && playlistSchedules.length === 0) {
      console.log('No logs or expiry dates to send.');
      return;
    }

    // Get current date for the email subject
    const currentDate = now.format('YYYY-MM-DD');

    // Helper function to format date and handle missing or invalid dates
    const formatDate = (date) => {
      if (!date) return null;
      const momentDate = moment(date);
      return momentDate.isValid() ? momentDate.tz('America/New_York').format('YYYY-MM-DD') : null;
    };

    // Helper function to format time
    const formatTime = (date) => {
      return moment(date).tz('America/New_York').format('hh:mm A');
    };

    // Group logs by user
    const groupedLogs = logs.reduce((acc, log) => {
      acc[log.user] = acc[log.user] || [];
      acc[log.user].push(log);
      return acc;
    }, {});

    // Prepare attachments array
    const attachments = [];

    // Generate a separate workbook for each user's logs
    Object.keys(groupedLogs).forEach(user => {
      const userLogs = groupedLogs[user];

      // Create Excel sheet for user logs
      const wsData = [
        ["User", "Date", "Message", "Time"],
        ...userLogs.map(log => [
          log.user,
          formatDate(log.timestamp),
          log.message,
          formatTime(log.timestamp)
        ])
      ];

      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet(wsData);
      xlsx.utils.book_append_sheet(wb, ws, `Logs_${user}`);

      // Generate the Excel file in memory and convert to base64
      const wbOpts = { bookType: 'xlsx', type: 'base64' };
      const base64Excel = xlsx.write(wb, wbOpts);

      // Add to attachments
      attachments.push({
        content: base64Excel,
        filename: `Logs_${user}_${currentDate}.xlsx`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: 'attachment'
      });
    });

    // Generate expiry date details, excluding those with no expiry date, and consolidate duplicates
    const expiryDetails = [];

    adsSchedules.forEach(schedule => {
      schedule.items.forEach((item, itemIndex) => {
        const formattedDate = formatDate(item.Expiry);
        if (formattedDate) {
          expiryDetails.push({
            Type: 'AdsSchedule',
            Folder: schedule.folder,
            Position: itemIndex + 1,
            FileName: item.FileName,
            Expiry: formattedDate
          });
        }
      });
    });

    playlistSchedules.forEach(schedule => {
      schedule.items.forEach((item, itemIndex) => {
        const formattedDate = formatDate(item.Expiry);
        if (formattedDate) {
          expiryDetails.push({
            Type: 'PlaylistSchedule',
            Folder: schedule.folder,
            Position: itemIndex + 1,
            FileName: item.FileName,
            Expiry: formattedDate
          });
        }
      });
    });

    // Consolidate duplicate entries by FileName
    const consolidatedExpiryDetails = expiryDetails.reduce((acc, detail) => {
      if (!acc[detail.FileName]) {
        acc[detail.FileName] = {
          Type: detail.Type,
          FileName: detail.FileName,
          Expiry: detail.Expiry,
          Folders: [],
          Positions: []
        };
      }
      acc[detail.FileName].Folders.push(`Folder ${detail.Folder}`);
      acc[detail.FileName].Positions.push(`Folder ${detail.Folder} - position ${detail.Position}`);
      return acc;
    }, {});

    const finalExpiryDetails = Object.values(consolidatedExpiryDetails).map(detail => ({
      Type: detail.Type,
      FileName: detail.FileName,
      Expiry: detail.Expiry,
      Folders: detail.Folders.join(', '),
      Positions: detail.Positions.join(', ')
    }));

    if (finalExpiryDetails.length > 0) {
      const wsExpiryData = [
        ["Type", "File Name", "Expiry Date", "Folders", "Positions"],
        ...finalExpiryDetails.map(detail => [
          detail.Type,
          detail.FileName,
          detail.Expiry,
          detail.Folders,
          detail.Positions
        ])
      ];

      const wbExpiry = xlsx.utils.book_new();
      const wsExpiry = xlsx.utils.aoa_to_sheet(wsExpiryData);
      xlsx.utils.book_append_sheet(wbExpiry, wsExpiry, "ExpiryDates");

      // Generate the Excel file in memory and convert to base64
      const base64ExcelExpiry = xlsx.write(wbExpiry, { bookType: 'xlsx', type: 'base64' });

      // Add to attachments
      attachments.push({
        content: base64ExcelExpiry,
        filename: `ExpiryDates_${currentDate}.xlsx`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        disposition: 'attachment'
      });
    }

    // Create the email content with log tables and expiry table
    const logTables = Object.keys(groupedLogs).map(user => {
      const userLogs = groupedLogs[user];
      return `
        <h3>Logs for ${user}</h3>
        <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Message</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${userLogs.map(log => `
              <tr>
                <td>${log.user}</td>
                <td>${formatDate(log.timestamp)}</td>
                <td>${log.message}</td>
                <td>${formatTime(log.timestamp)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }).join('<br>');  // Separate each table with a line break for clarity in the email

    const expiryTable = finalExpiryDetails.length > 0 ? `
      <h3>Expiry Dates</h3>
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>Type</th>
            <th>File Name</th>
            <th>Expiry Date</th>
            <th>Folders</th>
            <th>Positions</th>
          </tr>
        </thead>
        <tbody>
          ${finalExpiryDetails.map(detail => `
            <tr>
              <td>${detail.Type}</td>
              <td>${detail.FileName}</td>
              <td>${detail.Expiry}</td>
              <td>${detail.Folders}</td>
              <td>${detail.Positions}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '';

    // Create the email message
    const recipients = ['tom@commersive.ca', 'remi@commersive.ca', 'richard@commersive.ca'];
    const msg = {
      to: recipients,
      from: process.env.EMAIL_USERNAME,
      subject: `Daily Change Log Summary - ${currentDate}`,
      html: logTables + '<br>' + expiryTable,
      attachments: attachments
    };

    // Send email
    await sgMail.send(msg);
    console.log('Daily summary email sent successfully.');
  } catch (error) {
    console.error('Error sending daily summary email:', error);
  }
};


const sendPlaylistsAndAdsSchedulesDaily = async () => {
  try {
    // Get the current date in the 'America/New_York' timezone
    const now = moment.tz('America/New_York');
    const currentDate = now.format('YYYY-MM-DD');

    // Fetch PlaylistSchedule and AdsSchedule
    const playlistSchedules = await PlaylistSchedule.find({});
    const adsSchedules = await AdsSchedule.find({});
    // Helper function to format date and handle invalid dates
    const formatDate = (date) => {
      if (!date) return ''; // Return blank if date is null or doesn't exist
      const momentDate = moment(date);
      return momentDate.isValid() ? momentDate.tz('America/New_York').format('YYYY-MM-DD') : ''; // Return blank if date is invalid
    };
    // Prepare data for PlaylistSchedule Excel sheet
    const playlistData = [
      ["Folder", "FileName", "FileID", "StartTime", "EndTime", "PhotoUrl", "VideoUrl", "Type", "Tag", "Run_Time", "Content", "Expiry", "Notes"],
      ...playlistSchedules.map(schedule => schedule.items.map(item => [
        schedule.folder,
        item.FileName,
        item.FileID,
        item.startTime,
        item.endTime,
        item.PhotoUrl,
        item.videoUrl,
        item.Type,
        item.Tag,
        item.Run_Time,
        item.Content,
        formatDate(item.Expiry),
        item.notes ? item.notes.join(', ') : ''
      ])).flat()
    ];

    const wbPlaylist = xlsx.utils.book_new();
    const wsPlaylist = xlsx.utils.aoa_to_sheet(playlistData);
    xlsx.utils.book_append_sheet(wbPlaylist, wsPlaylist, `Eternal Playlist - ${currentDate}`);

    // Prepare data for AdsSchedule Excel sheet
    const wbAds = xlsx.utils.book_new();
    
    adsSchedules.forEach(schedule => {
      const adsData = [
        ["FileName", "FileID", "StartTime", "EndTime", "PhotoUrl", "VideoUrl", "Type", "Tag", "Run_Time", "Content", "Expiry", "Notes"],
        ...schedule.items.map(item => [
          item.FileName,
          item.FileID,
          item.startTime,
          item.endTime,
          item.PhotoUrl,
          item.videoUrl,
          item.Type,
          item.Tag,
          item.Run_Time,
          item.Content,
          formatDate(item.Expiry),
          item.notes ? item.notes.join(', ') : ''
        ])
      ];

      const wsAds = xlsx.utils.aoa_to_sheet(adsData);
      xlsx.utils.book_append_sheet(wbAds, wsAds, `ads ${schedule.folder}`);
    });

    // Convert the workbooks to base64 strings for email attachment
    const base64ExcelPlaylist = xlsx.write(wbPlaylist, { bookType: 'xlsx', type: 'base64' });
    const base64ExcelAds = xlsx.write(wbAds, { bookType: 'xlsx', type: 'base64' });

    // Prepare email content and attachments
    const recipients = ['tom@commersive.ca', 'remi@commersive.ca', 'richard@commersive.ca'];
    const msg = {
      to: recipients,
      from: process.env.EMAIL_USERNAME,
      subject: `Daily Playlist and Ads Schedules - ${currentDate}`,
      html: `<p>Dear Team, <br/><br/>Please find the attached daily Playlist and Ads Schedules for ${currentDate}.<br/><br/><img src="https://samqr.s3.ca-central-1.amazonaws.com/Commersive+Logo+2023+LIGHT.png" alt="Commersive Solutions Logo" style="width: 400px; height: auto;"></p>`,
      attachments: [
        {
          content: base64ExcelPlaylist,
          filename: `Eternal Playlist - ${currentDate}.xlsx`,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          disposition: 'attachment'
        },
        {
          content: base64ExcelAds,
          filename: `Ads Schedules - ${currentDate}.xlsx`,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          disposition: 'attachment'
        }
      ]
    };

    // Send email
    await sgMail.send(msg);
    console.log('Playlist and Ads Schedules email sent successfully.');
  } catch (error) {
    console.error('Error sending Playlist and Ads Schedules email:', error);
  }
};

// Schedule the cron job to run every 30 minutes between 9:00 AM and 5:30 PM
cron.schedule('0,30 9-17 * * *', () => {
  console.log('Running change log email task...');
  sendChangeLogEmail().catch(error => console.error('Error in scheduled email task:', error));
  sendDeletionLogEmailDaily().catch(error => console.error('Error in scheduled email task:', error))
  deleteReqLogs().catch(error => console.error('Error in scheduled delete logs task:', error));;
  
}, {
  scheduled: true,
  timezone: "America/New_York"
});

//daily summary every night
cron.schedule('0 22 * * *', () => {
  console.log('Running daily summary email task...');
  sendDailySummaryEmail().catch(error => console.error('Error in scheduled daily summary email task:', error));
  sendPlaylistsAndAdsSchedulesDaily().catch(error => console.error('Error in scheduled daily summary email schedules:', error));
}, {
  scheduled: true,
  timezone: "America/New_York"
});

// testing purposes
// cron.schedule('* * * * *', () => {
//   console.log('Running test cron job...');
//   sendDailySummaryEmail().catch(error => console.error('Error in scheduled daily summary email task:', error));
//   sendChangeLogEmail().catch(error => console.error('Error in scheduled email task:', error));
//   sendDeletionLogEmailDaily().catch(error => console.error('Error in scheduled email task:', error));
//   sendPlaylistsAndAdsSchedulesDaily().catch(error => console.error('Error in scheduled daily summary email schedules:', error));
// }, {
//   scheduled: true,
//   timezone: "America/New_York"
// });



// Deletes all logs, will schedule this every Sunday
const deleteAllLogs = async () => {
  try {
    // Delete all logs
    const result = await ChangeLog.deleteMany({});
    console.log(`Deleted ${result.deletedCount} logs.`);
  } catch (error) {
    console.error('Error deleting logs:', error);
  }
};

const deleteReqLogs = async()=>{
  try {
    const deletedReq = await DeletedRequest.deleteMany({});
    console.log(`Deleted ${deletedReq.deletedCount} logs.`);
  } catch (error) {
    console.error('Error deleting logs:', error);
  }
}

// Function to update schedules
const updateSchedules = async () => {
  try {
    // Calculate the start and end dates for the next month
    const nextMonthStart = moment().tz('America/New_York').add(1, 'month').startOf('month');
    const nextMonthEnd = moment(nextMonthStart).endOf('month');

    // Update Playlist Schedules
    await PlaylistSchedule.updateMany({}, {
      $set: {
        startDate: nextMonthStart.toDate(),
        endDate: nextMonthEnd.toDate()
      }
    });

    // Update Ads Schedules
    await AdsSchedule.updateMany({}, {
      $set: {
        startDate: nextMonthStart.toDate(),
        endDate: nextMonthEnd.toDate()
      }
    });

    console.log('Schedules updated successfully');
  } catch (error) {
    console.error('Error updating schedules:', error);
  }
};

// Schedule the cleanup task to run every Sunday at midnight Eastern Time
cron.schedule('0 0 * * 0', () => {
  console.log('Running delete all logs task...');
  deleteAllLogs().catch(error => console.error('Error in scheduled delete logs task:', error));
}, {
  scheduled: true,
  timezone: "America/New_York"
});

// Schedule the cron job to run at 11:59 PM on the last day of every month
cron.schedule('59 23 28-31 * *', async () => {
  const today = moment().tz('America/New_York').date();
  const lastDayOfMonth = moment().tz('America/New_York').endOf('month').date();

  if (today === lastDayOfMonth) {
    console.log('Running schedule update cron job...');
    await updateSchedules();
  }
}, {
  scheduled: true,
  timezone: "America/New_York"
});