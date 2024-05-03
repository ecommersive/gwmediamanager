const mongoose = require('mongoose');


const playlistScheduleSchema = new mongoose.Schema({
    folder: {
        type: Number
    },
    items: [{
        type: String,
        ref: 'Playlist' 
    }, {
        type: String,
        ref: 'Ads' 
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    otherTimes: [String]
});

const PlaylistSchedule = mongoose.model('PlaylistSchedule', playlistScheduleSchema);

module.exports = PlaylistSchedule;