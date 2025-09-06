import React from 'react';
import './ConnectWallet.css';

const ConnectWallet = ({ onConnect, networkError, onSwitchNetwork, onBack }) => {
  const walletOptions = [
    { name: 'Connect Wallet : METAMASK', icon: '🦊', primary: true }
  ];

  const features = [
    {
      icon: '🔐',
      title: 'User-Controlled Storage',
      description: 'Only you control your files.'
    },
    {
      icon: '🌍',
      title: 'Transparent Sharing',
      description: 'Share files publicly or privately on-chain.'
    },
    {
      icon: '🔗',
      title: 'Immutable Records',
      description: 'Every action is permanently recorded.'
    },
    {
      icon: '⚡',
      title: 'Verifiable Access',
      description: 'No hidden backdoors, access is cryptographically enforced.'
    }
  ];

  return (
    <div className="connect-wallet-page">
      {/* Background animation layers */}
      <div className="connect-wallet-bg"></div>
      <div className="connect-wallet-bg2"></div>
      <div className="connect-wallet-bg3"></div>

      {/* Back button */}
      <div className="connect-header-bar">
        <button className="back-to-landing" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Back to Landing
        </button>
      </div>

      {/* Main container */}
      <div className="connect-container">
        {/* Left panel */}
        <div className="connect-left">
          <div className="connect-header">
            <h2>Connect Your Wallet</h2>
            <p>Storium uses your wallet as your secure login and file owner identity.</p>
          </div>

          <div className="metamask-warning">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <h4>MetaMask Required</h4>
              <p>MetaMask browser extension must be installed to use STORIUM. Please install MetaMask before proceeding.</p>
              <a 
                href="https://metamask.io/download/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="install-metamask-btn"
              >
                Install MetaMask
              </a>
            </div>
          </div>

          {networkError && (
            <div className="network-warning">
              <div className="warning-icon">⚠️</div>
              <p>Please switch to Sepolia testnet to continue</p>
              <button className="switch-network-btn" onClick={onSwitchNetwork}>
                SWITCH TO SEPOLIA
              </button>
            </div>
          )}

          <div className="wallet-options">
            {walletOptions.map((wallet) => (
              <button
                key={wallet.name}
                className={`wallet-btn ${wallet.primary ? 'primary' : ''} ${wallet.disabled ? 'disabled' : ''}`}
                onClick={wallet.primary ? onConnect : undefined}
                disabled={wallet.disabled}
              >
                <span className="wallet-icon">{wallet.icon}</span>
                <span className="wallet-name">{wallet.name}</span>
                {wallet.disabled && <span className="coming-soon">Coming Soon</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="connect-right">
          <h3>Why Connect Your Wallet?</h3>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="connect-credits">
        Created by <span className="creator">Lies_Of_Code</span>
      </div>
    </div>
  );
}

export default ConnectWallet;
