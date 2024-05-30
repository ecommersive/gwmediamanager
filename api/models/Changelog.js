const mongoose = require('mongoose');

const changeLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  message: {
    type: String,
    required: true
  }
});

const ChangeLog = mongoose.model('ChangeLog', changeLogSchema);

module.exports = ChangeLog;
