const router = require('express').Router();
const Incident = require('../models/Incident');
const { protect, allowRoles } = require('../middleware/auth');
const toClient = doc => {
  const i = doc.toJSON ? doc.toJSON() : doc;
  const date = i.createdAt || i.accidentTime;
  const mins = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  return { ...i, time: mins < 1 ? 'Just now' : mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)} hr ago` };
};
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.severity) filter.severity = req.query.severity;
  const docs = await Incident.find(filter).sort({ createdAt: -1 }).limit(300);
  res.json({ incidents: docs.map(toClient) });
});
router.get('/:id', async (req, res) => {
  const doc = await Incident.findOne({ incidentNumber: Number(req.params.id) });
  if (!doc) return res.status(404).json({ message: 'Incident not found.' });
  res.json({ incident: toClient(doc) });
});
router.post('/', async (req, res) => {
  const b = req.body;
  if (!b.location || !b.type || !b.contact) return res.status(400).json({ message: 'Location, accident type and reporter contact are required.' });
  const last = await Incident.findOne().sort({ incidentNumber: -1 }).select('incidentNumber');
  const dead = Number(b.dead) || 0;
  const severity = dead > 0 || b.fire || b.bleeding ? 'Critical' : Number(b.injured) > 3 ? 'High' : 'Medium';
  const doc = await Incident.create({ incidentNumber: (last?.incidentNumber || 1023) + 1, location: b.location, type: b.type, injured: Number(b.injured) || 0, vehicles: Number(b.vehicles) || 1, fire: !!b.fire, blocked: !!b.blocked, bleeding: !!b.bleeding, dead, severity, status: 'Waiting', description: b.description || '', contact: b.contact, accidentTime: b.accidentTime || b.time || new Date(), lat: Number(b.lat) || undefined, lng: Number(b.lng) || undefined, responderType: b.fire ? 'fire' : 'ambulance', statusHistory: [{ status: 'Waiting', updatedBy: 'public reporter' }] });
  res.status(201).json({ incident: toClient(doc), message: 'Accident report received.' });
});
router.patch('/:id/status', protect, allowRoles('responder', 'admin'), async (req, res) => {
  const allowed = ['Waiting', 'Accepted', 'Navigate', 'Arrived', 'Rescue Started', 'Completed', 'Assigned'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid incident status.' });
  const doc = await Incident.findOneAndUpdate({ incidentNumber: Number(req.params.id) }, { $set: { status: req.body.status }, $push: { statusHistory: { status: req.body.status, updatedBy: req.user.email, updatedAt: new Date() } } }, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ message: 'Incident not found.' });
  res.json({ incident: toClient(doc) });
});

router.patch('/:id/hospital-status', protect, allowRoles('hospital', 'admin'), async (req, res) => {
  const allowed = ['Notification Received', 'Accept Patient', 'Treatment Started', 'Patient Status Updated'];
  if (!allowed.includes(req.body.hospitalStatus)) return res.status(400).json({ message: 'Invalid hospital status.' });
  const doc = await Incident.findOneAndUpdate({ incidentNumber: Number(req.params.id) }, { $set: { hospitalStatus: req.body.hospitalStatus } }, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ message: 'Incident not found.' });
  res.json({ incident: toClient(doc) });
});
router.get('/admin/statistics/summary', protect, allowRoles('admin'), async (req, res) => {
  const [total, active, critical, resolved, byType] = await Promise.all([
    Incident.countDocuments(), Incident.countDocuments({ status: { $ne: 'Completed' } }), Incident.countDocuments({ severity: 'Critical', status: { $ne: 'Completed' } }), Incident.countDocuments({ status: 'Completed' }), Incident.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }, { $sort: { count: -1 } }])
  ]);
  res.json({ total, active, critical, resolved, byType });
});
module.exports = router;
