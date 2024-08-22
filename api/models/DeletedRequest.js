const mongoose = require('mongoose');

const deletedRequestSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true,
        ref: 'User' // Referencing the user model
    },
    deletedAt: {
        type: Date,
        default: Date.now // Automatically set to the current date and time when a document is created
    }
});

const DeletedRequest = mongoose.model('DeletedRequest', deletedRequestSchema);

module.exports = DeletedRequest;
