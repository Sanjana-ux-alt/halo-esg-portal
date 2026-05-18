// HALO ESG — Founder-facing response form
// Real Excel KPI questions, no scores shown to the founder.
// Answers persist via window.HALO_ESG.STATE — review/response tabs read from there.

const SECTOR_TILES = [
  { label: "Consumer / D2C",      desc: "Direct-to-consumer brands, FMCG, retail" },
  { label: "B2B SaaS",            desc: "Software, cloud platforms, enterprise tech" },
  { label: "Fintech / Lending",   desc: "Payments, credit, insurtech, wealthtech" },
  { label: "Agritech",            desc: "Farm inputs, supply chain, crop intelligence" },
  { label: "Cleantech / Mobility",desc: "EVs, renewables, waste, sustainability" },
  { label: "Healthtech",          desc: "Digital health, diagnostics, medtech" },
];

const FounderView = ({ companyId }) => {
  const co = window.HALO_ESG.COMPANIES.find(c => c.id === companyId) || window.HALO_ESG.COMPANIES[0];
  const SCORING = window.HALO_ESG.SCORING;

  // Role-aware edit gating: ESG can edit, deal/risk are read-only, founders (no role) can always fill
  const role = window.HALO_ROLE;
  const canEdit = role ? !!(window.HALO_PERMS?.canEdit) : true;

  // Step 0: sector selection (always show so founder can confirm/change)
  const [sectorSelected, setSectorSelected] = React.useState(co.sector || null);
  const [sectorConfirmed, setSectorConfirmed] = React.useState(false);

  // Once confirmed, derive the sector key from the selected sector
  const sec = sectorConfirmed && sectorSelected
    ? SCORING.sectorKey(sectorSelected)
    : null;

  // Visible questions for the selected sector
  const allQs = React.useMemo(
    () => sec ? SCORING.QUESTIONS.filter(q => !q.sectors || q.sectors.includes(sec)) : [],
    [sec, co.id]
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

  // ── Top bar (shared between sector step and form) ──
  const topBar = (
    <div style={{
      background: "var(--halo-navy-deep)", color: "white",
      padding: "12px 36px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 16, fontSize: 12,
    }}>
      <div style={{display: "flex", alignItems: "center", gap: 10, minWidth: 0}}>
        <Icon name={role === 'esg' ? "pen" : "shield"} size={13} color={role === 'esg' ? "#22C28F" : "#8B91AB"} />
        <span style={{color: role === 'esg' ? "#A7EBC9" : !canEdit ? "#F2C77F" : "#ADB3CE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>
          {role === 'esg' ? `ESG Team — editing ${co.name}'s responses` : !canEdit ? "Read-only view — editing not permitted for your role" : "Secure response form · auto-saved as you go"}
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
  );

  // ── Header card (shared) ──
  const headerCard = (
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
    </div>
  );

  // ── Sector selection screen ──
  if (!sectorConfirmed) {
    return (
      <div style={{background: "#F4F6FA", minHeight: "100vh"}}>
        {topBar}
        <div style={{maxWidth: 860, margin: "0 auto", padding: "28px 32px 80px"}}>
          {headerCard}

          {/* Sector selection card */}
          <div style={{background: "white", borderRadius: 14, padding: "30px 32px", boxShadow: "var(--halo-shadow)"}}>
            <div style={{fontSize: 18, fontWeight: 700, marginBottom: 6}}>
              Which sector best describes your business?
            </div>
            <div style={{fontSize: 13, color: "var(--halo-text-2)", marginBottom: 24, lineHeight: 1.55}}>
              Select the category that most closely matches your primary business model.
            </div>

            {/* 2×3 sector tile grid */}
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22}}>
              {SECTOR_TILES.map(tile => {
                const active = sectorSelected === tile.label;
                return (
                  <SectorTile
                    key={tile.label}
                    tile={tile}
                    active={active}
                    onClick={() => setSectorSelected(tile.label)}
                  />
                );
              })}
            </div>

            <div style={{fontSize: 12, color: "var(--halo-text-3)", marginBottom: 24}}>
              Your selection determines which sector-specific questions appear in your assessment.
            </div>

            <button
              className="btn btn-mint"
              disabled={!sectorSelected}
              style={!sectorSelected ? {opacity: 0.55, cursor: "not-allowed"} : {}}
              onClick={() => setSectorConfirmed(true)}
            >
              Continue with {sectorSelected || "selected sector"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form (sector confirmed) ──
  return (
    <div style={{background: "#F4F6FA", minHeight: "100vh"}}>
      {topBar}

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

        {/* Role banner */}
        {role === 'esg' && (
          <div style={{display: "flex", alignItems: "center", gap: 10, background: "#F2FBF7", border: "1px solid #B8EDD8", borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 12, color: "#1B7C5E", fontWeight: 600}}>
            <Icon name="pen" size={13} color="#22C28F" />
            ESG edit mode — changes save immediately to the company's record.
          </div>
        )}
        {!canEdit && role && (
          <div style={{display: "flex", alignItems: "center", gap: 10, background: "#FFF7EC", border: "1px solid #F0D5A0", borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 12, color: "#8E5F18", fontWeight: 600}}>
            <Icon name="shield" size={13} color="#E8A33D" />
            Read-only — your role ({role === 'deal' ? 'Deal Team' : 'Risk Team'}) can view but not edit responses.
          </div>
        )}

        {/* Sector badge + change link */}
        <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 18}}>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
            background: "#E6F7F2", color: "#1B7C5E", border: "1px solid #A8DDD0",
          }}>
            Sector: {sectorSelected}
          </span>
          <button
            onClick={() => setSectorConfirmed(false)}
            style={{fontSize: 12, color: "var(--halo-text-3)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0}}
          >
            Change sector
          </button>
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

        {/* Full-width form */}
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
                  <FounderQuestion key={q.id} q={q} value={ans[q.id]} onChange={(v) => canEdit && setAns(q.id, v)} index={i} canEdit={canEdit} />
                ))}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div style={{background: "white", borderRadius: 14, padding: "20px 24px", boxShadow: "var(--halo-shadow)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16}}>
            <div>
              <div style={{fontSize: 14, fontWeight: 700}}>
                {!canEdit && role ? "Viewing response form" : pct === 100 ? "Ready to submit" : "Save and continue later"}
              </div>
              <div style={{fontSize: 12, color: "var(--halo-text-3)", marginTop: 2}}>
                {!canEdit && role ? "You have view-only access to this form." : `Your progress is auto-saved. ${pct < 100 ? `${allQs.length - answeredCount} questions remaining.` : 'All questions answered.'}`}
              </div>
            </div>
            {canEdit || !role ? (
              <button className="btn btn-mint" disabled={pct < 100} style={pct < 100 ? {opacity:0.55,cursor:"not-allowed"} : {}}>
                <Icon name="check" size={13} />Submit for review
              </button>
            ) : (
              <button className="btn btn-outline" onClick={() => window.HALO_NAV("company", co.id)}>
                <Icon name="arrowback" size={13} />Back to {co.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Sector tile button ──
const SectorTile = ({ tile, active, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active ? "#F2FBF7" : "white",
        border: active
          ? "2px solid var(--halo-mint)"
          : hovered
          ? "2px solid var(--halo-mint)"
          : "2px solid var(--halo-navy)",
        borderRadius: 12,
        padding: "18px 20px",
        textAlign: "left",
        cursor: "pointer",
        transition: "all 140ms",
        outline: "none",
      }}
    >
      <div style={{fontSize: 14, fontWeight: 700, color: "var(--halo-text)", marginBottom: 4}}>
        {tile.label}
      </div>
      <div style={{fontSize: 11, color: "var(--halo-text-3)", lineHeight: 1.45}}>
        {tile.desc}
      </div>
    </button>
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
const FounderQuestion = ({ q, value, onChange, index, canEdit = true }) => {
  return (
    <div style={{padding: "16px 24px", borderTop: index ? "1px solid var(--halo-line-2)" : "none", opacity: canEdit ? 1 : 0.82}}>
      <div style={{display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10}}>
        <div style={{fontSize: 13.5, fontWeight: 600, color: "var(--halo-text)", lineHeight: 1.45}}>
          <span style={{color: "var(--halo-text-3)", fontWeight: 600, marginRight: 8, fontFamily: "JetBrains Mono, monospace", fontSize: 12}}>Q{index + 1}</span>
          {q.q}{q.required && <span style={{color: "var(--halo-amber)", marginLeft: 4}}>*</span>}
        </div>
        <div style={{fontSize: 11, color: "var(--halo-text-3)", whiteSpace: "nowrap", flexShrink: 0}}>{q.type}</div>
      </div>
      <FounderInput q={q} value={value} onChange={onChange} canEdit={canEdit} />
    </div>
  );
};

const FounderInput = ({ q, value, onChange, canEdit = true }) => {
  if (q.type === 'Yes / No') {
    return (
      <div style={{display: "flex", gap: 10}}>
        {['Yes','No'].map(v => {
          const active = value === v;
          return (
            <button key={v} onClick={() => canEdit && onChange(v)}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                border: active ? "1.5px solid var(--halo-mint)" : "1px solid var(--halo-line)",
                background: active ? "#F2FBF7" : "white",
                color: active ? "#1B7C5E" : "var(--halo-text-2)",
                cursor: canEdit ? "pointer" : "default", transition: "all 120ms",
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
      <div style={{display: "flex", alignItems: "center", gap: 10, maxWidth: 320, border: "1px solid var(--halo-line)", borderRadius: 9, background: canEdit ? "white" : "#F7F8FC", padding: "0 14px"}}>
        <input
          type="number" step="any"
          value={value ?? ''}
          onChange={e => canEdit && onChange(e.target.value)}
          readOnly={!canEdit}
          placeholder="0"
          style={{flex: 1, border: "none", outline: "none", padding: "11px 0", fontFamily: "JetBrains Mono, monospace", fontSize: 14, background: "transparent", cursor: canEdit ? "auto" : "default"}}
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
            onChange={e => canEdit && onChange(e.target.value)}
            disabled={!canEdit}
            style={{flex: 1, accentColor: "var(--halo-mint)", cursor: canEdit ? "pointer" : "default"}}
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
            <button key={o.l} onClick={() => canEdit && onChange(o.l)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "11px 14px", borderRadius: 9, fontSize: 13.5,
                border: active ? "1.5px solid var(--halo-mint)" : "1px solid var(--halo-line)",
                background: active ? "#F2FBF7" : "white",
                cursor: canEdit ? "pointer" : "default", transition: "all 120ms", textAlign: "left",
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
      if (!canEdit) return;
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
                cursor: canEdit ? "pointer" : "default", transition: "all 120ms", textAlign: "left",
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
      type="text" value={value ?? ''} onChange={e => canEdit && onChange(e.target.value)}
      readOnly={!canEdit}
      style={{width: "100%", height: 38, padding: "0 12px", border: "1px solid var(--halo-line)", borderRadius: 9, fontSize: 13, outline: "none", background: canEdit ? "white" : "#F7F8FC"}}
    />
  );
};

window.FounderView = FounderView;
