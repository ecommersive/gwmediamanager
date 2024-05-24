const mongoose = require('mongoose');


const adsScheduleSchema = new mongoose.Schema({
    folder: {
        type: Number,
    },
    items: [String],
   
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // Store time as string in HH:MM format
        required: true
    },
    endTime: {
        type: String, // Store time as string in HH:MM format
        required: true
    },
    notes: [{
        text: { type: String },
        addedOn: { type: Date, default: Date.now } // Automatically set the date when note is added
    }]
});

const PlaylistSchedule = mongoose.model('AdsSchedule', adsScheduleSchema);

module.exports = PlaylistSchedule;