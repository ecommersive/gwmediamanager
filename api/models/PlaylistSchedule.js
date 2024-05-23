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
    otherTimes: [String]
});

const PlaylistSchedule = mongoose.model('PlaylistSchedule', playlistScheduleSchema);

module.exports = PlaylistSchedule;