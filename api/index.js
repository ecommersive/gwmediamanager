require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const User = require('./models/Users');
const Playlist = require('./models/Playlist');
const Ads = require('./models/Ads');
const Archived = require('./models/Archived');
const sgMail = require('@sendgrid/mail')
const cron = require('node-cron');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {verifyToken} = require('./middleware/authmiddleware');
const { log } = require('console');

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


const checkFileExistence = async (fileName) => {
  const regex = new RegExp('^' + fileName + '$', 'i');  // Case insensitive search
  const playlistExists = await Playlist.findOne({ FileName: regex });
  const adsExists = await Ads.findOne({ FileName: regex });
  const archivedExists = await Archived.findOne({ FileName: regex });

  let foundIn = [];
  if (playlistExists) foundIn.push('Playlist');
  if (adsExists) foundIn.push('Ads');
  if (archivedExists) foundIn.push('Archived');
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

app.get('/archived', async (req, res) => {
  try {
    const archived = await Archived.find({});
    res.json(archived);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/uploadPlaylist',verifyToken, async (req, res) => {
  const { FileName, PhotoUrl, Type, Tag, Run_Time, Content, videoUrl, Expiry, notes } = req.body;

  let errors = {};
  if (!FileName) {
    errors.FileName = 'File name is required';
  }
  if (!PhotoUrl) {
    errors.PhotoUrl = 'Photo URL is required';
  }
  if (!Type) {
    errors.Type = 'Type is required';
  }
  if (!Run_Time) {
    errors.Run_Time = 'Run Time is required';
  }
  if (!Content) {
    errors.Content = 'Content is required';
  }
  if (!videoUrl) {
    errors.videoUrl = 'Video URL is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

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
    videoUrl,
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
  const { FileName, PhotoUrl, Type, Tag, Run_Time, Content, videoUrl, Expiry, notes } = req.body;

  let errors = {};
  if (!FileName) {
    errors.FileName = 'File name is required';
  }
  if (!PhotoUrl) {
    errors.PhotoUrl = 'Photo URL is required';
  }
  if (!Type) {
    errors.Type = 'Type is required';
  }
  if (!Run_Time) {
    errors.Run_Time = 'Run Time is required';
  }
  if (!Content) {
    errors.Content = 'Content is required';
  }
  if (!videoUrl) {
    errors.videoUrl = 'Video URL is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

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
    videoUrl,
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
    archived: Archived
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
    archived: Archived
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
app.get('/notes/:category/:filename', verifyToken, async (req, res) => {
  const { category, filename } = req.params;
  const Model = { 'playlist': Playlist, 'ads': Ads, 'archived': Archived }[category.toLowerCase()];
  
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

      // Sign the JWT with user ID and admin status
      const token = jwt.sign(
          { userId: user._id, isAdmin: user.isAdmin },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }  // Token expires in 1 hour
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


//notes
// POST route to add a note to an item in a specific category
app.post('/notes/add/:category/:fileName', verifyToken, async (req, res) => {
  const { category, fileName } = req.params;
  const { text, addedOn } = req.body; // These are expected to be provided in the request body

  // Map the category to the corresponding model
  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
    archived: Archived
  };

  const Model = categoryModelMap[category.toLowerCase()];
  if (!Model) {
    return res.status(404).json({ error: 'Category not found' });
  }

  try {
    const result = await Model.findOneAndUpdate(
      { FileName: new RegExp(`^${fileName}$`, 'i') }, // Case insensitive match
      { $push: { notes: { text, addedOn: new Date(addedOn) } } }, // Add the note
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

// PUT route to update a note based on its index for an item in a specific category
app.put('/notes/update/:category/:fileName', verifyToken, async (req, res) => {
  const { category, fileName } = req.params;
  const { noteIndex, updatedText } = req.body; // Expect the index and new text of the note to be in the request body

  // Map the category to the corresponding model
  const categoryModelMap = {
    playlist: Playlist,
    ads: Ads,
    archived: Archived
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

    // Check if the note exists at the provided index
    if (noteIndex < 0 || noteIndex >= document.notes.length) {
      return res.status(404).json({ error: 'Note not found at the provided index' });
    }

    // Update the text of the note at the given index
    document.notes[noteIndex].text = updatedText;
    document.notes[noteIndex].addedOn = new Date(); // Optionally update the timestamp

    // Save the document with the updated note
    await document.save();

    res.status(200).json({ message: 'Note updated successfully', data: document.notes[noteIndex] });
  } catch (error) {
    console.error('Failed to update note:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
});


async function notifyExpiringItemsAcrossModels(modelMap) {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  const dateIn3Days = new Date();
  dateIn3Days.setDate(dateIn3Days.getDate() + 1);
  dateIn3Days.setHours(0, 0, 0, 0);
  const dateIn7Days = new Date();
  dateIn7Days.setDate(dateIn7Days.getDate() + 7);
  dateIn7Days.setHours(23, 59, 59, 999);

  let allExpiringItems = [];

  for (const [modelName, model] of Object.entries(modelMap)) {
    const expiringItems = await model.find({
      Expiry: { $gte: dateIn3Days, $lte: dateIn7Days }
    });

    if (expiringItems.length > 0) {
      let modelItemsHtml = expiringItems.map(item =>
        `${modelName} - ${item.FileName}: ${item.Expiry.toDateString()}`
      ).join('<br>');  // Use '<br>' here to avoid double line breaks
      allExpiringItems.push(modelItemsHtml);
    }
  }

  if (allExpiringItems.length > 0) {
    const itemListHtml = allExpiringItems.join('<br>');  // Changed from '<br><br>' to '<br>'
    // List of email recipients
    const recipients = [
      'tom@commersive.ca',
      'remi@commersive.ca',
      'richard@commersive.ca'
    ];
    const msg = {
      personalizations: [{
        to: recipients.map(email => ({ email }))
      }],
      from: process.env.EMAIL_USERNAME,
      subject: `Expiration Notice ${formattedDate}`,
      html: `<strong>The following items are set to expire soon:</strong><br>${itemListHtml}<br>Any deletions or altering of this data must be with a administrator's account.`
    };

    try {
      await sgMail.send(msg);
      console.log("Email sent to notify about expiring items across categories.");
    } catch (error) {
      console.log("email = ", process.env.EMAIL_USERNAME);
      console.error('Failed to send email:', error.response.body);
    }
  } else {
    console.log("No items expiring within 1 to 7 days across all categories.");
  }
}

const modelMap = {
  Playlist: Playlist,
  Ads: Ads,
  Archived: Archived
};

cron.schedule('0 0 * * *', async () => {
  console.log('Daily check for expiring items started.');
  notifyExpiringItemsAcrossModels(modelMap);
});
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily check to move expiring playlist items and ads to the Archived collection.');

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  async function archiveExpiringItems(model, modelName) {
    try {
      const expiringItems = await model.find({
        Expiry: {
          $lte: tomorrow
        }
      });
      for (let item of expiringItems) {
        const ArchivedItem = new Archived(item.toObject());
        await ArchivedItem.save();
        await model.findByIdAndDelete(item._id);
      }
      if (expiringItems.length > 0) {
        console.log(`${expiringItems.length} ${modelName} item(s) moved to the Archived collection.`);
      } else {
        console.log(`No ${modelName} items expiring tomorrow to move.`);
      }
    } catch (error) {
      console.error(`Error moving expiring ${modelName} items:`, error);
    }
  }
  await archiveExpiringItems(Playlist, 'playlist');
  await archiveExpiringItems(Ads, 'ads');
});