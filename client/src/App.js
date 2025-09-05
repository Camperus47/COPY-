import GlobalStorage from "./artifacts/contracts/GlobalStorage.sol/GlobalStorage.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import FileManager from "./components/FileManager";
import PublicExplorer from "./components/PublicExplorer";
import UserProfile from "./components/UserProfile";
import Modal from "./components/Modal";
import Header from "./components/Header";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const loadProvider = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });

        try {
          await provider.send("eth_requestAccounts", []);
          const signer = provider.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
          
          // Update this with your deployed contract address
          let contractAddress = "0x4ae88b1a70912b9728a503dca835730cb001fae9";

          const contract = new ethers.Contract(
            contractAddress,
            GlobalStorage.abi,
            signer
          );
          
          setContract(contract);
          setProvider(provider);
          setConnected(true);
          
          // Load user profile
          try {
            const profile = await contract.getUser(address);
            if (profile.username) {
              setUserProfile(profile);
            }
          } catch (error) {
            console.log("User not registered yet");
          }
        } catch (error) {
          console.error("Failed to connect to wallet:", error);
        }
      } else {
        console.error("Metamask is not installed");
      }
      setLoading(false);
    };
    
    loadProvider();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Connecting to wallet...</p>
      </div>
    );
  }

  return (
    <>
      {!modalOpen && connected && (
        <button className="floating-btn" onClick={() => setModalOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M16 6l2.29 2.29a4.25 4.25 0 0 1 0 6L16 16.58" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 6l-2.29 2.29a4.25 4.25 0 0 1 0 6L8 16.58" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      )}
      
      {modalOpen && (
        <Modal setModalOpen={setModalOpen} contract={contract} />
      )}

      <div className="app">
        <Header 
          account={account} 
          connected={connected} 
          userProfile={userProfile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        <main className="main-content">
          {connected ? (
            <>
              {activeTab === "upload" && (
                <FileUpload
                  account={account}
                  provider={provider}
                  contract={contract}
                />
              )}
              
              {activeTab === "files" && (
                <FileManager contract={contract} account={account} />
              )}
              
              {activeTab === "explore" && (
                <PublicExplorer contract={contract} account={account} />
              )}
              
              {activeTab === "profile" && (
                <UserProfile 
                  contract={contract} 
                  account={account}
                  userProfile={userProfile}
                  setUserProfile={setUserProfile}
                />
              )}
            </>
          ) : (
            <div className="connect-wallet">
              <div className="connect-icon">🚀</div>
              <h2>Initialize Neural Link</h2>
              <p>Connect your quantum wallet to access the global storage matrix</p>
              <div className="tech-specs">
                <div className="spec-item">
                  <span className="spec-label">Protocol:</span>
                  <span className="spec-value">Ethereum Blockchain</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Storage:</span>
                  <span className="spec-value">IPFS Distributed Network</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Security:</span>
                  <span className="spec-value">Quantum-Resistant Encryption</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default App;