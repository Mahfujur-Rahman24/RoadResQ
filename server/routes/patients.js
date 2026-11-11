const router = require('express').Router();
const Patient = require('../models/Patient');
const { protect, allowRoles } = require('../middleware/auth');

// Public patient directory: only records explicitly published with consent.
// Never return legal name, age, emergency contact, or private clinical notes here.
router.get('/public', async (req, res) => {
  const patients = await Patient.find({ publicListing: true, consentToPublic: true })
    .populate('hospitalId', 'organization name')
    .select('publicDisplayName gender condition incident treatmentStatus createdAt updatedAt hospitalId')
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();

  res.json({
    patients: patients.map(p => ({
      id: String(p._id),
      displayName: p.publicDisplayName || 'Unidentified patient',
      gender: p.gender === 'Unknown' ? 'Not shared' : p.gender,
      condition: p.condition,
      incident: p.incident,
      treatmentStatus: p.treatmentStatus,
      hospitalName: p.hospitalId?.organization || p.hospitalId?.name || 'Hospital not specified',
      lastUpdated: p.updatedAt
    }))
  });
});

// All private patient-record routes below require an authorized hospital/admin login.
router.use(protect, allowRoles('hospital', 'admin'));

router.get('/', async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { hospitalId: req.user._id };
  const patients = await Patient.find(filter).sort({ createdAt: -1 }).limit(500);
  res.json({ patients });
});

router.post('/', async (req, res) => {
  const { name, age, gender, condition, incident, emergencyContact, publicListing, consentToPublic, publicDisplayName } = req.body;
  if (!name || !age || incident === undefined) {
    return res.status(400).json({ message: 'Patient name, age and incident are required.' });
  }
  if (publicListing && !consentToPublic) {
    return res.status(400).json({ message: 'Public listing requires confirmation of patient or guardian consent.' });
  }
  const patient = await Patient.create({
    name, age: String(age), gender, condition, incident: Number(incident),
    hospitalId: req.user._id, emergencyContact,
    publicListing: Boolean(publicListing && consentToPublic),
    consentToPublic: Boolean(consentToPublic),
    publicDisplayName: publicDisplayName?.trim() || 'Unidentified patient',
    treatmentStatus: 'Notification Received'
  });
  res.status(201).json({ patient, message: 'Patient record saved.' });
});

router.patch('/:id', async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user.role !== 'admin') filter.hospitalId = req.user._id;
  const updates = {};
  if (req.body.condition) updates.condition = req.body.condition;
  if (req.body.treatmentStatus) updates.treatmentStatus = req.body.treatmentStatus;
  if (typeof req.body.publicListing === 'boolean') {
    if (req.body.publicListing && !req.body.consentToPublic) {
      return res.status(400).json({ message: 'Public listing requires patient or guardian consent.' });
    }
    updates.publicListing = req.body.publicListing;
    updates.consentToPublic = Boolean(req.body.consentToPublic);
  }
  const patient = await Patient.findOneAndUpdate(filter, { $set: updates }, { new: true, runValidators: true });
  if (!patient) return res.status(404).json({ message: 'Patient record not found.' });
  res.json({ patient });
});

module.exports = router;
