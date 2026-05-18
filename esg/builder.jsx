// HALO ESG — Form Builder (ESG-team facing master form editor)
// Lets ESG add / remove / toggle questions from the master survey.
// All companies' assessments read from SCORING.getActiveQuestions().

const FormBuilder = () => {
  const SCORING = window.HALO_ESG.SCORING;
  const STATE   = window.HALO_ESG.STATE;
  const [tick, setTick] = React.useState(0);
  const bump = () => setTick(t => t + 1);

  const disabled = new Set(STATE.disabledQuestions || []);
  const customQs = STATE.customQuestions || [];
  const baseQs   = SCORING.QUESTIONS;
  const activeQs = SCORING.getActiveQuestions();

  // Group active questions by section
  const sectionOrder = [];
  const grouped = {};
  activeQs.forEach(q => {
    if (!grouped[q.section]) { grouped[q.section] = []; sectionOrder.push(q.section); }
    grouped[q.section].push(q);
  });

  // View / Edit mode — page defaults to view; ESG must click Edit + confirm to make changes
  const [mode, setMode] = React.useState('view'); // 'view' | 'edit'
  const [confirmEdit, setConfirmEdit] = React.useState(false);
  const isEdit = mode === 'edit';

  // Add-question modal state
  const [adding, setAdding] = React.useState(false);
  const [draft, setDraft] = React.useState({
    section: sectionOrder[0] || 'Workforce & Diversity',
    q: '', type: 'Yes / No', topic: '', w: 0.1, required: false, opts: '',
  });

  const sectionList = [...new Set([...sectionOrder, 'Workforce & Diversity', 'Water Management', 'Energy & Emissions', 'Waste Management', 'Health & Safety', 'Community & CSR', 'Consumer Responsibility', 'Governance & Compliance', 'Supply Chain & Sourcing', 'Sector-Specific'])];
  const topicList = Object.entries(SCORING.TOPICS).map(([k, t]) => ({ k, name: t.name, pillar: t.pillar }));

  const addQ = () => {
    if (!draft.q.trim()) return;
    const optsArr = (draft.type === 'Multi-select' || draft.type === 'Single-select')
      ? draft.opts.split('\n').map(s => s.trim()).filter(Boolean)
      : undefined;
    window.HALO_ESG.addCustomQuestion({
      id: 'custom_' + Date.now(),
      section: draft.section,
      q: draft.q.trim(),
      type: draft.type,
      topic: draft.topic || 'cgov',
      w: Number(draft.w) || 0.1,
      required: !!draft.required,
      ...(optsArr ? { opts: optsArr } : {}),
    });
    setDraft({ ...draft, q: '', opts: '' });
    setAdding(false);
    bump();
  };

  const toggle = (qid) => { window.HALO_ESG.toggleQuestionDisabled(qid); bump(); };
  const removeCustom = (qid) => { window.HALO_ESG.removeCustomQuestion(qid); bump(); };

  const totalActive = activeQs.length;
  const totalCustom = customQs.length;
  const totalDisabled = disabled.size;

  return (
    <div className="fade-in">
      <HeaderBand
        title="Form Builder"
        subtitle={`Master ESG questionnaire · ${baseQs.length} Excel KPIs · curate which questions every founder sees`}
        badge="ESG"
      />

      <div className="content" style={{maxWidth: 1100}}>

        {/* Summary stats */}
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22}}>
          <StatTile label="Active questions"   v={totalActive}   c="#22C28F" icon="check" />
          <StatTile label="Custom additions"   v={totalCustom}   c="#6B6FBF" icon="plus" />
          <StatTile label="Disabled (hidden)"  v={totalDisabled} c="#E8A33D" icon="x" />
        </div>

        {/* Mode bar — View by default; Edit requires confirmation */}
        <div className="card" style={{padding: "16px 22px", marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderLeft: `3px solid ${isEdit ? '#E8A33D' : 'var(--halo-mint)'}`}}>
          <div style={{display: "flex", alignItems: "center", gap: 12}}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: isEdit ? '#FBF1DE' : '#F2FBF7',
              color:      isEdit ? '#8E5F18' : '#1B7C5E',
              display: "grid", placeItems: "center",
            }}>
              <Icon name={isEdit ? "pen" : "shield"} size={16} />
            </div>
            <div>
              <div style={{fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8}}>
                {isEdit ? "Edit mode" : "View mode"}
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                  padding: "2px 7px", borderRadius: 4,
                  background: isEdit ? "#FBF1DE" : "#F2FBF7",
                  color:      isEdit ? "#8E5F18" : "#1B7C5E",
                }}>
                  {isEdit ? "LIVE EDITS" : "READ-ONLY"}
                </span>
              </div>
              <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 2, lineHeight: 1.45}}>
                {isEdit
                  ? "Add, disable, or restore questions. Changes apply to every founder's form."
                  : "Browsing the master ESG questionnaire. Click Edit to modify questions."}
              </div>
            </div>
          </div>
          {isEdit ? (
            <div style={{display: "flex", gap: 10}}>
              <button className="btn btn-outline" onClick={() => setAdding(true)}>
                <Icon name="plus" size={13} />Add question
              </button>
              <button className="btn btn-mint" onClick={() => { setMode('view'); setAdding(false); }}>
                <Icon name="check" size={13} stroke={2.5} />Done editing
              </button>
            </div>
          ) : (
            <button className="btn btn-mint" onClick={() => setConfirmEdit(true)}>
              <Icon name="pen" size={13} />Edit form
            </button>
          )}
        </div>

        {/* Edit confirmation modal */}
        {confirmEdit && (
          <div style={{position:"fixed",inset:0,background:"rgba(11,26,63,0.55)",zIndex:120,display:"flex",alignItems:"center",justifyContent:"center"}}
            onClick={() => setConfirmEdit(false)}>
            <div style={{background:"white",borderRadius:14,padding:"28px 32px",width:440,maxWidth:"92vw",boxShadow:"0 24px 64px rgba(11,26,63,0.22)"}}
              onClick={e => e.stopPropagation()}>
              <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 14}}>
                <div style={{width: 40, height: 40, borderRadius: 10, background: "#FBF1DE", color: "#8E5F18", display: "grid", placeItems: "center"}}>
                  <Icon name="pen" size={18} />
                </div>
                <div style={{fontSize: 18, fontWeight: 800, color: "var(--halo-navy)"}}>
                  Switch to Edit mode?
                </div>
              </div>
              <div style={{fontSize: 13, color: "var(--halo-text-2)", lineHeight: 1.6, marginBottom: 6}}>
                You're about to modify the master ESG questionnaire. Any question you disable or add will apply to <strong>every company's</strong> survey going forward, including assessments already in progress.
              </div>
              <div style={{fontSize: 12, color: "var(--halo-text-3)", lineHeight: 1.55, marginBottom: 22, paddingLeft: 14, borderLeft: "3px solid var(--halo-amber)", padding: "8px 12px", background: "#FFFBF2", borderRadius: 6}}>
                Disabled master questions stop contributing to the score max. Custom questions are collected but unscored.
              </div>
              <div style={{display: "flex", gap: 10, justifyContent: "flex-end"}}>
                <button className="btn btn-ghost" onClick={() => setConfirmEdit(false)}>Cancel</button>
                <button className="btn btn-mint" onClick={() => { setMode('edit'); setConfirmEdit(false); }}>
                  <Icon name="pen" size={13} />Yes, edit form
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add question modal — only when in Edit mode */}
        {adding && isEdit && (
          <div style={{position:"fixed",inset:0,background:"rgba(11,26,63,0.55)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}
            onClick={() => setAdding(false)}>
            <div style={{background:"white",borderRadius:14,padding:"28px 30px",width:520,maxWidth:"92vw",boxShadow:"0 24px 64px rgba(11,26,63,0.22)"}}
              onClick={e => e.stopPropagation()}>
              <div style={{fontSize:18,fontWeight:800,color:"var(--halo-navy)",marginBottom:18}}>New question</div>

              <FieldLabel>Section</FieldLabel>
              <select value={draft.section} onChange={e => setDraft({...draft, section: e.target.value})} style={inputStyleFB}>
                {sectionList.map(s => <option key={s}>{s}</option>)}
              </select>

              <FieldLabel>Question text</FieldLabel>
              <input value={draft.q} onChange={e => setDraft({...draft, q: e.target.value})}
                placeholder="e.g. Does the company have a board-approved climate transition plan?"
                style={{...inputStyleFB, width: "100%"}} />

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <FieldLabel>Response type</FieldLabel>
                  <select value={draft.type} onChange={e => setDraft({...draft, type: e.target.value})} style={inputStyleFB}>
                    <option>Yes / No</option>
                    <option>Number</option>
                    <option>Slider</option>
                    <option>Single-select</option>
                    <option>Multi-select</option>
                  </select>
                </div>
                <div>
                  <FieldLabel>Topic</FieldLabel>
                  <select value={draft.topic} onChange={e => setDraft({...draft, topic: e.target.value})} style={inputStyleFB}>
                    <option value="">— pick a topic —</option>
                    {topicList.map(t => <option key={t.k} value={t.k}>{t.name} ({t.pillar})</option>)}
                  </select>
                </div>
              </div>

              {(draft.type === 'Single-select' || draft.type === 'Multi-select') && (
                <>
                  <FieldLabel>Options (one per line)</FieldLabel>
                  <textarea value={draft.opts} onChange={e => setDraft({...draft, opts: e.target.value})}
                    placeholder={"Option A\nOption B\nOption C"}
                    rows={4}
                    style={{...inputStyleFB, width:"100%", resize:"vertical", fontFamily:"inherit", padding:"10px 12px", height:"auto"}} />
                </>
              )}

              <label style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:13,color:"var(--halo-text-2)",marginTop:12}}>
                <input type="checkbox" checked={draft.required} onChange={e => setDraft({...draft, required: e.target.checked})} />
                Mark as required
              </label>

              <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:22}}>
                <button className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
                <button className="btn btn-mint" disabled={!draft.q.trim()} style={!draft.q.trim() ? {opacity:0.55,cursor:"not-allowed"} : {}} onClick={addQ}>
                  <Icon name="check" size={13} />Save question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Question groups */}
        {sectionOrder.map(section => (
          <div key={section} style={{marginBottom: 22}}>
            <div style={{display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10}}>
              <div style={{fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>
                {section}
              </div>
              <div style={{fontSize: 11, color: "var(--halo-text-3)"}}>
                {grouped[section].length} active question{grouped[section].length === 1 ? '' : 's'}
              </div>
            </div>
            <div className="card" style={{overflow: "hidden"}}>
              {grouped[section].map((q, i) => (
                <QuestionRow key={q.id} q={q} idx={i} canEdit={isEdit} onToggle={() => toggle(q.id)} onRemove={() => removeCustom(q.id)} />
              ))}
            </div>
          </div>
        ))}

        {/* Disabled list */}
        {totalDisabled > 0 && (
          <div style={{marginTop: 32, marginBottom: 40}}>
            <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 12}}>
              <Icon name="x" size={14} color="#E8A33D" />
              <h3 style={{margin: 0, fontSize: 14, fontWeight: 700, color: "var(--halo-text)"}}>
                Disabled questions ({totalDisabled})
              </h3>
            </div>
            <div className="card" style={{overflow: "hidden", opacity: 0.7}}>
              {baseQs.filter(q => disabled.has(q.id)).map((q, i) => (
                <div key={q.id} style={{display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontSize: 13, fontWeight: 600, color: "var(--halo-text-2)", textDecoration: "line-through"}}>{q.q}</div>
                    <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 2}}>{q.section} · {q.type}</div>
                  </div>
                  {isEdit && (
                    <button className="btn btn-outline btn-sm" onClick={() => toggle(q.id)} style={{borderColor: "var(--halo-mint)", color: "#1B7C5E"}}>
                      <Icon name="check" size={12} stroke={2.5} />Re-enable
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatTile = ({ label, v, c, icon }) => (
  <div className="card" style={{padding: "16px 20px", borderTop: `3px solid ${c}`}}>
    <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 8}}>
      <div style={{width: 28, height: 28, borderRadius: 7, background: c + "1A", display: "grid", placeItems: "center"}}>
        <Icon name={icon} size={14} color={c} stroke={2.5} />
      </div>
      <div style={{fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>{label}</div>
    </div>
    <div className="mono" style={{fontSize: 30, fontWeight: 700, color: "var(--halo-text)", letterSpacing: "-0.02em"}}>{v}</div>
  </div>
);

const QuestionRow = ({ q, idx, canEdit = false, onToggle, onRemove }) => {
  return (
    <div style={{display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderTop: idx ? "1px solid var(--halo-line-2)" : "none"}}>
      <div style={{width: 28, height: 28, borderRadius: 8, background: q.custom ? "#E6E7F4" : "#F2FBF7", color: q.custom ? "#45489B" : "#1B7C5E", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0}}>
        {idx + 1}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap"}}>
          <span style={{fontSize: 13, fontWeight: 600, color: "var(--halo-text)", lineHeight: 1.4}}>
            {q.q}{q.required && <span style={{color: "var(--halo-amber)", marginLeft: 4}}>*</span>}
          </span>
          {q.custom && (
            <span style={{fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", padding: "2px 7px", borderRadius: 4, background: "#E6E7F4", color: "#45489B"}}>CUSTOM</span>
          )}
        </div>
        <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap"}}>
          <span>{q.type}</span>
          {q.topic && <span>· Topic: {q.topic}</span>}
          {q.w !== undefined && !q.custom && <span>· Weight: {q.w}</span>}
          {q.sectors && <span>· Sectors: {q.sectors.join(', ')}</span>}
        </div>
      </div>
      {canEdit && (
        q.custom ? (
          <button className="btn btn-ghost btn-sm" onClick={onRemove} style={{color: "#9F2D2D", flexShrink: 0}}>
            <Icon name="x" size={12} />Remove
          </button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={onToggle} style={{color: "#8E5F18", flexShrink: 0}}>
            <Icon name="x" size={12} />Disable
          </button>
        )
      )}
    </div>
  );
};

const FieldLabel = ({ children }) => (
  <div style={{fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700, marginTop: 14, marginBottom: 6}}>
    {children}
  </div>
);

const inputStyleFB = {
  height: 38, padding: "0 12px",
  border: "1px solid var(--halo-line)",
  borderRadius: 8, background: "white",
  fontSize: 13, outline: "none", width: "100%",
};

window.FormBuilder = FormBuilder;
