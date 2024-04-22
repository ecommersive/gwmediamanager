const mongoose = require('mongoose');

const ArchivedSchema = new mongoose.Schema({
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
  notes: [{
    text: { type: String },
    addedOn: { type: Date, default: Date.now } 
  }]
}, {
  collection: 'Archived'
});

const Archived = mongoose.model('Deleted', ArchivedSchema);

module.exports = Archived;