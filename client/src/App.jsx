import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest, setSession, clearSession, getSessionUser } from '../api.js';
import {
  ShieldCheck, Siren, MapPin, Menu, X, ArrowRight, AlertTriangle, Ambulance,
  Hospital, Flame, Shield, Activity, Clock3, CheckCircle2, Users, Navigation,
  Bell, Search, Filter, ChevronRight, Plus, Minus, LocateFixed, HeartPulse,
  Phone, CalendarClock, BedDouble, UserRound, LogIn, LayoutDashboard, ClipboardList,
  BarChart3, Map as MapIcon, Settings, LogOut, Save, Check, CircleAlert, CarFront,
  Route as RouteIcon, Eye, EyeOff, Radio, UserCheck, Cross, FileText, Info
} from 'lucide-react';

const initialIncidents = [
  { id: 1024, location: 'Tongi, Gazipur', type: 'Vehicle collision', injured: 4, vehicles: 2, fire: false, blocked: true, bleeding: true, dead: 0, severity: 'Critical', status: 'Waiting', time: '12 min ago', description: 'Two vehicles collided near the main junction. Traffic is moving slowly.', contact: '+880 17XX-XXX-245', lat: 23.8988, lng: 90.4032 },
  { id: 1018, location: 'Savar, Dhaka', type: 'Motorcycle accident', injured: 2, vehicles: 1, fire: false, blocked: false, bleeding: false, dead: 0, severity: 'High', status: 'Accepted', time: '28 min ago', description: 'Motorcycle and car collision near Savar bus stand.', contact: '+880 18XX-XXX-814', lat: 23.8583, lng: 90.2667 },
  { id: 1007, location: 'Keraniganj, Dhaka', type: 'Bus accident', injured: 6, vehicles: 3, fire: true, blocked: true, bleeding: true, dead: 1, severity: 'Critical', status: 'Rescue Started', time: '1 hr ago', description: 'Bus overturned; smoke reported. Fire service and ambulance requested.', contact: '+880 16XX-XXX-992', lat: 23.6978, lng: 90.3440 },
  { id: 1002, location: 'Uttara, Dhaka', type: 'Pedestrian accident', injured: 1, vehicles: 1, fire: false, blocked: false, bleeding: false, dead: 0, severity: 'Medium', status: 'Completed', time: '2 hr ago', description: 'Pedestrian hit by a private car. One person taken to hospital.', contact: '+880 19XX-XXX-603', lat: 23.8759, lng: 90.3795 }
];
const steps = ['Waiting', 'Accepted', 'Navigate', 'Arrived', 'Rescue Started', 'Completed'];
const moneylessStats = [
  { label: 'Total accidents', value: '1,284', change: 'This year', icon: Activity, color: 'blue' },
  { label: 'Active incidents', value: '12', change: 'Across Bangladesh', icon: Radio, color: 'teal' },
  { label: 'Critical cases', value: '03', change: 'Need urgent response', icon: Siren, color: 'red' },
  { label: 'Resolved', value: '1,102', change: '85.8% resolution', icon: CheckCircle2, color: 'green' }
];

