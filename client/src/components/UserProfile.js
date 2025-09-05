import { useState, useEffect } from "react";
import "./UserProfile.css";

const UserProfile = ({ contract, account, userProfile, setUserProfile }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("🚀");
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const avatarOptions = ["🚀", "🤖", "👾", "🛸", "⚡", "🌟", "💎", "🔮", "🎯", "🎨"];

  const registerUser = async () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    setIsRegistering(true);
    try {
      await contract.registerUser(username.trim(), avatar);
      const newProfile = {
        username: username.trim(),
        avatar: avatar,
        totalFiles: 0,
        totalStorage: 0
      };
      setUserProfile(newProfile);
      alert("Profile created successfully!");
    } catch (error) {
      console.error("Error registering user:", error);
      if (error.message.includes("Username already exists")) {
        alert("Username already taken. Please choose another one.");
      } else {
        alert("Failed to create profile. Please try again.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const loadUserStats = async () => {
    setLoading(true);
    try {
      const profile = await contract.getUser(account);
      setUserStats({
        totalFiles: parseInt(profile.totalFiles.toString()),
        totalStorage: parseInt(profile.totalStorage.toString())
      });
    } catch (error) {
      console.error("Error loading user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  useEffect(() => {
    if (contract && account && userProfile) {
      loadUserStats();
    }
  }, [contract, account, userProfile]);

  if (!userProfile) {
    return (
      <div className="profile-container">
        <div className="registration-card">
          <div className="registration-header">
            <div className="header-icon">👤</div>
            <div>
              <h2>Initialize User Profile</h2>
              <p>Create your identity in the global network</p>
            </div>
          </div>

          <div className="registration-form">
            <div className="form-group">
              <label className="form-label">Choose Avatar</label>
              <div className="avatar-selector">
                {avatarOptions.map((emojiOption) => (
                  <button
                    key={emojiOption}
                    type="button"
                    className={`avatar-option ${avatar === emojiOption ? 'selected' : ''}`}
                    onClick={() => setAvatar(emojiOption)}
                  >
                    {emojiOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="username-input"
                placeholder="Enter unique username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
              />
            </div>

            <button
              className="register-btn"
              onClick={registerUser}
              disabled={isRegistering || !username.trim()}
            >
              {isRegistering ? (
                <>
                  <div className="btn-spinner"></div>
                  Initializing...
                </>
              ) : (
                'Create Profile'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {userProfile.avatar}
          </div>
          <div className="profile-info">
            <h2 className="profile-username">{userProfile.username}</h2>
            <p className="profile-address">{formatAddress(account)}</p>
            <div className="profile-status">
              <div className="status-dot"></div>
              <span>Neural Link Active</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-stats">
            <div className="stats-spinner"></div>
            <p>Loading profile data...</p>
          </div>
        ) : userStats && (
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-content">
                <span className="stat-number">{userStats.totalFiles}</span>
                <span className="stat-text">Files Uploaded</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">💾</div>
              <div className="stat-content">
                <span className="stat-number">{formatFileSize(userStats.totalStorage)}</span>
                <span className="stat-text">Storage Used</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🌐</div>
              <div className="stat-content">
                <span className="stat-number">∞</span>
                <span className="stat-text">Network Reach</span>
              </div>
            </div>
          </div>
        )}

        <div className="profile-features">
          <h3>Network Capabilities</h3>
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-content">
                <h4>Quantum Encryption</h4>
                <p>Files protected with advanced cryptographic protocols</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">🌍</div>
              <div className="feature-content">
                <h4>Global Distribution</h4>
                <p>Files replicated across the distributed IPFS network</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <div className="feature-content">
                <h4>Instant Access</h4>
                <p>Lightning-fast retrieval from nearest network nodes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;