// HALO ESG — Review screen (ESG team scoring)
// Each score row shows an "i" tooltip with the Excel scoring formula + the
// computed breakdown (topic_weight × question_weight × response% = points).

const InfoTip = ({ tip }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <span ref={ref} style={{position: "relative", display: "inline-block", marginLeft: 8}}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        title="How is this score computed?"
        style={{
          width: 20, height: 20, borderRadius: "50%",
          background: open ? "var(--halo-navy)" : "#E6E7F4",
          color: open ? "white" : "#45489B",
          fontSize: 11, fontWeight: 800, fontFamily: "Figtree, sans-serif",
          display: "inline-grid", placeItems: "center",
          border: "none", cursor: "pointer",
        }}>i</button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          width: 320, background: "var(--halo-navy)", color: "white",
          borderRadius: 10, padding: "12px 14px",
          fontSize: 12.5, lineHeight: 1.55,
          boxShadow: "0 12px 32px rgba(15,33,80,0.30)", zIndex: 30,
          textAlign: "left", whiteSpace: "pre-wrap",
        }}>
          <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-mint)", fontWeight: 800, marginBottom: 6}}>
            Scoring rule
          </div>
          {tip.rule}
          <div style={{
            marginTop: 10, padding: "8px 10px",
            background: "rgba(255,255,255,0.08)", borderRadius: 7,
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            fontSize: 11.5, whiteSpace: "pre",
          }}>{tip.calc}</div>
          {tip.topic && <div style={{marginTop: 8, fontSize: 11, color: "#ADB3CE"}}>Topic: {tip.topic} · Sector weight: {tip.topicW}</div>}
        </div>
      )}
    </span>
  );
};

