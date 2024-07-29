const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  FileName: {
    type: String,
    required: true,
    unique: true,
  },
  PhotoUrl: {
    type: String,
    required: true,
  },
  videoUrl:{
    type:String
  },
  Type: {
    type: String,
    required: true,
  },
  Tag: String,
  Run_Time: {
    type: String,
    required: true,
  },
  Content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  Expiry: {type: Date,},

  notes: [{
    text: { type: String },
    addedOn: { type: Date, default: Date.now }, // Automatically set the date when note is added
    user: { type: String },
  }],
  generalData: {
    OverallBitRate: String,
  },
  videoData: {
    ColorSpace: String,
    ChromaSubsampling: String,
    BitDepth: String,
    ScanType: String,
  },
  audioData: {
    BitMode: String,
    BitRate: String,
    CompressionMode: String,
  },
}, {
  collection: 'Playlist',
});

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
