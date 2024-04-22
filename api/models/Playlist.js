const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  FileName: {
    type: String,
    required: true
  },
  PhotoUrl: {
    type: String,
    required: true
  },
  Type: {
    type: String,
    required: true,
    enum: ['JPG', 'Video', 'PNG'] 
  },  
  Tag: String,
  Run_Time: {
    type: String,
    required: true
  },
  Content: { 
    type: String,
    required: true 
  },
  videoUrl: {
    type: String,
    required: true
  },
  Expiry: Date,
  notes: [String]  
}, {
  collection: 'Playlist'
});

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
