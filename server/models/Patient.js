const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  // Private clinical record fields: only the treating hospital and admins can read these.
  name: { type: String, required: true, trim: true, maxlength: 120 },
  age: { type: String, required: true, trim: true, maxlength: 20 },
  gender: { type: String, enum: ['Unknown', 'Female', 'Male', 'Other'], default: 'Unknown' },
  condition: { type: String, enum: ['Critical', 'Serious', 'Stable', 'Under treatment', 'Discharged'], default: 'Critical' },
  incident: { type: Number, required: true, index: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  treatmentStatus: { type: String, enum: ['Notification Received', 'Accept Patient', 'Treatment Started', 'Patient Status Updated'], default: 'Notification Received' },
  emergencyContact: { type: String, select: false },
  // Public directory is opt-in and requires hospital confirmation of consent.
  publicListing: { type: Boolean, default: false, index: true },
  consentToPublic: { type: Boolean, default: false },
  publicDisplayName: { type: String, trim: true, maxlength: 80, default: 'Unidentified patient' }
}, { timestamps: true });

patientSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; delete ret.emergencyContact; return ret; }
});

module.exports = mongoose.model('Patient', patientSchema);
