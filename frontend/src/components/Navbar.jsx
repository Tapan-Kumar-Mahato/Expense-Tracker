import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Wallet, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  User
} from 'lucide-react';
import { authService } from '../services/authService';

export default function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    if (onLogout) onLogout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Budget', path: '/budget', icon: Wallet },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
  ];

  return (
    <nav className="navbar-container">
      <div className="navbar-brand">
        <div className="brand-logo">
          <CreditCard size={22} className="logo-icon" />
        </div>
        <span className="brand-name">ExpenseTrack</span>
      </div>

      <div className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="mobile-user-section">
          <div className="user-badge">
            <User size={16} />
            <span>{user?.name || 'User'}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-info-desktop">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-logout-desktop" title="Logout">
          <LogOut size={18} />
        </button>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <style>{`
        .navbar-container {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          padding: 0.85rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo {
          width: 36px;
          height: 36px;
          background: var(--primary-gradient);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
        }

        .brand-name {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.55rem 1rem;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
        }

        .nav-item:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          color: #fff;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-info-desktop {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-right: 0.75rem;
          border-right: 1px solid var(--border-color);
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.25);
          color: #c084fc;
          border: 1px solid rgba(192, 132, 252, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.2;
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .btn-logout-desktop {
          background: rgba(244, 63, 94, 0.1);
          color: #f43f5e;
          border: 1px solid rgba(244, 63, 94, 0.2);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-logout-desktop:hover {
          background: rgba(244, 63, 94, 0.25);
        }

        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-main);
          cursor: pointer;
        }

        .mobile-user-section {
          display: none;
        }

        @media (max-width: 850px) {
          .user-info-desktop, .btn-logout-desktop {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .nav-links {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            background: #0f172a;
            flex-direction: column;
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: none;
            gap: 0.75rem;
            align-items: stretch;
          }

          .nav-links.mobile-active {
            display: flex;
          }

          .mobile-user-section {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
          }

          .user-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--text-muted);
            font-size: 0.9rem;
          }

          .btn-logout {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1rem;
            background: rgba(244, 63, 94, 0.15);
            color: #f43f5e;
            border: 1px solid rgba(244, 63, 94, 0.3);
            border-radius: var(--radius-sm);
            font-weight: 600;
            cursor: pointer;
          }
        }
      `}</style>
    </nav>
  );
}
