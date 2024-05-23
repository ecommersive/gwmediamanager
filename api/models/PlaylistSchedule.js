const mongoose = require('mongoose');


const playlistScheduleSchema = new mongoose.Schema({
    folder: {
        type: Number
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
    }
});

const PlaylistSchedule = mongoose.model('PlaylistSchedule', playlistScheduleSchema);

module.exports = PlaylistSchedule;