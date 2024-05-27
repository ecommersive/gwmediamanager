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


app.delete('/playlistSchedule/:folder/:item', verifyToken, async (req, res) => {
  const { folder, item } = req.params;
  console.log(folder, item)

  try {
    const decodedItem = decodeURIComponent(item);
    console.log(`Decoded item: ${decodedItem}`); // Log the decoded item name

    const playlistSchedule = await PlaylistSchedule.findOne({ folder });
    if (!playlistSchedule) {
      return res.status(404).json({ message: 'Playlist schedule not found' });
    }

    console.log(`Current items before deletion: ${playlistSchedule.items}`);

    playlistSchedule.items = playlistSchedule.items.filter(i => i !== decodedItem);
    await playlistSchedule.save();

    console.log(`Updated items after deletion: ${playlistSchedule.items}`);

    res.json(playlistSchedule);
  } catch (error) {
    console.error('Error deleting item from playlist schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

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
};

cron.schedule('0 0 * * *', async () => {
  console.log('Daily check for expiring items started.');
  notifyExpiringItemsAcrossModels(modelMap);
});

// const checkDataChanges = async () => {
//   // Check for new uploads for the day 
//   const newUploadPlaylists = await Playlist.find({ createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } });
//   const newUploadAds = await Ads.find({ createdAt: { $gte: new Date().setHours(0, 0, 0, 0) } });

//   // Check for deletions 
//   const deletedPlaylistItems = await Playlist.find({ deletedAt: { $gte: new Date().setHours(0, 0, 0, 0) } });
//   const deletedAdsItems = await Ads.find({ deletedAt: { $gte: new Date().setHours(0, 0, 0, 0) } });
//   // Check for extended expiry
//   const extendedExpiryPlaylistItems = await Playlist.find({ Expiry: { $gte: new Date().setHours(0, 0, 0, 0) } });
//   const extendedExpiryAdsItems = await Ads.find({ Expiry: { $gte: new Date().setHours(0, 0, 0, 0) } });
//   // Check for note changes
//   const updatedPlaylistNotes = await Playlist.find({ 'notes.updatedAt': { $gte: new Date().setHours(0, 0, 0, 0) } });
//   const updatedAdsNotes = await Ads.find({ 'notes.updatedAt': { $gte: new Date().setHours(0, 0, 0, 0) } });
  

//   let emailContent = '';
 
//   if (newUploadPlaylists.length > 0 || newUploadAds.length > 0) {
//     emailContent += 'New Uploads:\n';
//     if (newUploadPlaylists.length > 0) {
//       newUploadPlaylists.forEach(upload => {
//         emailContent += `- ${upload.FileName} has been added to the playlist on ${upload.createdAt}\n`;
//       });
//     }
//     if (newUploadAds.length > 0) {
//       newUploadAds.forEach(upload => {
//         emailContent += `- ${upload.FileName} has been added to the ads on ${upload.createdAt}\n`;
//       });
//     }
//     emailContent += '\n';
//   }

//   if (deletedPlaylistItems.length > 0) {
//     emailContent += 'Deleted Items:\n';
//     deletedPlaylistItems.forEach(item => {
//       emailContent += `- ${item.FileName} has been deleted from the playlist on ${item.deletedAt}\n`;
//     });
//     deletedAdsItems.forEach(item => {
//       emailContent += `- ${item.FileName} has been deleted from the ads on ${item.deletedAt}\n`;
//     });
//     deletedArchivedItems.forEach(item => {
//       emailContent += `- ${item.FileName} has been deleted from the archived on ${item.deletedAt}\n`;
//     });
//     emailContent += '\n';
//   }

//   if (extendedExpiryPlaylistItems.length > 0 || extendedExpiryAdsItems.length > 0 || extendedExpiryArchivedItems.length > 0) {
//     emailContent += 'Extended Expiry Items:\n';
//     if(extendedExpiryPlaylistItems.length > 0){
//       extendedExpiryPlaylistItems.forEach(item => {
//         emailContent += `- ${item.FileName} from playlists has had its expiry date extended to ${item.Expiry}\n`;
//       });
//     }
//     if(extendedExpiryAdsItems.length > 0){
//       extendedExpiryAdsItems.forEach(item => {
//         emailContent += `- ${item.FileName} from ads has had its expiry date extended to ${item.Expiry}\n`;
//       });
//     }
//     if(extendedExpiryArchivedItems.length > 0){
//       extendedExpiryArchivedItems.forEach(item => {
//         emailContent += `- ${item.FileName} from archived has had its expiry date extended to ${item.Expiry}\n`;
//       });
//     }
//     emailContent += '\n';
//   }

//   if (updatedPlaylistNotes.length > 0) {
//     emailContent += 'Updated Notes:\n';
//     updatedPlaylistNotes.forEach(item => {
//       item.notes.forEach(note => {
//         if (note.updatedAt >= new Date().setHours(0, 0, 0, 0)) {
//           if (note.addedOn === note.updatedAt) {
//             emailContent += `- ${item.FileName} - Note: ${note.text} (Added)\n`;
//           } else if (note.text === '') {
//             emailContent += `- ${item.FileName} - Note: ${note.text} (Deleted)\n`;
//           } else {
//             emailContent += `- ${item.FileName} - Note: ${note.text} (Updated)\n`;
//           }
//         }
//       });
//     });
//     emailContent += '\n';
//   }else if(updatedAdsNotes.length > 0){
//     updatedAdsNotes.forEach(item => {
//       item.notes.forEach(note => {
//         if (note.updatedAt >= new Date().setHours(0, 0, 0, 0)) {
//           if (note.addedOn === note.updatedAt) {
//             emailContent += `- ${item.FileName} - Note: ${note.text} (Added)\n`;
//           } else if (note.text === '') {
//             emailContent += `- ${item.FileName} - Note: ${note.text} (Deleted)\n`;
//           } else {
//             emailContent += `- ${item.FileName} - Note: ${note.text} (Updated)\n`;
//           }
//         }
//       });
//     });
//     emailContent += '\n';
//   }else if(updatedArchivedNotes.length > 0){
//     updatedArchivedNotes.forEach(item => {
//       item.notes.forEach(note => {
//         if (note.updatedAt >= new Date().setHours(0, 0, 0, 0)) {
//           if (note.addedOn === note.updatedAt) {
//             emailContent += `- ${item.FileName} - Note: ${note.text} (Added)\n`;
//           } else if (note.text === '') {
//             emailContent += `- ${item.FileName} - Note: ${note.text} (Deleted)\n`;
//           } else {
//             emailContent += `- ${item.FileName} - Note: ${note.text} (Updated)\n`;
//           }
//         }
//       });
//     });
//     emailContent += '\n';
//   }

//   const msg = {
//     to: 'rzhou1997@gmail.com',
//     from: process.env.EMAIL_USERNAME_TEST,
//     subject: 'Data Changes Notification',
//     text: emailContent
//   };

//   try {
//     await transporter.sendMail(msg);
//     console.log('Data changes notification email sent successfully.');
//   } catch (error) {
//     console.error('Failed to send data changes notification email:', error);
//   }
// };

//need to make it every 5 minutes for testing purposes
// cron.schedule('0 0 * * *', async () => {
//  console.log('Checking for data changes and sending email notification.');
//  await checkDataChanges();
// });
// cron.schedule('0 23 * * *', async () => {
//   console.log('Checking for data changes and sending email notification.');
//   await checkDataChanges();
// });