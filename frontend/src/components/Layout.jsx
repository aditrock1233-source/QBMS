import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const navItemsByRole = {
  faculty: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/questions', label: 'Question Bank' },
    { to: '/questions/add', label: 'Add Question' },
    { to: '/papers', label: 'Question Papers' },
    { to: '/analytics', label: 'Analytics' },
  ],
  hod: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/approvals', label: 'Pending Approvals' },
    { to: '/questions', label: 'Question Bank' },
    { to: '/papers', label: 'Question Papers' },
    { to: '/analytics', label: 'Analytics' },
  ],
  examcell: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/papers', label: 'Question Papers' },
    { to: '/papers/generate', label: 'Generate Paper' },
    { to: '/analytics', label: 'Analytics' },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/questions', label: 'Question Bank' },
    { to: '/questions/add', label: 'Add Question' },
    { to: '/approvals', label: 'Pending Approvals' },
    { to: '/papers', label: 'Question Papers' },
    { to: '/papers/generate', label: 'Generate Paper' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/departments', label: 'Departments' },
  ],
};

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = navItemsByRole[user?.role] || navItemsByRole.faculty;
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">QBMS</div>

        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            <span className="theme-toggle__icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
          </button>

          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-meta">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <NotificationBell />
        </div>
        <Outlet />
      </main>
    </div>
  );
};
<p style={{ fontSize: 11, textAlign: 'center', color: 'var(--color-text-muted)', marginTop: 8 }}>
  Built with ❤️ by Team QBMS
</p>
export default Layout;
