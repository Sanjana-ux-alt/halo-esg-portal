// HALO ESG — Final Report

const Report = ({ companyId, embedded }) => {
  const co = window.HALO_ESG.COMPANIES.find(c => c.id === (companyId || "wer")) || window.HALO_ESG.COMPANIES[0];
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
        {/* Hero — compact */}
        <div className="card" style={{padding: "20px 24px", borderTop: "3px solid var(--halo-mint)", marginBottom: 18}}>
          <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24}}>
            <div style={{display: "flex", alignItems: "center", gap: 14}}>
              <div>
                <div style={{fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--halo-text-3)", fontWeight: 700}}>Score</div>
                <div className="mono" style={{fontSize: 30, fontWeight: 700, color: "#1B7C5E", letterSpacing: "-0.02em", lineHeight: 1.1}}>78.4 <span style={{fontSize: 14, color: "var(--halo-text-3)", fontWeight: 500}}>/100</span></div>
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

        {/* Pillar tiles */}
        <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, margin: "22px 0"}}>
          {[
            { p: "Environment", v: 26.2, m: 35, c: "#22C28F", note: "Strong renewable mix; Scope 3 disclosure pending" },
            { p: "Social",      v: 28.1, m: 35, c: "#6B6FBF", note: "Above-sector diversity; POSH compliant" },
            { p: "Governance",  v: 24.1, m: 30, c: "#E8A33D", note: "Independent directors present; whistleblower active" },
          ].map(p => (
            <div key={p.p} className="pillar-tile">
              <Ring value={p.v} max={p.m} color={p.c} size={84} stroke={11} track="#EEF0F6" />
              <div>
                <div className="label">{p.p}</div>
                <div><span className="v mono">{p.v}</span><span className="max"> / {p.m}</span></div>
                <div style={{fontSize: 11, color: "var(--halo-text-3)", marginTop: 4, lineHeight: 1.45}}>{p.note}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements */}
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16}}>
          <div className="card card-pad" style={{borderLeft: "3px solid var(--halo-mint)"}}>
            <h3 style={{margin: "0 0 12px", fontSize: 15}}>Top strengths</h3>
            {[
              "Renewable energy at 22% — top quartile for sector",
              "Independent directors on board (2 of 7 seats)",
              "Pay-equity audit completed in last 12 months",
              "Active whistleblower hotline with third-party admin",
            ].map((s,i) => (
              <div key={i} style={{display: "flex", gap: 10, padding: "8px 0", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}>
                <Icon name="check" size={15} color="#22C28F" stroke={2.5} />
                <span style={{fontSize: 13, color: "var(--halo-text-2)"}}>{s}</span>
              </div>
            ))}
          </div>
          <div className="card card-pad" style={{borderLeft: "3px solid var(--halo-amber)"}}>
            <h3 style={{margin: "0 0 12px", fontSize: 15}}>Priority improvements</h3>
            {[
              "Disclose Scope 3 emissions by next quarter",
              "Tighten gender pay gap (currently 4.8%, widening)",
              "Expand supplier ESG audits beyond top-tier vendors",
              "Publish board-level diversity tracking publicly",
            ].map((s,i) => (
              <div key={i} style={{display: "flex", gap: 10, padding: "8px 0", borderTop: i ? "1px solid var(--halo-line-2)" : "none"}}>
                <Icon name="flag" size={14} color="#E8A33D" />
                <span style={{fontSize: 13, color: "var(--halo-text-2)"}}>{s}</span>
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
                <th style={{paddingLeft: 24}}>Company</th>
                <th>Stage</th>
                <th>E</th>
                <th>S</th>
                <th>G</th>
                <th>Total</th>
                <th>Δ vs avg</th>
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
                  <td className="mono">{r.e}</td>
                  <td className="mono">{r.so}</td>
                  <td className="mono">{r.g}</td>
                  <td className="mono" style={{fontWeight: 700}}>{r.t}</td>
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
              { p: "High", c: "#E25C5C", bg: "#FBE3E3", t: "Publish Scope 3 emissions inventory", b: "Engage a third-party verifier (CDP, Greenly) to baseline Scope 3 across borrowers and operations.", impact: "+3.2 pts", time: "Q3 FY26" },
              { p: "Medium", c: "#E8A33D", bg: "#FBF1DE", t: "Close gender pay gap to under 2%", b: "Roll out structured pay bands and run a remediation review at the next merit cycle.", impact: "+2.4 pts", time: "Q4 FY26" },
              { p: "Medium", c: "#6B6FBF", bg: "#E6E7F4", t: "Expand supplier ESG audit coverage", b: "Onboard top 50 suppliers (currently 18) to a self-assessment + spot-check program.", impact: "+1.8 pts", time: "FY27 H1" },
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
              { r: "Reviewed by", n: "Krishti Sharma", role: "Head of ESG", d: "Apr 29, 2026", s: "completed" },
              { r: "Approved by", n: "Akshat Gautam",  role: "Deal Partner", d: "May 2, 2026", s: "completed" },
              { r: "Acknowledged", n: "Vikram Jain",   role: "Founder, WeRize", d: "Pending", s: "in-progress" },
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
      </div>
    </div>
  );
};

window.Report = Report;
