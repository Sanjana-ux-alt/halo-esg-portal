// HALO ESG — Founder-facing response form
// Real Excel KPI questions, no scores shown to the founder.
// Answers persist via window.HALO_ESG.STATE — review/response tabs read from there.
// Right rail = "Ask the ESG team" thread; messages surface in the Q&A tab.

const FounderView = ({ companyId }) => {
  const co = window.HALO_ESG.COMPANIES.find(c => c.id === companyId) || window.HALO_ESG.COMPANIES[0];
  const SCORING = window.HALO_ESG.SCORING;
  const sec = SCORING.sectorKey(co.sector);

  // Visible questions for this company's sector
  const allQs = React.useMemo(
    () => SCORING.QUESTIONS.filter(q => !q.sectors || q.sectors.includes(sec)),
    [co.id]
  );
  // Group by section in original order
  const grouped = React.useMemo(() => {
    const order = [];
    const map = {};
    allQs.forEach(q => {
      if (!map[q.section]) { map[q.section] = []; order.push(q.section); }
      map[q.section].push(q);
    });
    return order.map(s => ({ section: s, items: map[s] }));
  }, [allQs]);

  // Reactive view of answers
  const [tick, setTick] = React.useState(0);
  const ans = window.HALO_ESG.STATE.answers[co.id] || {};
  const answeredCount = allQs.filter(q => {
    const v = ans[q.id];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== '' && v !== null;
  }).length;
  const pct = Math.round(answeredCount / Math.max(1, allQs.length) * 100);

  const setAns = (qid, val) => { window.HALO_ESG.setAnswer(co.id, qid, val); setTick(t => t + 1); };

  // ── Ask ESG Team sidebar state ──
  const [draftQ, setDraftQ] = React.useState('');
  const thread = window.HALO_ESG.STATE.qaQuestions[co.id] || [];
  const submitQ = () => {
    if (!draftQ.trim()) return;
    window.HALO_ESG.askQuestion(co.id, { from: co.spoc, q: draftQ.trim() });
    setDraftQ('');
    setTick(t => t + 1);
  };

  return (
    <div style={{background: "#F4F6FA", minHeight: "100vh"}}>
      {/* Top bar */}
      <div style={{
        background: "var(--halo-navy-deep)", color: "white",
        padding: "12px 36px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, fontSize: 12,
      }}>
        <div style={{display: "flex", alignItems: "center", gap: 10, minWidth: 0}}>
          <Icon name="shield" size={13} color="#8B91AB" />
          <span style={{color: "#ADB3CE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
            Secure response form · auto-saved as you go
          </span>
        </div>
        <button onClick={() => window.HALO_NAV("company", co.id)}
          style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
            color: "white", cursor: "pointer", padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 6,
            display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          }}>
          <Icon name="arrowback" size={12} />Back to {co.name}
        </button>
      </div>

      <div style={{maxWidth: 1240, margin: "0 auto", padding: "28px 32px 80px"}}>
        {/* Header card */}
        <div style={{background: "white", borderRadius: 14, padding: "26px 30px", boxShadow: "var(--halo-shadow)", marginBottom: 18}}>
          <div style={{display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16}}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: "var(--halo-navy)", color: "white",
              display: "grid", placeItems: "center",
              fontWeight: 800, fontSize: 16, flexShrink: 0,
            }}>S</div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 4}}>
                From Stride Ventures · ESG team
              </div>
              <div style={{fontSize: 22, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em"}}>
                ESG Response Form for {co.name}
              </div>
              <div style={{fontSize: 13, color: "var(--halo-text-2)", marginTop: 6, lineHeight: 1.55}}>
                Hi {co.spoc.split(" ")[0]}, please answer the questions below to the best of your knowledge. Your progress saves automatically — close the tab any time and return via the same link.
              </div>
            </div>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18,
            marginTop: 8, paddingTop: 16, borderTop: "1px solid var(--halo-line-2)",
          }}>
            <FounderMeta label="Sent"     v={co.sent} />
            <FounderMeta label="Deadline" v="May 22, 2026" />
            <FounderMeta label="Sections" v={`${grouped.length} sections`} sub={`${allQs.length} questions`} />
            <FounderMeta label="Status"   v={pct === 100 ? 'Complete' : 'In progress'} accent={pct === 100 ? '#1B7C5E' : '#8E5F18'} />
          </div>
        </div>

        {/* Progress */}
        <div style={{background: "white", borderRadius: 14, padding: "16px 22px", boxShadow: "var(--halo-shadow)", marginBottom: 18}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8}}>
            <div style={{fontSize: 13, fontWeight: 600}}>Your progress</div>
            <div className="mono" style={{fontSize: 14, fontWeight: 700, color: "var(--halo-mint)"}}>{answeredCount} / {allQs.length} · {pct}%</div>
          </div>
          <div style={{height: 8, borderRadius: 999, background: "#ECEEF6", overflow: "hidden"}}>
            <div style={{height: "100%", width: pct + "%", background: "var(--halo-mint)", transition: "width 400ms"}} />
          </div>
        </div>

        {/* 2-column layout: form left, Ask ESG team sticky right */}
        <div style={{display: "grid", gridTemplateColumns: "1fr 340px", gap: 22, alignItems: "start"}}>
          <div>
            {grouped.map((g, gi) => (
              <div key={g.section} style={{background: "white", borderRadius: 14, boxShadow: "var(--halo-shadow)", marginBottom: 18, overflow: "hidden"}}>
                <div style={{padding: "18px 24px", borderBottom: "1px solid var(--halo-line-2)", display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                  <div>
                    <div style={{fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>Section {gi + 1}</div>
                    <div style={{fontSize: 16, fontWeight: 700, marginTop: 2}}>{g.section}</div>
                  </div>
                  <FounderSectionStatus items={g.items} ans={ans} />
                </div>
                <div>
                  {g.items.map((q, i) => (
                    <FounderQuestion key={q.id} q={q} value={ans[q.id]} onChange={(v) => setAns(q.id, v)} index={i} />
                  ))}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div style={{background: "white", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--halo-shadow)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16}}>
              <div>
                <div style={{fontSize: 14, fontWeight: 700}}>{pct === 100 ? "Ready to submit" : "Save and continue later"}</div>
                <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 2}}>
                  Your progress is auto-saved. {pct < 100 ? `${allQs.length - answeredCount} questions remaining.` : 'All questions answered.'}
                </div>
              </div>
              <button className="btn btn-mint" disabled={pct < 100} style={pct < 100 ? {opacity:0.55,cursor:"not-allowed"} : {}}>
                <Icon name="check" size={13} />Submit for review
              </button>
            </div>
          </div>

          {/* Ask the ESG team — sticky right rail */}
          <div style={{position: "sticky", top: 22, display: "flex", flexDirection: "column", gap: 14}}>
            <div className="card card-pad">
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                <div style={{width: 32, height: 32, borderRadius: 8, background: "#E6E7F4", color: "#45489B", display: "grid", placeItems: "center"}}>
                  <Icon name="help" size={15} />
                </div>
                <div>
                  <div style={{fontSize: 14, fontWeight: 700}}>Ask the ESG team</div>
                  <div style={{fontSize: 11, color: "var(--halo-text-3)"}}>Stuck on a question? They'll reply here.</div>
                </div>
              </div>
              <textarea
                value={draftQ}
                onChange={e => setDraftQ(e.target.value)}
                placeholder="e.g. For Scope 1+2, do we include our leased Mumbai office?"
                style={{
                  width: "100%", minHeight: 86, marginTop: 8,
                  border: "1px solid var(--halo-line)", borderRadius: 9,
                  padding: "10px 12px", fontSize: 13, fontFamily: "inherit",
                  resize: "vertical", outline: "none", boxSizing: "border-box",
                }}
              />
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 8}}>
                <div style={{fontSize: 11, color: "var(--halo-text-3)"}}>Sent to Krishti Sharma</div>
                <button className="btn btn-mint btn-sm" disabled={!draftQ.trim()} style={!draftQ.trim() ? {opacity:0.55,cursor:"not-allowed"} : {}} onClick={submitQ}>
                  <Icon name="send" size={12} />Send question
                </button>
              </div>
            </div>

            {/* Thread */}
            <div className="card card-pad">
              <div style={{fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 12}}>
                Your conversation ({thread.length})
              </div>
              {thread.length === 0 && (
                <div style={{fontSize: 12.5, color: "var(--halo-text-3)", fontStyle: "italic", padding: "4px 0 4px"}}>
                  No questions yet. Ask anything above and the ESG team will reply.
                </div>
              )}
              {thread.map((t, i) => (
                <div key={t.id} style={{padding: "12px 0", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4}}>
                    <span style={{fontSize: 12, fontWeight: 700}}>You</span>
                    <span style={{fontSize: 11, color: "var(--halo-text-3)"}}>{t.time}</span>
                  </div>
                  <div style={{fontSize: 13, color: "var(--halo-text)", lineHeight: 1.5}}>{t.q}</div>
                  {t.status === 'answered' ? (
                    <div style={{marginTop: 8, padding: "10px 12px", background: "#F2FBF7", borderRadius: 8, fontSize: 12.5, color: "var(--halo-text-2)", lineHeight: 1.5}}>
                      <strong style={{color: "var(--halo-mint)"}}>{t.repliedBy || 'ESG team'} replied:</strong> {t.a}
                    </div>
                  ) : (
                    <div style={{marginTop: 6, fontSize: 11, color: "#8E5F18", fontWeight: 600, letterSpacing: "0.04em"}}>
                      <Icon name="clock" size={11} /> Waiting for ESG team reply
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FounderMeta = ({ label, v, sub, accent }) => (
  <div>
    <div style={{fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>{label}</div>
    <div style={{fontSize: 14, fontWeight: 700, marginTop: 4, color: accent || "var(--halo-text)"}}>{v}</div>
    {sub && <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 2}}>{sub}</div>}
  </div>
);

const FounderSectionStatus = ({ items, ans }) => {
  const done = items.filter(q => {
    const v = ans[q.id];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== '' && v !== null;
  }).length;
  const total = items.length;
  if (done === total) return <span className="pill completed"><span className="dot" />Complete</span>;
  if (done === 0)     return <span className="pill not-started"><span className="dot" />Not started</span>;
  return <span className="pill in-progress"><span className="dot" />{done} / {total}</span>;
};

// ── Question renderer ──
const FounderQuestion = ({ q, value, onChange, index }) => {
  return (
    <div style={{padding: "16px 24px", borderTop: index ? "1px solid var(--halo-line-2)" : "none"}}>
      <div style={{display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10}}>
        <div style={{fontSize: 13.5, fontWeight: 600, color: "var(--halo-text)", lineHeight: 1.45}}>
          <span style={{color: "var(--halo-text-3)", fontWeight: 600, marginRight: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 12}}>Q{index + 1}</span>
          {q.q}{q.required && <span style={{color: "var(--halo-amber)", marginLeft: 4}}>*</span>}
        </div>
        <div style={{fontSize: 11, color: "var(--halo-text-3)", whiteSpace: "nowrap", flexShrink: 0}}>{q.type}</div>
      </div>
      <FounderInput q={q} value={value} onChange={onChange} />
    </div>
  );
};

const FounderInput = ({ q, value, onChange }) => {
  if (q.type === 'Yes / No') {
    return (
      <div style={{display: "flex", gap: 10}}>
        {['Yes','No'].map(v => {
          const active = value === v;
          return (
            <button key={v} onClick={() => onChange(v)}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                border: active ? "1.5px solid var(--halo-mint)" : "1px solid var(--halo-line)",
                background: active ? "#F2FBF7" : "white",
                color: active ? "#1B7C5E" : "var(--halo-text-2)",
                cursor: "pointer", transition: "all 120ms",
              }}>
              {v}
            </button>
          );
        })}
      </div>
    );
  }

  if (q.type === 'Number') {
    return (
      <div style={{display: "flex", alignItems: "center", gap: 10, maxWidth: 320, border: "1px solid var(--halo-line)", borderRadius: 9, background: "white", padding: "0 14px"}}>
        <input
          type="number" step="any"
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          style={{flex: 1, border: "none", outline: "none", padding: "11px 0", fontFamily: "JetBrains Mono, monospace", fontSize: 14, background: "transparent"}}
        />
        {q.unit && <span style={{fontSize: 12, color: "var(--halo-text-3)"}}>{q.unit}</span>}
      </div>
    );
  }

  if (q.type === 'Slider') {
    const v = Number(value);
    const display = isFinite(v) ? v : 0;
    return (
      <div>
        <div style={{display: "flex", alignItems: "center", gap: 14}}>
          <input
            type="range" min={0} max={100} step={1}
            value={display}
            onChange={e => onChange(e.target.value)}
            style={{flex: 1, accentColor: "var(--halo-mint)"}}
          />
          <span className="mono" style={{fontSize: 14, fontWeight: 700, color: "var(--halo-text)", minWidth: 56, textAlign: "right"}}>{display}{q.unit || '%'}</span>
        </div>
      </div>
    );
  }

  if (q.type === 'Single-select') {
    const opts = (q.opts || []).map(o => typeof o === 'string' ? {l: o} : o);
    return (
      <div style={{display: "flex", flexDirection: "column", gap: 8}}>
        {opts.map(o => {
          const active = value === o.l;
          return (
            <button key={o.l} onClick={() => onChange(o.l)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 14px", borderRadius: 9, fontSize: 13.5,
                border: active ? "1.5px solid var(--halo-mint)" : "1px solid var(--halo-line)",
                background: active ? "#F2FBF7" : "white",
                cursor: "pointer", transition: "all 120ms", textAlign: "left",
                color: active ? "var(--halo-text)" : "var(--halo-text-2)",
                fontWeight: active ? 600 : 500,
              }}>
              <span style={{
                width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                border: active ? "5px solid var(--halo-mint)" : "1.5px solid var(--halo-line)",
                background: "white",
              }} />
              <span>{o.l}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (q.type === 'Multi-select') {
    const opts = (q.opts || []).map(o => typeof o === 'string' ? {l: o} : o);
    const selected = Array.isArray(value) ? value : [];
    const toggle = (l) => {
      if (selected.includes(l)) onChange(selected.filter(x => x !== l));
      else onChange([...selected, l]);
    };
    return (
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8}}>
        {opts.map(o => {
          const active = selected.includes(o.l);
          return (
            <button key={o.l} onClick={() => toggle(o.l)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 14px", borderRadius: 9, fontSize: 13.5,
                border: active ? "1.5px solid var(--halo-mint)" : "1px solid var(--halo-line)",
                background: active ? "#F2FBF7" : "white",
                cursor: "pointer", transition: "all 120ms", textAlign: "left",
                color: active ? "var(--halo-text)" : "var(--halo-text-2)",
                fontWeight: active ? 600 : 500,
              }}>
              <span style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: active ? "none" : "1.5px solid var(--halo-line)",
                background: active ? "var(--halo-mint)" : "white",
                display: "grid", placeItems: "center", color: "white",
              }}>
                {active && <Icon name="check" size={11} stroke={3} />}
              </span>
              <span style={{flex: 1}}>{o.l}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Fallback
  return (
    <input
      type="text" value={value ?? ''} onChange={e => onChange(e.target.value)}
      style={{width: "100%", height: 38, padding: "0 12px", border: "1px solid var(--halo-line)", borderRadius: 9, fontSize: 13, outline: "none"}}
    />
  );
};

window.FounderView = FounderView;
