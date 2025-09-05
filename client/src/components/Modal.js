import { useEffect, useState } from "react";
import "./Modal.css";

const Modal = ({ setModalOpen, contract }) => {
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(false);

  const sharing = async () => {
    const address = document.querySelector(".share-address").value.trim();
    
    if (!address) {
      alert("Please enter a valid address");
      return;
    }

    if (!ethers.utils.isAddress(address)) {
      alert("Please enter a valid Ethereum address");
      return;
    }

    setLoading(true);
    try {
      await contract.allow(address);
      alert("Access granted successfully!");
      setModalOpen(false);
      // Refresh access list
      loadAccessList();
    } catch (error) {
      console.error("Error granting access:", error);
      alert("Failed to grant access. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async (userAddress) => {
    setLoading(true);
    try {
      await contract.disallow(userAddress);
      alert("Access revoked successfully!");
      loadAccessList();
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Failed to revoke access. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadAccessList = async () => {
    try {
      const addressList = await contract.shareAccess();
      setAccessList(addressList);
    } catch (error) {
      console.error("Error loading access list:", error);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (contract) {
      loadAccessList();
    }
  }, [contract]);

  return (
    <div className="modal-background">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Manage File Access</h3>
          <button
            className="close-btn"
            onClick={() => setModalOpen(false)}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <div className="grant-access-section">
            <h4>Grant Access</h4>
            <p className="section-description">
              Enter a wallet address to give them access to your files
            </p>
            <div className="input-group">
              <input
                type="text"
                className="share-address"
                placeholder="0x... wallet address"
              />
              <button 
                className="grant-btn"
                onClick={sharing}
                disabled={loading}
              >
                {loading ? "Granting..." : "Grant Access"}
              </button>
            </div>
          </div>

          <div className="access-list-section">
            <h4>Current Access List</h4>
            {accessList.length > 0 ? (
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
                        disabled={loading}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-access">No access granted yet</p>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button
            className="cancel-btn"
            onClick={() => setModalOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;