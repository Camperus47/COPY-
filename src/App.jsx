import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import ConnectWallet from './components/ConnectWallet'
import FileUpload from './components/FileUpload'
import FileManager from './components/FileManager'
import PublicExplorer from './components/PublicExplorer'
import ShareManager from './components/ShareManager'
import ArrowAnimation from './components/ArrowAnimation'
import './App.css'

// Contract ABI
const CONTRACT_ABI = [
  "function addFile(string memory _fileName, string memory _fileType, string memory _ipfsHash, uint256 _fileSize, bool _isPublic, string memory _description, string[] memory _tags) external",
  "function getMyFiles() external view returns (tuple(string fileName, string fileType, string ipfsHash, uint256 fileSize, uint256 uploadTime, address owner, bool isPublic, string description, string[] tags)[])",
  "function getPublicFiles() external view returns (tuple(string fileName, string fileType, string ipfsHash, uint256 fileSize, uint256 uploadTime, address owner, bool isPublic, string description, string[] tags)[])",
  "function getUserFiles(address _user) external view returns (tuple(string fileName, string fileType, string ipfsHash, uint256 fileSize, uint256 uploadTime, address owner, bool isPublic, string description, string[] tags)[])",
  "function allow(address user) external",
  "function disallow(address user) external",
  "function shareAccess() external view returns (tuple(address user, bool access)[])",
  "function deleteFile(uint256 _fileId) external",
  "function grantFileAccess(uint256 _fileId, address _user) external",
  "function revokeFileAccess(uint256 _fileId, address _user) external",
  "function getFileAccessList() external view returns (tuple(uint256 fileId, address user, bool hasAccess)[])",
  "function hasFileAccess(uint256 _fileId, address _user) external view returns (bool)",
  "event FileUploaded(address indexed user, uint256 indexed fileId, string fileName, string ipfsHash)",
  "event AccessGranted(address indexed owner, address indexed user)",
  "event FileDeleted(address indexed user, uint256 indexed fileId)",
  "event FileAccessGranted(address indexed owner, address indexed user, uint256 indexed fileId)",
  "event FileAccessRevoked(address indexed owner, address indexed user, uint256 indexed fileId)"
]

// Sepolia testnet configuration
const SEPOLIA_CHAIN_ID = '0xaa36a7'
const SEPOLIA_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID,
  chainName: 'Sepolia Test Network',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.infura.io/v3/'],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
}

