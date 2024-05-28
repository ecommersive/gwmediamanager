require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const User = require('./models/Users');
const Playlist = require('./models/Playlist');
const Ads = require('./models/Ads');
const AdsSchedule = require('./models/AdsSchedule');
const PlaylistSchedule = require('./models/PlaylistSchedule');
const sgMail = require('@sendgrid/mail')
const cron = require('node-cron');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {verifyToken} = require('./middleware/authmiddleware');

app.use(express.json());
app.use(cors());
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
console.clear()

const transporter = nodemailer.createTransport({
  service: 'outlook', 
  auth: {
    user: process.env.EMAIL_USERNAME_TEST,
    pass: process.env.EMAIL_PASSWORD
  }
});
mongoose.connect(process.env.MONGO_URI, { dbName: 'GWData' })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const PORT = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, '../client/build')));

app.get(['/', '/home'], (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


const checkFileExistence = async (fileName) => {
  const regex = new RegExp('^' + fileName + '$', 'i');  // Case insensitive search
  const playlistExists = await Playlist.findOne({ FileName: regex });
  const adsExists = await Ads.findOne({ FileName: regex });

  let foundIn = [];
  if (playlistExists) foundIn.push('Playlist');
  if (adsExists) foundIn.push('Ads');
  return foundIn;
};
app.get('/playlists' , async (req, res) => {
  try {
    const playlists = await Playlist.find({});
    res.json(playlists);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/ads', async (req, res) => {
  try {
    const ads = await Ads.find({});
    res.json(ads);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).send('Internal Server Error');
  }
});

//create endpoint to get adsSchedule
app.get('/adsSchedule', async (req, res) => {
  try {
    const adsSchedule = await AdsSchedule.find({});
    res.json(adsSchedule);
  } catch (err) {
    console.error('Error fetching adsSchedule:', err);
    res.status(500).send('Internal Server Error');
  }
});

//create endpoint to get playlistSchedule
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

  const itemsFileNames = items.map(item => item.FileName);

  try {
    // Improved folder number calculation
    const latestSchedule = await PlaylistSchedule.findOne().sort({ folder: -1 }).exec();
    const folderNumber = latestSchedule ? latestSchedule.folder + 1 : 1;

    const newPlaylistSchedule = new PlaylistSchedule({
      folder: folderNumber,
      items: itemsFileNames,
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

  const itemsFileNames = items.map(item => item.FileName);
  const folderNumber = await AdsSchedule.countDocuments() + 1;

  const newAdsSchedule = new AdsSchedule({
    folder: folderNumber,
    items: itemsFileNames,
    startDate,
    endDate,
    startTime,
    endTime,
    notes
  });

  try {
    const savedSchedule = await newAdsSchedule.save();
    res.status(201).json(savedSchedule);
  } catch (err) {
    console.error('Error saving new playlist schedule:', err);
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



app.post('/uploadPlaylist',verifyToken, async (req, res) => {
  const { FileName, PhotoUrl, Type, Tag, Run_Time, Content,  Expiry, notes } = req.body;
  const foundIn = await checkFileExistence(FileName);
  if (foundIn.length > 0) {
    return res.status(400).json({ message: `File name already exists in ${foundIn.join(', ')}.` });
  }

  const newPlaylistItem = new Playlist({
    FileName,
    PhotoUrl,
    Type,
    Tag,
    Run_Time,
    Content,
    
    Expiry,
    notes
  });

  try {
    const savedItem = await newPlaylistItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error saving new playlist item:', err);
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
app.post('/uploadAds', verifyToken, async (req, res) => {
  const { FileName, PhotoUrl, Type, Tag, Run_Time, Content,  Expiry, notes } = req.body;

  const foundIn = await checkFileExistence(FileName);
  if (foundIn.length > 0) {
    return res.status(400).json({ message: `File name already exists in ${foundIn.join(', ')}.` });
  }

  const newAdsItem = new Ads({
    FileName,
    PhotoUrl,
    Type,
    Tag,
    Run_Time,
    Content,
    
    Expiry,
    notes
  });

  try {
    const savedItem = await newAdsItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error saving new playlist item:', err);
    res.status(500).send('Internal Server Error');
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
    console.log('deleted = ', deletedDocument);
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
app.post('/notes/add/:category/:fileName', verifyToken, async (req, res) => {
  const { category, fileName } = req.params;
  const { text, addedOn } = req.body; 

  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
  };

  const Model = categoryModelMap[category.toLowerCase()];
  if (!Model) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const result = await Model.findOneAndUpdate(
      { FileName: new RegExp(`^${fileName}$`, 'i') }, 
      { $push: { notes: { text, addedOn: new Date(addedOn) } } }, 
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.status(200).json({ message: 'Note added successfully', data: result });
  } catch (error) {
    console.error('Failed to add note:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
});

//notes backend
app.put('/notes/update/:category/:fileName', verifyToken, async (req, res) => {
  const { category, fileName } = req.params;
  const { noteIndex, updatedText } = req.body; 

  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
  };

  const Model = categoryModelMap[category.toLowerCase()];
  if (!Model) {
    return res.status(404).json({ error: 'Category not found' });
  }

  if (noteIndex === undefined || updatedText === undefined) {
    return res.status(400).json({ error: 'Note index and updated text are required' });
  }

  try {
    const document = await Model.findOne({ FileName: new RegExp(`^${fileName}$`, 'i') });
    if (!document) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (noteIndex < 0 || noteIndex >= document.notes.length) {
      return res.status(404).json({ error: 'Note not found at the provided index' });
    }

    document.notes[noteIndex].text = updatedText;
    document.notes[noteIndex].addedOn = new Date(); 

    await document.save();

    res.status(200).json({ message: 'Note updated successfully', data: document.notes[noteIndex] });
  } catch (error) {
    console.error('Failed to update note:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
});

app.delete('/notes/delete/:category/:fileName/:noteIndex', verifyToken, async (req, res) => {
  const { category, fileName, noteIndex } = req.params;
  const index = parseInt(noteIndex, 10); 

  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
  };

  const Model = categoryModelMap[category.toLowerCase()];
  if (!Model) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const document = await Model.findOne({ FileName: new RegExp(`^${fileName}$`, 'i') });
    if (!document) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (index >= 0 && index < document.notes.length) {
      document.notes.splice(index, 1);
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

app.get('/notes/:category/:filename', verifyToken, async (req, res) => {
  const { category, filename } = req.params;
  const Model = { 'playlist': Playlist, 'ads': Ads }[category.toLowerCase()];
  
  if (!Model) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const document = await Model.findOne({ FileName: new RegExp(`^${filename}$`, 'i') });
    if (!document) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(document.notes || []);
  } catch (error) {
    console.error(`Failed to fetch notes for file: ${filename} in category: ${category}`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//folder backend alters
const getModel = (scheduleType) => {
  return scheduleType === 'Playlist Schedule' ? PlaylistSchedule : AdsSchedule;
};

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
  console.log(scheduleType, folder, item);

  const decodedItem = decodeURIComponent(item);
  console.log(`Decoded item: ${decodedItem}`); 

  const Model = getModel(scheduleType);

  try {
    const schedule = await Model.findOne({ folder });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    console.log(`Current items before deletion: ${schedule.items}`);

    schedule.items = schedule.items.filter(i => i !== decodedItem);
    await schedule.save();

    console.log(`Updated items after deletion: ${schedule.items}`);

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

  try {
    const schedule = await Model.findOne({ folder });
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const index = schedule.items.indexOf(item);
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