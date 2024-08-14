const mongoose = require('mongoose');


const adsScheduleSchema = new mongoose.Schema({
    folder: {
        type: Number,
    },
    items: [{
        FileName: { type: String },
        FileID: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
        startTime: { type: String },
        endTime: { type: String },
        PhotoUrl: { type: String },
        videoUrl: { type: String }, // New field for video URL
        Type: { type: String }, // New field for Type
        Tag: { type: String }, // New field for Tag
        Run_Time: { type: String }, // New field for Run Time
        Content: { type: String }, // New field for Content
        Expiry: { type: Date }, // New field for Expiry (if applicable)
        notes: [{ type: String }], // Assuming notes should be an array of strings
        generalData: { type: Map, of: String }, // New field for general data, stored as a Map
        videoData: { type: Map, of: String }, // New field for video data, stored as a Map
        audioData: { type: Map, of: String }, // New field for audio data, stored as a Map
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
    }
});

const AdsSchedule = mongoose.model('AdsSchedule', adsScheduleSchema);

module.exports = AdsSchedule;