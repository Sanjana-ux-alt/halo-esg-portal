// HALO ESG sub-module — data + icons + components

const COMPANIES = [
  { id: "wer",  name: "WeRize WFin",       sector: "Fintech / Lending",   stage: "IC Pending",   status: "completed",  progress: 100, score: 78.4, e: 26.2, s: 28.1, g: 24.1, color: "#6B6FBF", initials: "WR", spoc: "Niranjan Rathi", deal: "SV4280_T2", amount: "₹75 Cr", sent: "Mar 12", submitted: "Apr 22", reviewed: "Apr 29" },
  { id: "alf",  name: "Alpha Capital",     sector: "NBFC / Consumer",     stage: "Documentation",status: "in-review",  progress: 100, score: 71.2, e: 23.4, s: 25.8, g: 22.0, color: "#22C28F", initials: "AC", spoc: "Siddharth Manohar", deal: "SV4280_T2", amount: "₹75 Cr", sent: "Mar 18", submitted: "Apr 24", reviewed: "—" },
  { id: "sid",  name: "Sid's Company",     sector: "B2B SaaS",            stage: "CAM In Progress", status: "in-progress", progress: 64, score: null, e: null, s: null, g: null, color: "#0F2150", initials: "SC", spoc: "Siddharth Manohar", deal: "SV4156_T1", amount: "₹40 Cr", sent: "Apr 02", submitted: "—", reviewed: "—" },
  { id: "tap",  name: "Theater Apparel",   sector: "Consumer / D2C",      stage: "Term Sheet",   status: "in-progress",progress: 47,  score: null, e: null, s: null, g: null, color: "#E8A33D", initials: "TA", spoc: "Akshat Gautam", deal: "SV4302_T2", amount: "₹35 Cr", sent: "Apr 18", submitted: "—", reviewed: "—" },
  { id: "krv",  name: "Krvvy Foods",       sector: "Consumer / D2C",      stage: "Diligence",    status: "in-review",  progress: 100, score: 58.6, e: 18.4, s: 21.2, g: 19.0, color: "#E25C5C", initials: "KR", spoc: "Akshat Gautam", deal: "SV4290_T1", amount: "₹22 Cr", sent: "Apr 04", submitted: "Apr 26", reviewed: "—" },
  { id: "fct",  name: "FirstClub Tech",    sector: "B2B SaaS",            stage: "Documentation",status: "completed",  progress: 100, score: 65.8, e: 21.3, s: 22.5, g: 22.0, color: "#0B1A3F", initials: "FC", spoc: "Rohan Sethi", deal: "SV4188_T2", amount: "₹50 Cr", sent: "Mar 02", submitted: "Apr 14", reviewed: "Apr 22" },
  { id: "nat",  name: "Naturohabit",       sector: "Consumer / D2C",      stage: "Active",       status: "completed",  progress: 100, score: 82.1, e: 28.9, s: 27.4, g: 25.8, color: "#22C28F", initials: "NH", spoc: "Priya Menon", deal: "SV4012_T3", amount: "₹65 Cr", sent: "Feb 14", submitted: "Mar 28", reviewed: "Apr 04" },
  { id: "fln",  name: "Slaash / Flent",    sector: "Consumer / D2C",      stage: "Term Sheet",   status: "not-started",progress: 0,   score: null, e: null, s: null, g: null, color: "#8B91AB", initials: "FL", spoc: "Anaya Krishnan", deal: "SV4318_T1", amount: "₹18 Cr", sent: "Apr 28", submitted: "—", reviewed: "—" },
  { id: "cpf",  name: "Captain Fresh",     sector: "Agritech",            stage: "Diligence",    status: "in-progress",progress: 78,  score: null, e: null, s: null, g: null, color: "#6B6FBF", initials: "CF", spoc: "Rohan Sethi", deal: "SV4244_T2", amount: "₹120 Cr", sent: "Mar 22", submitted: "—", reviewed: "—" },
  { id: "ath",  name: "Ather Energy",      sector: "Mobility / Cleantech",stage: "Active",       status: "completed",  progress: 100, score: 76.9, e: 31.4, s: 24.2, g: 21.3, color: "#0F2150", initials: "AE", spoc: "Vikram Jain", deal: "SV4022_T4", amount: "₹240 Cr", sent: "Jan 18", submitted: "Mar 02", reviewed: "Mar 09" },
  { id: "rzr",  name: "Razorpay Capital",  sector: "Fintech / Lending",   stage: "Active",       status: "completed",  progress: 100, score: 73.5, e: 22.1, s: 26.8, g: 24.6, color: "#22C28F", initials: "RZ", spoc: "Vikram Jain", deal: "SV4108_T3", amount: "₹180 Cr", sent: "Feb 04", submitted: "Mar 18", reviewed: "Mar 24" },
  { id: "frt",  name: "Fraternitas",       sector: "Consumer / D2C",      stage: "Prospect",     status: "overdue",    progress: 22,  score: null, e: null, s: null, g: null, color: "#E25C5C", initials: "FV", spoc: "Anaya Krishnan", deal: "SV4321_T1", amount: "₹15 Cr", sent: "Mar 10", submitted: "—", reviewed: "—" },
];

