const mongoose = require('mongoose');


const adsSchema = new mongoose.Schema({
  FileName: {
    type: String,
    required: true,
    unique: true
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
  notes: [{
    text: { type: String },
    addedOn: { type: Date, default: Date.now } // Automatically set the date when note is added
  }]
}, {
  collection: 'Ads'
});

const Ads = mongoose.model('Ads', adsSchema);

module.exports = Ads;