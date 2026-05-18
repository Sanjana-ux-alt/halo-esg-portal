// HALO ESG — Send Survey (pick → template → edit questions → send)

// Real Stride Ventures portcos from the "Old Portcos_Fund II & Fund III" sheet
// in the KPI Coverage Excel — they're due for re-survey under the current scoring
// methodology and haven't been issued the v3 survey yet.
const PROSPECTS = [
  { id: "moe", name: "MoEVing",          sector: "Cleantech / Mobility", stage: "Active",       spoc: "Vikash Mishra",       color: "#22C28F", initials: "MV" },
  { id: "bts", name: "Battery Smart",    sector: "Cleantech / Mobility", stage: "Active",       spoc: "Pulkit Khurana",      color: "#6B6FBF", initials: "BS" },
  { id: "eul", name: "Euler Motors",     sector: "Cleantech / Mobility", stage: "Active",       spoc: "Saurav Kumar",        color: "#0F2150", initials: "EM" },
  { id: "ygb", name: "Yoga Bar",         sector: "Consumer / D2C",       stage: "Active",       spoc: "Anindita Sampath",    color: "#E25C5C", initials: "YB" },
  { id: "hfy", name: "Healthifyme",      sector: "Healthtech",           stage: "Active",       spoc: "Tushar Vashisht",     color: "#E8A33D", initials: "HM" },
  { id: "zwk", name: "Zetwerk",          sector: "B2B SaaS",             stage: "Active",       spoc: "Amrit Acharya",       color: "#0B1A3F", initials: "ZW" },
];

const TEMPLATES = {
  full:  { name: "Full Stride ESG Assessment", desc: "9 sections · 86 questions · ~45 min", reco: true },
  renew: { name: "Annual Renewal (lighter)",   desc: "5 sections · 32 questions · ~20 min" },
  sect:  { name: "Sector-specific (Fintech)",  desc: "6 sections · 48 questions · ~30 min" },
  blank: { name: "Start from blank",           desc: "Build a custom survey from scratch" },
};

// Real Stride ESG KPI questions, sourced from the Excel "3. Q & Resp score" sheet
// via window.HALO_ESG.SCORING.QUESTIONS (loaded by scoring.jsx).
const TEMPLATE_QUESTIONS = (window.HALO_ESG?.SCORING?.QUESTIONS || []).map(q => ({
  id: q.id,
  section: q.section,
  q: q.q,
  type: q.type,
  required: !!q.required,
  // keep scoring metadata so the builder/preview can show it
  topic: q.topic, w: q.w, opts: q.opts, logic: q.logic, unit: q.unit,
}));

const DEFAULT_EMAIL_SUBJECT = 'ESG assessment from Stride Ventures';
const DEFAULT_EMAIL_BODY =
`Hi {{firstName}},

As part of our ongoing diligence on {{company}}, we'd appreciate if you could complete our ESG assessment within {{deadline}}.

The form has {{n}} questions across {{sections}} sections and auto-saves your progress.

Open the secure survey link below.

— Krishti Sharma, Head of ESG, Stride Ventures`;