const STATUS_LABEL = {
  "completed": "Completed",
  "in-review": "In Review",
  "in-progress": "In Progress",
  "not-started": "Not Started",
  "overdue": "Overdue",
};

const SECTIONS = [
  { id: 1, title: "Company Information",     qs: 8,  done: 8,  status: "done" },
  { id: 2, title: "Water Management",        qs: 11, done: 11, status: "done" },
  { id: 3, title: "Energy & Emissions",      qs: 14, done: 14, status: "done" },
  { id: 4, title: "Workforce & Diversity",   qs: 12, done: 7,  status: "current" },
  { id: 5, title: "Health & Safety",         qs: 10, done: 0,  status: "todo" },
  { id: 6, title: "Community & CSR",         qs: 9,  done: 0,  status: "todo" },
  { id: 7, title: "Governance & Compliance", qs: 18, done: 0,  status: "todo" },
  { id: 8, title: "Supply Chain & Sourcing", qs: 13, done: 0,  status: "todo" },
  { id: 9, title: "Sector-Specific",         qs: 11, done: 0,  status: "todo" },
];

window.HALO_ESG = { COMPANIES, STATUS_LABEL, SECTIONS };

// Icons
const Icon = ({ name, size = 16, stroke = 1.75, color = "currentColor" }) => {
  const p = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    pipe: <><circle cx="6" cy="6" r="3" /><circle cx="18" cy="18" r="3" /><path d="M6 9v6a3 3 0 0 0 3 3h6" /></>,
    erp: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></>,
    chart: <><path d="M3 21h18" /><path d="M6 17v-6" /><path d="M11 17V7" /><path d="M16 17v-9" /></>,
    leaf: <><path d="M5 21c8 0 14-6 14-14V3h-4C7 3 3 9 3 15c0 2 1 4 2 6z" /><path d="M3 21l9-9" /></>,
    brain: <><path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3 3 3 0 0 0 3-3V4a0 0 0 0 0 0 0z" /><path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3 3 3 0 0 1-3-3" /></>,
    trend: <><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>,
    pen: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
    shield: <><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z" /></>,
    phone: <><path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></>,
    help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4" /><circle cx="12" cy="17" r="0.5" fill="currentColor" /></>,
    out: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
    chev: <><path d="M9 18l6-6-6-6" /></>,
    chevd: <><path d="M6 9l6 6 6-6" /></>,
    arrowup: <><path d="M7 17L17 7" /><path d="M7 7h10v10" /></>,
    arrowdn: <><path d="M7 7l10 10" /><path d="M17 7v10H7" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
    send: <><path d="M21 3L11 13" /><path d="M21 3l-7 18-3-8-8-3z" /></>,
    check: <><path d="M5 12l5 5L20 7" /></>,
    x: <><path d="M6 6l12 12M6 18L18 6" /></>,
    file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>,
    download: <><path d="M12 3v12M6 11l6 6 6-6" /><path d="M5 21h14" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01" /><path d="M11 12h1v5h1" /></>,
    flag: <><path d="M4 21V4" /><path d="M4 4h13l-2 4 2 4H4" /></>,
    upload: <><path d="M12 21V9M6 13l6-6 6 6" /><path d="M5 3h14" /></>,
    bldg: <><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" /></>,
    coin: <><circle cx="12" cy="12" r="9" /><path d="M9 9h4a2 2 0 0 1 0 4h-4M9 13h4a2 2 0 0 1 0 4h-4" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" /></>,
    dots: <><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>,
    arrowback: <><path d="M19 12H5M12 19l-7-7 7-7" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{p[name]}</svg>;
};

const StatusPill = ({ status }) => (
  <span className={"pill " + status}>
    <span className="dot" />{window.HALO_ESG.STATUS_LABEL[status]}
  </span>
);

const Ring = ({ value, max = 100, size = 72, stroke = 7, color = "#22C28F", track = "#ECEEF6" }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(value / max, 1));
  const offset = c * (1 - pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 400ms ease" }} />
    </svg>
  );
};

Object.assign(window, { Icon, StatusPill, Ring });
