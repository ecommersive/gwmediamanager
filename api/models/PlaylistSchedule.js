const mongoose = require('mongoose');


const playlistScheduleSchema = new mongoose.Schema({
    folder: {
        type: Number
    },
    items: [{
        FileName: { type: String },
        FileID: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
        startTime: {type: String},
        endTime: {type: String},
        PhotoUrl: {type: String}
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
        type: String, // Store time as string in HH:MM format
        required: true
    },
    endTime: {
        type: String, // Store time as string in HH:MM format
        required: true
    },
    notes: [{
        text: { type: String },
        addedOn: { type: Date, default: Date.now }, // Automatically set the date when note is added
        user: { type: String }
    }]
});

const PlaylistSchedule = mongoose.model('PlaylistSchedule', playlistScheduleSchema);

module.exports = PlaylistSchedule;