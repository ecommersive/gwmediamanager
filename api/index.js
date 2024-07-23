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
const sgMail = require('@sendgrid/mail')
const cron = require('node-cron');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const xlsx = require('xlsx');
const AWS = require('aws-sdk');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ObjectId = mongoose.Types.ObjectId;

const moment = require('moment-timezone');

const {verifyToken} = require('./middleware/authmiddleware');

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

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const generateThumbnail = async (fileBuffer, fileName) => {
  const tempFilePath = path.join(__dirname, 'temp', fileName);
  await promisify(fs.writeFile)(tempFilePath, fileBuffer);
  
  const thumbnailPath = path.join(__dirname, 'temp', `${fileName}.png`);
  
  await new Promise((resolve, reject) => {
    ffmpeg(tempFilePath)
      .screenshots({
        count: 1,
        folder: path.dirname(thumbnailPath),
        filename: path.basename(thumbnailPath),
        size: '320x240',
        timemarks: ['3'] 
      })
      .on('end', resolve)
      .on('error', reject);
  });

  const thumbnailBuffer = await promisify(fs.readFile)(thumbnailPath);
  await promisify(fs.unlink)(tempFilePath);
  await promisify(fs.unlink)(thumbnailPath);
  return thumbnailBuffer;
};
const uploadToS3 = async (buffer, key, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Ensure your bucket name is set in your environment variables
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Return the URL of the uploaded file
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
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

app.get('/ads', async (req, res) => {
  try {
    const ads = await Ads.find({});
    const adsSchedules = await AdsSchedule.find({})
    const scheduledItems = new Set(
      adsSchedules.flatMap(schedule => 
        schedule.items
          .filter(item => item.FileID)  // Ensure FileID is defined
          .map(item => item.FileID.toString())
      )
    )
    const filteredAds = ads.filter(ads => ads._id && !scheduledItems.has(ads._id.toString()))
    res.json(filteredAds);
  } catch (err) {
    console.error('Error fetching playlists:', err);
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

  // Ensure items is defined and not empty
  if (!items || items.length === 0) {
    return res.status(400).send('items array is required and must not be empty.');
  }

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

  // Ensure items is defined and not empty
  if (!items || items.length === 0) {
    return res.status(400).send('items array is required and must not be empty.');
  }

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


// app.post('/uploadPlaylist', verifyToken, async (req, res) => {
//   const { FileName, PhotoUrl, videoUrl, Type, Tag, Run_Time, Content, Expiry, notes, generalData, videoData, audioData } = req.body;
//   const foundIn = await checkFileExistence(FileName);
//   if (foundIn.length > 0) {
//     return res.status(400).json({ message: `File name already exists in ${foundIn.join(', ')}.` });
//   }

//   const newPlaylistItem = new Playlist({
//     FileName,
//     PhotoUrl,
//     Type,
//     Tag,
//     Run_Time,
//     Content,
//     Expiry,
//     notes,
//     generalData,
//     videoData,
//     audioData,
//   });

//   try {
//     const savedItem = await newPlaylistItem.save();
//     res.status(201).json(savedItem);
//   } catch (err) {
//     console.error('Error saving new playlist item:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });
app.post('/uploadPlaylist', verifyToken, upload.single('file'), async (req, res) => {
  const { FileName, Type, Tag, Run_Time, Content, Expiry, notes, generalData, videoData, audioData, mediaType } = req.body;
  const file = req.file;

  const foundIn = await checkFileExistence(FileName);
  if (foundIn.length > 0) {
    return res.status(400).json({ message: `File name already exists in ${foundIn.join(', ')}.` });
  }

  
  try {
    let thumbnailUrl = '';
    let fileUrl = await uploadToS3(file.buffer, `gwfolder/${Type === 'Video' ? 'gwvideos':'gwphotos'}/${file.originalname}`, file.mimetype);

    // If the file is a video, generate a thumbnail
    if (file.mimetype.startsWith('video/')) {
      const thumbnailBuffer = await generateThumbnail(file.buffer, file.originalname);
      thumbnailUrl = await uploadToS3(thumbnailBuffer, `gwfolder/gwphotos/${file.originalname}.png`, 'image/png');
    }

    const newPlaylistItem = new Playlist({
      FileName,
      PhotoUrl: thumbnailUrl || fileUrl, // Use the thumbnail URL if it's a video, otherwise use the file URL
      videoUrl: file.mimetype.startsWith('video/') ? fileUrl : '', // Add the video URL if it's a video, otherwise an empty string
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

    const savedItem = await newPlaylistItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error uploading file to S3 or saving new playlist item:', err);
    res.status(500).send('Internal Server Error');
  }
});

// app.post('/uploadAds', verifyToken, async (req, res) => {
//   const { FileName, PhotoUrl, Type, Tag, Run_Time, Content,  Expiry, notes, generalData, videoData, audioData  } = req.body;

//   const foundIn = await checkFileExistence(FileName);
//   if (foundIn.length > 0) {
//     return res.status(400).json({ message: `File name already exists in ${foundIn.join(', ')}.` });
//   }

//   const newAdsItem = new Ads({
//     FileName,
//     PhotoUrl,
//     Type,
//     Tag,
//     Run_Time,
//     Content,
//     Expiry,
//     notes,
//     generalData,
//     videoData,
//     audioData,
//   });

//   try {
//     const savedItem = await newAdsItem.save();
//     res.status(201).json(savedItem);
//   } catch (err) {
//     console.error('Error saving new playlist item:', err);
//     res.status(500).send('Internal Server Error');
//   }
// });
app.post('/uploadAds', verifyToken, upload.single('file'), async (req, res) => {
  const { FileName, Type, Tag, Run_Time, Content, Expiry, notes, generalData, videoData, audioData, mediaType } = req.body;
  const file = req.file;

  const foundIn = await checkFileExistence(FileName);
  if (foundIn.length > 0) {
    return res.status(400).json({ message: `File name already exists in ${foundIn.join(', ')}.` });
  }

  try {
    let thumbnailUrl = '';
    let fileUrl = await uploadToS3(file.buffer, `gwfolder/${mediaType}/${file.originalname}`, file.mimetype);

    // If the file is a video, generate a thumbnail
    if (file.mimetype.startsWith('video/')) {
      const thumbnailBuffer = await generateThumbnail(file.buffer, file.originalname);
      thumbnailUrl = await uploadToS3(thumbnailBuffer, `gwfolder/${mediaType}/thumbnails/${file.originalname}.png`, 'image/png');
    }

    const newAdsItem = new Ads({
      FileName,
      PhotoUrl: thumbnailUrl || fileUrl, // Use the thumbnail URL if it's a video, otherwise use the file URL
      videoUrl: file.mimetype.startsWith('video/') ? fileUrl : '', // Add the video URL if it's a video, otherwise an empty string
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

    const savedItem = await newAdsItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error uploading file to S3 or saving new ads item:', err);
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
  const { username, password, isAdmin } = req.body;

  // Validate input
  if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
  }
  if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ message: 'Invalid user role specified' });
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
          isAdmin: isAdmin  // isAdmin is a boolean that should be passed in the request
      });

      await newUser.save();
      res.status(201).json({ message: 'User registered successfully', userId: newUser._id, role: isAdmin ? 'Admin' : 'User' });
  } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});



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
    const regex = new RegExp('^' + fileName + '$', 'i');
    const deletedDocument = await Model.findOneAndDelete({ FileName: regex });
    if (!deletedDocument) {
      return res.status(404).send({ error: 'File not found' });
    }
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

      res.json({ token, message: 'Login successful', isAdmin: user.isAdmin });
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
  const { text, addedOn, user  } = req.body;

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
  const { item, direction } = req.body;

  if (!item || !direction) {
    return res.status(400).json({ message: 'Item and direction are required' });
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

    if (direction === 'up' && index > 0) {
      const temp = schedule.items[index - 1];
      schedule.items[index - 1] = schedule.items[index];
      schedule.items[index] = temp;
    } else if (direction === 'down' && index < schedule.items.length - 1) {
      const temp = schedule.items[index + 1];
      schedule.items[index + 1] = schedule.items[index];
      schedule.items[index] = temp;
    } else {
      return res.status(400).json({ message: 'Invalid move operation' });
    }

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

      res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



//changelog
app.post('/changelog', async (req, res) => {
  try {
    const { user,message } = req.body;

    if (!message) {
      return res.status(400).send('Message is required');
    }

    if(!message){
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
    // Get the current date at midnight to use as a filter
    const startOfDay = moment.tz('America/New_York').startOf('day').toDate();
    const endOfDay = moment.tz('America/New_York').endOf('day').toDate();

    // Fetch change logs for the current day
    const logs = await ChangeLog.find({
      timestamp: { $gte: startOfDay, $lt: endOfDay }
    });

    if (logs.length === 0) {
      console.log('No change logs to send.');
      return;
    }

    // Get current date for the email subject
    const currentDate = moment.tz('America/New_York').format('YYYY-MM-DD');

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
      subject: `Change Log - ${currentDate}`,
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

cron.schedule('0 22 * * *', () => {
  console.log('Running change log email task...');
  sendChangeLogEmail().catch(error => console.error('Error in scheduled email task:', error));
}, {
  scheduled: true,
  timezone: "America/New_York"
});

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