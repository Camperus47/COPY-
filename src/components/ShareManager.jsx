import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './ShareManager.css'

const ShareManager = ({ contract, account }) => {
  const [accessList, setAccessList] = useState([])
  const [loading, setLoading] = useState(false)
  const [newAddress, setNewAddress] = useState("")
  const [granting, setGranting] = useState(false)
  const [fileAccessList, setFileAccessList] = useState([])
  const [loadingFileAccess, setLoadingFileAccess] = useState(false)

  const loadAccessList = async () => {
    setLoading(true)
    try {
      const addressList = await contract.shareAccess()
      setAccessList(addressList)
    } catch (error) {
      console.error("Error loading access list:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadFileAccessList = async () => {
    setLoadingFileAccess(true)
    try {
      const fileAccesses = await contract.getFileAccessList()
      const formattedFileAccesses = fileAccesses.map(access => ({
        fileId: parseInt(access.fileId.toString()),
        user: access.user,
        hasAccess: access.hasAccess
      }))
      setFileAccessList(formattedFileAccesses)
    } catch (error) {
      console.error("Error loading file access list:", error)
    } finally {
      setLoadingFileAccess(false)
    }
  }
  const grantAccess = async () => {
    if (!newAddress.trim()) {
      alert("Please enter a valid address")
      return
    }

    if (!ethers.utils.isAddress(newAddress)) {
      alert("Please enter a valid Ethereum address")
      return
    }

    setGranting(true)
    try {
      await contract.allow(newAddress)
      alert("Access granted successfully!")
      setNewAddress("")
      loadAccessList()
    } catch (error) {
      console.error("Error granting access:", error)
      alert("Failed to grant access. Please try again.")
    } finally {
      setGranting(false)
    }
  }

  const revokeAccess = async (userAddress) => {
    if (!window.confirm("Are you sure you want to revoke access for this user?")) {
      return
    }

    try {
      await contract.disallow(userAddress)
      alert("Access revoked successfully!")
      loadAccessList()
    } catch (error) {
      console.error("Error revoking access:", error)
      alert("Failed to revoke access. Please try again.")
    }
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  useEffect(() => {
    if (contract) {
      loadAccessList()
      loadFileAccessList()
    }
  }, [contract])

  const groupFileAccessByUser = () => {
    const grouped = {}
    fileAccessList.forEach(access => {
      if (access.hasAccess) {
        if (!grouped[access.user]) {
          grouped[access.user] = []
        }
        grouped[access.user].push(access.fileId)
      }
    })
    return grouped
  }
  return (
    <div className="share-manager">
      <div className="share-header">
        <div className="header-content">
          <div className="header-icon">🤝</div>
          <div>
            <h2>Share Management</h2>
            <p className="share-description">
              Grant or revoke file access to other users
            </p>
          </div>
        </div>
      </div>

      <div className="grant-section">
        <div className="section-card">
          <h3>Grant Access</h3>
          <p>Enter a wallet address to give them access to your files</p>
          
          <div className="input-group">
            <input
              type="text"
              className="address-input"
              placeholder="0x... wallet address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <button 
              className="grant-btn"
              onClick={grantAccess}
              disabled={granting || !newAddress.trim()}
            >
              {granting ? (
                <>
                  <div className="btn-spinner"></div>
                  Granting...
                </>
              ) : (
                'Grant Access'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="access-list-section">
        <div className="section-card">
          <h3>Current Access List</h3>
          
          {loading ? (
            <div className="loading-access">
              <div className="access-spinner"></div>
              <p>Loading access list...</p>
            </div>
          ) : accessList.length > 0 ? (
            <div className="access-list">
              {accessList.map((item, index) => (
                <div key={index} className="access-item">
                  <div className="access-info">
                    <span className="address-display">
                      {formatAddress(item.user)}
                    </span>
                    <span className={`status ${item.access ? 'active' : 'revoked'}`}>
                      {item.access ? 'Active' : 'Revoked'}
                    </span>
                  </div>
                  {item.access && (
                    <button
                      className="revoke-btn"
                      onClick={() => revokeAccess(item.user)}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-access">
              <div className="no-access-icon">🔒</div>
              <h4>No access granted yet</h4>
              <p>Grant access to other users to share your files</p>
            </div>
          )}
        </div>
      </div>

      <div className="access-list-section">
        <div className="section-card">
          <h3>Selective File Access</h3>
          <p>Files shared with specific users</p>
          
          {loadingFileAccess ? (
            <div className="loading-access">
              <div className="access-spinner"></div>
              <p>Loading file access list...</p>
            </div>
          ) : (() => {
            const groupedAccess = groupFileAccessByUser()
            const userAddresses = Object.keys(groupedAccess)
            
            return userAddresses.length > 0 ? (
              <div className="file-access-list">
                {userAddresses.map((userAddress, index) => (
                  <div key={index} className="file-access-item">
                    <div className="access-user-info">
                      <span className="user-address">
                        {formatAddress(userAddress)}
                      </span>
                      <span className="file-count">
                        {groupedAccess[userAddress].length} file(s)
                      </span>
                    </div>
                    <div className="file-ids">
                      {groupedAccess[userAddress].map((fileId, fileIndex) => (
                        <span key={fileIndex} className="file-id-badge">
                          File #{fileId}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-file-access">
                <div className="no-access-icon">📁</div>
                <h4>No selective file access granted</h4>
                <p>Use the file manager to grant access to specific files</p>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default ShareManager