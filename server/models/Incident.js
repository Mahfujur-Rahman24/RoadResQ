const mongoose = require('mongoose');
const incidentSchema = new mongoose.Schema({
  incidentNumber: { type: Number, unique: true, index: true },
  location: { type: String, required: true, trim: true },
  type: { type: String, required: true },
  injured: { type: Number, min: 0, default: 0 },
  vehicles: { type: Number, min: 1, default: 1 },
  fire: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  bleeding: { type: Boolean, default: false },
  dead: { type: Number, min: 0, default: 0 },
  severity: { type: String, enum: ['Critical', 'High', 'Medium'], default: 'Medium' },
  status: { type: String, enum: ['Waiting', 'Accepted', 'Navigate', 'Arrived', 'Rescue Started', 'Completed', 'Assigned'], default: 'Waiting' },
  description: { type: String, default: '' },
  contact: { type: String, required: true },
  accidentTime: { type: Date, default: Date.now },
  lat: Number,
  lng: Number,
  responderType: { type: String, enum: ['ambulance', 'fire', 'police', 'rescue'], default: 'ambulance' },
  hospitalStatus: { type: String, enum: ['Notification Received', 'Accept Patient', 'Treatment Started', 'Patient Status Updated'], default: 'Notification Received' },
  statusHistory: [{ status: String, updatedAt: { type: Date, default: Date.now }, updatedBy: String }]
}, { timestamps: true });
incidentSchema.set('toJSON', { virtuals: true, transform: (_, ret) => { ret.id = ret.incidentNumber; delete ret._id; delete ret.__v; return ret; } });
module.exports = mongoose.model('Incident', incidentSchema);
