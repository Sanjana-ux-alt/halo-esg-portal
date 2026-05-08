// HALO ESG — Company detail with per-company sub-tabs

const CompanyDetail = ({ companyId }) => {
  const co = window.HALO_ESG.COMPANIES.find(c => c.id === companyId) || window.HALO_ESG.COMPANIES[0];
  const filled  = co.progress === 100;
  const scored  = co.score !== null;

  const [tab, setTab] = React.useState(() => {
    if (co.score !== null)         return "report";
    if (co.progress === 100)       return "review";
    return "submission";
  });

  return (
    <div className="fade-in">
      {/* Company header */}
      <div style={{
        background: "linear-gradient(180deg, var(--halo-navy-deep) 0%, var(--halo-navy) 100%)",
        color: "white",
        padding: "18px 36px 22px",
      }}>
        <div style={{marginBottom: 16}}>
          <button onClick={() => window.HALO_NAV("overview")}
            style={{background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "white", cursor: "pointer", padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 7, display: "inline-flex", alignItems: "center", gap: 7}}>
            <Icon name="arrowback" size={13} />Back to assessments
          </button>
        </div>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24}}>
          <div style={{display: "flex", alignItems: "center", gap: 18}}>
            <div className="co-logo" style={{background: co.color, width: 56, height: 56, borderRadius: 13, fontSize: 18, boxShadow: "0 0 0 4px rgba(255,255,255,0.06)"}}>{co.initials}</div>
            <div>
              <div style={{display: "flex", alignItems: "center", gap: 12}}>
                <h1 style={{margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em"}}>{co.name}</h1>
                <StatusPill status={co.status} />
              </div>
              <div style={{color: "#ADB3CE", fontSize: 13, marginTop: 4, display: "flex", alignItems: "center", gap: 14}}>
                <span><Icon name="leaf" size={11} color="#ADB3CE" /> {co.sector}</span>
                <span style={{color: "#3a4063"}}>·</span>
                <span>{co.amount}</span>
                <span style={{color: "#3a4063"}}>·</span>
                <ContactTeamButton co={co} />
              </div>
            </div>
          </div>
          <StageBadge co={co} filled={filled} scored={scored} />
        </div>
      </div>

      {/* Per-company tabs */}
      <div style={{
        background: "white",
        borderBottom: "1px solid var(--halo-line)",
        padding: "0 36px",
        display: "flex",
        gap: 4,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        {[
          { id: "report",     label: "Report",             icon: "folder", disabled: !scored },
          { id: "review",     label: "Review",             icon: "brain", disabled: !filled },
          { id: "submission", label: "Submitted Response", icon: "folder" },
          { id: "qna",        label: "Q&A",                icon: "mail" },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id}
              onClick={() => !t.disabled && setTab(t.id)}
              disabled={t.disabled}
              style={{
                padding: "14px 18px 12px",
                fontSize: 13, fontWeight: 600, background: "none", border: "none",
                color: active ? "var(--halo-navy)" : t.disabled ? "var(--halo-text-3)" : "var(--halo-text-2)",
                borderBottom: active ? "2px solid var(--halo-navy)" : "2px solid transparent",
                marginBottom: -1,
                display: "inline-flex", alignItems: "center", gap: 8,
                cursor: t.disabled ? "not-allowed" : "pointer",
                opacity: t.disabled ? 0.5 : 1,
              }}
            >
              <Icon name={t.icon} size={14} />{t.label}
              {t.disabled && <Icon name="shield" size={11} />}
            </button>
          );
        })}
      </div>

      {tab === "submission" && <Submission co={co} />}
      {tab === "qna"        && <FounderQA co={co} />}
      {tab === "review" && filled && <Review companyId={co.id} embedded />}
      {tab === "report" && scored && <Report companyId={co.id} embedded />}
    </div>
  );
};

// ─── Submitted Response ───────────────────────────────────
// Renders the EXACT same Excel KPI questions the founder saw, with their answers.
// Pulled from window.HALO_ESG.STATE.answers (the form auto-saves to it).
const buildSubmittedAnswers = (co) => {
  const SCORING = window.HALO_ESG.SCORING;
  const sec = SCORING.sectorKey(co.sector);
  const ans = window.HALO_ESG.STATE.answers[co.id] || {};
  const allQs = SCORING.QUESTIONS.filter(q => !q.sectors || q.sectors.includes(sec));
  const order = []; const map = {};
  allQs.forEach(q => {
    if (!map[q.section]) { map[q.section] = []; order.push(q.section); }
    const v = ans[q.id];
    const display = (() => {
      if (v === undefined || v === null || v === '') return null;
      if (Array.isArray(v)) return v.join(' · ');
      if (q.type === 'Slider') return `${v}${q.unit || '%'}`;
      if (q.type === 'Number' && q.unit) return `${v} ${q.unit}`;
      return String(v);
    })();
    map[q.section].push({ q: q.q, type: q.type, a: display });
  });
  return order.map(s => ({ section: s, items: map[s] }));
};

