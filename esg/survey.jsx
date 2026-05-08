// HALO ESG — Survey screen (Workforce & Diversity demo section)

const Survey = ({ companyId }) => {
  const co = window.HALO_ESG.COMPANIES.find(c => c.id === (companyId || "tap")) || window.HALO_ESG.COMPANIES[3];
  const SECTIONS = window.HALO_ESG.SECTIONS;
  const [activeSection, setActiveSection] = React.useState(4);
  const [women, setWomen] = React.useState(38);
  const [posh, setPosh] = React.useState("yes");
  const [initiatives, setInitiatives] = React.useState(new Set(["mentor", "review"]));
  const [headcount, setHeadcount] = React.useState(412);
  const [vp, setVp] = React.useState(28);

  const totalQ = SECTIONS.reduce((s, x) => s + x.qs, 0);
  const doneQ  = SECTIONS.reduce((s, x) => s + x.done, 0);
  const pct = Math.round((doneQ / totalQ) * 100);

  const toggleInit = (k) => {
    const n = new Set(initiatives);
    n.has(k) ? n.delete(k) : n.add(k);
    setInitiatives(n);
  };

  const INITIATIVES = [
    { id: "mentor",   label: "Mentorship for women",         hint: "Structured 1:1 program" },
    { id: "review",   label: "Pay equity review",            hint: "Annual audit by external firm" },
    { id: "parental", label: "Extended parental leave",      hint: "Beyond statutory requirement" },
    { id: "flex",     label: "Flexible work arrangements",   hint: "Remote, hybrid, part-time" },
    { id: "tracking", label: "Diversity hiring targets",     hint: "Tracked at board level" },
    { id: "training", label: "Unconscious bias training",    hint: "Mandatory for managers" },
    { id: "ergs",     label: "Employee resource groups",     hint: "ERGs / affinity networks" },
    { id: "child",    label: "On-site childcare or stipend", hint: "Crèche or monthly stipend" },
  ];

  return (
    <div className="fade-in">
      <HeaderBand
        title={`${co.name} — ESG Survey`}
        badge="DRAFT"
        subtitle={`Section ${activeSection} of 9 · Auto-saves every 10 seconds · Last edited 2:34 PM`}
        actions={<>
          <button className="tab-btn"><Icon name="out" size={14} />Save & exit</button>
          <button className="tab-btn"><Icon name="help" size={14} />Get help</button>
          <button className="tab-btn primary"><Icon name="check" size={14} />Submit assessment</button>
        </>}
      />

      {/* Progress bar strip */}
      <div style={{background: "white", borderBottom: "1px solid var(--halo-line)", padding: "16px 36px"}}>
        <div style={{maxWidth: 1480, margin: "0 auto", display: "flex", alignItems: "center", gap: 24}}>
          <div style={{flex: 1}}>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12}}>
              <span style={{fontWeight: 600, color: "var(--halo-text-2)"}}>Overall completion</span>
              <span className="mono" style={{fontWeight: 700, color: "var(--halo-text)"}}>{doneQ} of {totalQ} questions · {pct}%</span>
            </div>
            <div className="score-bar" style={{height: 8}}>
              <div style={{width: pct + "%", background: "linear-gradient(90deg, var(--halo-mint) 0%, var(--halo-amber) 100%)"}} />
            </div>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 6, color: "#1B7C5E", fontSize: 12, fontWeight: 600}}>
            <Icon name="check" size={14} />Saved 2 sec ago
          </div>
        </div>
      </div>

      <div className="content" style={{display: "grid", gridTemplateColumns: "260px 1fr 300px", gap: 22, alignItems: "start"}}>
        {/* Section nav */}
        <div className="card" style={{position: "sticky", top: 22, overflow: "hidden"}}>
          <div className="card-h" style={{padding: "18px 20px 12px"}}>
            <h3 style={{fontSize: 14}}>Sections</h3>
          </div>
          <div>
            {SECTIONS.map(s => {
              const isCur = s.id === activeSection;
              const cls = s.status === "done" ? "done" : isCur ? "current" : "todo";
              return (
                <div key={s.id}
                  className={"section-card " + cls}
                  onClick={() => setActiveSection(s.id)}
                  style={{cursor: "pointer", background: isCur ? "#FAFBFD" : "transparent"}}
                >
                  <div className="num">
                    {s.status === "done" ? <Icon name="check" size={14} stroke={2.5} /> : s.id}
                  </div>
                  <div className="body">
                    <div className="t">{s.title}</div>
                    <div className="m">{s.done}/{s.qs} questions</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Questions column */}
        <div>
          <div style={{marginBottom: 22}}>
            <div style={{fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "var(--halo-amber)", textTransform: "uppercase", marginBottom: 8}}>
              Section 4 of 9
            </div>
            <h2 style={{margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em"}}>Workforce & Diversity</h2>
            <p style={{color: "var(--halo-text-2)", fontSize: 14, marginTop: 8, maxWidth: 620}}>
              Tell us about your team composition, equity practices, and policies. These answers feed the Social pillar of your ESG score and help us benchmark against your sector.
            </p>
            <div style={{display: "flex", gap: 18, marginTop: 12, fontSize: 12, color: "var(--halo-text-3)"}}>
              <span><Icon name="clock" size={12} /> ~8 minutes</span>
              <span>12 questions</span>
              <span>Auto-saves every 10 sec</span>
            </div>
          </div>

          {/* Q1 — number */}
          <QCard num={1} required title="Total full-time headcount" hint="Permanent employees on payroll as of last month-end">
            <div style={{display: "flex", alignItems: "center", gap: 12, maxWidth: 360}}>
              <input className="mono" type="number" value={headcount} onChange={e=>setHeadcount(+e.target.value)}
                style={inputStyle} />
              <span className="muted" style={{fontSize: 13}}>employees</span>
            </div>
          </QCard>

          {/* Q2 — slider */}
          <QCard num={2} required title="What percentage of your workforce identifies as women?">
            <div style={{display: "flex", alignItems: "center", gap: 18}}>
              <input type="range" min="0" max="100" value={women}
                onChange={e=>setWomen(+e.target.value)}
                style={{flex: 1, accentColor: "var(--halo-mint)", height: 6}} />
              <div style={{minWidth: 88, textAlign: "right"}}>
                <span className="mono" style={{fontSize: 24, fontWeight: 700, color: "var(--halo-navy)"}}>{women}</span>
                <span className="mono" style={{fontSize: 14, color: "var(--halo-text-3)", marginLeft: 4}}>%</span>
              </div>
            </div>
            <div style={{display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--halo-text-3)", marginTop: 8}}>
              <span>0%</span>
              <span style={{color: "#1B7C5E"}}>Sector median: 31%</span>
              <span>100%</span>
            </div>
          </QCard>

          {/* Q3 — number */}
          <QCard num={3} required title="Women in leadership roles (VP+)" hint="Includes VPs, SVPs, C-suite, and board">
            <div style={{display: "flex", alignItems: "center", gap: 12, maxWidth: 360}}>
              <input className="mono" type="number" value={vp} onChange={e=>setVp(+e.target.value)} style={inputStyle} />
              <span className="muted" style={{fontSize: 13}}>people</span>
            </div>
          </QCard>

          {/* Q4 — multi-select */}
          <QCard num={4} required title="Which D&I initiatives have you implemented?" hint="Select all that apply">
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
              {INITIATIVES.map(o => {
                const sel = initiatives.has(o.id);
                return (
                  <button key={o.id} onClick={()=>toggleInit(o.id)} style={{
                    border: sel ? "1.5px solid var(--halo-mint)" : "1px solid var(--halo-line)",
                    background: sel ? "#F2FBF7" : "white",
                    borderRadius: 10, padding: "12px 14px",
                    display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left",
                    transition: "all 120ms",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, marginTop: 1,
                      background: sel ? "var(--halo-mint)" : "white",
                      border: sel ? "none" : "1.5px solid var(--halo-line)",
                      display: "grid", placeItems: "center", flexShrink: 0,
                    }}>
                      {sel && <Icon name="check" size={11} color="white" stroke={3} />}
                    </div>
                    <div>
                      <div style={{fontSize: 13, fontWeight: 600, color: "var(--halo-text)"}}>{o.label}</div>
                      <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 2}}>{o.hint}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </QCard>

          {/* Q5 — yes/no */}
          <QCard num={5} required title="Is your anti-harassment policy compliant with the POSH Act?" hint="Prevention of Sexual Harassment of Women at Workplace Act, 2013">
            <div style={{display: "flex", gap: 10}}>
              {["yes", "no"].map(v => {
                const sel = posh === v;
                return (
                  <button key={v} onClick={()=>setPosh(v)} style={{
                    flex: 1, padding: "16px 0",
                    border: sel ? "1.5px solid var(--halo-navy)" : "1px solid var(--halo-line)",
                    background: sel ? "#F4F6FA" : "white",
                    borderRadius: 10,
                    fontSize: 14, fontWeight: 700,
                    letterSpacing: "0.06em", textTransform: "uppercase",
                    color: sel ? "var(--halo-navy)" : "var(--halo-text-2)",
                  }}>
                    {v === "yes" ? "Yes, fully compliant" : "No, not yet"}
                  </button>
                );
              })}
            </div>
          </QCard>

          {/* Q6 — matrix */}
          <QCard num={6} title="Median annual compensation by gender (₹)" hint="Across full-time employees, last fiscal year">
            <div style={{border: "1px solid var(--halo-line)", borderRadius: 10, overflow: "hidden"}}>
              {[
                { lbl: "Male",       v: "12,40,000" },
                { lbl: "Female",     v: "11,80,000" },
                { lbl: "Non-binary", v: "—" },
              ].map((r, i) => (
                <div key={i} style={{display: "grid", gridTemplateColumns: "1fr 200px", padding: "14px 18px",
                  borderTop: i ? "1px solid var(--halo-line-2)" : "none", alignItems: "center"}}>
                  <span style={{fontSize: 13, fontWeight: 500}}>{r.lbl}</span>
                  <input className="mono" defaultValue={r.v} style={{...inputStyle, width: "100%", textAlign: "right"}} />
                </div>
              ))}
            </div>
          </QCard>

          {/* Q7 — file upload */}
          <QCard num={7} title="Upload your latest D&I report or workforce policy" hint="Optional — speeds up review">
            <div style={{
              border: "1.5px dashed var(--halo-line)",
              background: "#FAFBFD",
              borderRadius: 10, padding: "26px 20px",
              textAlign: "center",
            }}>
              <div style={{display: "inline-grid", placeItems: "center", width: 44, height: 44, borderRadius: 11, background: "#E6E7F4", color: "#45489B", marginBottom: 8}}>
                <Icon name="upload" size={20} />
              </div>
              <div style={{fontSize: 13, fontWeight: 600}}>Drop files here, or <span style={{color: "var(--halo-mint)"}}>click to browse</span></div>
              <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 4}}>PDF, DOCX, XLSX · Max 10MB</div>
            </div>
          </QCard>
        </div>

        {/* Help sidebar */}
        <div style={{position: "sticky", top: 22, display: "flex", flexDirection: "column", gap: 16}}>
          <div className="card card-pad">
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 10}}>
              <div style={{width: 28, height: 28, borderRadius: 8, background: "#E6E7F4", color: "#45489B", display: "grid", placeItems: "center"}}>
                <Icon name="info" size={14} />
              </div>
              <h3 style={{margin: 0, fontSize: 14, fontWeight: 700}}>Why we're asking</h3>
            </div>
            <p style={{fontSize: 13, color: "var(--halo-text-2)", lineHeight: 1.55, margin: 0}}>
              Workforce & Diversity contributes <strong>22 points</strong> to your Social pillar score. Companies in the top quartile typically have 35%+ women representation and documented pay-equity reviews.
            </p>
          </div>
          <div className="card card-pad">
            <h3 style={{margin: "0 0 10px", fontSize: 14, fontWeight: 700}}>Example response</h3>
            <div style={{borderLeft: "3px solid var(--halo-violet)", paddingLeft: 12, fontSize: 12.5, color: "var(--halo-text-2)", lineHeight: 1.6, fontStyle: "italic"}}>
              "We track diversity at every level — hiring funnels, promotions, exits — with a quarterly review at the board. Our last pay-equity audit was completed in Q1 by Aon."
            </div>
            <button className="btn btn-outline btn-sm" style={{marginTop: 14, width: "100%"}}>
              <Icon name="mail" size={13} />Ask Krishti's team
            </button>
          </div>

          <div className="card card-pad" style={{background: "#F4F6FA"}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 8}}>
              <Icon name="shield" size={14} color="#45489B" />
              <span style={{fontSize: 12, fontWeight: 700, letterSpacing: "0.04em"}}>Confidential</span>
            </div>
            <p style={{fontSize: 12, color: "var(--halo-text-2)", lineHeight: 1.5, margin: 0}}>
              Your responses are visible only to the Stride ESG team and your assigned deal partner. Aggregated data may be shared in anonymized benchmarks.
            </p>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        position: "sticky", bottom: 0,
        background: "white", borderTop: "1px solid var(--halo-line)",
        padding: "14px 36px",
      }}>
        <div style={{maxWidth: 1480, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <button className="btn btn-ghost"><Icon name="arrowback" size={14} />Previous: Energy & Emissions</button>
          <span className="muted mono" style={{fontSize: 12}}>Last synced 2:34 PM · Section 4 of 9</span>
          <div style={{display: "flex", gap: 10}}>
            <button className="btn btn-outline">Save draft</button>
            <button className="btn btn-mint">Continue to Health & Safety<Icon name="chev" size={13} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  height: 38, padding: "0 12px",
  border: "1px solid var(--halo-line)",
  borderRadius: 8, background: "white",
  fontSize: 14, outline: "none", width: 160,
};

const QCard = ({ num, title, hint, children, required }) => (
  <div style={{position: "relative", background: "white", borderRadius: 12, padding: "22px 26px", boxShadow: "var(--halo-shadow)", marginBottom: 14, marginLeft: 22}}>
    <div style={{
      position: "absolute", left: -22, top: 22,
      width: 32, height: 32, borderRadius: "50%",
      background: "var(--halo-navy)", color: "white",
      display: "grid", placeItems: "center",
      fontFamily: "JetBrains Mono", fontSize: 12, fontWeight: 700,
      boxShadow: "0 2px 6px rgba(11,26,63,0.18)",
    }}>{num}</div>
    <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14}}>
      <div>
        <div style={{fontSize: 15, fontWeight: 600, color: "var(--halo-text)"}}>
          {title}{required && <span style={{color: "var(--halo-amber)", marginLeft: 4}}>*</span>}
        </div>
        {hint && <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 4}}>{hint}</div>}
      </div>
      <button className="btn btn-ghost btn-sm" style={{flexShrink: 0}}>
        <Icon name="help" size={12} />Why we ask
      </button>
    </div>
    {children}
  </div>
);

window.Survey = Survey;
