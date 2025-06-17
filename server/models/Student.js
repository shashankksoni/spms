
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: String,
    phone: String,
    cfHandle: String,
    currentRating: Number,
    maxRating: Number,
    cfData: Object,
    lastSynced: Date,
    emailReminders: {
        sent: { type: Number, default: 0 },
        disabled: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);