const Submission = ({ co }) => {
  if (!co.submitted || co.submitted === "—") {
    return (
      <div style={{padding: "40px 36px"}}>
        <div className="card card-pad" style={{textAlign: "center", padding: 56}}>
          <div style={{display: "inline-grid", placeItems: "center", width: 56, height: 56, borderRadius: 14, background: "var(--halo-amber-soft)", color: "#8E5F18", marginBottom: 14}}>
            <Icon name="clock" size={26} />
          </div>
          <h3 style={{margin: 0, fontSize: 18, fontWeight: 700}}>Awaiting submission</h3>
          <div style={{color: "var(--halo-text-2)", fontSize: 13, marginTop: 6, maxWidth: 440, margin: "6px auto 0"}}>
            Survey was sent {co.sent}. {co.progress}% complete. The founder will see all answers here once submitted.
          </div>
          <div style={{display: "flex", gap: 10, justifyContent: "center", marginTop: 18}}>
            <button className="btn btn-outline" onClick={() => window.HALO_NAV("founder", co.id)}><Icon name="out" size={13} />Preview response form</button>
            <button className="btn btn-mint"><Icon name="bell" size={13} />Send reminder</button>
          </div>
        </div>
      </div>
    );
  }

  const sections = buildSubmittedAnswers(co);
  const totalQs = sections.reduce((n, s) => n + s.items.length, 0);
  const filled  = sections.reduce((n, s) => n + s.items.filter(it => it.a !== null).length, 0);

  return (
    <div style={{padding: "24px 36px"}}>
      <div className="card" style={{padding: "16px 22px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <div>
          <div style={{fontSize: 14, fontWeight: 700}}>Submitted by {co.spoc} · {co.submitted}</div>
          <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 2}}>
            {filled} of {totalQs} questions answered · same form the founder filled out
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => window.HALO_NAV("founder", co.id)}>
          <Icon name="out" size={13} />Open response form
        </button>
      </div>

      {sections.map(sec => (
        <div key={sec.section} style={{marginBottom: 18}}>
          <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8}}>
            <div style={{fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>{sec.section}</div>
            <div style={{fontSize: 11, color: "var(--halo-text-3)"}}>
              {sec.items.filter(it => it.a !== null).length} / {sec.items.length} answered
            </div>
          </div>
          <div className="card" style={{overflow: "hidden"}}>
            {sec.items.map((it, i) => (
              <div key={i} style={{padding: "14px 18px", borderTop: i ? "1px solid var(--halo-line-2)" : "none", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18, alignItems: "flex-start"}}>
                <div>
                  <div style={{fontSize: 13, color: "var(--halo-text-2)", lineHeight: 1.45}}>{it.q}</div>
                  <div style={{fontSize: 10, color: "var(--halo-text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginTop: 4}}>{it.type}</div>
                </div>
                <div style={{fontSize: 13.5, fontWeight: 600, color: it.a === null ? "var(--halo-text-3)" : "var(--halo-text)", fontStyle: it.a === null ? "italic" : "normal"}}>
                  {it.a === null ? '— no answer' : it.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Founder Q&A — reads real questions from STATE.qaQuestions ───
const FounderQA = ({ co }) => {
  // Track tick so we re-render after replyQuestion mutates STATE
  const [tick, setTick] = React.useState(0);
  const [drafts, setDrafts] = React.useState({}); // { [qid]: text }

  const thread = window.HALO_ESG.STATE.qaQuestions[co.id] || [];
  const open    = thread.filter(q => q.status === "open").length;
  const ansd    = thread.filter(q => q.status === "answered").length;

  const sendReply = (qid) => {
    const text = (drafts[qid] || '').trim();
    if (!text) return;
    window.HALO_ESG.replyQuestion(co.id, qid, text);
    setDrafts({ ...drafts, [qid]: '' });
    setTick(t => t + 1);
  };

  return (
    <div style={{padding: "24px 36px"}}>
      <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14}}>
        <div>
          <h2 style={{margin: 0, fontSize: 18, fontWeight: 700}}>Questions from {co.name}</h2>
          <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 4}}>
            {co.spoc.split(' ')[0]} can ask questions from the "Ask the ESG team" panel on the survey form.
          </div>
        </div>
        <div style={{fontSize: 12, color: "var(--halo-text-3)"}}>
          {open} open · {ansd} answered
        </div>
      </div>

      {thread.length === 0 && (
        <div className="card card-pad" style={{textAlign: "center", padding: 40}}>
          <div style={{display: "inline-grid", placeItems: "center", width: 52, height: 52, borderRadius: 13, background: "#E6E7F4", color: "#45489B", marginBottom: 12}}>
            <Icon name="help" size={22} />
          </div>
          <div style={{fontSize: 15, fontWeight: 700}}>No questions yet</div>
          <div style={{fontSize: 13, color: "var(--halo-text-3)", marginTop: 4, maxWidth: 420, margin: "4px auto 0"}}>
            When {co.spoc.split(' ')[0]} asks a question from the survey form, it'll appear here for you to reply.
          </div>
        </div>
      )}

      <div style={{display: "flex", flexDirection: "column", gap: 12}}>
        {thread.map((q) => (
          <div key={q.id} className="card card-pad">
            <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8}}>
              <div style={{fontSize: 12, color: "var(--halo-text-3)"}}>
                <strong style={{color: "var(--halo-text)"}}>{q.from}</strong> · {q.time}
              </div>
              <span style={{
                fontSize: 10, letterSpacing: "0.14em", fontWeight: 800, padding: "3px 8px", borderRadius: 4,
                background: q.status === "open" ? "var(--halo-amber-soft)" : "var(--halo-mint-soft)",
                color: q.status === "open" ? "#8E5F18" : "#1B7C5E",
              }}>{q.status === "open" ? "OPEN" : "ANSWERED"}</span>
            </div>
            <div style={{fontSize: 14, fontWeight: 600, color: "var(--halo-text)", lineHeight: 1.5}}>{q.q}</div>
            {q.status === "answered" ? (
              <div style={{marginTop: 10, padding: "10px 12px", background: "#F2FBF7", borderRadius: 8, fontSize: 13, color: "var(--halo-text-2)", lineHeight: 1.5}}>
                <strong style={{color: "var(--halo-mint)"}}>{q.repliedBy || 'Krishti'} replied{q.repliedTime ? ` · ${q.repliedTime}` : ''}:</strong> {q.a}
              </div>
            ) : (
              <div style={{marginTop: 10, display: "flex", gap: 8}}>
                <input
                  placeholder={`Reply to ${q.from}…`}
                  value={drafts[q.id] || ''}
                  onChange={e => setDrafts({ ...drafts, [q.id]: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') sendReply(q.id); }}
                  style={{flex: 1, height: 36, padding: "0 12px", border: "1px solid var(--halo-line)", borderRadius: 8, fontSize: 13, outline: "none"}}
                />
                <button className="btn btn-mint" disabled={!(drafts[q.id] || '').trim()}
                  style={!(drafts[q.id] || '').trim() ? {opacity:0.55,cursor:"not-allowed"} : {}}
                  onClick={() => sendReply(q.id)}>
                  <Icon name="send" size={13} />Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

window.CompanyDetail = CompanyDetail;

// ─── Contact team popover ───────────────────────────────────
const ContactTeamButton = ({ co }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const team = [
    { name: co.spoc, role: "Deal SPOC", email: co.spoc.toLowerCase().replace(/\s+/g, ".") + "@stride.vc", phone: "+91 98765 43210" },
    { name: "Krishti Sharma", role: "ESG Lead", email: "krishti.sharma@stride.vc", phone: "+91 98123 44556" },
    { name: "Aditi Rao", role: "Investment Associate", email: "aditi.rao@stride.vc", phone: "+91 99876 12345" },
  ];

  return (
    <span style={{position: "relative", display: "inline-block"}} ref={ref}>
      <button onClick={() => setOpen(!open)}
        style={{background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", color: "white", cursor: "pointer", padding: "4px 10px", fontSize: 12, fontWeight: 600, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6}}>
        <Icon name="mail" size={11} />Contact team
        <Icon name="chev" size={10} />
      </button>
      {open && (
        <div style={{position: "absolute", top: "calc(100% + 8px)", left: 0, width: 320, background: "white", borderRadius: 12, boxShadow: "0 12px 32px rgba(15,33,80,0.18)", zIndex: 20, overflow: "hidden"}}>
          <div style={{padding: "12px 16px", borderBottom: "1px solid var(--halo-line-2)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>
            Deal team — {co.name}
          </div>
          {team.map((m, i) => (
            <div key={i} style={{padding: "12px 16px", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
                <div style={{fontSize: 13, fontWeight: 700, color: "var(--halo-text)"}}>{m.name}</div>
                <div style={{fontSize: 10, color: "var(--halo-text-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600}}>{m.role}</div>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--halo-text-2)", marginTop: 4}}>
                <Icon name="mail" size={11} color="#8B91AB" /><span>{m.email}</span>
              </div>
              <div style={{display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--halo-text-2)", marginTop: 2}}>
                <Icon name="bell" size={11} color="#8B91AB" /><span className="mono">{m.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </span>
  );
};

// ─── Stage badge with timeline dropdown ───────────────────────────────────
const StageBadge = ({ co, filled, scored }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  let idx;
  if (co.status === "completed")           idx = 4;
  else if (scored)                         idx = 3;
  else if (co.status === "in-review" || filled) idx = 2;
  else if (co.progress > 0)                idx = 1;
  else                                     idx = 0;

  const stages = [
    { label: "Sent",          sub: co.sent || "—" },
    { label: "Founder input", sub: co.progress < 100 ? co.progress + "% filled" : "Completed" },
    { label: "Under review",  sub: filled ? "Krishti Sharma" : "Pending" },
    { label: "Scored",        sub: scored ? co.score + " / 100" : "Pending" },
    { label: "Approved",      sub: co.status === "completed" ? co.reviewed : "Pending" },
  ];
  const current = stages[idx];

  return (
    <span style={{position: "relative", display: "inline-block"}} ref={ref}>
      <button onClick={() => setOpen(!open)}
        style={{background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "white", cursor: "pointer", padding: "10px 16px", borderRadius: 12, display: "inline-flex", alignItems: "center", gap: 12}}>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          background: "var(--halo-navy-deep)",
          border: "2px solid var(--halo-mint)",
          display: "grid", placeItems: "center", flexShrink: 0, position: "relative",
        }}>
          <span className="mono" style={{fontSize: 14, fontWeight: 700, color: "var(--halo-mint)"}}>{idx + 1}</span>
          <span style={{position: "absolute", inset: -4, borderRadius: "50%", border: "1px solid rgba(34,194,143,0.25)"}} />
        </div>
        <div style={{textAlign: "left"}}>
          <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8B91AB", fontWeight: 700}}>Current stage · {idx + 1} of {stages.length}</div>
          <div style={{fontSize: 14, fontWeight: 700, marginTop: 1}}>{current.label}</div>
        </div>
        <Icon name="chev" size={12} color="#ADB3CE" />
      </button>
      {open && (
        <div style={{position: "absolute", top: "calc(100% + 8px)", right: 0, width: 320, background: "white", borderRadius: 12, boxShadow: "0 12px 32px rgba(15,33,80,0.18)", zIndex: 20, overflow: "hidden", color: "var(--halo-text)"}}>
          <div style={{padding: "12px 18px", borderBottom: "1px solid var(--halo-line-2)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>
            Process timeline
          </div>
          <div style={{padding: "16px 18px"}}>
            {stages.map((s, i) => {
              const done   = i < idx;
              const active = i === idx;
              return (
                <div key={s.label} style={{display: "flex", gap: 12, paddingBottom: i === stages.length - 1 ? 0 : 16, position: "relative"}}>
                  {i < stages.length - 1 && (
                    <div style={{position: "absolute", left: 11, top: 24, bottom: -4, width: 2, background: done ? "var(--halo-mint)" : "var(--halo-line-2)"}} />
                  )}
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: done ? "var(--halo-mint)" : active ? "white" : "white",
                    border: done ? "none" : active ? "2px solid var(--halo-mint)" : "2px solid var(--halo-line)",
                    display: "grid", placeItems: "center", flexShrink: 0, zIndex: 1,
                  }}>
                    {done ? <Icon name="check" size={12} stroke={2.6} color="white" />
                          : active ? <span style={{width: 8, height: 8, borderRadius: "50%", background: "var(--halo-mint)"}} />
                                   : <span style={{width: 6, height: 6, borderRadius: "50%", background: "var(--halo-text-3)"}} />}
                  </div>
                  <div style={{flex: 1, paddingTop: 2}}>
                    <div style={{fontSize: 13, fontWeight: 700, color: active ? "var(--halo-mint)" : done ? "var(--halo-text)" : "var(--halo-text-3)"}}>
                      {s.label}{active && <span style={{marginLeft: 8, fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#F2FBF7", color: "#1B7C5E", fontWeight: 700, letterSpacing: "0.1em"}}>NOW</span>}
                    </div>
                    <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 2}}>{s.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
};