function Logo({ light = false }) {
  return <Link className={`brand ${light ? 'brand-light' : ''}`} to="/">
    <span className="brand-mark"><ShieldCheck size={27} strokeWidth={2.4}/><span className="brand-dot">Q</span></span>
    <span>Road<span>ResQ</span></span>
  </Link>;
}
function Header() {
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  const navs = [['Home','/'],['How It Works','/#how-it-works'],['Live Incidents','/incidents'],['View Patients','/patients'],['About','/#about']];
  return <header className="site-header">
    <div className="nav-wrap">
      <Logo />
      <button className="mobile-menu icon-btn" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X/> : <Menu/>}</button>
      <nav className={menu ? 'main-nav open' : 'main-nav'}>
        {navs.map(([name, path]) => <Link key={name} onClick={() => setMenu(false)} className={(loc.pathname === path ? 'active' : '')} to={path}>{name}</Link>)}
      </nav>
      <div className="nav-actions"><Link className="login-link" to="/login"><UserRound size={17}/> Login</Link><Link className="btn btn-danger btn-small" to="/report"><AlertTriangle size={16}/> Report Accident</Link></div>
    </div>
  </header>;
}
function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><Logo light/><span>Safer Roads. Stronger Communities.</span><span>Bangladesh · © 2026 RoadResQ</span></div></footer>;
}
function MapVisual({ incidents = initialIncidents, compact = false, onSelect }) {
  return <div className={`map-visual ${compact ? 'map-compact' : ''}`}>
    <div className="map-grid"></div><div className="map-river"></div>
    <svg className="map-roads" viewBox="0 0 800 380" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-20 90 C120 120 200 40 340 110 S580 250 820 130" />
      <path d="M60 -20 C170 90 100 190 250 410" />
      <path d="M450 -20 C400 110 560 190 470 410" />
      <path d="M-10 300 C180 250 320 340 430 260 S660 200 810 320" />
      <path d="M670 -20 C600 80 700 180 620 400" />
      <path d="M0 190 L800 190" />
    </svg>
    <span className="map-label label-dhaka">Dhaka</span><span className="map-label label-tongi">Tongi</span><span className="map-label label-savar">Savar</span><span className="map-label label-gazipur">Gazipur</span>
    {incidents.slice(0, compact ? 3 : 4).map((it, i) => <button key={it.id} className={`map-pin pin-${i+1}`} onClick={() => onSelect?.(it)} title={`Incident #${it.id} · ${it.location}`}><MapPin size={compact ? 22 : 26} fill="currentColor"/><span>{it.id}</span></button>)}
    {!compact && <div className="map-controls"><button aria-label="Zoom in"><Plus size={16}/></button><button aria-label="Zoom out"><Minus size={16}/></button><button aria-label="Locate"><LocateFixed size={16}/></button></div>}
    <div className="map-legend"><span><i className="legend-dot red-dot"></i> Critical</span><span><i className="legend-dot teal-dot"></i> Active</span></div>
  </div>;
}
function StatCard({ item }) {
  const Icon = item.icon;
  return <div className="stat-card"><div className={`stat-icon ${item.color}`}><Icon size={21}/></div><div><p>{item.label}</p><strong>{item.value}</strong><small>{item.change}</small></div><span className="stat-spark">↗</span></div>;
}
function IncidentRow({ incident, onClick }) {
  return <button className="incident-row" onClick={() => onClick?.(incident)}>
    <span className="incident-pin"><MapPin size={18} fill="currentColor"/></span>
    <span className="incident-main"><b>INCIDENT #{incident.id}</b><small>{incident.location} · {incident.time}</small></span>
    <span className={`status-pill ${incident.status === 'Completed' ? 'resolved' : incident.severity === 'Critical' ? 'critical' : 'active'}`}>{incident.status}</span>
    <span className="row-arrow"><ChevronRight size={18}/></span>
  </button>;
}
function Home({ incidents }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  return <>
    <Header/>
    <main>
      <section className="hero">
        <div className="hero-bg-orb orb-one"></div><div className="hero-bg-orb orb-two"></div>
        <div className="hero-content">
          <div className="eyebrow"><span className="pulse"></span> BANGLADESH'S ROAD ACCIDENT REPORTING & RESPONSE PLATFORM</div>
          <h1>Every Second Matters.<br/><span>Every Report Saves Lives.</span></h1>
          <p>Report road accidents quickly and connect emergency responders, hospitals and communities for a faster, smarter and safer response across Bangladesh.</p>
          <div className="hero-buttons"><Link className="btn btn-primary" to="/report"><AlertTriangle size={18}/> Report an Accident</Link><Link className="btn btn-outline" to="/incidents"><MapPin size={18}/> View Live Incidents</Link></div>
          <div className="trust-row"><span><CheckCircle2/> Fast reporting</span><i></i><span><CheckCircle2/> Coordinated response</span><i></i><span><CheckCircle2/> Better outcomes</span></div>
        </div>
        <div className="hero-art">
          <div className="hero-map"><MapVisual incidents={incidents} compact onSelect={setSelected}/></div>
          <div className="incident-float"><div className="float-top"><span className="alert-square"><Siren size={16}/></span><b>INCIDENT #{selected?.id || incidents[0]?.id || 1024}</b><span className="live-tag">LIVE</span></div><p><MapPin size={15}/>{selected?.location || incidents[0]?.location || 'Tongi, Gazipur'}</p><p><Users size={15}/>{selected?.injured ?? incidents[0]?.injured ?? 4} injured · {selected?.vehicles ?? incidents[0]?.vehicles ?? 2} vehicles</p><div className="responders-notified"><CheckCircle2 size={15}/> Responders notified</div></div>
          <div className="ambulance-float"><Ambulance size={32}/><span><b>Emergency response</b><small>Dispatch coordination active</small></span><span className="signal-wave"><i></i><i></i><i></i></span></div>
          <div className="floating-coord coord-one">23.8988° N <span>90.4032° E</span></div>
        </div>
      </section>
      <section className="feature-section section-wrap" id="services">
        <Link to="/report" className="feature-card"><span className="feature-icon red-soft"><Siren size={25}/></span><span><b>Report an Accident</b><small>Share accident details, location and injuries to get help faster.</small><em>Start a report <ArrowRight size={14}/></em></span><span className="feature-arrow"><ArrowRight/></span></Link>
        <Link to="/register?role=responder" className="feature-card"><span className="feature-icon teal-soft"><Ambulance size={27}/></span><span><b>Responder Portal</b><small>Create an account for ambulance, police or fire response teams.</small><em>Register responder <ArrowRight size={14}/></em></span><span className="feature-arrow"><ArrowRight/></span></Link>
        <Link to="/register?role=hospital" className="feature-card"><span className="feature-icon blue-soft"><Hospital size={26}/></span><span><b>Hospital Portal</b><small>Register your hospital to receive incident information and manage patient updates.</small><em>Register hospital <ArrowRight size={14}/></em></span><span className="feature-arrow"><ArrowRight/></span></Link>
      </section>
      <section className="live-section section-wrap">
        <div className="live-map-card"><div className="section-card-head"><div><h2>Accident locations</h2><p>Recent reported incidents across the area</p></div><span className="map-live"><span className="pulse"></span> LIVE MAP</span></div><MapVisual incidents={incidents} onSelect={setSelected}/></div>
        <div className="live-activity card"><div className="section-card-head"><div><h2><Activity size={20}/> Live incident activity</h2><p>Latest community reports</p></div><Link to="/incidents" className="view-all">View all <ArrowRight size={14}/></Link></div><div className="activity-summary"><span>● Active <b>{incidents.filter(i=>i.status!=='Completed').length}</b></span><span className="critical-count">● Critical <b>{incidents.filter(i=>i.severity==='Critical').length}</b></span><span className="resolved-count">● Resolved <b>{incidents.filter(i=>i.status==='Completed').length}</b></span></div><div className="incident-list">{incidents.slice(0,4).map(i=><IncidentRow key={i.id} incident={i} onClick={setSelected}/>)}</div>{selected && <div className="selected-detail"><button onClick={()=>setSelected(null)} aria-label="Close"><X size={15}/></button><b>Incident #{selected.id}: {selected.location}</b><small>{selected.description}</small><Link to={`/incidents/${selected.id}`}>View incident details <ArrowRight size={13}/></Link></div>}</div>
      </section>
      <section className="how-section" id="how-it-works"><div className="section-wrap"><div className="center-heading"><span className="eyebrow">HOW ROADRESQ WORKS</span><h2>One report. A coordinated response.</h2><p>From the first alert to patient care, everyone stays connected.</p></div><div className="steps-grid">{[{n:'01',icon:ClipboardList,title:'Report the incident',desc:'Anyone can report an accident without creating an account.'},{n:'02',icon:Radio,title:'Responders are alerted',desc:'Ambulance, police and fire service receive relevant details.'},{n:'03',icon:Hospital,title:'Hospitals prepare',desc:'Nearby hospitals receive incoming patient information and ETA.'},{n:'04',icon:HeartPulse,title:'Track the outcome',desc:'Response and patient status updates help families and teams.'}].map(s=><div className="how-step" key={s.n}><span className="step-number">{s.n}</span><span className="step-icon"><s.icon size={23}/></span><h3>{s.title}</h3><p>{s.desc}</p></div>)}</div></div></section>
      <section className="cta-section section-wrap"><div><span className="eyebrow">SEE AN ACCIDENT?</span><h2>Your report can help save a life.</h2><p>Share the details you know. Emergency teams can take it from there.</p></div><Link to="/report" className="btn btn-danger"><AlertTriangle size={18}/> Report Accident Now <ArrowRight size={16}/></Link></section>
    </main><Footer/>
  </>;
}
function ReportPage({ onSubmit }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ type:'Vehicle collision', injured:'1', vehicles:'2', fire:'No', blocked:'No', bleeding:'No', dead:'No', deadCount:'0', description:'', location:'', time:new Date().toISOString().slice(0,16), contact:'' });
  const [locating, setLocating] = useState(false);
  const update = (key,val)=>setForm(f=>({...f,[key]:val}));
  const submit = async e => { e.preventDefault(); try { const item=await onSubmit(form); navigate(`/incidents/${item.id}`,{state:{newReport:true}}); } catch (err) { alert(err.message || 'Could not submit the report.'); } };
  return <><Header/><main className="page-shell"><div className="breadcrumb"><Link to="/">Home</Link><ChevronRight size={14}/> Report an accident</div><div className="page-title-row"><div><span className="eyebrow">COMMUNITY REPORTING</span><h1>Report an accident</h1><p>Give us the details you know. Fields marked * are required.</p></div><div className="secure-note"><ShieldCheck size={18}/><span><b>No login required</b><small>Your report helps coordinate emergency response.</small></span></div></div>
    <form className="form-layout" onSubmit={submit}><div className="form-main card"><div className="form-section-title"><span>01</span><div><h2>Incident details</h2><p>What happened at the scene?</p></div></div>
      <div className="form-grid"><label>Accident type *<select required value={form.type} onChange={e=>update('type',e.target.value)}>{['Vehicle collision','Motorcycle accident','Bus accident','Pedestrian accident','Truck accident','Vehicle fire','Other'].map(x=><option key={x}>{x}</option>)}</select></label><label>Time of accident *<input type="datetime-local" required value={form.time} onChange={e=>update('time',e.target.value)}/></label><label>Number of injured people *<input min="0" type="number" required value={form.injured} onChange={e=>update('injured',e.target.value)}/></label><label>Number of vehicles involved *<input min="1" type="number" required value={form.vehicles} onChange={e=>update('vehicles',e.target.value)}/></label></div>
      <div className="form-section-title spaced"><span>02</span><div><h2>Scene conditions</h2><p>Help responders understand the urgency.</p></div></div>
      <div className="condition-grid">{[['fire','Fire involved?'],['blocked','Road blocked?'],['bleeding','Serious bleeding?'],['dead','Any deceased?']].map(([k,l])=><div className="condition-control" key={k}><span>{l}</span><div className="segmented"><button type="button" className={form[k]==='No'?'selected':''} onClick={()=>update(k,'No')}>No</button><button type="button" className={form[k]==='Yes'?'selected yes':''} onClick={()=>update(k,'Yes')}>Yes</button></div></div>)}</div>
      {form.dead==='Yes'&&<label className="dead-count">Number of deceased people *<input min="1" type="number" required value={form.deadCount} onChange={e=>update('deadCount',e.target.value)}/></label>}
      <div className="form-section-title spaced"><span>03</span><div><h2>Location & description</h2><p>Be as specific as possible.</p></div></div>
      <label>Accident location *<div className="input-with-action"><MapPin size={18}/><input required placeholder="Road, area, landmark or address" value={form.location} onChange={e=>update('location',e.target.value)}/><button type="button" onClick={()=>{setLocating(true);setTimeout(()=>{update('location',form.location||'Near my current location, Dhaka');setLocating(false)},450)}}><LocateFixed size={15}/>{locating?'Locating…':'Use location'}</button></div></label>
      <label className="description-label">Description<textarea rows="4" placeholder="Describe what happened, visible hazards, landmarks or anything responders should know…" value={form.description} onChange={e=>update('description',e.target.value)}/></label>
      <div className="form-section-title spaced"><span>04</span><div><h2>Reporter contact</h2><p>Responders may call to clarify information.</p></div></div>
      <label>Contact number *<div className="input-with-action"><Phone size={17}/><input required type="tel" placeholder="+880 1XXX-XXXXXX" value={form.contact} onChange={e=>update('contact',e.target.value)}/></div></label>
      <div className="form-footer"><span><ShieldCheck size={17}/> Please share only information you know to be accurate.</span><button className="btn btn-primary" type="submit"><Siren size={17}/> Submit accident report <ArrowRight size={16}/></button></div>
    </div><aside className="form-aside"><div className="card response-info"><span className="aside-icon"><Siren size={22}/></span><h3>What happens next?</h3><ol><li><b>Report received</b><small>Your incident is added to the live incident list.</small></li><li><b>Responders alerted</b><small>Relevant teams are notified based on fire and incident details.</small></li><li><b>Hospital coordination</b><small>Hospitals can prepare for incoming patients.</small></li></ol></div><div className="emergency-note"><AlertTriangle size={20}/><div><b>Life-threatening emergency?</b><p>Call your local emergency number immediately. This demo form does not dispatch real emergency services.</p></div></div><div className="card form-map-preview"><h3><MapPin size={17}/> Location preview</h3><MapVisual incidents={[]} compact/><small>Map preview is illustrative in this frontend demo.</small></div></aside></form></main><Footer/></>;
}
function IncidentsPage({ incidents }) {
  const [query,setQuery]=useState(''); const [status,setStatus]=useState('All'); const [severity,setSeverity]=useState('All');
  const filtered=incidents.filter(i=>(`${i.id} ${i.location} ${i.type}`.toLowerCase().includes(query.toLowerCase()))&&(status==='All'||i.status===status)&&(severity==='All'||i.severity===severity));
  return <><Header/><main className="page-shell"><div className="breadcrumb"><Link to="/">Home</Link><ChevronRight size={14}/> Live incidents</div><div className="page-title-row"><div><span className="eyebrow">COMMUNITY SAFETY</span><h1>Live incidents</h1><p>Review recent accident reports and their current response status.</p></div><Link className="btn btn-primary" to="/report"><Plus size={17}/> Report an accident</Link></div><div className="incident-page-grid"><div className="card incident-table-card"><div className="filter-row"><div className="search-box"><Search size={17}/><input placeholder="Search incident or location…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="select-filter"><Filter size={16}/><select value={status} onChange={e=>setStatus(e.target.value)}>{['All','Waiting','Accepted','Navigate','Arrived','Rescue Started','Completed','Assigned'].map(s=><option>{s}</option>)}</select></div><select className="severity-filter" value={severity} onChange={e=>setSeverity(e.target.value)}>{[['All','All severity'],['Critical','Critical'],['High','High'],['Medium','Medium']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div><div className="table-header"><span>INCIDENT</span><span>TYPE / DETAILS</span><span>SEVERITY</span><span>STATUS</span><span></span></div>{filtered.length?filtered.map(i=><div className="table-row" key={i.id}><div><b>#{i.id}</b><small>{i.location}</small><small>{i.time}</small></div><div><b>{i.type}</b><small>{i.injured} injured · {i.vehicles} vehicles</small></div><span className={`severity-text ${i.severity.toLowerCase()}`}><i></i>{i.severity}</span><span className={`status-pill ${i.status==='Completed'?'resolved':'active'}`}>{i.status}</span><Link to={`/incidents/${i.id}`} className="circle-arrow"><ArrowRight size={16}/></Link></div>):<div className="empty-state"><Search size={26}/><b>No matching incidents</b><p>Try changing your search or filters.</p></div>}</div><aside className="card incidents-map-side"><h3><MapIcon size={18}/> Incident map</h3><p>Reported accident locations</p><MapVisual incidents={filtered} compact/><div className="map-side-stats"><span><i className="legend-dot red-dot"></i> Critical</span><span><i className="legend-dot teal-dot"></i> Active</span></div><div className="map-disclaimer"><Info size={15}/> Demo locations only. Live geolocation requires a map service and backend.</div></aside></div></main><Footer/></>;
}
function IncidentDetail({ incidents, onUpdate }) {
  const { pathname }=useLocation(); const id=Number(pathname.split('/').pop()); const incident=incidents.find(i=>i.id===id);
  const [showContact,setShowContact]=useState(false);
  if(!incident)return <><Header/><main className="page-shell"><div className="empty-state"><CircleAlert/><h2>Incident not found</h2><Link to="/incidents" className="btn btn-primary">Back to incidents</Link></div></main><Footer/></>;
  return <><Header/><main className="page-shell"><div className="breadcrumb"><Link to="/">Home</Link><ChevronRight size={14}/><Link to="/incidents">Live incidents</Link><ChevronRight size={14}/> Incident #{incident.id}</div><div className="page-title-row"><div><span className="eyebrow">INCIDENT REPORT</span><h1>Incident #{incident.id}</h1><p><MapPin size={16} className="inline-icon"/> {incident.location} · Reported {incident.time}</p></div><span className={`status-pill large ${incident.status==='Completed'?'resolved':'active'}`}>{incident.status}</span></div><div className="detail-grid"><div className="detail-main"><div className="card detail-card"><div className="detail-head"><div><span className={`severity-badge ${incident.severity.toLowerCase()}`}>{incident.severity} priority</span><h2>{incident.type}</h2><p>{incident.description || 'No additional description provided.'}</p></div><div className="detail-alert"><Siren size={22}/></div></div><div className="detail-metrics"><div><Users/><small>Injured people</small><b>{incident.injured}</b></div><div><CarFront/><small>Vehicles</small><b>{incident.vehicles}</b></div><div><Flame/><small>Fire involved</small><b>{incident.fire?'Yes':'No'}</b></div><div><AlertTriangle/><small>Road blocked</small><b>{incident.blocked?'Yes':'No'}</b></div><div><HeartPulse/><small>Serious bleeding</small><b>{incident.bleeding?'Yes':'No'}</b></div><div><Cross/><small>Deceased</small><b>{incident.dead}</b></div></div><h3 className="subsection-heading">Response timeline</h3><div className="timeline">{steps.map((s,i)=>{const idx=steps.indexOf(incident.status); const done=i<=idx;return <div className={`timeline-step ${done?'done':''}`} key={s}><span>{done?<Check size={13}/>:i+1}</span><div><b>{s}</b><small>{done?(i===0?'Report received':'Status updated'):'Awaiting update'}</small></div></div>})}</div></div><div className="card detail-map"><h3><MapPin size={18}/> Incident location</h3><MapVisual incidents={[incident]} compact/><div className="location-line"><b>{incident.location}</b><small>Approximate location · Bangladesh</small></div></div></div><aside className="detail-side"><div className="card reporter-card"><h3><UserRound size={18}/> Reporter information</h3><p>Reporter contact is available to response teams.</p><button className="btn btn-outline full-width" onClick={()=>setShowContact(!showContact)}>{showContact?<EyeOff size={16}/>:<Eye size={16}/>} {showContact?'Hide contact':'Show contact number'}</button>{showContact&&<div className="contact-reveal"><Phone size={16}/>{incident.contact}</div>}</div><div className="card response-card"><h3><Activity size={18}/> Response coordination</h3><div className="coord-row"><Ambulance/><span><b>Ambulance</b><small>{incident.status==='Completed'?'Transport completed':'Notification queued'}</small></span><span className="mini-status">{incident.status==='Completed'?'Done':'Alert'}</span></div>{incident.fire&&<div className="coord-row"><Flame/><span><b>Fire service</b><small>Fire involvement reported</small></span><span className="mini-status red-mini">Alert</span></div>}<div className="coord-row"><Shield/><span><b>Police</b><small>Traffic and scene support</small></span><span className="mini-status">Alert</span></div><div className="demo-note"><Info size={15}/> This is a frontend demo. No real emergency service has been contacted.</div></div><Link to="/incidents" className="back-link">← Back to all incidents</Link></aside></div></main><Footer/></>;
}
function PublicPatientsPage() {
  const [patients,setPatients]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [condition,setCondition]=useState('All');
  const load=async()=>{
    try { const data=await apiRequest('/patients/public'); setPatients(data.patients||[]); setError(''); }
    catch(err){ setError(err.message||'Could not load patient directory.'); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); const timer=setInterval(load,10000); return ()=>clearInterval(timer); },[]);
  const filtered=patients.filter(p=>(`${p.displayName} ${p.hospitalName} ${p.incident}`.toLowerCase().includes(query.toLowerCase()))&&(condition==='All'||p.condition===condition));
  return <><Header/><main className="page-shell">
    <div className="breadcrumb"><Link to="/">Home</Link><ChevronRight size={14}/> View patient details</div>
    <div className="page-title-row"><div><span className="eyebrow">PUBLIC PATIENT DIRECTORY</span><h1>Patient information</h1><p>View limited updates for patients whose hospital has confirmed permission to share them.</p></div><span className="availability"><span className="pulse"></span> Updates every 10 seconds</span></div>
    <div className="patient-directory-notice"><ShieldCheck size={20}/><div><b>Privacy protected</b><p>Only consented public records appear here. Private names, exact age, phone numbers, addresses and detailed medical notes are never shown.</p></div></div>
    <div className="patient-directory-toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search patient alias, hospital or incident…"/></div><select value={condition} onChange={e=>setCondition(e.target.value)}><option>All</option><option>Critical</option><option>Serious</option><option>Stable</option><option>Under treatment</option><option>Discharged</option></select></div>
    {loading?<div className="empty-state"><Activity/><b>Loading patient information…</b></div>:error?<div className="empty-state"><CircleAlert/><b>{error}</b><button className="btn btn-outline" onClick={load}>Try again</button></div>:filtered.length===0?<div className="empty-state"><Users/><b>No public patient records yet</b><p>Hospitals can publish limited details only after confirming patient or guardian consent.</p></div>:
      <div className="public-patient-grid">{filtered.map(p=><article className="public-patient-card" key={p.id}><div className="public-patient-top"><span className="patient-avatar"><UserRound/></span><span className={`condition-pill ${p.condition.toLowerCase().replaceAll(' ','-')}`}>{p.condition}</span></div><h2>{p.displayName}</h2><p className="public-patient-hospital"><Hospital size={16}/>{p.hospitalName}</p><div className="public-patient-facts"><span><small>Gender</small><b>{p.gender}</b></span><span><small>Incident</small><b>#{p.incident}</b></span><span><small>Treatment</small><b>{p.treatmentStatus}</b></span></div><small className="public-patient-updated">Updated {new Date(p.lastUpdated).toLocaleString()}</small></article>)}</div>}
  </main><Footer/></>;
}


function RegisterPage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const [role, setRole] = useState(params.get('role') === 'hospital' ? 'hospital' : 'responder');
  const [form, setForm] = useState({ name: '', email: '', password: '', organization: '', responderType: 'ambulance' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const change = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, role })
      });
      setSession(data.token, data.user);
      navigate(role === 'hospital' ? '/hospital' : '/responder');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <>
    <Header/>
    <main className="login-page register-page">
      <div className="login-art">
        <div className="login-shield"><ShieldCheck size={80}/></div>
        <span className="eyebrow">JOIN THE ROADRESQ NETWORK</span>
        <h1>Work together.<br/><span>Respond faster.</span></h1>
        <p>Create an organization account to coordinate emergency response and hospital care through one connected platform.</p>
        <div className="login-benefit"><CheckCircle2/> Secure account with encrypted password</div>
        <div className="login-benefit"><CheckCircle2/> Your account is stored in MongoDB</div>
        <div className="login-benefit"><CheckCircle2/> Dedicated organization dashboard</div>
      </div>
      <form className="login-form card register-form" onSubmit={submit}>
        <span className="eyebrow">CREATE ORGANIZATION ACCOUNT</span>
        <h2>Register for RoadResQ</h2>
        <p>Registration is available for responders and hospitals.</p>
        <label>Account type
          <select value={role} onChange={e => { setRole(e.target.value); setError(''); }}>
            <option value="responder">Emergency responder</option>
            <option value="hospital">Hospital</option>
          </select>
        </label>
        <label>Contact person name
          <input required minLength="2" maxLength="100" value={form.name} onChange={e=>change('name',e.target.value)} placeholder="Your full name"/>
        </label>
        <label>Organization / service name
          <input required minLength="2" maxLength="140" value={form.organization} onChange={e=>change('organization',e.target.value)} placeholder={role === 'hospital' ? 'e.g. City General Hospital' : 'e.g. Dhaka Ambulance Service'}/>
        </label>
        {role === 'responder' && <label>Responder service
          <select value={form.responderType} onChange={e=>change('responderType',e.target.value)}>
            <option value="ambulance">Ambulance</option>
            <option value="police">Police</option>
            <option value="fire">Fire service</option>
          </select>
        </label>}
        <label>Email address
          <input required type="email" autoComplete="email" value={form.email} onChange={e=>change('email',e.target.value)} placeholder="you@organization.org"/>
        </label>
        <label>Password
          <div className="password-field">
            <input required minLength="8" autoComplete="new-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e=>change('password',e.target.value)} placeholder="At least 8 characters"/>
            <button type="button" className="password-toggle" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button>
          </div>
        </label>
        {error && <div className="emergency-note"><Info size={16}/><div>{error}</div></div>}
        <button className="btn btn-primary full-width" disabled={busy} type="submit"><UserCheck size={17}/>{busy ? 'Creating account…' : 'Create account'}</button>
        <div className="register-switch">Already registered? <Link to="/login">Sign in</Link></div>
        <Link to="/" className="back-link">← Back to public website</Link>
      </form>
    </main>
    <Footer/>
  </>;
}

