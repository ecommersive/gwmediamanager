const mongoose = require('mongoose');


const playlistScheduleSchema = new mongoose.Schema({
    folder: {
        type: Number
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Playlist' 
    }, {
        type: mongoose.Schema.Types.ObjectId,
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