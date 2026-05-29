import { Link } from '@tanstack/react-router';

const NAV_LINKS = [
  { to: '/' as const,            label: 'Game',        exact: true },
  { to: '/discuss' as const,     label: 'Discuss',     exact: false },
  { to: '/leaderboard' as const, label: 'Leaderboard', exact: false },
  { to: '/profile' as const,     label: 'Profile',     exact: false },
  { to: '/contribute' as const,  label: 'Contribute',  exact: false },
];

export default function Navbar() {
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="brand-dot" />
        NOBOT
      </Link>

      <nav className="nav">
        {NAV_LINKS.map(({ to, label, exact }) => (
          <Link
            key={to}
            to={to}
            className="nav-btn"
            activeProps={{ className: 'nav-btn active' }}
            activeOptions={{ exact }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
