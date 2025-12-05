import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FiHome, FiUsers, FiAward, FiBarChart2, FiSettings,
  FiLogOut, FiMenu, FiX, FiBell, FiSearch, FiMoon, FiSun
} from 'react-icons/fi';
import './Layout.css';

const Layout = ({ children, role = 'admin' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true'
  );

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = role === 'admin' ? [
    { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FiUsers, label: 'Équipes', path: '/admin/teams' },
    { icon: FiAward, label: 'Classement', path: '/admin/leaderboard' },
    { icon: FiBarChart2, label: 'Statistiques', path: '/admin/stats' },
    { icon: FiSettings, label: 'Paramètres', path: '/admin/settings' },
  ] : [
    { icon: FiHome, label: 'Dashboard', path: '/leader/dashboard' },
    { icon: FiUsers, label: 'Mes équipes', path: '/leader/teams' },
    { icon: FiAward, label: 'Classement', path: '/leader/leaderboard' },
  ];

  return (
    <div className={`layout ${darkMode ? 'dark' : ''}`}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🏆 Podium</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
              >
                <Icon />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <button
            className="nav-item"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
            <span className="nav-label">Mode {darkMode ? 'clair' : 'sombre'}</span>
          </button>
          <button
            className="nav-item logout"
            onClick={handleLogout}
            aria-label="Déconnexion"
          >
            <FiLogOut />
            <span className="nav-label">Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="navbar">
          <div className="navbar-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <FiMenu />
            </button>
          </div>
          <div className="navbar-right">
            <div className="user-menu">
              <span className="username">{user?.username}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
        </header>

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

