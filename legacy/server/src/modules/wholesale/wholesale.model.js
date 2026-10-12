const mongoose = require('mongoose');

const wholesaleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    comment: {
        type: String
    },
    file: {
        type: String
    },
    status: {
        type: String,
        enum: ["new", "processed", "rejected"],
        default: "new"
    }
}, { timestamps: true });

module.exports = mongoose.model('Wholesale', wholesaleSchema);
