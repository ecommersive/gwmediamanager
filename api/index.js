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

app.use(express.json());
app.use(cors());
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
console.clear()
console.log('process.env.MONGO_URI = ', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, { dbName: 'GWData' })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

const PORT = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname, '../client/build')));

app.get(['/', '/home'], (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.get('/playlists', async (req, res) => {
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

app.post('/uploadPlaylist', async (req, res) => {
  const { FileName, PhotoUrl, Type, Tag, Run_Time, Content, videoUrl, Expiry } = req.body;

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

  const newPlaylistItem = new Playlist({
    FileName,
    PhotoUrl,
    Type,
    Tag,
    Run_Time,
    Content,
    videoUrl,
    Expiry
  });

  try {
    const savedItem = await newPlaylistItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error saving new playlist item:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/uploadAds', async (req, res) => {
  const { FileName, PhotoUrl, Type, Tag, Run_Time, Content, videoUrl, Expiry } = req.body;

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

  const newAdsItem = new Ads({
    FileName,
    PhotoUrl,
    Type,
    Tag,
    Run_Time,
    Content,
    videoUrl,
    Expiry
  });

  try {
    const savedItem = await newAdsItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error saving new playlist item:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.delete('/deleteData/:category/:fileName', async (req, res) => {
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
app.post('/setExpiry/:category/:fileName', async (req, res) => {
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

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('Username does not exists, please try again!');
    }
    if (user.password !== password) {
      return res.status(401).send('Incorrect password, please try again!');
    }
    res.json({ message: 'Login successful', isAdmin: user.isAdmin });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
// cron.schedule('0 0 * * *', async () => {
//   console.log('Running check for items expiring within 3 to 7 days.');
//   const dateIn3Days = new Date();
//   dateIn3Days.setDate(dateIn3Days.getDate() + 3);
//   dateIn3Days.setHours(0, 0, 0, 0);
//   const dateIn7Days = new Date();
//   dateIn7Days.setDate(dateIn7Days.getDate() + 7);
//   dateIn7Days.setHours(23, 59, 59, 999);
//   async function notifyExpiringItems(model, modelName) {
//     const expiringItems = await model.find({
//       Expiry: {
//         $gte: dateIn3Days,
//         $lte: dateIn7Days
//       }
//     });
//     expiringItems.forEach(async (item) => {
//       const mailOptions = {
//         from: process.env.EMAIL_USERNAME,
//         to: 'rzhou1997@gmail.com',
//         subject: 'Expiration Notice Test Reminder',
//         text: `Your ${modelName} item '${item.FileName}' is set to expire at ${item.Expiry.toDateString()}. Please reply to this email if you would like to extend the expiration date or if it should be deleted.`
//       };
//       try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent to notify about expiring ${modelName} item: ${item.FileName}`);
//       } catch (error) {
//         console.error('Failed to send email:', error);
//       }
//     });
//     if (expiringItems.length > 0) {
//       console.log(`${expiringItems.length} ${modelName} item(s) notification sent.`);
//     } else {
//       console.log(`No ${modelName} items expiring within 3 to 7 days.`);
//     }
//   }
//   await notifyExpiringItems(Playlist, 'playlist');
//   await notifyExpiringItems(Ads, 'ads');
// });