const SendSurvey = () => {
  const [selected, setSelected] = React.useState(null);
  const [template, setTemplate] = React.useState("full");
  const [questions, setQuestions] = React.useState(TEMPLATE_QUESTIONS);
  const [step, setStep] = React.useState("pick"); // pick → configure → confirm (template/builder removed)
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState({ section: "Workforce & Diversity", q: "", type: "Number", required: true });

  // NEW: multi-recipient + editable email
  const [recipients, setRecipients] = React.useState([]);
  const [recipDropdownOpen, setRecipDropdownOpen] = React.useState(false);
  const [newContact, setNewContact] = React.useState({name:'', role:'', email:''});
  const [deadline, setDeadline] = React.useState('14 days');
  const [subject, setSubject] = React.useState(DEFAULT_EMAIL_SUBJECT);
  const [body, setBody]       = React.useState(DEFAULT_EMAIL_BODY);
  // NEW: mandatory revenue tier (L1/L2/L3) — from Excel scoring sheet
  const [tier, setTier]       = React.useState(null);
  const recipDropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (!recipDropdownOpen) return;
    const h = (e) => { if (recipDropdownRef.current && !recipDropdownRef.current.contains(e.target)) setRecipDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [recipDropdownOpen]);

  const co = PROSPECTS.find(p => p.id === selected);
  const sections = [...new Set(questions.map(q => q.section))];

  const addQ = () => {
    if (!draft.q.trim()) return;
    setQuestions([...questions, { ...draft, id: "q" + Date.now() }]);
    setDraft({ section: draft.section, q: "", type: "Number", required: true });
    setAdding(false);
  };
  const removeQ = id => setQuestions(questions.filter(q => q.id !== id));

  const STEPS = ["Pick company", "Review form", "Configure delivery", "Send"];
  const stepIdx = ["pick", "review-form", "configure", "confirm"].indexOf(step);

  return (
    <div style={{padding: "24px 36px"}}>
      <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 8}}>
        <button className="btn btn-ghost btn-sm" onClick={() => window.HALO_NAV("overview")}>
          <Icon name="arrowback" size={13} />Back to assessments
        </button>
      </div>
      <h2 style={{margin: "4px 0 6px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em"}}>Send new ESG survey</h2>
      <p style={{color: "var(--halo-text-2)", fontSize: 13, marginTop: 0, marginBottom: 22, maxWidth: 620}}>
        Pick a company, configure delivery, and send the Stride Full Assessment — secure link auto-generated.
      </p>

      {/* Stepper */}
      <div style={{display: "flex", gap: 12, marginBottom: 22, padding: "12px 18px", background: "white", borderRadius: 12, boxShadow: "var(--halo-shadow)"}}>
        {STEPS.map((s, i) => {
          const active = i === stepIdx;
          const done = i < stepIdx;
          return (
            <div key={s} style={{display: "flex", alignItems: "center", gap: 8, flex: 1}}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: done ? "var(--halo-mint)" : active ? "var(--halo-navy)" : "#ECEEF6",
                color: done || active ? "white" : "var(--halo-text-3)",
                display: "grid", placeItems: "center",
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {done ? <Icon name="check" size={12} stroke={2.5} /> : i + 1}
              </div>
              <div style={{fontSize: 11.5, fontWeight: 600, color: active || done ? "var(--halo-text)" : "var(--halo-text-3)", whiteSpace: "nowrap"}}>{s}</div>
              {i < STEPS.length - 1 && <div style={{flex: 1, height: 2, background: done ? "var(--halo-mint)" : "#ECEEF6", marginLeft: 4}} />}
            </div>
          );
        })}
      </div>

      {/* Step 1: pick company */}
      {step === "pick" && (
        <div className="card" style={{overflow: "hidden"}}>
          <div className="card-h">
            <div>
              <h3>Eligible companies</h3>
              <div className="sub">{PROSPECTS.length} portfolio companies have not yet received an ESG survey</div>
            </div>
            <div className="search-input">
              <Icon name="search" size={14} color="#8B91AB" />
              <input placeholder="Search…" />
            </div>
          </div>
          <table className="table">
            <thead>
              <tr><th style={{paddingLeft: 24, width: 40}}></th><th>Company</th><th>Sector</th><th>Deal stage</th><th>Deal SPOC</th><th></th></tr>
            </thead>
            <tbody>
              {PROSPECTS.map(p => (
                <tr key={p.id} onClick={() => setSelected(p.id)} style={selected === p.id ? {background: "#F2FBF7"} : {}}>
                  <td style={{paddingLeft: 24}}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      border: selected === p.id ? "5px solid var(--halo-mint)" : "1.5px solid var(--halo-line)",
                      background: "white",
                    }} />
                  </td>
                  <td><div className="co-cell"><div className="co-logo" style={{background: p.color}}>{p.initials}</div><div className="co-name">{p.name}</div></div></td>
                  <td className="muted">{p.sector}</td>
                  <td className="muted">{p.stage}</td>
                  <td>{p.spoc}</td>
                  <td><Icon name="chev" size={14} color="#8B91AB" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{padding: "16px 24px", borderTop: "1px solid var(--halo-line)", display: "flex", justifyContent: "flex-end", gap: 10}}>
            <button className="btn btn-mint" disabled={!selected}
              style={!selected ? {opacity: 0.5, cursor: "not-allowed"} : {}}
              onClick={() => selected && setStep("review-form")}>Continue<Icon name="chev" size={13} /></button>
          </div>
        </div>
      )}

      {/* Step 2: Review form (Form Builder embedded) */}
      {step === "review-form" && co && (
        <div>
          <div className="card" style={{padding: "16px 22px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14}}>
            <div className="co-logo" style={{background: co.color, width: 40, height: 40, borderRadius: 10, fontSize: 13}}>{co.initials}</div>
            <div style={{flex: 1}}>
              <div style={{fontSize: 14, fontWeight: 700}}>Review the form for {co.name}</div>
              <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 2, lineHeight: 1.5}}>
                Sector: <strong>{co.sector}</strong>. Browse the active questions {co.spoc.split(' ')[0]} will see. Switch to Edit mode if you need to add or remove questions before sending.
              </div>
            </div>
          </div>

          {/* The Form Builder itself (defaults to View; Edit requires confirmation) */}
          <FormBuilder embedded />

          <div style={{display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18}}>
            <button className="btn btn-ghost" onClick={() => setStep("pick")}><Icon name="arrowback" size={13} />Back</button>
            <button className="btn btn-mint" onClick={() => setStep("configure")}>
              Continue to delivery<Icon name="chev" size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: choose template */}
      {step === "template" && co && (
        <div className="card card-pad">
          <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 18}}>
            <div className="co-logo" style={{background: co.color, width: 38, height: 38, borderRadius: 10, fontSize: 13}}>{co.initials}</div>
            <div>
              <div style={{fontSize: 15, fontWeight: 700}}>{co.name}</div>
              <div style={{fontSize: 12, color: "var(--halo-text-3)"}}>{co.sector} · {co.stage}</div>
            </div>
          </div>

          <h3 style={{margin: "8px 0 12px", fontSize: 14}}>Choose a starting template</h3>
          <div style={{display: "grid", gap: 10, marginBottom: 22}}>
            {Object.entries(TEMPLATES).map(([id, t]) => {
              const active = template === id;
              return (
                <label key={id} style={{display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: active ? "1.5px solid var(--halo-mint)" : "1px solid var(--halo-line)", borderRadius: 10, background: active ? "#F2FBF7" : "white", cursor: "pointer"}}>
                  <input type="radio" name="tpl" checked={active} onChange={() => setTemplate(id)} />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 13, fontWeight: 600}}>
                      {t.name}
                      {t.reco && <span style={{marginLeft: 8, fontSize: 10, color: "#1B7C5E", fontWeight: 700, letterSpacing: "0.1em"}}>RECOMMENDED</span>}
                    </div>
                    <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 2}}>{t.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>

          <div style={{display: "flex", gap: 10, justifyContent: "flex-end"}}>
            <button className="btn btn-ghost" onClick={() => setStep("pick")}><Icon name="arrowback" size={13} />Back</button>
            <button className="btn btn-mint" onClick={() => setStep("builder")}>Edit questions<Icon name="chev" size={13} /></button>
          </div>
        </div>
      )}

      {/* Step 3: survey builder */}
      {step === "builder" && co && (
        <div className="card card-pad">
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 16}}>
            <div>
              <h3 style={{margin: 0, fontSize: 16, fontWeight: 700}}>Edit survey for {co.name}</h3>
              <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 4}}>
                Based on <strong>{TEMPLATES[template].name}</strong> · {questions.length} questions across {sections.length} sections. Edits apply only to {co.name}.
              </div>
            </div>
            <button className="btn btn-mint" onClick={() => setAdding(true)}>
              <Icon name="plus" size={13} />Add question
            </button>
          </div>

          {adding && (
            <div className="card card-pad" style={{marginBottom: 14, border: "1.5px solid var(--halo-mint)"}}>
              <div style={{fontSize: 13, fontWeight: 700, marginBottom: 12}}>New question</div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10}}>
                <select value={draft.section} onChange={e=>setDraft({...draft, section: e.target.value})} style={inputStyleBuilder}>
                  {sections.map(s => <option key={s}>{s}</option>)}
                  <option>Health & Safety</option>
                  <option>Community & CSR</option>
                </select>
                <select value={draft.type} onChange={e=>setDraft({...draft, type: e.target.value})} style={inputStyleBuilder}>
                  <option>Number</option><option>Slider</option><option>Yes / No</option>
                  <option>Multi-select</option><option>Single-select</option>
                  <option>Matrix</option><option>Free text</option><option>File upload</option>
                </select>
              </div>
              <input value={draft.q} onChange={e=>setDraft({...draft, q: e.target.value})}
                placeholder="Question text…"
                style={{...inputStyleBuilder, width: "100%", marginBottom: 10}} />
              <label style={{display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--halo-text-2)"}}>
                <input type="checkbox" checked={draft.required} onChange={e=>setDraft({...draft, required: e.target.checked})} />
                Required
              </label>
              <div style={{display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end"}}>
                <button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn btn-mint" onClick={addQ}>Add to survey</button>
              </div>
            </div>
          )}

          {sections.map(section => (
            <div key={section} style={{marginBottom: 18}}>
              <div style={{fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 8}}>
                {section} · {questions.filter(q => q.section === section).length} questions
              </div>
              <div style={{border: "1px solid var(--halo-line-2)", borderRadius: 10, overflow: "hidden"}}>
                {questions.filter(q => q.section === section).map((q, i) => (
                  <div key={q.id} style={{display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderTop: i ? "1px solid var(--halo-line-2)" : "none", background: "white"}}>
                    <div style={{width: 26, height: 26, borderRadius: 7, background: "#E6E7F4", color: "#45489B", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0}}>{i + 1}</div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontSize: 13, fontWeight: 600}}>
                        {q.q}{q.required && <span style={{color: "var(--halo-amber)", marginLeft: 4}}>*</span>}
                      </div>
                      <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 2}}>
                        {q.type}{q.required ? " · Required" : " · Optional"}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm"><Icon name="pen" size={12} />Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeQ(q.id)} style={{color: "#9F2D2D"}}><Icon name="x" size={12} />Remove</button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8}}>
            <button className="btn btn-ghost" onClick={() => setStep("template")}><Icon name="arrowback" size={13} />Back</button>
            <button className="btn btn-mint" onClick={() => setStep("configure")}>Continue<Icon name="chev" size={13} /></button>
          </div>
        </div>
      )}

      {/* Step 4: configure delivery — multi-recipient + editable email */}
      {step === "configure" && co && (() => {
        const baseContacts = (window.HALO_ESG.CONTACTS && window.HALO_ESG.CONTACTS[co.id]) || [
          {name: co.spoc, role: 'Deal SPOC', email: 'founder@' + co.name.toLowerCase().replace(/[^a-z]/g, '') + '.com'},
        ];
        const customContacts = (window.HALO_ESG.STATE.customContacts[co.id]) || [];
        const allContacts = [...baseContacts, ...customContacts];
        const available = allContacts.filter(c => !recipients.find(r => r.email === c.email));
        const initials = (name) => name.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase();

        const addRecipient = (c) => {
          if (!recipients.find(r => r.email === c.email)) setRecipients([...recipients, c]);
          setRecipDropdownOpen(false);
        };
        const removeRecipient = (email) => setRecipients(recipients.filter(r => r.email !== email));
        const addCustomContact = () => {
          if (!newContact.name.trim() || !newContact.email.trim()) return;
          const c = {name: newContact.name.trim(), role: newContact.role.trim() || '—', email: newContact.email.trim()};
          if (!window.HALO_ESG.STATE.customContacts[co.id]) window.HALO_ESG.STATE.customContacts[co.id] = [];
          window.HALO_ESG.STATE.customContacts[co.id].push(c);
          window.HALO_ESG.persist();
          setRecipients([...recipients, c]);
          setNewContact({name:'', role:'', email:''});
          setRecipDropdownOpen(false);
        };

        const firstName = recipients[0]?.name?.split(' ')[0] || co.spoc.split(' ')[0];
        const renderedSubject = subject.replace(/\{\{company\}\}/g, co.name);
        const renderedBody = body
          .replace(/\{\{firstName\}\}/g, firstName)
          .replace(/\{\{company\}\}/g, co.name)
          .replace(/\{\{n\}\}/g, questions.length)
          .replace(/\{\{sections\}\}/g, sections.length)
          .replace(/\{\{deadline\}\}/g, deadline);

        return (
          <div style={{display: "grid", gridTemplateColumns: "1fr 360px", gap: 22, alignItems: "start"}}>
            <div className="card card-pad">
              {/* Recipients */}
              <h3 style={{margin: "0 0 6px", fontSize: 14}}>Recipients</h3>
              <div style={{fontSize: 12, color: "var(--halo-text-3)", marginBottom: 12}}>
                Add one or more people from {co.name}. Each person will receive their own copy of the survey link.
              </div>

              {recipients.length === 0 && (
                <div style={{fontSize: 12.5, fontStyle: "italic", color: "var(--halo-text-3)", padding: "8px 0 12px"}}>
                  No recipients yet — pick at least one from the dropdown below.
                </div>
              )}
              {recipients.map(r => (
                <div key={r.email} style={{display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--halo-line)", borderRadius: 10, marginBottom: 8, background: "white"}}>
                  <div style={{width: 32, height: 32, borderRadius: "50%", background: co.color, color: "white", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, flexShrink: 0}}>{initials(r.name)}</div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 13, fontWeight: 600}}>{r.name}</div>
                    <div style={{fontSize: 12, color: "var(--halo-text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{r.role} · {r.email}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeRecipient(r.email)} style={{color: "#9F2D2D"}}>
                    <Icon name="x" size={13} />
                  </button>
                </div>
              ))}

              {/* Add recipient dropdown */}
              <div style={{position: "relative", marginTop: 4}} ref={recipDropdownRef}>
                <button className="btn btn-outline btn-sm" onClick={() => setRecipDropdownOpen(!recipDropdownOpen)}>
                  <Icon name="plus" size={12} />Add recipient from {co.name}
                </button>
                {recipDropdownOpen && (
                  <div style={{position: "absolute", top: "calc(100% + 6px)", left: 0, width: 380, background: "white", borderRadius: 12, boxShadow: "0 12px 32px rgba(15,33,80,0.18)", zIndex: 20, overflow: "hidden", maxHeight: 360, overflowY: "auto"}}>
                    <div style={{padding: "10px 14px", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, borderBottom: "1px solid var(--halo-line-2)"}}>
                      Saved contacts at {co.name}
                    </div>
                    {available.length === 0 && (
                      <div style={{padding: "12px 14px", fontSize: 12.5, color: "var(--halo-text-3)"}}>
                        No more saved contacts. Add a new one below.
                      </div>
                    )}
                    {available.map((c, i) => (
                      <div key={i} onClick={() => addRecipient(c)}
                        style={{padding: "10px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}
                        onMouseEnter={e => e.currentTarget.style.background = '#F4F6FA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <div>
                          <div style={{fontSize: 13, fontWeight: 600}}>{c.name}</div>
                          <div style={{fontSize: 12, color: "var(--halo-text-3)"}}>{c.role} · {c.email}</div>
                        </div>
                        <Icon name="plus" size={13} color="#22C28F" />
                      </div>
                    ))}
                    <div style={{padding: "10px 14px", borderTop: "1px solid var(--halo-line-2)", background: "#FAFBFD"}}>
                      <div style={{fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 8}}>
                        Or add a new contact
                      </div>
                      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6}}>
                        <input value={newContact.name}  onChange={e => setNewContact({...newContact, name: e.target.value})}  placeholder="Name"  style={{...inputStyleBuilder, height: 30, fontSize: 12, width: "100%"}} />
                        <input value={newContact.role}  onChange={e => setNewContact({...newContact, role: e.target.value})}  placeholder="Role"  style={{...inputStyleBuilder, height: 30, fontSize: 12, width: "100%"}} />
                      </div>
                      <div style={{display: "flex", gap: 6}}>
                        <input value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} placeholder="email@…" style={{...inputStyleBuilder, height: 30, fontSize: 12, flex: 1}} type="email" />
                        <button className="btn btn-mint btn-sm" onClick={addCustomContact}>Add</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Deadline */}
              <h3 style={{margin: "20px 0 12px", fontSize: 14}}>Deadline</h3>
              <div style={{display: "flex", gap: 10, flexWrap: "wrap"}}>
                {["7 days", "14 days", "30 days", "Custom"].map(d => (
                  <button key={d} className={"chip" + (deadline === d ? " active" : "")} onClick={() => setDeadline(d)} style={{height: 36}}>{d}</button>
                ))}
              </div>

              {/* Revenue tier — MANDATORY */}
              <h3 style={{margin: "20px 0 4px", fontSize: 14, display: "flex", alignItems: "center", gap: 8}}>
                Revenue tier
                <span style={{color: "var(--halo-amber)", fontSize: 16, lineHeight: 1}}>*</span>
                <span style={{fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", padding: "2px 7px", borderRadius: 4, background: "var(--halo-amber-soft)", color: "#8E5F18"}}>REQUIRED</span>
              </h3>
              <div style={{fontSize: 12, color: "var(--halo-text-3)", marginBottom: 12, lineHeight: 1.5}}>
                Sets which Stride ESG pass-threshold applies. Pulled from the master Excel scoring sheet (column "Pass thresholds").
              </div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 4}}>
                {[
                  { id: 'L1', label: 'L1', range: 'Revenue < ₹100 Cr',           threshold: 15, c: '#6B6FBF', sub: 'Early-stage / seed'   },
                  { id: 'L2', label: 'L2', range: '₹100 Cr – ₹500 Cr',           threshold: 30, c: '#22C28F', sub: 'Growth-stage'         },
                  { id: 'L3', label: 'L3', range: 'Revenue > ₹500 Cr',           threshold: 40, c: '#E8A33D', sub: 'Late-stage / pre-IPO' },
                ].map(t => {
                  const active = tier === t.id;
                  return (
                    <button key={t.id} onClick={() => setTier(t.id)}
                      style={{
                        textAlign: "left", padding: "14px 16px", borderRadius: 10,
                        border: active ? `2px solid ${t.c}` : "1.5px solid var(--halo-line)",
                        background: active ? t.c + "10" : "white",
                        cursor: "pointer", transition: "all 140ms",
                      }}>
                      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6}}>
                        <span style={{fontSize: 16, fontWeight: 800, color: active ? t.c : "var(--halo-text)", letterSpacing: "-0.01em"}}>
                          {t.label}
                        </span>
                        <span style={{
                          width: 18, height: 18, borderRadius: "50%",
                          border: active ? `5px solid ${t.c}` : "1.5px solid var(--halo-line)",
                          background: "white", flexShrink: 0,
                        }} />
                      </div>
                      <div style={{fontSize: 12, fontWeight: 700, color: "var(--halo-text)", marginBottom: 4}}>{t.range}</div>
                      <div style={{fontSize: 11, color: "var(--halo-text-3)", marginBottom: 6}}>{t.sub}</div>
                      <div style={{fontSize: 10.5, letterSpacing: "0.06em", color: "var(--halo-text-3)", fontFamily: "JetBrains Mono, monospace"}}>
                        Pass ≥ <strong style={{color: active ? t.c : "var(--halo-text-2)"}}>{t.threshold}</strong>/100
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Editable email */}
              <h3 style={{margin: "20px 0 8px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                <span>Email content</span>
                <button className="btn btn-ghost btn-sm" onClick={() => { setSubject(DEFAULT_EMAIL_SUBJECT); setBody(DEFAULT_EMAIL_BODY); }}>Reset to default</button>
              </h3>
              <div style={{fontSize: 12, color: "var(--halo-text-3)", marginBottom: 10}}>
                Variables <code style={{background: "#F4F6FA", padding: "1px 5px", borderRadius: 4}}>{"{{firstName}}"}</code>, <code style={{background: "#F4F6FA", padding: "1px 5px", borderRadius: 4}}>{"{{company}}"}</code>, <code style={{background: "#F4F6FA", padding: "1px 5px", borderRadius: 4}}>{"{{deadline}}"}</code>, <code style={{background: "#F4F6FA", padding: "1px 5px", borderRadius: 4}}>{"{{n}}"}</code>, <code style={{background: "#F4F6FA", padding: "1px 5px", borderRadius: 4}}>{"{{sections}}"}</code> are substituted on send.
              </div>
              <label style={{fontSize: 11, color: "var(--halo-text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600}}>Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} style={{...inputStyleBuilder, width: "100%", marginTop: 4, marginBottom: 12}} />
              <label style={{fontSize: 11, color: "var(--halo-text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600}}>Body</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} style={{...inputStyleBuilder, height: "auto", padding: "12px 14px", width: "100%", marginTop: 4, minHeight: 220, fontFamily: "inherit", lineHeight: 1.55, resize: "vertical"}} />

              {/* Block-reason hint */}
              {(recipients.length === 0 || !tier) && (
                <div style={{display: "flex", alignItems: "center", gap: 8, marginTop: 18, padding: "10px 14px", background: "var(--halo-amber-soft)", border: "1px solid #F0D5A0", borderRadius: 10, fontSize: 12, color: "#8E5F18"}}>
                  <Icon name="flag" size={13} color="#E8A33D" />
                  <span>
                    {recipients.length === 0 && !tier && 'Add at least one recipient and pick a revenue tier to send.'}
                    {recipients.length === 0 && tier && 'Add at least one recipient to send.'}
                    {recipients.length > 0 && !tier && 'Pick a revenue tier (L1, L2, or L3) to send.'}
                  </span>
                </div>
              )}

              <div style={{display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end"}}>
                <button className="btn btn-ghost" onClick={() => setStep("review-form")}><Icon name="arrowback" size={13} />Back</button>
                <button className="btn btn-mint"
                  disabled={recipients.length === 0 || !tier}
                  style={(recipients.length === 0 || !tier) ? {opacity:0.5, cursor:"not-allowed"} : {}}
                  onClick={() => {
                    if (recipients.length === 0 || !tier) return;
                    window.HALO_ESG.setCompanyTier(co.id, tier);
                    setStep("confirm");
                  }}>
                  Review & send to {recipients.length || 0}<Icon name="chev" size={13} />
                </button>
              </div>
            </div>

            {/* Live preview */}
            <div className="card card-pad" style={{position: "sticky", top: 22}}>
              <h3 style={{margin: "0 0 10px", fontSize: 14}}>Live preview</h3>
              <div style={{padding: 14, background: "#FAFBFD", borderRadius: 10, fontSize: 12, color: "var(--halo-text-2)", lineHeight: 1.6}}>
                <div style={{fontSize: 11, color: "var(--halo-text-3)", marginBottom: 4}}>From: Krishti Sharma &lt;esg@stride.vc&gt;</div>
                <div style={{fontSize: 11, color: "var(--halo-text-3)", marginBottom: 8, whiteSpace: "normal", wordBreak: "break-word"}}>
                  To: {recipients.length === 0 ? <i>no recipients yet</i> : recipients.map(r => `${r.name} <${r.email}>`).join(', ')}
                </div>
                <div style={{height: 1, background: "var(--halo-line-2)", margin: "8px 0 10px"}} />
                <div style={{fontSize: 13, fontWeight: 700, color: "var(--halo-text)", marginBottom: 8}}>{renderedSubject}</div>
                <div style={{fontSize: 12.5, whiteSpace: "pre-wrap"}}>{renderedBody}</div>
                <div style={{marginTop: 10, color: "var(--halo-mint)", fontWeight: 600}}>→ Open survey link</div>
              </div>
              <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 10, lineHeight: 1.5}}>
                {questions.length} questions · {sections.length} sections · <strong>Stride Full Assessment</strong>
              </div>
              {tier && (
                <div style={{marginTop: 12, padding: "10px 12px", background: "#F2FBF7", border: "1px solid #B8EDD8", borderRadius: 8, display: "flex", alignItems: "center", gap: 8}}>
                  <Icon name="shield" size={13} color="#22C28F" />
                  <div style={{fontSize: 11.5, color: "var(--halo-text-2)", lineHeight: 1.4}}>
                    Tier <strong style={{color: "#1B7C5E"}}>{tier}</strong> · pass threshold <span className="mono" style={{fontWeight: 700}}>{window.HALO_ESG.SCORING.PASS_THRESHOLDS[tier]}</span>/100
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Step 5: confirm */}
      {step === "confirm" && co && (
        <div className="card card-pad" style={{textAlign: "center", padding: 48}}>
          <div style={{display: "inline-grid", placeItems: "center", width: 72, height: 72, borderRadius: 18, background: "#F2FBF7", color: "var(--halo-mint)", marginBottom: 18}}>
            <Icon name="check" size={36} stroke={2.5} />
          </div>
          <h2 style={{margin: 0, fontSize: 22, fontWeight: 700}}>Survey sent to {co.name}</h2>
          <p style={{color: "var(--halo-text-2)", fontSize: 14, maxWidth: 480, margin: "10px auto 18px"}}>
            We've emailed {co.spoc} a secure link with {questions.length} questions. You'll be notified as sections are completed.
          </p>
          {tier && (
            <div style={{display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#F2FBF7", border: "1px solid #B8EDD8", borderRadius: 999, marginBottom: 22}}>
              <Icon name="shield" size={13} color="#22C28F" />
              <span style={{fontSize: 12, fontWeight: 700, color: "#1B7C5E"}}>
                Tagged as Tier {tier} · pass threshold {window.HALO_ESG.SCORING.PASS_THRESHOLDS[tier]}/100
              </span>
            </div>
          )}
          <div style={{display: "flex", gap: 10, justifyContent: "center"}}>
            <button className="btn btn-outline" onClick={() => { setStep("pick"); setSelected(null); setTier(null); setQuestions(TEMPLATE_QUESTIONS); }}>Send to another</button>
            <button className="btn btn-mint" onClick={() => window.HALO_NAV("overview")}>Back to assessments</button>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyleBuilder = {
  height: 38, padding: "0 12px",
  border: "1px solid var(--halo-line)",
  borderRadius: 8, background: "white",
  fontSize: 13, outline: "none",
};

window.SendSurvey = SendSurvey;
