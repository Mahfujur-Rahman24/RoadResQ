require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Incident = require('./models/Incident');
const User = require('./models/User');
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_, res) => res.json({ ok: true, service: 'RoadResQ API', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/patients', require('./routes/patients'));
app.use((err, req, res, next) => { console.error(err); res.status(err.status || 500).json({ message: err.message || 'Internal server error.' }); });
const sampleIncidents = [
  { incidentNumber: 1024, location: 'Tongi, Gazipur', type: 'Vehicle collision', injured: 4, vehicles: 2, fire: false, blocked: true, bleeding: true, dead: 0, severity: 'Critical', status: 'Waiting', description: 'Two vehicles collided near the main junction. Traffic is moving slowly.', contact: '+880 17XX-XXX-245', lat: 23.8988, lng: 90.4032 },
  { incidentNumber: 1018, location: 'Savar, Dhaka', type: 'Motorcycle accident', injured: 2, vehicles: 1, fire: false, blocked: false, bleeding: false, dead: 0, severity: 'High', status: 'Accepted', description: 'Motorcycle and car collision near Savar bus stand.', contact: '+880 18XX-XXX-814', lat: 23.8583, lng: 90.2667 },
  { incidentNumber: 1007, location: 'Keraniganj, Dhaka', type: 'Bus accident', injured: 6, vehicles: 3, fire: true, blocked: true, bleeding: true, dead: 1, severity: 'Critical', status: 'Rescue Started', description: 'Bus overturned; smoke reported. Fire service and ambulance requested.', contact: '+880 16XX-XXX-992', lat: 23.6978, lng: 90.3440 },
  { incidentNumber: 1002, location: 'Uttara, Dhaka', type: 'Pedestrian accident', injured: 1, vehicles: 1, fire: false, blocked: false, bleeding: false, dead: 0, severity: 'Medium', status: 'Completed', description: 'Pedestrian hit by a private car. One person taken to hospital.', contact: '+880 19XX-XXX-603', lat: 23.8759, lng: 90.3795 }
];
async function seedDatabase() {
  if (await Incident.countDocuments() === 0) await Incident.insertMany(sampleIncidents);
  const demoUsers = [
    { name: 'RoadResQ Admin', email: 'admin@roadresq.demo', password: 'Admin123!', role: 'admin', organization: 'RoadResQ' },
    { name: 'Emergency Responder', email: 'responder@roadresq.demo', password: 'Responder123!', role: 'responder', organization: 'Emergency Response Unit' },
    { name: 'Hospital Coordinator', email: 'hospital@roadresq.demo', password: 'Hospital123!', role: 'hospital', organization: 'RoadResQ Partner Hospital' }
  ];
  for (const u of demoUsers) {
    if (!(await User.findOne({ email: u.email }))) await User.create({ ...u, password: await bcrypt.hash(u.password, 12) });
  }
}
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/roadresq';
mongoose.connect(MONGO_URI).then(async () => {
  console.log('MongoDB connected'); await seedDatabase(); console.log('Demo data ready');
}).catch(err => { console.error('MongoDB connection failed:', err.message); console.error('Start MongoDB or configure MONGO_URI in server/.env'); });
app.listen(PORT, () => console.log(`RoadResQ API listening on http://localhost:${PORT}`));
