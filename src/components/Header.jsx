import React from 'react';
import './Header.css';

const Header = ({ account, connected, activeTab, setActiveTab, onLogout }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '⬆️' },
    { id: 'files', label: 'My Files', icon: '📁' },
    { id: 'explore', label: 'Explore', icon: '🌐' },
    { id: 'share', label: 'Share', icon: '🤝' },
  ];

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
          <h1>STORIUM</h1>
        </div>

        {connected && (
          <nav className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        )}

        <div className="account-section">
          {connected ? (
            <>
              <div className="user-details">
                <div className="address-circle">
                  <span className="account-address">{formatAddress(account)}</span>
                </div>
                <div className="connection-status">
                  <div className="status-indicator"></div>
                  <span>Connected</span>
                </div>
              </div>
              <button className="logout-btn small" onClick={onLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" />
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" />
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <div className="not-connected">
              <span>Not Connected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;