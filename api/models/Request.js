const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['completed', 'unfinished'],
        default: 'unfinished'
    },
    description: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    }
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