function LoginPage() {
  const navigate=useNavigate(); const params=new URLSearchParams(useLocation().search); const [role,setRole]=useState(params.get('role')||'responder'); const [email,setEmail]=useState(params.get('role')==='hospital'?'hospital@roadresq.demo':params.get('role')==='admin'?'admin@roadresq.demo':'responder@roadresq.demo'); const [password,setPassword]=useState(params.get('role')==='hospital'?'Hospital123!':params.get('role')==='admin'?'Admin123!':'Responder123!'); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  const enter=async e=>{e.preventDefault();setBusy(true);setError('');try{const data=await apiRequest('/auth/login',{method:'POST',body:JSON.stringify({email,password,role})});setSession(data.token,data.user);navigate(role==='hospital'?'/hospital':role==='admin'?'/admin':'/responder');}catch(err){setError(err.message+' Make sure the backend and MongoDB are running.');}finally{setBusy(false);}};
  const chooseRole=value=>{setRole(value);setEmail(value==='hospital'?'hospital@roadresq.demo':value==='admin'?'admin@roadresq.demo':'responder@roadresq.demo');setPassword(value==='hospital'?'Hospital123!':value==='admin'?'Admin123!':'Responder123!');};
  return <><Header/><main className="login-page"><div className="login-art"><div className="login-shield"><ShieldCheck size={80}/></div><span className="eyebrow">ROADRESQ SECURE PORTAL</span><h1>One network.<br/><span>Faster response.</span></h1><p>Authorized emergency teams and hospitals can coordinate care from one connected workspace.</p><div className="login-benefit"><CheckCircle2/> Incident details in real time</div><div className="login-benefit"><CheckCircle2/> Coordinated emergency response</div><div className="login-benefit"><CheckCircle2/> Patient and hospital updates</div></div><form className="login-form card" onSubmit={enter}><span className="eyebrow">WELCOME BACK</span><h2>Sign in to RoadResQ</h2><p>Choose your portal to continue.</p><label>Portal<select value={role} onChange={e=>chooseRole(e.target.value)}><option value="responder">Emergency responder</option><option value="hospital">Hospital</option><option value="admin">Administrator</option></select></label><label>Email address<input required type="email" placeholder="you@organization.org" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input required type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="emergency-note"><Info size={16}/><div>{error}</div></div>}<button className="btn btn-primary full-width" disabled={busy} type="submit"><LogIn size={17}/> {busy?'Signing in…':'Sign in to dashboard'}</button><div className="demo-login-note"><Info size={15}/> Demo credentials are for local testing. Use registration to create your own responder or hospital account.</div><div className="register-switch">New to RoadResQ? <Link to="/register">Create an account</Link></div><Link to="/" className="back-link">← Back to public website</Link></form></main><Footer/></>;
}
function DashboardShell({ role, title, subtitle, nav, children }) {
  const navigate=useNavigate(); const [collapsed,setCollapsed]=useState(false); const [mobile,setMobile]=useState(false);
  useEffect(()=>{ const user=getSessionUser(); const expected=role.toLowerCase(); if(!user || (user.role!==expected && user.role!=='admin')) navigate('/login'); },[role,navigate]);
  return <div className={`dashboard-shell ${collapsed?'sidebar-collapsed':''}`}>
    <aside className={`dash-sidebar ${mobile?'mobile-open':''}`}><Logo light/><div className="portal-label">{role} PORTAL</div><nav>{nav.map((n,i)=><Link key={n.label} to={n.to} className={i===0?'selected':''}><n.icon size={18}/><span>{n.label}</span></Link>)}</nav><div className="sidebar-bottom"><span className="online-dot"></span> System operational<button type="button" onClick={()=>{clearSession();navigate('/login');}}><LogOut size={16}/> <span>Sign out</span></button></div></aside>
    <div className="dash-main"><header className="dash-topbar"><button className="icon-btn dash-toggle" onClick={()=>setCollapsed(!collapsed)}><Menu/></button><button className="icon-btn dash-mobile-toggle" onClick={()=>setMobile(!mobile)}><Menu/></button><div className="dash-top-title"><b>{title}</b><small>{subtitle}</small></div><div className="dash-top-actions"><button className="icon-btn" onClick={()=>alert('You are all caught up in this demo.')}><Bell/><i></i></button><div className="avatar">{role[0].toUpperCase()}</div><span className="profile-label">{role}</span></div></header><main className="dash-content">{children}</main></div>
  </div>;
}
function ResponderDashboard({ incidents, updateIncident }) {
  const [selected,setSelected]=useState(incidents[0]?.id); const [filter,setFilter]=useState('All');
  const current=incidents.find(i=>i.id===selected)||incidents[0];
  const active=incidents.filter(i=>i.status!=='Completed');
  const filtered=active.filter(i=>filter==='All'||i.severity===filter);
  const advance=(id)=>{const item=incidents.find(i=>i.id===id);const idx=steps.indexOf(item.status);updateIncident(id,{status:steps[Math.min(idx+1,steps.length-1)]});};
  return <DashboardShell role="Responder" title="Emergency response" subtitle="Review dispatches and update your rescue progress." nav={[{label:'Active incidents',icon:LayoutDashboard,to:'/responder'},{label:'My assignments',icon:ClipboardList,to:'/responder'},{label:'Map & navigation',icon:Navigation,to:'/responder'},{label:'Incident history',icon:Clock3,to:'/incidents'},{label:'Profile & availability',icon:Settings,to:'/responder'}]}>
    <div className="dash-welcome"><div><span className="eyebrow">OPERATIONS CENTER</span><h1>Emergency response dashboard</h1><p>Good afternoon. Here's your current response overview.</p></div><span className="availability"><span className="pulse"></span> Available for dispatch</span></div>
    <div className="stats-grid">{[{label:'Active incidents',value:String(active.length).padStart(2,'0'),sub:'Across the area',icon:Activity,color:'teal'},{label:'Critical priority',value:String(active.filter(i=>i.severity==='Critical').length).padStart(2,'0'),sub:'Needs immediate action',icon:Siren,color:'red'},{label:'Assigned to you',value:'04',sub:'2 en route',icon:Ambulance,color:'blue'},{label:'Completed today',value:'18',sub:'Demo statistic',icon:CheckCircle2,color:'green'}].map((s,i)=><StatCard key={i} item={s}/>)}</div>
    <div className="responder-layout"><section className="card dashboard-panel"><div className="panel-heading"><div><h2>Active incidents</h2><p>Choose an incident to view details and update status.</p></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Critical</option><option>High</option><option>Medium</option></select></div><div className="responder-incidents">{filtered.map(i=><button key={i.id} className={`responder-incident ${selected===i.id?'chosen':''}`} onClick={()=>setSelected(i.id)}><span className="incident-pin"><MapPin size={18} fill="currentColor"/></span><span className="responder-row-main"><b>Incident #{i.id}</b><small>{i.location}</small><small>{i.injured} injured · {i.vehicles} vehicles · {i.time}</small></span><span className={`severity-badge ${i.severity.toLowerCase()}`}>{i.severity}</span><ChevronRight size={17}/></button>)}</div>{!filtered.length&&<div className="empty-state">No active incidents match this filter.</div>}</section>
    <section className="card selected-incident-panel">{current?<><div className="panel-heading"><div><h2>Incident #{current.id}</h2><p><MapPin size={14} className="inline-icon"/> {current.location}</p></div><span className={`status-pill ${current.status==='Completed'?'resolved':'active'}`}>{current.status}</span></div><MapVisual incidents={[current]} compact/><div className="detail-mini-grid"><div><small>Injured</small><b>{current.injured}</b></div><div><small>Vehicles</small><b>{current.vehicles}</b></div><div><small>Fire involved</small><b>{current.fire?'Yes':'No'}</b></div><div><small>Road blocked</small><b>{current.blocked?'Yes':'No'}</b></div><div><small>Serious bleeding</small><b>{current.bleeding?'Yes':'No'}</b></div><div><small>Deceased</small><b>{current.dead}</b></div></div><div className="incident-description"><b>Reporter description</b><p>{current.description||'No additional description provided.'}</p><small><Phone size={13}/> {current.contact}</small></div><div className="responder-actions"><button className="btn btn-primary full-width" disabled={current.status==='Completed'} onClick={()=>advance(current.id)}>{current.status==='Waiting'?'Accept incident':current.status==='Accepted'?'Start navigation':current.status==='Navigate'?'Mark arrived':current.status==='Arrived'?'Start rescue':'Complete rescue'} <ArrowRight size={16}/></button><div className="workflow-line">{steps.slice(1).map((s,i)=><span key={s} className={steps.indexOf(current.status)>=i+1?'workflow-done':''}>{s}</span>)}</div></div></>:<div className="empty-state">Select an incident to view details.</div>}</section></div>
  </DashboardShell>;
}
function HospitalDashboard({ incidents }) {
  const [hospitalIncidents,setHospitalIncidents]=useState(incidents);
  useEffect(()=>setHospitalIncidents(incidents),[incidents]);
  const setHospitalIncident=item=>setHospitalIncidents(old=>old.map(i=>i.id===item.id?{...i,...item}:i));
  const [bedCount,setBedCount]=useState(8); const [patients,setPatients]=useState([]);
  useEffect(()=>{apiRequest('/patients').then(data=>setPatients(data.patients||[])).catch(()=>{});},[]); const emptyPatientForm={name:'',age:'',gender:'Unknown',condition:'Critical',incident:incidents[0]?.id||1024,publicDisplayName:'Unidentified patient',publicListing:false,consentToPublic:false};
  const [form,setForm]=useState(emptyPatientForm);
  const [activeTab,setActiveTab]=useState('incoming');
  const addPatient=async e=>{e.preventDefault();try{const data=await apiRequest('/patients',{method:'POST',body:JSON.stringify(form)});setPatients(p=>[data.patient,...p]);setForm({...emptyPatientForm,incident:incidents[0]?.id||1024});alert('Patient record saved to MongoDB.');}catch(err){alert(err.message+' Check hospital login and backend connection.');}};
  return <DashboardShell role="Hospital" title="Hospital coordination" subtitle="Prepare capacity and update incoming patient care." nav={[{label:'Overview',icon:LayoutDashboard,to:'/hospital'},{label:'Incoming emergencies',icon:Ambulance,to:'/hospital'},{label:'Patient records',icon:Users,to:'/hospital'},{label:'Bed availability',icon:BedDouble,to:'/hospital'},{label:'Treatment updates',icon:HeartPulse,to:'/hospital'},{label:'Hospital profile',icon:Settings,to:'/hospital'}]}>
    <div className="dash-welcome"><div><span className="eyebrow">HOSPITAL OPERATIONS</span><h1>Hospital coordination dashboard</h1><p>Manage incoming emergencies, patient records and bed availability.</p></div><span className="availability"><span className="pulse"></span> Receiving patients</span></div>
    <div className="stats-grid">{[{label:'Incoming emergencies',value:String(hospitalIncidents.filter(i=>i.status!=='Completed').length).padStart(2,'0'),sub:'Expected arrivals',icon:Ambulance,color:'red'},{label:'Patients in care',value:String(patients.length+16),sub:'Across departments',icon:HeartPulse,color:'blue'},{label:'Available beds',value:String(bedCount).padStart(2,'0'),sub:'ICU beds: 2',icon:BedDouble,color:'teal'},{label:'Average ETA',value:'11 min',sub:'Incoming ambulances',icon:Clock3,color:'green'}].map((s,i)=><StatCard key={i} item={s}/>)}</div>
    <div className="hospital-grid"><section className="card dashboard-panel"><div className="panel-heading"><div><h2>Incoming emergencies</h2><p>Incident reports shared with your hospital.</p></div><span className="count-badge">{hospitalIncidents.filter(i=>i.status!=='Completed').length} incoming</span></div>{hospitalIncidents.filter(i=>i.status!=='Completed').map(i=><div className="incoming-card" key={i.id}><div className="incoming-top"><span className="incident-pin"><Ambulance size={18}/></span><div><b>Incident #{i.id} · {i.location}</b><small>{i.injured} potential patients · {i.severity} severity</small></div><span className="eta-pill"><Clock3 size={13}/> ETA {i.id===1024?'08':'14'} min</span></div><p>{i.description}</p><div className="incoming-tags">{i.fire&&<span className="warning-tag"><Flame size={12}/> Fire involved</span>}{i.bleeding&&<span className="warning-tag"><HeartPulse size={12}/> Serious bleeding</span>}<span className="soft-tag">{i.vehicles} vehicles</span></div><div className="incoming-actions"><span className="soft-tag">{i.hospitalStatus||'Notification Received'}</span><button className="btn btn-outline btn-small" onClick={async()=>{const stages=['Notification Received','Accept Patient','Treatment Started','Patient Status Updated'];const next=stages[Math.min(stages.indexOf(i.hospitalStatus||'Notification Received')+1,stages.length-1)];try{const data=await apiRequest(`/incidents/${i.id}/hospital-status`,{method:'PATCH',body:JSON.stringify({hospitalStatus:next})});setHospitalIncident(data.incident); }catch(err){alert(err.message+' Sign in to the hospital portal first.');}}}><CheckCircle2 size={15}/> Update patient status</button></div></div>)}</section>
    <section className="card dashboard-panel"><div className="panel-heading"><div><h2>Emergency bed availability</h2><p>Adjust available beds locally.</p></div><BedDouble size={21} className="teal-text"/></div><div className="bed-count"><strong>{bedCount}</strong><span>available beds</span></div><div className="bed-meter"><span style={{width:`${Math.min(100,bedCount*10)}%`}}/></div><div className="bed-control"><button className="icon-btn" onClick={()=>setBedCount(v=>Math.max(0,v-1))}><Minus/></button><span>Available beds</span><button className="icon-btn" onClick={()=>setBedCount(v=>Math.min(30,v+1))}><Plus/></button></div><div className="bed-breakdown"><span>General beds <b>{Math.max(0,bedCount-2)}</b></span><span>ICU beds <b>2</b></span><span>Reserved <b>4</b></span></div><div className="hospital-alert"><Info size={15}/> Bed availability is saved only for this browser session.</div></section></div>
    <section className="card dashboard-panel patient-management"><div className="panel-heading"><div><h2>Patient information</h2><p>Record patient identity and condition to help families identify missing people.</p></div><span className="count-badge">{patients.length} saved locally</span></div><form className="patient-form" onSubmit={addPatient}><label>Patient name<input placeholder="Full name or Unidentified patient" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>Age<input type="text" placeholder="Age" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} required/></label><label>Gender<select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option>Unknown</option><option>Female</option><option>Male</option><option>Other</option></select></label><label>Condition<select value={form.condition} onChange={e=>setForm({...form,condition:e.target.value})}><option>Critical</option><option>Serious</option><option>Stable</option><option>Under treatment</option><option>Discharged</option></select></label><label>Incident<select value={form.incident} onChange={e=>setForm({...form,incident:Number(e.target.value)})}>{hospitalIncidents.map(i=><option value={i.id} key={i.id}>#{i.id} · {i.location}</option>)}</select></label><label>Public display name<input value={form.publicDisplayName} onChange={e=>setForm({...form,publicDisplayName:e.target.value})} placeholder="e.g. Unidentified patient"/></label><label className="patient-public-consent"><input type="checkbox" checked={form.consentToPublic} onChange={e=>setForm({...form,consentToPublic:e.target.checked,publicListing:e.target.checked})}/> Patient/guardian has consented to show limited details on the public patient page.</label><button className="btn btn-primary" type="submit"><Save size={16}/> Save patient</button></form><div className="patient-table">{patients.map(p=><div className="patient-row" key={p.id}><span className="patient-avatar"><UserRound/></span><div><b>{p.name||'Unidentified patient'}</b><small>{p.age||'Age unknown'} · {p.gender} · Incident #{p.incident}</small></div><span className={`condition-pill ${p.condition.toLowerCase().replace(' ','-')}`}>{p.condition}</span><button className="icon-btn" title="Update patient" onClick={async()=>{const condition=p.condition==='Stable'?'Under treatment':p.condition==='Under treatment'?'Discharged':'Stable';try{const data=await apiRequest(`/patients/${p.id}`,{method:'PATCH',body:JSON.stringify({condition})});setPatients(all=>all.map(x=>x.id===p.id?data.patient:x));}catch(err){alert(err.message);}}}><Activity size={16}/></button></div>)}</div></section>
  </DashboardShell>;
}
function AdminDashboard({ incidents }) {
  const [period,setPeriod]=useState('Last 6 months');
  const bars=[34,48,42,62,52,79,60,92,68,76,58,86];
  return <DashboardShell role="Admin" title="System overview" subtitle="Monitor incident activity, response performance and trends." nav={[{label:'Overview',icon:LayoutDashboard,to:'/admin'},{label:'All incidents',icon:ClipboardList,to:'/incidents'},{label:'Accident hotspots',icon:MapIcon,to:'/admin'},{label:'Monthly statistics',icon:BarChart3,to:'/admin'},{label:'User management',icon:Users,to:'/admin'},{label:'System settings',icon:Settings,to:'/admin'}]}>
    <div className="dash-welcome"><div><span className="eyebrow">ADMINISTRATION</span><h1>System overview</h1><p>Operational overview of reported accidents and emergency response.</p></div><button className="btn btn-outline" onClick={()=>alert('Demo report generated locally.')}><FileText size={16}/> Export report</button></div>
    <div className="stats-grid">{moneylessStats.map((s,i)=><StatCard key={i} item={s}/>)}</div>
    <div className="admin-charts-grid"><section className="card dashboard-panel"><div className="panel-heading"><div><h2>Accident statistics</h2><p>Reported incidents by month · sample data</p></div><select value={period} onChange={e=>setPeriod(e.target.value)}><option>Last 6 months</option><option>Last 12 months</option></select></div><div className="bar-chart">{bars.slice(period==='Last 6 months'?6:0).map((v,i)=><div className="bar-column" key={i}><span className="bar-value">{Math.round(v*1.7)}</span><div className="bar" style={{height:`${v}%`}}></div><small>{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i+(period==='Last 6 months'?6:0)]}</small></div>)}</div><div className="chart-legend"><span><i></i> Reported accidents</span><small>Illustrative values</small></div></section><section className="card dashboard-panel"><div className="panel-heading"><div><h2>Incident status</h2><p>Current report distribution</p></div><Activity size={20} className="teal-text"/></div><div className="status-donut"><div><b>1,284</b><small>Total accidents</small></div></div><div className="donut-legend"><span><i className="teal-bg"></i> Active <b>12</b></span><span><i className="red-bg"></i> Critical <b>3</b></span><span><i className="blue-bg"></i> Resolved <b>1,102</b></span><span><i className="gray-bg"></i> Other <b>167</b></span></div></section></div>
    <div className="admin-bottom-grid"><section className="card dashboard-panel"><div className="panel-heading"><div><h2>Accident hotspots</h2><p>Locations with recent reported activity</p></div><Link to="/incidents" className="view-all">All incidents <ArrowRight size={14}/></Link></div><MapVisual incidents={incidents}/><div className="hotspot-list">{[['Dhaka–Tongi corridor','High activity','critical'],['Savar bus stand','Frequent collisions','active'],['Keraniganj crossing','Fire reported','critical']].map(([a,b,c])=><div key={a}><MapPin size={16}/><span><b>{a}</b><small>{b}</small></span><i className={`hotspot-dot ${c}`}></i></div>)}</div></section><section className="card dashboard-panel"><div className="panel-heading"><div><h2>Recent incidents</h2><p>Latest reports in the system</p></div><Link to="/incidents" className="view-all">View all <ArrowRight size={14}/></Link></div><div className="incident-list">{incidents.slice(0,4).map(i=><IncidentRow key={i.id} incident={i}/>)}</div><div className="response-time-card"><span className="response-time-icon"><Clock3/></span><span><small>Average response time</small><b>08m 24s</b></span><span className="positive">↓ 12%</span></div></section></div>
  </DashboardShell>;
}
function App() {
  const [incidents,setIncidents]=useState(initialIncidents);
  useEffect(()=>{
    const refresh=()=>apiRequest('/incidents').then(data=>setIncidents(data.incidents||[])).catch(()=>{});
    refresh(); const timer=setInterval(refresh,7000); return ()=>clearInterval(timer);
  },[]);
  const createIncident=async form=>{
    const body={type:form.type,location:form.location,injured:Number(form.injured)||0,vehicles:Number(form.vehicles)||1,fire:form.fire==='Yes',blocked:form.blocked==='Yes',bleeding:form.bleeding==='Yes',dead:form.dead==='Yes'?Number(form.deadCount)||1:0,description:form.description,contact:form.contact,accidentTime:form.time};
    try{const data=await apiRequest('/incidents',{method:'POST',body:JSON.stringify(body)});const item=data.incident;setIncidents(old=>[item,...old]);return item;}
    catch(err){if(err.message==='Failed to fetch'||err.message.includes('fetch'))throw new Error('Backend API is not reachable. Start the server and MongoDB first.');throw err;}
  };
  const updateIncident=async(id,changes)=>{
    try{let item;if(changes.status){const data=await apiRequest(`/incidents/${id}/status`,{method:'PATCH',body:JSON.stringify({status:changes.status})});item=data.incident;}else{item={...incidents.find(i=>i.id===id),...changes};}setIncidents(old=>old.map(i=>i.id===id?{...i,...item}:i));return item;}
    catch(err){alert(err.message+' Check that you are signed in as a responder.');}
  };
  return <Routes><Route path="/" element={<Home incidents={incidents}/>}/><Route path="/report" element={<ReportPage onSubmit={createIncident}/>}/><Route path="/incidents" element={<IncidentsPage incidents={incidents}/>}/><Route path="/patients" element={<PublicPatientsPage/>}/><Route path="/incidents/:id" element={<IncidentDetail incidents={incidents} onUpdate={updateIncident}/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route path="/responder/*" element={<ResponderDashboard incidents={incidents} updateIncident={updateIncident}/>}/><Route path="/hospital/*" element={<HospitalDashboard incidents={incidents}/>}/><Route path="/admin/*" element={<AdminDashboard incidents={incidents}/>}/><Route path="*" element={<Header/>}/></Routes>;
}
export default App;
