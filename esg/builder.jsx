// HALO ESG — Survey Builder (ESG-team facing question editor + reminder)

const DEFAULT_QUESTIONS = [
  { id: "q1", section: "Workforce & Diversity", q: "Total full-time headcount", type: "Number", required: true },
  { id: "q2", section: "Workforce & Diversity", q: "What percentage of your workforce identifies as women?", type: "Slider", required: true },
  { id: "q3", section: "Workforce & Diversity", q: "Women in leadership roles (VP+)", type: "Number", required: true },
  { id: "q4", section: "Workforce & Diversity", q: "Which D&I initiatives have you implemented?", type: "Multi-select", required: true },
  { id: "q5", section: "Workforce & Diversity", q: "Anti-harassment policy compliant with POSH Act?", type: "Yes / No", required: true },
  { id: "q6", section: "Workforce & Diversity", q: "Median annual compensation by gender", type: "Matrix", required: false },
  { id: "q7", section: "Workforce & Diversity", q: "Upload latest D&I report or workforce policy", type: "File upload", required: false },
  { id: "q8", section: "Energy & Emissions", q: "What is your Scope 1 + 2 emissions footprint (tCO₂e)?", type: "Number", required: true },
  { id: "q9", section: "Energy & Emissions", q: "Renewable energy as % of total consumption?", type: "Slider", required: true },
  { id: "q10", section: "Governance", q: "Is there an independent director on the board?", type: "Yes / No", required: true },
];

const SurveyBuilder = ({ co }) => {
  const [questions, setQuestions] = React.useState(DEFAULT_QUESTIONS);
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState({ section: "Workforce & Diversity", q: "", type: "Number", required: true });

  const sections = [...new Set(questions.map(q => q.section))];
  const sentDate = co?.sent || "Apr 18";
  const notFilled = co && (co.status === "in-progress" || co.status === "not-started" || co.status === "overdue");

  const addQ = () => {
    if (!draft.q.trim()) return;
    setQuestions([...questions, { ...draft, id: "q" + Date.now() }]);
    setDraft({ section: draft.section, q: "", type: "Number", required: true });
    setAdding(false);
  };

  const removeQ = (id) => setQuestions(questions.filter(q => q.id !== id));

  return (
    <div style={{padding: "24px 36px"}}>
      {/* Reminder banner if company hasn't filled */}
      {notFilled && (
        <div className="card" style={{padding: "18px 24px", marginBottom: 22, borderLeft: "3px solid var(--halo-amber)", display: "flex", alignItems: "center", gap: 16}}>
          <div style={{width: 40, height: 40, borderRadius: 10, background: "var(--halo-amber-soft)", color: "#8E5F18", display: "grid", placeItems: "center"}}>
            <Icon name="clock" size={18} />
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 14, fontWeight: 700, color: "var(--halo-text)"}}>
              {co.name} has not completed the survey
            </div>
            <div style={{fontSize: 12, color: "var(--halo-text-2)", marginTop: 2}}>
              Sent {sentDate} · {co.progress}% complete · Last activity 3 days ago
            </div>
          </div>
          <button className="btn btn-outline"><Icon name="mail" size={13} />Email founder</button>
          <button className="btn btn-mint"><Icon name="bell" size={13} />Send reminder</button>
        </div>
      )}

      <div style={{display: "grid", gridTemplateColumns: "1fr 320px", gap: 22, alignItems: "start"}}>
        <div>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16}}>
            <div>
              <h2 style={{margin: 0, fontSize: 20, fontWeight: 700}}>Survey questions</h2>
              <div className="sub" style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 4}}>
                {questions.length} questions across {sections.length} sections · sent to founder {sentDate}
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
            <div key={section} style={{marginBottom: 22}}>
              <div style={{fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 8}}>
                {section} · {questions.filter(q => q.section === section).length} questions
              </div>
              <div className="card" style={{overflow: "hidden"}}>
                {questions.filter(q => q.section === section).map((q, i, arr) => (
                  <div key={q.id} style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px",
                    borderTop: i ? "1px solid var(--halo-line-2)" : "none",
                  }}>
                    <div style={{width: 28, height: 28, borderRadius: 8, background: "#E6E7F4", color: "#45489B", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0}}>
                      {i + 1}
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontSize: 13, fontWeight: 600, color: "var(--halo-text)"}}>
                        {q.q}{q.required && <span style={{color: "var(--halo-amber)", marginLeft: 4}}>*</span>}
                      </div>
                      <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 2}}>
                        {q.type}{q.required ? " · Required" : " · Optional"}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm"><Icon name="pen" size={12} />Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeQ(q.id)} style={{color: "#9F2D2D"}}>
                      <Icon name="x" size={12} />Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Send survey CTA below the builder */}
          <div className="card" style={{padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 8}}>
            <div>
              <div style={{fontSize: 14, fontWeight: 700, color: "var(--halo-text)"}}>Ready to send this survey?</div>
              <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 2}}>
                {questions.length} questions across {sections.length} sections will be delivered to {co?.spoc || "the founder"}.
              </div>
            </div>
            <div style={{display: "flex", gap: 10}}>
              <button className="btn btn-outline"><Icon name="out" size={13} />Preview</button>
              <button className="btn btn-mint"><Icon name="send" size={13} />Send survey</button>
            </div>
          </div>
        </div>

        {/* Side rail */}
        <div style={{position: "sticky", top: 22, display: "flex", flexDirection: "column", gap: 16}}>
          <div className="card card-pad">
            <h3 style={{margin: "0 0 10px", fontSize: 14, fontWeight: 700}}>Survey overview</h3>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
              <Stat label="Questions" v={questions.length} />
              <Stat label="Sections" v={sections.length} />
              <Stat label="Required" v={questions.filter(q=>q.required).length} />
              <Stat label="Est. time" v="~45m" />
            </div>
            <div style={{marginTop: 14, padding: "10px 12px", background: "#FAFBFD", borderRadius: 8, fontSize: 12, color: "var(--halo-text-2)", lineHeight: 1.5}}>
              Edits made here apply only to <strong>{co?.name || "this company"}</strong>'s instance of the survey. Use Settings → Templates to edit the master.
            </div>
          </div>

          <div className="card card-pad">
            <h3 style={{margin: "0 0 10px", fontSize: 14, fontWeight: 700}}>Response form access</h3>
            <div style={{display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0"}}>
              <span className="muted">Recipient</span>
              <span style={{fontWeight: 600}}>{co?.spoc || "—"}</span>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0"}}>
              <span className="muted">Sent on</span>
              <span className="mono">{sentDate}</span>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0"}}>
              <span className="muted">Status</span>
              <StatusPill status={co?.status || "in-progress"} />
            </div>
            <div style={{display: "flex", gap: 8, marginTop: 12}}>
              <button className="btn btn-outline btn-sm" style={{flex: 1}}><Icon name="out" size={12} />Copy link</button>
              <button className="btn btn-outline btn-sm" style={{flex: 1}}><Icon name="mail" size={12} />Resend</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyleBuilder = {
  height: 38, padding: "0 12px",
  border: "1px solid var(--halo-line)",
  borderRadius: 8, background: "white",
  fontSize: 13, outline: "none",
};

const Stat = ({ label, v }) => (
  <div style={{padding: "10px 12px", background: "#FAFBFD", borderRadius: 8}}>
    <div style={{fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>{label}</div>
    <div className="mono" style={{fontSize: 22, fontWeight: 700, marginTop: 2}}>{v}</div>
  </div>
);

window.SurveyBuilder = SurveyBuilder;
