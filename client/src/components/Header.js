import React from 'react';
import './Header.css';

const Header = ({ account, connected, userProfile, activeTab, setActiveTab }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '⬆️' },
    { id: 'files', label: 'My Files', icon: '📁' },
    { id: 'explore', label: 'Explore', icon: '🌐' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h1>GlobalVault</h1>
        </div>
        
        {connected && (
          <nav className="nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        )}
        
        <div className="account-section">
          {connected ? (
            <div className="account-info">
              {userProfile?.avatar && (
                <div className="user-avatar">
                  {userProfile.avatar}
                </div>
              )}
              <div className="user-details">
                {userProfile?.username ? (
                  <span className="username">{userProfile.username}</span>
                ) : (
                  <span className="account-address">{formatAddress(account)}</span>
                )}
                <div className="connection-status">
                  <div className="status-indicator"></div>
                  <span>Neural Link Active</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="not-connected">
              <span>Neural Link Offline</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;