function App() {
  const [account, setAccount] = useState("")
  const [contract, setContract] = useState(null)
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")
  const [contractAddress, setContractAddress] = useState("0x2662b183bC1883e15B8E4D1E8DE1Da5ca126A626")
  const [networkError, setNetworkError] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [showDragon, setShowDragon] = useState(false)
  const [dragonDirection, setDragonDirection] = useState('right')

  const triggerDragonTransition = (direction = 'right') => {
    setDragonDirection(direction)
    setShowDragon(true)
    setTimeout(() => setShowDragon(false), 2000)
  }

  const handleTabChange = (newTab) => {
    triggerDragonTransition()
    setTimeout(() => setActiveTab(newTab), 500)
  }

  const handleLogout = () => {
    triggerDragonTransition('left')
    setTimeout(() => {
      // Clear all wallet state
      setConnected(false)
      setAccount("")
      setContract(null)
      setProvider(null)
      setActiveTab("upload")
      setShowLanding(true)
      
      // Clear localStorage to prevent auto-reconnection
      localStorage.removeItem('walletConnected')
      localStorage.removeItem('connectedAccount')
      
      // Disconnect from MetaMask if possible
      if (window.ethereum && window.ethereum.selectedAddress) {
        // Request account disconnection (not all wallets support this)
        try {
          window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          }).catch(() => {
            // Ignore errors as not all wallets support this
          })
        } catch (error) {
          // Ignore errors
        }
      }
    }, 1000)
  }

  // Custom cursor effect
  useEffect(() => {
    const cursor = document.createElement('div')
    cursor.className = 'cursor'
    document.body.appendChild(cursor)

    const moveCursor = (e) => {
      cursor.style.left = e.clientX - 10 + 'px'
      cursor.style.top = e.clientY - 10 + 'px'
    }

    const createWave = (e) => {
      const wave = document.createElement('div')
      wave.className = 'cursor-wave'
      wave.style.left = e.clientX - 20 + 'px'
      wave.style.top = e.clientY - 20 + 'px'
      document.body.appendChild(wave)
      
      setTimeout(() => {
        document.body.removeChild(wave)
      }, 600)
    }

    document.addEventListener('mousemove', moveCursor)
    document.addEventListener('click', createWave)

    return () => {
      document.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('click', createWave)
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor)
      }
    }
  }, [])

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      })
      setNetworkError(false)
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [SEPOLIA_CONFIG],
          })
          setNetworkError(false)
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError)
          alert('Failed to add Sepolia network. Please add it manually in MetaMask.')
        }
      } else {
        console.error('Failed to switch to Sepolia:', switchError)
        alert('Failed to switch to Sepolia network. Please switch manually in MetaMask.')
      }
    }
  }

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setNetworkError(true)
        return false
      }
      setNetworkError(false)
      return true
    }
    return false
  }

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const isCorrectNetwork = await checkNetwork()
        if (!isCorrectNetwork) {
          await switchToSepolia()
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const address = await signer.getAddress()
        
        setAccount(address)
        setProvider(provider)
        setConnected(true)
        
        // Store connection state
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('connectedAccount', address)
        
        if (contractAddress) {
          const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer)
          setContract(contract)
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error)
        alert("Failed to connect wallet. Please try again.")
      }
    } else {
      alert("Please install MetaMask to use this application")
    }
    setLoading(false)
  }

  const initializeContract = (address) => {
    if (provider && account) {
      const signer = provider.getSigner()
      const contract = new ethers.Contract(address, CONTRACT_ABI, signer)
      setContract(contract)
      setContractAddress(address)
    }
  }

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        await checkNetwork()
        
        // Only auto-connect if user was previously connected
        const wasConnected = localStorage.getItem('walletConnected')
        const savedAccount = localStorage.getItem('connectedAccount')
        
        if (wasConnected === 'true' && savedAccount) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0 && accounts[0].toLowerCase() === savedAccount.toLowerCase()) {
            await connectWallet()
            setShowLanding(false)
          } else {
            // Clear stale connection data
            localStorage.removeItem('walletConnected')
            localStorage.removeItem('connectedAccount')
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    
    init()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // Clear connection state when accounts are disconnected
          localStorage.removeItem('walletConnected')
          localStorage.removeItem('connectedAccount')
          setConnected(false)
          setAccount("")
          setContract(null)
          setShowLanding(true)
        } else {
          // Only reload if the account actually changed
          const savedAccount = localStorage.getItem('connectedAccount')
          if (savedAccount && accounts[0].toLowerCase() !== savedAccount.toLowerCase()) {
            localStorage.setItem('connectedAccount', accounts[0])
            window.location.reload()
          }
        }
      })

      window.ethereum.on('chainChanged', () => {
        checkNetwork().then(() => {
          window.location.reload()
        })
      })
    }
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Initializing STORIUM...</p>
      </div>
    )
  }

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />
  }

  return (
    <div className="app">
      {!connected ? (
        <ConnectWallet 
          onConnect={connectWallet}
          networkError={networkError}
          onSwitchNetwork={switchToSepolia}
          onBack={() => setShowLanding(true)}
        />
      ) : (
        <>
          <Header 
            account={account} 
            connected={connected} 
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            contractAddress={contractAddress}
            networkError={networkError}
            onSwitchNetwork={switchToSepolia}
            onLogout={handleLogout}
            showBackButton={!connected}
            onBack={() => setShowLanding(true)}
          />
          
          <main className="main-content">
            {activeTab === "upload" && contract && (
              <FileUpload
                account={account}
                provider={provider}
                contract={contract}
              />
            )}
            
            {activeTab === "files" && contract && (
              <FileManager contract={contract} account={account} />
            )}
            
            {activeTab === "explore" && contract && (
              <PublicExplorer contract={contract} account={account} />
            )}
            
            {activeTab === "share" && contract && (
              <ShareManager contract={contract} account={account} />
            )}
          </main>
          
          {/* Arrow Transition Animation */}
          {showDragon && (
            <ArrowAnimation direction={dragonDirection} />
          )}
        </>
      )}
    </div>
  )
}

export default App