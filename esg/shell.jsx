// HALO ESG — Sidebar + Header band shell

const Sidebar = ({ active }) => (
  <aside className="sidebar">
    <div className="brand">
      <div className="brand-mark">H</div>
      <div className="brand-text">
        <div className="n">HALO</div>
        <div className="s">Stride Ventures</div>
      </div>
    </div>

    <div className="me">
      <div className="av">KS</div>
      <div>
        <div className="who">Krishti Sharma</div>
        <div className="role">Head of ESG</div>
      </div>
    </div>

    <div className="nav-group">Workspace</div>
    <a className="nav-item" href="#"><Icon name="grid" />Dashboard</a>
    <a className="nav-item" href="#"><Icon name="pipe" />Pipeline</a>
    <a className="nav-item" href="#"><Icon name="erp" />Deal Room</a>
    <a className="nav-item" href="#"><Icon name="chart" />Analytics</a>

    <div className="nav-group">ESG Module</div>
    <a className={"nav-item active"} href="#" onClick={(e)=>e.preventDefault()}>
      <Icon name="leaf" />ESG Portal
      <span className="nav-tag">LIVE</span>
    </a>

    <div className="nav-group">Account</div>
    <a className="nav-item" href="#"><Icon name="shield" />Settings</a>
    <a className="nav-item" href="#"><Icon name="help" />Help</a>

    <div className="collapse-btn">
      <Icon name="arrowback" size={14} />Collapse sidebar
    </div>
  </aside>
);

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
