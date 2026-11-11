const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['responder', 'hospital', 'admin'], required: true },
  responderType: { type: String, enum: ['ambulance', 'police', 'fire', ''], default: '' },
  organization: { type: String, default: '', trim: true, maxlength: 140 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