const Review = ({ companyId, embedded }) => {
  const co = window.HALO_ESG.COMPANIES.find(c => c.id === (companyId || "wer")) || window.HALO_ESG.COMPANIES[0];
  const [tab, setTab] = React.useState("all");
  const [openComment, setOpenComment] = React.useState(null);
  const [draft, setDraft] = React.useState("");
  const [comments, setComments] = React.useState({
    pct_women_lead: [{ author: "Krishti Sharma", time: "2 days ago", text: "Pay gap is acceptable now but trending wider — please share latest 12-month comp benchmarking.", sentToFounder: false }],
    scope12:        [{ author: "Krishti Sharma", time: "Yesterday",  text: "We need Scope 3 disclosure or a written rationale for omission.", sentToFounder: true }],
  });
  const [userFlags, setUserFlags] = React.useState({});
  const toggleFlag = (qid, currentFlag) => setUserFlags(prev => ({...prev, [qid]: !currentFlag}));

  // ── Approval workflow ──
  const APPROVAL_STEPS = [
    { id: 'responses', label: 'Responses Reviewed',  desc: 'All founder answers have been read and verified by the ESG team.' },
    { id: 'flags',     label: 'Flags Addressed',     desc: 'All flagged and concern questions have been noted or resolved.' },
    { id: 'score',     label: 'Score Validated',     desc: 'ESG score has been computed and confirmed as accurate.' },
    { id: 'qa',        label: 'Q&A Closed',           desc: 'All open founder questions have been answered.' },
    { id: 'signoff',   label: 'Final Sign-off',       desc: 'ESG lead formally approves this assessment for the IC.' },
  ];
  const REVIEWER = "Krishti Sharma";
  const nowStr = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const [showApproval, setShowApproval] = React.useState(false);
  const [showApprovalRecord, setShowApprovalRecord] = React.useState(false);
  const [checkedSteps, setCheckedSteps] = React.useState({});
  const [approvalComment, setApprovalComment] = React.useState("");
  const [isApproved, setIsApproved] = React.useState(false);
  const [approvalRecord, setApprovalRecord] = React.useState(null);
  const allChecked = APPROVAL_STEPS.every(s => checkedSteps[s.id]);
  const toggleStep = (id) => setCheckedSteps(prev => {
    if (prev[id]) { const n = {...prev}; delete n[id]; return n; }
    return {...prev, [id]: { by: REVIEWER, time: nowStr() }};
  });
  const confirmApproval = () => {
    const rec = {
      steps: APPROVAL_STEPS.map(s => ({ ...s, ...(checkedSteps[s.id] || {}) })),
      comment: approvalComment.trim(),
      finalBy: REVIEWER,
      finalTime: nowStr(),
    };
    setApprovalRecord(rec);
    setIsApproved(true);
    setShowApproval(false);
  };
  const addComment = (qid, sendToFounder) => {
    if (!draft.trim()) return;
    setComments({...comments, [qid]: [...(comments[qid] || []), { author: "Krishti Sharma", time: "Just now", text: draft.trim(), sentToFounder }]});
    setDraft("");
    if (sendToFounder) setOpenComment(null);
  };

  // ── Build Q_DATA from ALL real Excel KPIs + this company's stored answers ──
  const SCORING = window.HALO_ESG.SCORING;
  const sec = SCORING.sectorKey(co.sector);
  const stored = (window.HALO_ESG.STATE.answers[co.id]) || {};

  // Flag heuristics: a question is "flagged" if it scored 0 on a high-weight question.
  const FLAG_NOTES = {
    scope12: 'No Scope 3 disclosure yet — supplementary data requested',
    pct_women_lead: 'Below sector benchmark — request a 12-month leadership pipeline plan',
    data_breaches: 'Breach reporting cadence unclear — request DPIA report',
    fines: 'Pending litigation flag — request counsel statement',
  };
  const fmtAns = (v) => {
    if (v === undefined || v === null || v === '') return null;
    if (Array.isArray(v)) return v.join(' · ');
    return String(v);
  };
  const fmtPct = (x) => `${Math.round((x||0)*100)}%`;

  // Every scored question for this sector, in section order.
  const scoredQs = SCORING.QUESTIONS.filter(q => !q.unscored && (!q.sectors || q.sectors.includes(sec)));
  const Q_DATA = scoredQs.map(q => {
    const tw = SCORING.TOPICS[q.topic]?.w?.[sec] || 0;
    const max = (q.w || 0) * tw;
    const answer = stored[q.id];
    const answered = answer !== undefined && answer !== null && answer !== '' && !(Array.isArray(answer) && answer.length === 0);
    const respPct = answered ? SCORING.scoreQuestion(q, answer) : null;
    const points = answered ? max * (respPct || 0) : 0;
    const isLowScorer = answered && tw > 0 && (q.w || 0) >= 0.2 && (respPct || 0) <= 0.25;
    const computedFlag = isLowScorer || !!FLAG_NOTES[q.id];
    const flag = userFlags.hasOwnProperty(q.id) ? userFlags[q.id] : computedFlag;
    return {
      id: q.id,
      section: q.section,
      topic: SCORING.TOPICS[q.topic]?.name,
      q: q.q,
      a: answered ? fmtAns(answer) : null,
      score: Math.round(points * 10) / 10,
      max:   Math.round(max   * 10) / 10,
      flag,
      note: FLAG_NOTES[q.id] || (computedFlag ? 'Low-scoring response on a high-weight question — confirm with founder.' : null),
      tip: {
        rule: q.logic || '—',
        calc: answered
          ? `topic_w × q_w × resp%\n= ${tw} × ${q.w} × ${fmtPct(respPct)}\n= ${(Math.round(points * 10) / 10)} pts (max ${(Math.round(max * 10) / 10)})`
          : `topic_w × q_w × resp%\n= ${tw} × ${q.w} × (no answer)\n= 0 pts (max ${(Math.round(max * 10) / 10)})`,
        topic: SCORING.TOPICS[q.topic]?.name,
        topicW: tw,
      },
    };
  });

  // Group by section for display
  const sections = [];
  const sectionMap = {};
  Q_DATA.forEach(d => {
    if (!sectionMap[d.section]) { sectionMap[d.section] = { section: d.section, items: [] }; sections.push(sectionMap[d.section]); }
    sectionMap[d.section].items.push(d);
  });

  // Tab filtering
  let filteredSections;
  if (tab === 'concerns')      filteredSections = sections.map(s => ({ ...s, items: s.items.filter(it => it.flag) })).filter(s => s.items.length);
  else if (tab === 'unanswered') filteredSections = sections.map(s => ({ ...s, items: s.items.filter(it => it.a === null) })).filter(s => s.items.length);
  else                          filteredSections = sections;

  const totalQ = Q_DATA.length;
  const flagCount = Q_DATA.filter(d => d.flag).length;
  const unansweredCount = Q_DATA.filter(d => d.a === null).length;

  return (
    <div className="fade-in">
      {!embedded && <HeaderBand
        title={`Review — ${co.name}`}
        badge="IN REVIEW"
        subtitle={`${co.sector} · Submitted ${co.submitted} · Owner Krishti Sharma · 4 of 12 sections scored`}
      />}
      {embedded && (
        <div style={{padding: "16px 36px 0", display: "flex", alignItems: "center", gap: 12}}>
          <div style={{fontSize: 13, color: "var(--halo-text-2)"}}>
            <strong style={{color: "var(--halo-text)"}}>4 of 12</strong> sections scored · Owner Krishti Sharma
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--halo-amber-soft)",
            color: "#8E5F18",
            padding: "4px 10px", borderRadius: 999,
            fontSize: 10, fontWeight: 800, letterSpacing: "0.14em",
            border: "1px solid #F0D5A0",
          }}>
            <span style={{width: 6, height: 6, borderRadius: "50%", background: "#E8A33D", boxShadow: "0 0 0 3px rgba(232,163,61,0.25)"}} />
            IN REVIEW
          </span>
          <div style={{marginLeft: "auto"}}>
            {isApproved ? (
              <button
                onClick={() => setShowApprovalRecord(true)}
                style={{display:"inline-flex",alignItems:"center",gap:6,background:"#F2FBF7",border:"1.5px solid #22C28F",color:"#1B7C5E",padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                <Icon name="check" size={13} color="#22C28F" />
                Assessment Approved
                <span style={{opacity:0.6,fontWeight:500,marginLeft:2}}>· View</span>
              </button>
            ) : (
              <button
                className="btn btn-sm"
                onClick={() => setShowApproval(true)}
                style={{
                  background: allChecked ? "var(--halo-mint)" : "#E6E7F4",
                  color: allChecked ? "white" : "#8B91AB",
                  border: "none", cursor: "pointer",
                  display:"inline-flex",alignItems:"center",gap:6,
                  padding:"6px 14px",borderRadius:8,fontSize:12,fontWeight:700,
                }}>
                <Icon name="check" size={12} color={allChecked ? "white" : "#8B91AB"} />
                Approve {allChecked ? "" : `(${Object.values(checkedSteps).filter(Boolean).length}/5)`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Approval workflow modal ── */}
      {showApproval && (
        <div style={{
          position:"fixed",inset:0,background:"rgba(11,26,63,0.55)",zIndex:100,
          display:"flex",alignItems:"center",justifyContent:"center",
        }} onClick={() => setShowApproval(false)}>
          <div style={{
            background:"white",borderRadius:16,padding:"32px 36px",width:480,maxWidth:"90vw",
            boxShadow:"0 24px 64px rgba(11,26,63,0.22)",
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--halo-text-3)",fontWeight:700,marginBottom:6}}>
                Approval Checklist
              </div>
              <div style={{fontSize:20,fontWeight:800,color:"var(--halo-navy)",letterSpacing:"-0.01em"}}>
                Approve — {co.name}
              </div>
              <div style={{fontSize:12.5,color:"var(--halo-text-3)",marginTop:4}}>
                Complete all 5 steps to enable final approval.
              </div>
            </div>

            {/* Steps */}
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {APPROVAL_STEPS.map((step, i) => {
                const stepData = checkedSteps[step.id];
                const done = !!stepData;
                return (
                  <div key={step.id} style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:8}}>
                    {/* Circle + connector */}
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                      <button
                        onClick={() => toggleStep(step.id)}
                        style={{
                          width:36,height:36,borderRadius:"50%",border:"none",cursor:"pointer",
                          background: done ? "var(--halo-mint)" : "#F0F2F8",
                          display:"grid",placeItems:"center",
                          boxShadow: done ? "0 0 0 4px rgba(34,194,143,0.18)" : "none",
                          transition:"all 180ms",flexShrink:0,
                        }}>
                        {done
                          ? <Icon name="check" size={15} color="white" stroke={2.5} />
                          : <span style={{fontSize:13,fontWeight:700,color:"#8B91AB"}}>{i+1}</span>
                        }
                      </button>
                      {i < APPROVAL_STEPS.length - 1 && (
                        <div style={{width:2,height:done ? 28 : 18,background: done ? "var(--halo-mint)" : "#E6E7F4",borderRadius:1,margin:"3px 0",transition:"all 200ms"}} />
                      )}
                    </div>
                    {/* Text */}
                    <div style={{paddingTop:6,paddingBottom:i < APPROVAL_STEPS.length-1 ? 6 : 0,minHeight:36}}>
                      <div style={{fontSize:13.5,fontWeight: done ? 700 : 600,color: done ? "#1B7C5E" : "var(--halo-text)",lineHeight:1.3}}>
                        {step.label}
                      </div>
                      <div style={{fontSize:11.5,color:"var(--halo-text-3)",marginTop:2,lineHeight:1.5}}>
                        {step.desc}
                      </div>
                      {done && (
                        <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:5,background:"#F2FBF7",border:"1px solid #B8EDD8",borderRadius:6,padding:"3px 8px"}}>
                          <Icon name="check" size={10} color="#22C28F" stroke={2.5} />
                          <span style={{fontSize:11,color:"#1B7C5E",fontWeight:600}}>
                            Approved by <strong>{stepData.by}</strong> · {stepData.time}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div style={{margin:"18px 0 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--halo-text-3)",marginBottom:6}}>
                <span>{Object.keys(checkedSteps).length} of 5 steps completed</span>
                {allChecked && <span style={{color:"#1B7C5E",fontWeight:700}}>✓ Ready to approve</span>}
              </div>
              <div style={{height:5,borderRadius:99,background:"#ECEEF6",overflow:"hidden"}}>
                <div style={{
                  height:"100%",borderRadius:99,background:"var(--halo-mint)",
                  width:(Object.keys(checkedSteps).length/5*100)+"%",
                  transition:"width 300ms",
                }} />
              </div>
            </div>

            {/* Comment field */}
            <div style={{borderTop:"1px solid #ECEEF6",paddingTop:14,marginBottom:18}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--halo-text)",marginBottom:6}}>
                Approval Comment
                <span style={{fontWeight:400,color:"var(--halo-text-3)",marginLeft:4}}>(optional)</span>
              </div>
              <textarea
                value={approvalComment}
                onChange={e => setApprovalComment(e.target.value)}
                placeholder="Add notes for this approval — e.g. exceptions noted, next review date, IC memo reference..."
                rows={3}
                style={{
                  width:"100%",resize:"vertical",boxSizing:"border-box",
                  border:"1.5px solid #E6E7F4",borderRadius:8,
                  padding:"9px 12px",fontSize:12.5,lineHeight:1.55,
                  color:"var(--halo-text)",fontFamily:"Figtree, sans-serif",
                  outline:"none",background:allChecked ? "white" : "#FAFBFD",
                  transition:"border-color 180ms",
                }}
                onFocus={e => e.target.style.borderColor="#22C28F"}
                onBlur={e => e.target.style.borderColor="#E6E7F4"}
              />
            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowApproval(false)}>Cancel</button>
              <button
                className="btn btn-sm"
                disabled={!allChecked}
                onClick={confirmApproval}
                style={{
                  background: allChecked ? "var(--halo-mint)" : "#E6E7F4",
                  color: allChecked ? "white" : "#8B91AB",
                  border:"none",cursor: allChecked ? "pointer" : "not-allowed",
                  padding:"8px 20px",borderRadius:8,fontSize:13,fontWeight:700,
                  display:"inline-flex",alignItems:"center",gap:6,
                }}>
                <Icon name="check" size={13} color={allChecked ? "white" : "#8B91AB"} />
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approval Record modal (read-only) ── */}
      {showApprovalRecord && approvalRecord && (
        <div style={{
          position:"fixed",inset:0,background:"rgba(11,26,63,0.55)",zIndex:100,
          display:"flex",alignItems:"center",justifyContent:"center",
        }} onClick={() => setShowApprovalRecord(false)}>
          <div style={{
            background:"white",borderRadius:16,padding:"32px 36px",width:500,maxWidth:"92vw",
            boxShadow:"0 24px 64px rgba(11,26,63,0.22)",maxHeight:"90vh",overflowY:"auto",
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
              <div>
                <div style={{fontSize:11,letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--halo-text-3)",fontWeight:700,marginBottom:6}}>
                  Approval Record
                </div>
                <div style={{fontSize:20,fontWeight:800,color:"var(--halo-navy)",letterSpacing:"-0.01em"}}>
                  {co.name}
                </div>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:8,background:"#F2FBF7",border:"1.5px solid #22C28F",borderRadius:8,padding:"5px 12px"}}>
                  <Icon name="check" size={12} color="#22C28F" stroke={2.5} />
                  <span style={{fontSize:12,fontWeight:700,color:"#1B7C5E"}}>
                    Assessment Approved by {approvalRecord.finalBy} · {approvalRecord.finalTime}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowApprovalRecord(false)} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:"var(--halo-text-3)"}}>
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* All 5 steps */}
            <div style={{fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:"var(--halo-text-3)",marginBottom:12}}>
              Verification steps
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:0,marginBottom:20}}>
              {approvalRecord.steps.map((step, i) => (
                <div key={step.id} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  {/* Circle + line */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                    <div style={{
                      width:32,height:32,borderRadius:"50%",
                      background:"var(--halo-mint)",
                      display:"grid",placeItems:"center",
                      boxShadow:"0 0 0 3px rgba(34,194,143,0.15)",flexShrink:0,
                    }}>
                      <Icon name="check" size={13} color="white" stroke={2.5} />
                    </div>
                    {i < approvalRecord.steps.length - 1 && (
                      <div style={{width:2,height:20,background:"#B8EDD8",borderRadius:1,margin:"3px 0"}} />
                    )}
                  </div>
                  {/* Info */}
                  <div style={{paddingTop:5,paddingBottom:i < approvalRecord.steps.length-1 ? 8 : 0}}>
                    <div style={{fontSize:13,fontWeight:700,color:"var(--halo-text)",lineHeight:1.3}}>
                      {step.label}
                    </div>
                    <div style={{fontSize:11,color:"#1B7C5E",fontWeight:600,marginTop:3}}>
                      Approved by <strong>{step.by}</strong> · {step.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment */}
            {approvalRecord.comment ? (
              <div style={{background:"#F7F8FC",border:"1.5px solid #E6E7F4",borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:"var(--halo-text-3)",marginBottom:6}}>
                  Approval Comment
                </div>
                <div style={{fontSize:13,color:"var(--halo-text)",lineHeight:1.6}}>
                  {approvalRecord.comment}
                </div>
                <div style={{fontSize:11,color:"var(--halo-text-3)",marginTop:8}}>
                  — {approvalRecord.finalBy} · {approvalRecord.finalTime}
                </div>
              </div>
            ) : (
              <div style={{fontSize:12,color:"var(--halo-text-3)",fontStyle:"italic"}}>No comment added.</div>
            )}

            {/* Close */}
            <div style={{marginTop:24,display:"flex",justifyContent:"flex-end"}}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowApprovalRecord(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="content" style={{display: "grid", gridTemplateColumns: "1fr 320px", gap: 22, alignItems: "start"}}>
        <div>
          {/* Tab strip */}
          <div className="detail-tabs">
            <div className={"t " + (tab==="all"?"active":"")} onClick={()=>setTab("all")}>All Responses<span className="count">{totalQ}</span></div>
            <div className={"t " + (tab==="unanswered"?"active":"")} onClick={()=>setTab("unanswered")}>Unanswered<span className="count">{unansweredCount}</span></div>
            <div className={"t " + (tab==="concerns"?"active":"")} onClick={()=>setTab("concerns")}>
              <Icon name="flag" size={13} />Concerns<span className="count">{flagCount}</span>
            </div>
          </div>

          {/* Q&A list — grouped by section */}
          {filteredSections.length === 0 && (
            <div className="card card-pad" style={{textAlign: "center", padding: 36, color: "var(--halo-text-3)"}}>
              No questions match this filter.
            </div>
          )}
          {filteredSections.map(sec => (
            <div key={sec.section} style={{marginBottom: 22}}>
              <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10, paddingTop: 4}}>
                <div>
                  <div style={{fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>{sec.section}</div>
                </div>
                <div style={{fontSize: 11, color: "var(--halo-text-3)"}}>
                  {sec.items.filter(it => it.a !== null).length} answered · {sec.items.filter(it => it.flag).length} flagged
                </div>
              </div>
              {sec.items.map((q, i) => (
                <div key={q.id} className="card" style={{padding: "20px 22px", marginBottom: 10}}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18}}>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 6}}>
                        Q{i+1} · {q.topic}
                      </div>
                      <div style={{fontSize: 14, fontWeight: 600, color: "var(--halo-text)", marginBottom: 10, lineHeight: 1.45}}>{q.q}</div>
                      <div style={{
                        borderLeft: "3px solid " + (q.a === null ? "var(--halo-line)" : q.flag ? "var(--halo-amber)" : "var(--halo-violet)"),
                        paddingLeft: 14, fontSize: 13, color: q.a === null ? "var(--halo-text-3)" : "var(--halo-text-2)", lineHeight: 1.55,
                        fontStyle: q.a === null ? "italic" : "normal",
                      }}>
                        {q.a === null ? '— founder did not answer' : q.a}
                      </div>
                      {q.flag && q.note && (
                        <div style={{marginTop: 10, padding: "8px 11px", background: "var(--halo-amber-soft)", borderRadius: 7, color: "#8E5F18", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6}}>
                          <Icon name="flag" size={11} /> {q.note}
                        </div>
                      )}
                    </div>
                    <div style={{minWidth: 180, textAlign: "right"}}>
                      <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "flex-end"}}>
                        Score
                        <InfoTip tip={q.tip} />
                      </div>
                      <div>
                        <span className="mono" style={{fontSize: 22, fontWeight: 700, color: q.max > 0 && q.score/q.max >= 0.75 ? "#1B7C5E" : q.max > 0 && q.score/q.max >= 0.5 ? "#8E5F18" : "#9F2D2D"}}>{q.score}</span>
                        <span className="mono" style={{fontSize: 14, color: "var(--halo-text-3)"}}> / {q.max}</span>
                      </div>
                      <div style={{display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 10, flexWrap: "wrap"}}>
                        <button
                          className={"btn btn-sm " + (q.flag ? "btn-outline" : "btn-ghost")}
                          onClick={() => toggleFlag(q.id, q.flag)}
                          style={q.flag ? {borderColor:"var(--halo-amber)",color:"#8E5F18"} : {}}>
                          <Icon name="flag" size={11} />{q.flag ? "Flagged" : "Flag"}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setOpenComment(openComment === q.id ? null : q.id); setDraft(""); }}>
                          <Icon name="mail" size={11} />Comment
                          {comments[q.id]?.length > 0 && (
                            <span style={{marginLeft: 4, padding: "1px 6px", borderRadius: 99, background: "var(--halo-navy)", color: "white", fontSize: 10, fontWeight: 700}}>{comments[q.id].length}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Existing comments thread */}
                  {comments[q.id]?.length > 0 && (
                    <div style={{marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--halo-line-2)", display: "flex", flexDirection: "column", gap: 10}}>
                      {comments[q.id].map((c, ci) => (
                        <div key={ci} style={{display: "flex", gap: 10, alignItems: "flex-start"}}>
                          <div style={{width: 26, height: 26, borderRadius: "50%", background: "var(--halo-navy)", color: "white", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0}}>KS</div>
                          <div style={{flex: 1}}>
                            <div style={{display: "flex", alignItems: "center", gap: 8, fontSize: 12, marginBottom: 3}}>
                              <strong style={{color: "var(--halo-text)"}}>{c.author}</strong>
                              <span style={{color: "var(--halo-text-3)"}}>· {c.time}</span>
                              {c.sentToFounder && (
                                <span style={{fontSize: 9, padding: "2px 7px", borderRadius: 4, background: "#F2FBF7", color: "#1B7C5E", fontWeight: 700, letterSpacing: "0.1em", display: "inline-flex", alignItems: "center", gap: 4}}>
                                  <Icon name="send" size={9} />SENT TO FOUNDER
                                </span>
                              )}
                            </div>
                            <div style={{fontSize: 13, color: "var(--halo-text-2)", lineHeight: 1.5}}>{c.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Composer */}
                  {openComment === q.id && (
                    <div style={{marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--halo-line-2)"}}>
                      <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder="Add an internal note, or send a question back to the founder…"
                        style={{width: "100%", minHeight: 64, padding: "9px 11px", border: "1px solid var(--halo-line)", borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box"}}
                      />
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10}}>
                        <div style={{fontSize: 11, color: "var(--halo-text-3)"}}>
                          <Icon name="shield" size={11} /> Internal notes are visible to the ESG team only
                        </div>
                        <div style={{display: "flex", gap: 8}}>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setOpenComment(null); setDraft(""); }}>Cancel</button>
                          <button className="btn btn-outline btn-sm" disabled={!draft.trim()} style={!draft.trim() ? {opacity:0.5, cursor:"not-allowed"} : {}} onClick={() => addComment(q.id, false)}>
                            <Icon name="pen" size={11} />Save internal note
                          </button>
                          <button className="btn btn-mint btn-sm" disabled={!draft.trim()} style={!draft.trim() ? {opacity:0.5, cursor:"not-allowed"} : {}} onClick={() => addComment(q.id, true)}>
                            <Icon name="send" size={11} />Send to {co.spoc.split(" ")[0]}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right rail */}
        <div style={{position: "sticky", top: 22, display: "flex", flexDirection: "column", gap: 16}}>
          {/* Score panel — computed live from this company's stored answers */}
          {(() => {
            const sc = SCORING.computeScores(co.id) || {total:0,totalMax:100,eP:{s:0,m:0},sP:{s:0,m:0},gP:{s:0,m:0},verdict:'FAIL',threshold:30,tier:'L1'};
            const pillarRows = [
              { p: 'Environment', v: sc.eP.s, m: sc.eP.m, c: '#22C28F' },
              { p: 'Social',      v: sc.sP.s, m: sc.sP.m, c: '#6B6FBF' },
              { p: 'Governance',  v: sc.gP.s, m: sc.gP.m, c: '#E8A33D' },
            ];
            const r1 = (x) => Math.round(x*10)/10;
            return (
              <div className="card" style={{background: "linear-gradient(180deg, var(--halo-navy-deep), var(--halo-navy))", color: "white", padding: "22px 24px"}}>
                <div style={{fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ADB3CE", fontWeight: 600}}>Cumulative Score</div>
                <div style={{display: "flex", alignItems: "center", gap: 18, marginTop: 12}}>
                  <Ring value={sc.total} max={sc.totalMax || 100} size={84} stroke={9} color={sc.verdict==='PASS' ? '#22C28F' : sc.verdict==='REVIEW' ? '#E8A33D' : '#E25C5C'} track="rgba(255,255,255,0.10)" />
                  <div>
                    <div className="mono" style={{fontSize: 38, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em"}}>{r1(sc.total)}</div>
                    <div style={{fontSize: 12, color: "#ADB3CE", marginTop: 4}}>out of {r1(sc.totalMax || 100)}</div>
                  </div>
                </div>
                <div style={{marginTop: 18, padding: "10px 12px", background: sc.verdict==='PASS' ? "rgba(34,194,143,0.15)" : sc.verdict==='REVIEW' ? "rgba(232,163,61,0.18)" : "rgba(226,92,92,0.18)", borderRadius: 8, fontSize: 12, fontWeight: 600, color: sc.verdict==='PASS' ? "#A7EBC9" : sc.verdict==='REVIEW' ? "#F2C77F" : "#F2A0A0"}}>
                  <Icon name={sc.verdict==='PASS' ? "check" : "flag"} size={13} /> {sc.verdict} · {sc.tier} threshold ({sc.threshold})
                </div>
                <div style={{marginTop: 16}}>
                  {pillarRows.map(p => (
                    <div key={p.p} style={{margin: "10px 0"}}>
                      <div style={{display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5}}>
                        <span style={{color: "#C5C9DD"}}>{p.p}</span>
                        <span className="mono" style={{fontWeight: 700}}>{r1(p.v)}<span style={{color: "#8B91AB"}}> / {r1(p.m)}</span></span>
                      </div>
                      <div style={{height: 5, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden"}}>
                        <div style={{height: "100%", width: (p.m > 0 ? (p.v/p.m*100) : 0)+"%", background: p.c, borderRadius: 99}} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Peer benchmarking */}
          <div className="card card-pad">
            <h3 style={{margin: 0, fontSize: 14, fontWeight: 700}}>Peer benchmarking</h3>
            <div className="sub" style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 4, marginBottom: 14}}>Fintech / Lending sector</div>
            {[
              { l: "This company",       v: 78.4, c: "var(--halo-navy)", b: true },
              { l: "Sector average",     v: 71.2, c: "#6B6FBF" },
              { l: "Portfolio average",  v: 71.4, c: "#22C28F" },
              { l: "Top quartile",       v: 84.6, c: "#E8A33D" },
            ].map((r,i) => (
              <div key={i} style={{margin: "10px 0"}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4}}>
                  <span style={{fontWeight: r.b ? 700 : 500}}>{r.l}</span>
                  <span className="mono" style={{fontWeight: 700}}>{r.v}</span>
                </div>
                <div className="score-bar" style={{height: 5}}>
                  <div style={{width: r.v + "%", background: r.c}} />
                </div>
              </div>
            ))}
            <div style={{marginTop: 12, fontSize: 12, color: "#1B7C5E", fontWeight: 600}}>
              <Icon name="arrowup" size={12} /> +7.2 vs sector avg
            </div>
          </div>

          {/* Concerns */}
          <div className="card card-pad">
            <h3 style={{margin: "0 0 12px", fontSize: 14, fontWeight: 700}}>Areas of concern</h3>
            {[
              { sev: "Medium", c: "#E8A33D", bg: "#FBF1DE", t: "No Scope 3 emissions disclosure" },
              { sev: "Medium", c: "#E8A33D", bg: "#FBF1DE", t: "Gender pay gap trending wider" },
              { sev: "Low",    c: "#6B6FBF", bg: "#E6E7F4", t: "Limited supplier ESG audit coverage" },
            ].map((x,i) => (
              <div key={i} style={{display: "flex", gap: 10, padding: "9px 0", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}>
                <span style={{padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: x.bg, color: x.c, height: 18, alignSelf: "flex-start"}}>{x.sev}</span>
                <span style={{fontSize: 12.5, color: "var(--halo-text-2)"}}>{x.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Review = Review;
