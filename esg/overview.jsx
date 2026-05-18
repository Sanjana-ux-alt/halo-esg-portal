// HALO ESG — Overview / Assessments dashboard

const Overview = () => {
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  // Live counts from real data
  const ALL = window.HALO_ESG.COMPANIES;
  const countBy = (s) => ALL.filter(c => c.status === s).length;
  const KPI_DATA = [
    { label: "Active Assessments", value: ALL.length, delta: `+${ALL.filter(c => c.status==='in-progress' || c.status==='in-review').length}`, sub: "this quarter", color: "#22C28F", icon: "pipe", iconBg: "#DCF5EB", iconColor: "#1B7C5E" },
    { label: "Pending My Review",  value: countBy('in-review'),  delta: countBy('in-review') > 0 ? `+${countBy('in-review')}` : '0', sub: "since yesterday", color: "#E8A33D", icon: "clock", iconBg: "#FBF1DE", iconColor: "#8E5F18", deltaColor: "dn" },
  ];
  const FILTER_TABS = [
    { id: "all",         label: "All",         count: ALL.length },
    { id: "completed",   label: "Completed",   count: countBy('completed') },
    { id: "in-review",   label: "In Review",   count: countBy('in-review') },
    { id: "in-progress", label: "In Progress", count: countBy('in-progress') },
    { id: "not-started", label: "Not Started", count: countBy('not-started') },
    { id: "overdue",     label: "Overdue",     count: countBy('overdue'), danger: true },
  ].filter(t => t.count > 0 || t.id === 'all');

  const cos = ALL.filter(c =>
    (filter === "all" || c.status === filter) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in">
      <HeaderBand
        title="ESG Assessments"
        badge="LIVE PIPELINE"
        subtitle={`Monitoring ${window.HALO_ESG.COMPANIES.length} portfolio companies across 4 active funds · Updated 2 min ago`}
        actions={<>
          <button className="tab-btn primary" onClick={() => window.HALO_NAV("send")}><Icon name="send" size={14} />Send Survey</button>
          <div style={{display: "flex", gap: 8, marginLeft: 4}}>
            {KPI_DATA.map((k, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: k.iconBg, color: k.iconColor,
                  display: "grid", placeItems: "center", flexShrink: 0,
                }}>
                  <Icon name={k.icon} size={13} />
                </div>
                <div style={{lineHeight: 1.1}}>
                  <div style={{display: "flex", alignItems: "baseline", gap: 6}}>
                    <span className="mono" style={{fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "-0.01em"}}>{k.value}</span>
                    <span style={{fontSize: 10, fontWeight: 700, color: k.deltaColor === "dn" ? "#F2A0A0" : "#7DD3AE"}}>{k.delta}</span>
                  </div>
                  <div style={{fontSize: 10, color: "#ADB3CE", marginTop: 2, letterSpacing: "0.04em"}}>{k.label}</div>
                </div>
              </div>
            ))}
          </div>
        </>}
      />

      <div className="content">

        {/* Filter bar */}
        <div className="filter-bar">
          {FILTER_TABS.map(t => (
            <button
              key={t.id}
              className={"chip" + (filter === t.id ? " active" : "")}
              onClick={() => setFilter(t.id)}
              style={t.danger && filter !== t.id ? {color: "#9F2D2D"} : {}}
            >
              {t.label}<span className="count">{t.count}</span>
            </button>
          ))}
          <div className="search-input">
            <Icon name="search" size={14} color="#8B91AB" />
            <input
              placeholder="Search companies, sectors, owners…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Pipeline table */}
        <div className="card" style={{overflow: "hidden"}}>
          <div className="card-h">
            <div>
              <h3>Pipeline</h3>
              <div className="sub">{cos.length} of {window.HALO_ESG.COMPANIES.length} companies · sorted by recent activity</div>
            </div>
            <div style={{display: "flex", gap: 8}}>
              <button className="btn btn-outline btn-sm"><Icon name="grid" size={13} />Columns</button>
              <button className="btn btn-outline btn-sm"><Icon name="dots" size={13} /></button>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th style={{paddingLeft: 24}}>Company</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Progress</th>
                <th>ESG Score</th>
                <th>Owner</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cos.map(c => (
                <tr key={c.id} onClick={() => window.HALO_NAV("company", c.id)}>
                  <td style={{paddingLeft: 24}}>
                    <div className="co-cell">
                      <div className="co-logo" style={{background: c.color}}>{c.initials}</div>
                      <div>
                        <div className="co-name">{c.name}</div>
                        <div className="co-meta">{c.sector} · {c.amount}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="muted" style={{fontSize: 13}}>{c.stage}</span></td>
                  <td><StatusPill status={c.status} /></td>
                  <td style={{width: 160}}>
                    <div style={{display: "flex", alignItems: "center", gap: 10}}>
                      <div className="score-bar" style={{width: 90}}>
                        <div style={{
                          width: c.progress + "%",
                          background: c.progress === 100 ? "var(--halo-mint)" : c.status === "overdue" ? "var(--halo-red)" : "var(--halo-amber)"
                        }} />
                      </div>
                      <span className="mono" style={{fontSize: 12, color: "var(--halo-text-2)", fontWeight: 600}}>{c.progress}%</span>
                    </div>
                  </td>
                  <td>
                    {c.score !== null ? (
                      <span style={{display: "inline-flex", alignItems: "center", gap: 8}}>
                        <span className="mono" style={{fontSize: 15, fontWeight: 700, color: c.score >= 70 ? "#1B7C5E" : c.score >= 60 ? "#8E5F18" : "#9F2D2D"}}>{c.score}</span>
                        <span style={{fontSize: 11, color: "var(--halo-text-3)"}}>/100</span>
                      </span>
                    ) : <span className="muted" style={{fontSize: 13}}>—</span>}
                  </td>
                  <td>
                    <div style={{display: "flex", alignItems: "center", gap: 8}}>
                      <div style={{width: 26, height: 26, borderRadius: "50%", background: "#E6E7F4", color: "#45489B", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700}}>
                        {c.spoc.split(" ").map(n => n[0]).slice(0,2).join("")}
                      </div>
                      <span style={{fontSize: 13}}>{c.spoc.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td><span className="mono muted" style={{fontSize: 12}}>{c.submitted}</span></td>
                  <td style={{width: 40}}><Icon name="chev" size={14} color="#8B91AB" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 22}}>
          <div className="card">
            <div className="card-h">
              <div>
                <h3>Activity this week</h3>
                <div className="sub">Reviews completed, surveys submitted, flags raised</div>
              </div>
            </div>
            <div style={{padding: "0 24px 22px"}}>
              {[
                { ic: "check", color: "#22C28F", bg: "#DCF5EB", who: "Krishti", what: "approved Naturohabit's ESG report — score 82.1", time: "2h ago" },
                { ic: "send",  color: "#0F2150", bg: "#E6E7F4", who: "Akshat",  what: "sent survey link to Slaash / Flent", time: "5h ago" },
                { ic: "flag",  color: "#E25C5C", bg: "#FBE3E3", who: "Krishti", what: "flagged 3 governance concerns on Krvvy Foods", time: "Yesterday" },
                { ic: "file",  color: "#8E5F18", bg: "#FBF1DE", who: "Vikram",  what: "uploaded supporting docs for WeRize WFin", time: "Yesterday" },
                { ic: "check", color: "#22C28F", bg: "#DCF5EB", who: "Krishti", what: "approved Ather Energy's renewal assessment", time: "2 days ago" },
              ].map((a, i) => (
                <div key={i} style={{display: "flex", gap: 12, padding: "11px 0", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}>
                  <div style={{width: 28, height: 28, borderRadius: 8, background: a.bg, color: a.color, display: "grid", placeItems: "center", flexShrink: 0}}>
                    <Icon name={a.ic} size={14} />
                  </div>
                  <div style={{flex: 1, fontSize: 13}}>
                    <strong>{a.who}</strong> <span style={{color: "var(--halo-text-2)"}}>{a.what}</span>
                  </div>
                  <span className="muted" style={{fontSize: 12, whiteSpace: "nowrap"}}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <div>
                <h3>Score distribution by sector</h3>
                <div className="sub">Average ESG score across active deals</div>
              </div>
              <span className="muted mono" style={{fontSize: 12}}>n=12</span>
            </div>
            <div style={{padding: "0 24px 22px"}}>
              {[
                { s: "Consumer / D2C",       n: 4, avg: 71.4, w: 71 },
                { s: "Fintech / Lending",    n: 2, avg: 75.9, w: 76 },
                { s: "B2B SaaS",             n: 2, avg: 65.8, w: 66 },
                { s: "Mobility / Cleantech", n: 1, avg: 76.9, w: 77 },
                { s: "Agritech",             n: 1, avg: 68.0, w: 68 },
                { s: "NBFC / Consumer",      n: 2, avg: 71.2, w: 71 },
              ].map((r, i) => (
                <div key={i} style={{padding: "10px 0"}}>
                  <div style={{display: "flex", justifyContent: "space-between", marginBottom: 6}}>
                    <span style={{fontSize: 13, fontWeight: 500}}>{r.s} <span className="muted" style={{fontWeight: 400, fontSize: 12}}>· {r.n}</span></span>
                    <span className="mono" style={{fontSize: 13, fontWeight: 700}}>{r.avg}</span>
                  </div>
                  <div className="score-bar">
                    <div style={{width: r.w + "%", background: r.avg >= 70 ? "var(--halo-mint)" : r.avg >= 60 ? "var(--halo-amber)" : "var(--halo-red)"}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.Overview = Overview;
