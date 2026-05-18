// HALO ESG — Sidebar + Header band shell

const ROLE_META = {
  esg:  { label: "ESG Team",   title: "Head of ESG",           initials: "KS" },
  deal: { label: "Deal Team",  title: "Investment Associate",  initials: "NR" },
  risk: { label: "Risk Team",  title: "Risk Analyst",          initials: "AM" },
};

const Sidebar = ({ active, role, userName }) => {
  const r = role || 'esg';
  const meta = ROLE_META[r] || ROLE_META.esg;
  const displayName = userName || meta.label;
  const rolePillColor = r === 'esg' ? '#22C28F' : r === 'deal' ? '#6B6FBF' : '#E25C5C';
  const perms = window.HALO_PERMS || {};

  return (
  <aside className="sidebar">
    <div className="brand">
      <div className="brand-mark">H</div>
      <div className="brand-text">
        <div className="n">HALO</div>
        <div className="s">Stride Ventures</div>
      </div>
    </div>

    <div className="me">
      <div className="av" style={{background: rolePillColor}}>{meta.initials}</div>
      <div style={{flex:1,minWidth:0}}>
        <div className="who" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{displayName}</div>
        <div className="role" style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:rolePillColor,flexShrink:0}} />
          {meta.label}
        </div>
      </div>
    </div>

    <div className="nav-group">Workspace</div>
    <a className="nav-item" href="#"><Icon name="grid" />Dashboard</a>
    {r !== 'risk' && <a className="nav-item" href="#"><Icon name="pipe" />Pipeline</a>}
    <a className="nav-item" href="#"><Icon name="erp" />Deal Room</a>
    <a className="nav-item" href="#"><Icon name="chart" />Analytics</a>

    <div className="nav-group">ESG Module</div>
    <a className={"nav-item active"} href="#" onClick={(e)=>e.preventDefault()}>
      <Icon name="leaf" />ESG Portal
      <span className="nav-tag">LIVE</span>
    </a>
    {perms.canSend && (
      <a className="nav-item" href="#" onClick={(e)=>{e.preventDefault();window.HALO_NAV("send");}}>
        <Icon name="send" />Send Survey
      </a>
    )}

    <div className="nav-group">Account</div>
    <a className="nav-item" href="#"><Icon name="shield" />Settings</a>
    <a className="nav-item" href="#"><Icon name="help" />Help</a>
    <a className="nav-item" href="#" onClick={(e)=>{e.preventDefault();window.HALO_LOGOUT && window.HALO_LOGOUT();}}>
      <Icon name="out" />Sign out
    </a>
  </aside>
  );
};

const HeaderBand = ({ title, subtitle, actions, badge }) => (
  <div className="header-band">
    <div>
      <h1>
        {title}
        {badge && <span className="live-pill"><span className="dot" />{badge}</span>}
      </h1>
      {subtitle && <div className="sub">{subtitle}</div>}
    </div>
    <div className="header-actions">{actions}</div>
  </div>
);

Object.assign(window, { Sidebar, HeaderBand });
