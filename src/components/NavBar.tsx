import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Check-in' },
  { to: '/roster', label: 'Roster' },
  { to: '/matrix', label: 'Matrix' }
];

export function NavBar() {
  return (
    <nav className="nav-bar">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
