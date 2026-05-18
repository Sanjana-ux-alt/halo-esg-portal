/* login.jsx — HALO ESG Login Screen
   React 18 + Babel standalone (no imports).
   Mount: window.LoginScreen
*/

function LoginScreen({ onLogin }) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [emailFocused, setEmailFocused] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);
  const [btnHovered, setBtnHovered] = React.useState(false);

  const USERS = [
    { email: 'esg@stride.vc',  password: 'demo', role: 'esg',  name: 'Krishti Sharma' },
    { email: 'deal@stride.vc', password: 'demo', role: 'deal', name: 'Niranjan Rathi' },
    { email: 'risk@stride.vc', password: 'demo', role: 'risk', name: 'Ananya Mehta'   },
  ];

  function handleSubmit(e) {
    e.preventDefault();
    const match = USERS.find(
      u => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (match) {
      setError('');
      onLogin(match.role, match.name);
    } else {
      setError('Invalid email or password. Try the demo quick access below.');
    }
  }

  function quickLogin(role) {
    const u = USERS.find(u => u.role === role);
    if (u) onLogin(u.role, u.name);
  }

  /* ---- styles ---- */
  const s = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0B1A3F 0%, #0F2150 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: '"Figtree", "Inter", system-ui, -apple-system, sans-serif',
    },
    card: {
      width: '100%',
      maxWidth: '420px',
      background: '#FFFFFF',
      borderRadius: '16px',
      padding: '36px 36px 32px',
      boxShadow: '0 24px 60px rgba(7,18,43,0.35), 0 4px 16px rgba(7,18,43,0.20)',
    },
    strideLabel: {
      display: 'block',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: '#22C28F',
      marginBottom: '6px',
    },
    haloTitle: {
      fontSize: '32px',
      fontWeight: 800,
      color: '#0B1A3F',
      lineHeight: 1.1,
      margin: '0 0 8px',
      letterSpacing: '-0.5px',
    },
    subtitle: {
      fontSize: '13px',
      color: '#5C6485',
      margin: '0 0 28px',
      lineHeight: 1.5,
    },
    fieldWrap: {
      marginBottom: '14px',
    },
    label: {
      display: 'block',
      fontSize: '12px',
      fontWeight: 600,
      color: '#1F2440',
      marginBottom: '5px',
      letterSpacing: '0.02em',
    },
    input: (focused) => ({
      display: 'block',
      width: '100%',
      padding: '10px 13px',
      fontSize: '14px',
      color: '#1F2440',
      background: focused ? '#FAFBFF' : '#F4F6FA',
      border: focused ? '1.5px solid #22C28F' : '1.5px solid #E6E8F0',
      borderRadius: '9px',
      outline: 'none',
      transition: 'border-color 0.15s, background 0.15s',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    }),
    errorMsg: {
      marginTop: '8px',
      fontSize: '12px',
      color: '#E25C5C',
      background: '#FBE3E3',
      border: '1px solid #F4B8B8',
      borderRadius: '7px',
      padding: '7px 10px',
      lineHeight: 1.45,
    },
    signInBtn: (hovered) => ({
      display: 'block',
      width: '100%',
      marginTop: '20px',
      padding: '12px',
      background: hovered ? '#1AAD7E' : '#22C28F',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '9px',
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '0.03em',
      cursor: 'pointer',
      transition: 'background 0.15s',
      fontFamily: 'inherit',
    }),
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: '24px 0 16px',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#E6E8F0',
    },
    dividerLabel: {
      fontSize: '11px',
      fontWeight: 600,
      color: '#8B91AB',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    },
    quickRow: {
      display: 'flex',
      gap: '8px',
    },
    quickBtn: (color, bg) => ({
      flex: 1,
      padding: '8px 4px',
      background: bg,
      color: color,
      border: `1.5px solid ${color}22`,
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit',
      letterSpacing: '0.02em',
      transition: 'opacity 0.12s',
      textAlign: 'center',
    }),
    footerText: {
      marginTop: '20px',
      fontSize: '11px',
      color: 'rgba(255,255,255,0.35)',
      textAlign: 'center',
      letterSpacing: '0.02em',
    },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Header */}
        <span style={s.strideLabel}>Stride Ventures</span>
        <h1 style={s.haloTitle}>HALO ESG</h1>
        <p style={s.subtitle}>ESG Assessment &amp; Monitoring Platform</p>

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={s.fieldWrap}>
            <label style={s.label} htmlFor="halo-email">Email</label>
            <input
              id="halo-email"
              type="email"
              value={email}
              placeholder="you@stride.vc"
              autoComplete="username"
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              style={s.input(emailFocused)}
              required
            />
          </div>

          <div style={s.fieldWrap}>
            <label style={s.label} htmlFor="halo-password">Password</label>
            <input
              id="halo-password"
              type="password"
              value={password}
              placeholder="••••••••"
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              style={s.input(passwordFocused)}
              required
            />
            {error && <div style={s.errorMsg}>{error}</div>}
          </div>

          <button
            type="submit"
            style={s.signInBtn(btnHovered)}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
          >
            Sign in
          </button>
        </form>

        {/* Demo quick access */}
        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerLabel}>Demo quick access</span>
          <div style={s.dividerLine} />
        </div>

        <div style={s.quickRow}>
          <button
            style={s.quickBtn('#6B6FBF', '#F0F0FB')}
            onClick={() => quickLogin('deal')}
            title="Sign in as Niranjan Rathi (Deal Team)"
          >
            Deal Team
          </button>
          <button
            style={s.quickBtn('#22C28F', '#F0FBF7')}
            onClick={() => quickLogin('esg')}
            title="Sign in as Krishti Sharma (ESG Team)"
          >
            ESG Team
          </button>
          <button
            style={s.quickBtn('#E25C5C', '#FBF0F0')}
            onClick={() => quickLogin('risk')}
            title="Sign in as Ananya Mehta (Risk Team)"
          >
            Risk Team
          </button>
        </div>

      </div>

      <p style={s.footerText}>Confidential — Stride Ventures Internal Platform</p>
    </div>
  );
}

window.LoginScreen = LoginScreen;
