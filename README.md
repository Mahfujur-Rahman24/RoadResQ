# RoadResQ — MERN Stack Project

RoadResQ is a full-stack Smart Road Accident Reporting and Response System prototype built with **MongoDB, Express, React and Node.js**. It keeps the existing responsive React interface and connects accident reports, responder status changes, user login and hospital patient records to a MongoDB database.

## Features

- Public accident reporting without login
- Public live incident list and incident details
- Incident severity calculated from fire, serious bleeding, deceased count and number injured
- Role-based sign-in for responder, hospital and admin
- Public self-registration for responder and hospital organizations; admin self-registration is blocked
- Registration validates required fields, hashes passwords with bcrypt, prevents duplicate email addresses, and saves the account in MongoDB
- Responder registration includes service type: ambulance, police or fire service
- Successful registration signs the user in and opens the matching role dashboard
- JWT authentication and bcrypt-hashed demo passwords
- Responder incident workflow: Waiting → Accepted → Navigate → Arrived → Rescue Started → Completed
- Hospital incoming emergency list, patient records stored in MongoDB, and patient condition updates
- Public **View Patient Details** page at `/patients`, showing only hospital-published records
- Public patient listing is opt-in and requires hospital confirmation of patient/guardian consent
- Public directory hides private legal names, exact age, emergency contact and detailed clinical notes
- Live incident list refreshes from the API every 7 seconds; public patient directory refreshes every 10 seconds
- Admin dashboard UI and an admin statistics API
- MongoDB seed data and three demo accounts created automatically on first database connection
- Responsive React/Vite frontend

> This is an academic/demo starter, not a production emergency dispatch service. Real dispatch notifications, verified GPS/Leaflet maps, hospital bed synchronization, SMS/email alerts, audit/compliance controls, rate limiting, password reset, and production-grade authorization still need implementation before real-world use.

## Requirements

- Node.js 18 or newer
- npm
- MongoDB Community running locally, or a MongoDB Atlas connection string



## Public patient page

Open **View Patients** in the public navigation or visit `http://localhost:5173/patients`. To add a public-safe entry:
1. Sign in to the Hospital portal.
2. Save a patient record.
3. Tick the consent confirmation only when the patient/guardian has authorized this limited public disclosure.
4. Keep the public display name as `Unidentified patient` unless there is a valid reason and consent to use an alias.
5. Visit `/patients`; the new public-safe summary should appear and refresh automatically.

A patient record without the consent checkbox remains private and is visible only to its hospital account and admins.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API/database health |
| POST | `/api/auth/register` | Public (responder/hospital only) | Create an organization account in MongoDB and receive JWT |
| POST | `/api/auth/login` | Public | Sign in and receive JWT |
| GET | `/api/auth/me` | Signed in | Current account |
| GET | `/api/incidents` | Public | List incidents |
| GET | `/api/incidents/:id` | Public | Incident detail |
| POST | `/api/incidents` | Public | Submit an accident report |
| PATCH | `/api/incidents/:id/status` | Responder/Admin | Update rescue workflow status |
| GET | `/api/incidents/admin/statistics/summary` | Admin | Summary statistics |
| GET | `/api/patients/public` | Public | List only consented, published patient summaries |
| GET | `/api/patients` | Hospital/Admin | List authorized patient records |
| POST | `/api/patients` | Hospital/Admin | Save a patient record |
| PATCH | `/api/patients/:id` | Hospital/Admin | Update condition/treatment status |

## Project structure

```text
RoadResQ_MERN/
├── client/                  # React + Vite frontend
│   ├── src/App.jsx
│   ├── src/styles.css
│   └── api.js                # API client and JWT session helpers
├── server/
│   ├── index.js              # Express app, MongoDB connection and seed data
│   ├── models/               # User, Incident, Patient schemas
│   ├── routes/               # Auth, incident and patient endpoints
│   └── middleware/auth.js    # JWT and role checks
├── package.json
└── README.md
```

## Notes

- The database seed data is inserted only when the incidents collection is empty.
- Public visitors can view and submit incident reports without an account.
- The demo login credentials are for local development only.
- Accident and patient data can be sensitive. Do not use real personal or medical data in an unsecured demo deployment.


## Public patient information and privacy

The public `/patients` page is not a public dump of hospital records. A hospital must tick the consent confirmation when saving a patient before the limited summary is listed. The public endpoint returns only a display alias, gender (if shared), condition, incident number, hospital name, treatment status and last-updated time. It never returns the patient's private legal name, exact age, emergency contact or private clinical notes. Do not publish a patient's identity or medical information without a valid legal basis and documented consent. A public demo must use fictional test records only.

## Important operational limits

This is an academic demonstration project, not a certified emergency dispatch or hospital information system. The sample incidents and dashboard figures seeded for demonstration are not live emergency data. The map artwork in the current interface is illustrative rather than a verified GPS map. Bed availability is currently a local dashboard control and is not yet a multi-user synchronized inventory. Before real deployment, add HTTPS, strict CORS, rate limiting, input validation, audit logs, account provisioning and approval, secure password reset, backups, monitoring, formal privacy/legal review, and integration testing. Never use it as a substitute for calling emergency services.


