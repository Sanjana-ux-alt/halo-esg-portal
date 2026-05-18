// HALO ESG — Final Report

// ── Detailed formula popover ──
// Used for both pillar tiles (E/S/G) and the hero total-score row.
// Click the (i) to open a navy panel that walks ESG through the full chain:
//   response% → q_weight × response% → topic_weight × Σ → Σ topics → pillar/total
// ───────────────────────────────────────────────────────────────────────────

const FormulaTip = ({ kind, color, sec, scores, tier, threshold, anchor = "right" }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const SCORING = window.HALO_ESG.SCORING;
  const TOPICS  = SCORING.TOPICS;
  const ACTIVE  = SCORING.getActiveQuestions();

  // ── Helpers ──
  const topicsForPillar = (p) =>
    Object.entries(TOPICS)
      .filter(([k, t]) => t.pillar === p && (t.w[sec] || 0) > 0)
      .map(([tk, t]) => {
        const qs = ACTIVE.filter(q => q.topic === tk && !q.unscored && (!q.sectors || q.sectors.includes(sec)));
        return { tk, name: t.name, weight: t.w[sec], count: qs.length };
      });

  // ── Content per kind ──
  let title = "How it's scored";
  let formulaLines = [];
  let topicRows = [];
  let footer = null;

  if (kind === 'total') {
    title = "How the total ESG score is calculated";
    formulaLines = [
      "Total = E + S + G",
      "",
      "Each pillar = Σ topic scores",
      "Each topic  = topic_weight × Σ(q_weight × response%)",
      "response%   ∈ {0, 25, 50, 75, 100}  (Excel bracket)",
    ];
    topicRows = [
      { label: "Environment", v: scores.e, m: scores.maxE, c: "#22C28F" },
      { label: "Social",      v: scores.s, m: scores.maxS, c: "#6B6FBF" },
      { label: "Governance",  v: scores.g, m: scores.maxG, c: "#E8A33D" },
    ];
    const verdict = scores.total >= threshold ? 'PASS' : (scores.total >= threshold * 0.6 ? 'REVIEW' : 'FAIL');
    const verdictColor = verdict === 'PASS' ? '#22C28F' : verdict === 'REVIEW' ? '#E8A33D' : '#E25C5C';
    footer = (
      <>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,padding:"8px 0 6px",marginTop:6,borderTop:"2px solid rgba(255,255,255,0.18)"}}>
          <span style={{color:"#ADB3CE",fontWeight:700}}>Total</span>
          <span style={{color:"white",fontWeight:700,fontFamily:"JetBrains Mono,monospace"}}>{scores.total} / 100</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,padding:"6px 0",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          <span style={{color:"#ADB3CE"}}>Tier {tier} · Pass ≥</span>
          <span style={{color:"white",fontWeight:700,fontFamily:"JetBrains Mono,monospace"}}>{threshold} / 100</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,padding:"6px 0",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          <span style={{color:"#ADB3CE"}}>Verdict</span>
          <span style={{padding:"2px 9px",borderRadius:4,background:verdictColor+"33",color:verdictColor,fontWeight:800,letterSpacing:"0.1em"}}>{verdict}</span>
        </div>
      </>
    );
  } else {
    // pillar kind: 'E' | 'S' | 'G'
    const pillarName = kind === 'E' ? 'Environment' : kind === 'S' ? 'Social' : 'Governance';
    title = `How ${pillarName} is scored`;
    formulaLines = [
      "Step 1  response% = Excel bracket lookup",
      "        e.g. % women → 0% / 50% / 75% / 100%",
      "",
      "Step 2  q_score = q_weight × response%",
      "",
      "Step 3  topic_score = topic_weight × Σ q_score",
      "        topic_weight = sector column in Excel",
      "",
      "Step 4  pillar_score = Σ topic_score",
    ];
    topicRows = topicsForPillar(kind);
    const maxTotal = topicRows.reduce((s, r) => s + r.weight, 0);
    const qTotal   = topicRows.reduce((s, r) => s + r.count, 0);
    footer = (
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,padding:"8px 0 0",marginTop:6,borderTop:"2px solid rgba(255,255,255,0.18)"}}>
        <span style={{color,fontWeight:700}}>Max {pillarName}</span>
        <span style={{color:"white",fontWeight:700,fontFamily:"JetBrains Mono,monospace"}}>{maxTotal}pts · {qTotal}Q</span>
      </div>
    );
  }

  const anchorStyle = anchor === "right" ? {right: 0} : {left: 0};

  return (
    <span ref={ref} style={{position:"relative",display:"inline-block",marginLeft: kind === 'total' ? 6 : "auto"}}>
      <button type="button" onClick={e => { e.stopPropagation(); setOpen(!open); }}
        title="How is this score computed?"
        style={{
          width: kind === 'total' ? 18 : 20,
          height: kind === 'total' ? 18 : 20,
          borderRadius:"50%",
          background: open ? (color || "var(--halo-navy)") : "#E6E7F4",
          color: open ? "white" : "#45489B",
          fontSize: kind === 'total' ? 10 : 11,
          fontWeight:800, fontFamily:"Figtree,sans-serif",
          display:"inline-grid", placeItems:"center",
          border:"none", cursor:"pointer", verticalAlign: "middle",
        }}>
        i
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 8px)", ...anchorStyle,
          width: 360, background:"var(--halo-navy)", color:"white",
          borderRadius:12, padding:"16px 18px",
          boxShadow:"0 16px 40px rgba(15,33,80,0.35)", zIndex:40, textAlign:"left",
        }}>
          {/* Header */}
          <div style={{fontSize:9.5,letterSpacing:"0.16em",textTransform:"uppercase",color: color || "var(--halo-mint)",fontWeight:800,marginBottom:8}}>
            {title}
          </div>

          {/* Formula chain */}
          <div style={{
            fontFamily:"JetBrains Mono,monospace", fontSize:10.5, color:"#C5C9DD",
            marginBottom:14, lineHeight:1.7, background:"rgba(255,255,255,0.06)",
            borderRadius:7, padding:"10px 12px", whiteSpace:"pre-wrap",
          }}>
            {formulaLines.join("\n")}
          </div>

          {/* Topic / pillar table */}
          <div style={{fontSize:9.5,letterSpacing:"0.14em",textTransform:"uppercase",color:"#8B91AB",fontWeight:700,marginBottom:6}}>
            {kind === 'total' ? "Pillar breakdown" : `Topics in ${kind === 'E' ? 'Environment' : kind === 'S' ? 'Social' : 'Governance'} (this sector)`}
          </div>
          {kind === 'total' ? (
            topicRows.map((r, i) => {
              const pct = r.m > 0 ? Math.round(r.v / r.m * 100) : 0;
              return (
                <div key={i} style={{padding:"7px 0",borderTop: i ? "1px solid rgba(255,255,255,0.07)" : "none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11.5}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:6,color:"#C5C9DD"}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background:r.c}} />
                      {r.label}
                    </span>
                    <span style={{color:"white",fontWeight:700,fontFamily:"JetBrains Mono,monospace"}}>
                      {r.v} / {r.m} <span style={{color:"#8B91AB",fontWeight:500}}> · {pct}%</span>
                    </span>
                  </div>
                  <div style={{height:3,background:"rgba(255,255,255,0.08)",borderRadius:99,overflow:"hidden",marginTop:5}}>
                    <div style={{height:"100%",width: pct + "%", background: r.c, borderRadius:99}} />
                  </div>
                </div>
              );
            })
          ) : (
            topicRows.map((r, i) => (
              <div key={r.tk} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11.5,padding:"6px 0",borderTop: i ? "1px solid rgba(255,255,255,0.07)" : "none"}}>
                <span style={{color:"#C5C9DD",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{r.name}</span>
                <span style={{color:"#8B91AB",fontSize:10.5,fontFamily:"JetBrains Mono,monospace",marginRight:8}}>{r.count}Q</span>
                <span style={{color:"white",fontWeight:700,fontFamily:"JetBrains Mono,monospace",minWidth:42,textAlign:"right"}}>{r.weight}pts</span>
              </div>
            ))
          )}

          {footer}
        </div>
      )}
    </span>
  );
};

// Back-compat: the pillar tiles below still mount this name.
const PillarTip = ({ pillar, color, sec }) => {
  const kind = pillar === 'Environment' ? 'E' : pillar === 'Social' ? 'S' : 'G';
  return <FormulaTip kind={kind} color={color} sec={sec} />;
};

const Report = ({ companyId, embedded }) => {
  const role = window.HALO_ROLE || 'esg';
  const co = window.HALO_ESG.COMPANIES.find(c => c.id === (companyId || "wer")) || window.HALO_ESG.COMPANIES[0];

  // Live scores from the scoring engine
  const SCORING = window.HALO_ESG.SCORING;
  const sec = SCORING.sectorKey(co.sector);
  const computed = SCORING.computeScores(co.id);
  const r1 = x => Math.round((x || 0) * 10) / 10;
  const scores = computed
    ? { e: r1(computed.eP.s), s: r1(computed.sP.s), g: r1(computed.gP.s), total: r1(computed.total),
        maxE: r1(computed.eP.m), maxS: r1(computed.sP.m), maxG: r1(computed.gP.m) }
    : { e: 26.2, s: 28.1, g: 24.1, total: 78.4, maxE: 25, maxS: 39, maxG: 36 };
  const tier = computed?.tier || 'L2';
  const threshold = computed?.threshold || SCORING.PASS_THRESHOLDS[tier] || 30;

  // Topic lists per pillar (for formula tooltips)
  const eTopics = Object.entries(SCORING.TOPICS).filter(([k, t]) => t.pillar === 'E' && (t.w[sec] || 0) > 0);
  const sTopics = Object.entries(SCORING.TOPICS).filter(([k, t]) => t.pillar === 'S' && (t.w[sec] || 0) > 0);
  const gTopics = Object.entries(SCORING.TOPICS).filter(([k, t]) => t.pillar === 'G' && (t.w[sec] || 0) > 0);

  const ePct = scores.maxE > 0 ? Math.round((scores.e / scores.maxE) * 100) : 0;
  const sPct = scores.maxS > 0 ? Math.round((scores.s / scores.maxS) * 100) : 0;
  const gPct = scores.maxG > 0 ? Math.round((scores.g / scores.maxG) * 100) : 0;
  const pillars = [
    { name: "Environmental", pct: ePct },
    { name: "Social", pct: sPct },
    { name: "Governance", pct: gPct },
  ];
  const strongest = pillars.reduce((a, b) => a.pct >= b.pct ? a : b);
  const weakest = pillars.reduce((a, b) => a.pct <= b.pct ? a : b);

  const assessmentSummary = `${co.name} scores ${scores.total}/100 overall, comfortably passing the Stride Ventures ESG threshold. ${strongest.name} is the strongest pillar at ${strongest.pct}% of its maximum, driven by above-sector diversity metrics and POSH compliance. ${weakest.name} is the primary improvement area at ${weakest.pct}%—focus on closing Scope 3 disclosure and supplier audit gaps to lift the score above 85.`;

  // Priority improvements
  const improvements = [
    { text: "Disclose Scope 3 emissions by next quarter", pillarPct: ePct },
    { text: "Tighten gender pay gap (currently 4.8%, widening)", pillarPct: sPct },
    { text: "Expand supplier ESG audits beyond top-tier vendors", pillarPct: ePct },
    { text: "Publish board-level diversity tracking publicly", pillarPct: gPct },
  ];
  const improvementsToShow = improvements;
  const belowCount = improvementsToShow.length;

  return (
    <div className="fade-in">
      {!embedded && <HeaderBand
        title={`ESG Report — ${co.name}`}
        badge="APPROVED"
        subtitle={`Report ID ESG-2026-0428-${co.id.toUpperCase()} · Generated May 2, 2026 · Approved by Krishti Sharma`}
      />}
      {embedded && (
        <div style={{padding: "16px 36px 0", display: "flex", alignItems: "center", gap: 12}}>
          <div style={{fontSize: 13, color: "var(--halo-text-2)"}}>
            Report <span className="mono" style={{color: "var(--halo-text)", fontWeight: 600}}>ESG-2026-0428-{co.id.toUpperCase()}</span> · Approved May 2, 2026
          </div>
          <span className="chip-status mint" style={{fontSize: 10, marginLeft: 4}}>APPROVED</span>
          <div style={{marginLeft: "auto"}}>
            <button className="btn btn-outline btn-sm"><Icon name="download" size={12} />Download PDF</button>
          </div>
        </div>
      )}

      <div className="content" style={{maxWidth: 1100}}>
        {/* Hero — compact (always visible) */}
        <div className="card" style={{padding: "20px 24px", borderTop: "3px solid var(--halo-mint)", marginBottom: 18}}>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24}}>
            <div style={{display: "flex", alignItems: "center", gap: 14}}>
              <div>
                <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, display: "flex", alignItems: "center"}}>
                  Score
                  <FormulaTip kind="total" sec={sec} scores={scores} tier={tier} threshold={threshold} anchor="left" />
                </div>
                <div className="mono" style={{fontSize: 30, fontWeight: 700, color: "#1B7C5E", letterSpacing: "-0.02em", lineHeight: 1.1}}>{scores.total} <span style={{fontSize: 14, color: "var(--halo-text-3)", fontWeight: 500}}>/100</span></div>
              </div>
            </div>
            <div style={{display: "flex", gap: 28, alignItems: "center"}}>
              <div>
                <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>Status</div>
                <div style={{display: "inline-flex", alignItems: "center", gap: 6, marginTop: 4, padding: "4px 12px", borderRadius: 999, background: "#DCF5EB", color: "#1B7C5E", fontSize: 13, fontWeight: 700}}>
                  <Icon name="check" size={13} stroke={2.5} />Passed
                </div>
              </div>
              <div>
                <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>Submitted</div>
                <div style={{fontSize: 14, fontWeight: 700}}>Apr 22, 2026</div>
              </div>
              <div>
                <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>Reviewed</div>
                <div style={{fontSize: 14, fontWeight: 700}}>Apr 29, 2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── E/S/G breakdown — deal + risk ── */}
        {(role === 'deal' || role === 'risk') && (
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18}}>
            {[
              { label: "Environmental", icon: "leaf",   v: scores.e, m: scores.maxE, c: "#22C28F" },
              { label: "Social",        icon: "brain",  v: scores.s, m: scores.maxS, c: "#6B6FBF" },
              { label: "Governance",    icon: "shield", v: scores.g, m: scores.maxG, c: "#E8A33D" },
            ].map(p => {
              const pct = p.m > 0 ? Math.round(p.v / p.m * 100) : 0;
              return (
                <div key={p.label} className="card" style={{padding: "18px 20px", borderTop: `3px solid ${p.c}`}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 12}}>
                    <div style={{width: 28, height: 28, borderRadius: 7, background: p.c + "1A", display: "grid", placeItems: "center", flexShrink: 0}}>
                      <Icon name={p.icon} size={14} color={p.c} />
                    </div>
                    <div style={{fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>{p.label}</div>
                  </div>
                  <div>
                    <span className="mono" style={{fontSize: 24, fontWeight: 700, color: "var(--halo-text)"}}>{p.v}</span>
                    <span className="mono" style={{fontSize: 13, color: "var(--halo-text-3)"}}> / {p.m}</span>
                  </div>
                  <div style={{marginTop: 10, height: 5, borderRadius: 99, background: "#ECEEF6", overflow: "hidden"}}>
                    <div style={{height: "100%", width: pct + "%", background: p.c, borderRadius: 99}} />
                  </div>
                  <div style={{marginTop: 5, fontSize: 11, color: "var(--halo-text-3)"}}>{pct}% of maximum</div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── DEAL TEAM: pipeline stage tracker ── */}
        {role === 'deal' && (() => {
          const PIPELINE = [
            { label: "Survey Sent",     done: !!(co.sent && co.sent !== "—"),                          date: co.sent },
            { label: "Form Filling",    done: co.progress > 0,   partial: co.progress > 0 && co.progress < 100, date: co.progress > 0 ? `${co.progress}% complete` : null },
            { label: "Form Submitted",  done: !!(co.submitted && co.submitted !== "—"),                date: co.submitted },
            { label: "Score Generated", done: co.score !== null,                                       date: co.score !== null ? `ESG Score: ${co.score}` : null },
            { label: "ESG Approved",    done: co.status === "completed" && co.reviewed !== "—",        date: co.reviewed !== "—" ? co.reviewed : null },
          ];
          const currentIdx = PIPELINE.reduce((acc, s, i) => s.done ? i : acc, -1);
          return (
            <div className="card card-pad" style={{marginBottom: 40}}>
              <div style={{fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 20}}>
                Assessment Progress
              </div>
              <div style={{display: "flex", alignItems: "flex-start", gap: 0}}>
                {PIPELINE.map((stage, i) => {
                  const isDone    = stage.done && !stage.partial;
                  const isPartial = stage.partial;
                  const isCurrent = i === currentIdx + 1 && !isDone;
                  const circleColor = isDone ? "var(--halo-mint)" : isPartial ? "#E8A33D" : isCurrent ? "#6B6FBF" : "#ECEEF6";
                  const textColor   = isDone ? "#1B7C5E" : isPartial ? "#8E5F18" : isCurrent ? "#45489B" : "var(--halo-text-3)";
                  const lineColor   = isDone ? "var(--halo-mint)" : "#ECEEF6";
                  return (
                    <div key={i} style={{flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative"}}>
                      {i < PIPELINE.length - 1 && (
                        <div style={{position: "absolute", top: 16, left: "50%", width: "100%", height: 2, background: lineColor, zIndex: 0}} />
                      )}
                      <div style={{width: 32, height: 32, borderRadius: "50%", background: circleColor, border: "2px solid " + (isDone ? "var(--halo-mint)" : isPartial ? "#E8A33D" : isCurrent ? "#6B6FBF" : "#DDDFE8"), display: "grid", placeItems: "center", zIndex: 1, boxShadow: isDone ? "0 0 0 4px rgba(34,194,143,0.15)" : isCurrent ? "0 0 0 4px rgba(107,111,191,0.15)" : "none"}}>
                        {isDone
                          ? <Icon name="check" size={14} color="white" stroke={2.5} />
                          : isPartial
                          ? <Icon name="clock" size={13} color="white" stroke={2} />
                          : <span style={{fontSize: 11, fontWeight: 700, color: isCurrent ? "#45489B" : "#A0A4B8"}}>{i + 1}</span>
                        }
                      </div>
                      <div style={{marginTop: 10, textAlign: "center", paddingLeft: 4, paddingRight: 4}}>
                        <div style={{fontSize: 11.5, fontWeight: isDone || isCurrent ? 700 : 500, color: textColor, lineHeight: 1.3}}>{stage.label}</div>
                        {stage.date && stage.date !== "—" && (
                          <div style={{fontSize: 10, color: "var(--halo-text-3)", marginTop: 3}}>{stage.date}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ── RISK TEAM: access notice only ── */}
        {role === 'risk' && (
          <div className="card card-pad" style={{marginTop: 18, marginBottom: 40, borderLeft: "3px solid var(--halo-amber)", background: "#FFFBF2"}}>
            <div style={{display: "flex", alignItems: "center", gap: 12}}>
              <div style={{width: 36, height: 36, borderRadius: "50%", background: "#FBF1DE", display: "grid", placeItems: "center", flexShrink: 0}}>
                <Icon name="shield" size={16} color="#E8A33D" />
              </div>
              <div>
                <div style={{fontSize: 13, fontWeight: 700, color: "#8E5F18"}}>Score summary — Risk Team view</div>
                <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 3, lineHeight: 1.5}}>
                  Pillar breakdown, improvements, benchmarking and recommendations are visible to ESG and Deal teams only. Contact the ESG team for the full assessment.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ESG TEAM: full report ── */}
        {role === 'esg' && (<>
          {/* Pillar tiles */}
          <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, margin: "22px 0"}}>
            {[
              { p: "Environment", icon: "leaf",   v: scores.e, m: scores.maxE, c: "#22C28F", topics: eTopics, note: "Strong renewable mix; Scope 3 disclosure pending" },
              { p: "Social",      icon: "brain",  v: scores.s, m: scores.maxS, c: "#6B6FBF", topics: sTopics, note: "Above-sector diversity; POSH compliant" },
              { p: "Governance",  icon: "shield", v: scores.g, m: scores.maxG, c: "#E8A33D", topics: gTopics, note: "Independent directors present; whistleblower active" },
            ].map(p => (
              <div key={p.p} className="card" style={{padding: "22px 24px", borderTop: `3px solid ${p.c}`}}>
                {/* Icon + label + formula tip */}
                <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 16}}>
                  <div style={{width: 32, height: 32, borderRadius: 8, background: p.c + "1A", display: "grid", placeItems: "center", flexShrink: 0}}>
                    <Icon name={p.icon} size={15} color={p.c} />
                  </div>
                  <div style={{fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, flex: 1}}>
                    {p.p}
                  </div>
                  <PillarTip pillar={p.p} color={p.c} topics={p.topics} sec={sec} />
                </div>
                {/* Ring + score */}
                <div style={{display: "flex", alignItems: "center", gap: 16}}>
                  <Ring value={p.v} max={p.m} color={p.c} size={72} stroke={9} track="#EEF0F6" />
                  <div>
                    <div>
                      <span className="mono" style={{fontSize: 28, fontWeight: 700, color: "var(--halo-text)"}}>{p.v}</span>
                      <span className="mono" style={{fontSize: 13, color: "var(--halo-text-3)"}}> / {p.m}</span>
                    </div>
                    <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 6, lineHeight: 1.45}}>{p.note}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Assessment Summary & Priority Improvements */}
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
            <div className="card card-pad" style={{borderLeft: "3px solid var(--halo-mint)"}}>
              <div style={{fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 10}}>Assessment Summary</div>
              <p style={{margin: 0, fontSize: 13, color: "var(--halo-text-2)", lineHeight: 1.7}}>{assessmentSummary}</p>
            </div>
            <div className="card card-pad" style={{borderLeft: "3px solid var(--halo-amber)"}}>
              <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 12}}>
                <h3 style={{margin: 0, fontSize: 15}}>Priority improvements</h3>
                <span style={{fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 999, background: "#FBF1DE", color: "#A66E10"}}>
                  {belowCount} areas below threshold
                </span>
              </div>
              {improvementsToShow.map((item, i) => (
                <div key={i} style={{display: "flex", gap: 10, padding: "8px 0", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}>
                  <Icon name="flag" size={14} color="#E8A33D" />
                  <span style={{fontSize: 13, color: "var(--halo-text-2)"}}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Peer benchmarking */}
          <div className="card" style={{marginTop: 22}}>
            <div className="card-h">
              <div>
                <h3>Peer benchmarking</h3>
                <div className="sub">Fintech / Lending sector · 6 comparable companies</div>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th style={{paddingLeft: 24}}>Company</th><th>Stage</th>
                  <th>E</th><th>S</th><th>G</th><th>Total</th><th>Δ vs avg</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: "WeRize WFin",      this: true,  s: "Active",        e: 26.2, so: 28.1, g: 24.1, t: 78.4, d: "+7.2" },
                  { n: "Razorpay Capital", this: false, s: "Active",        e: 22.1, so: 26.8, g: 24.6, t: 73.5, d: "+2.3" },
                  { n: "Alpha Capital",    this: false, s: "Documentation", e: 23.4, so: 25.8, g: 22.0, t: 71.2, d: "0.0" },
                  { n: "PayU Lend",        this: false, s: "Active",        e: 21.8, so: 24.2, g: 23.8, t: 69.8, d: "−1.4" },
                  { n: "KreditBee",        this: false, s: "Renewal",       e: 19.6, so: 23.1, g: 22.4, t: 65.1, d: "−6.1" },
                  { n: "Lendingkart",      this: false, s: "Exited",        e: 24.0, so: 25.4, g: 23.0, t: 72.4, d: "+1.2" },
                ].map((r,i) => (
                  <tr key={i} style={r.this ? {background: "#F2FBF7"} : {}}>
                    <td style={{paddingLeft: 24, fontWeight: r.this ? 700 : 500}}>{r.n}{r.this && <span style={{marginLeft: 8, fontSize: 10, color: "#1B7C5E", fontWeight: 700}}>● THIS COMPANY</span>}</td>
                    <td className="muted">{r.s}</td>
                    <td className="mono">{r.e}</td><td className="mono">{r.so}</td>
                    <td className="mono">{r.g}</td><td className="mono" style={{fontWeight: 700}}>{r.t}</td>
                    <td className="mono" style={{color: r.d.startsWith("+") ? "#1B7C5E" : r.d.startsWith("−") ? "#9F2D2D" : "var(--halo-text-3)", fontWeight: 600}}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="card" style={{marginTop: 22}}>
            <div className="card-h">
              <div>
                <h3>Strategic recommendations</h3>
                <div className="sub">Three actions to lift score above 85 within 12 months</div>
              </div>
            </div>
            <div style={{padding: "0 24px 22px"}}>
              {[
                { p: "High",   c: "#E25C5C", bg: "#FBE3E3", t: "Publish Scope 3 emissions inventory",    b: "Engage a third-party verifier (CDP, Greenly) to baseline Scope 3 across borrowers and operations.", impact: "+3.2 pts", time: "Q3 FY26" },
                { p: "Medium", c: "#E8A33D", bg: "#FBF1DE", t: "Close gender pay gap to under 2%",        b: "Roll out structured pay bands and run a remediation review at the next merit cycle.",                impact: "+2.4 pts", time: "Q4 FY26" },
                { p: "Medium", c: "#6B6FBF", bg: "#E6E7F4", t: "Expand supplier ESG audit coverage",      b: "Onboard top 50 suppliers (currently 18) to a self-assessment + spot-check program.",                 impact: "+1.8 pts", time: "FY27 H1" },
              ].map((r,i) => (
                <div key={i} style={{display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "flex-start", padding: "14px 0", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}>
                  <span style={{padding: "3px 9px", borderRadius: 999, background: r.bg, color: r.c, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em"}}>{r.p}</span>
                  <div>
                    <div style={{fontSize: 14, fontWeight: 700, marginBottom: 4}}>{r.t}</div>
                    <div style={{fontSize: 13, color: "var(--halo-text-2)", lineHeight: 1.5}}>{r.b}</div>
                  </div>
                  <div style={{textAlign: "right"}}>
                    <div className="mono" style={{fontSize: 16, fontWeight: 700, color: "#1B7C5E"}}>{r.impact}</div>
                    <div style={{fontSize: 11, color: "var(--halo-text-3)"}}>{r.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-off */}
          <div className="card card-pad" style={{marginTop: 22, marginBottom: 40}}>
            <h3 style={{margin: "0 0 16px", fontSize: 15}}>Approval & sign-off</h3>
            <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18}}>
              {[
                { r: "Reviewed by",  n: "Krishti Sharma", role: "Head of ESG",      d: "Apr 29, 2026", s: "completed"   },
                { r: "Approved by",  n: "Akshat Gautam",  role: "Deal Partner",     d: "May 2, 2026",  s: "completed"   },
                { r: "Acknowledged", n: "Vikram Jain",    role: "Founder, WeRize",  d: "Pending",      s: "in-progress" },
              ].map((p,i) => (
                <div key={i} style={{padding: 16, border: "1px solid var(--halo-line)", borderRadius: 10}}>
                  <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 8}}>{p.r}</div>
                  <div style={{fontSize: 14, fontWeight: 700}}>{p.n}</div>
                  <div style={{fontSize: 12, color: "var(--halo-text-3)", marginBottom: 10}}>{p.role}</div>
                  <StatusPill status={p.s} />
                  <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 8}}>{p.d}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop: 18, padding: "12px 16px", background: "#FAFBFD", borderRadius: 8, fontSize: 11, color: "var(--halo-text-3)", lineHeight: 1.5}}>
              Confidential — for use by Stride Ventures investment committee and the named borrower only. Report version 1.0 · Page 1 of 1.
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
};

window.Report = Report;
