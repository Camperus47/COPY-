// Import React hooks and necessary libraries
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

// Import UI components
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import ConnectWallet from './components/ConnectWallet'
import FileUpload from './components/FileUpload'
import FileManager from './components/FileManager'
import PublicExplorer from './components/PublicExplorer'
import ShareManager from './components/ShareManager'
import ArrowAnimation from './components/ArrowAnimation'

// Import main CSS
import './App.css'

// Contract ABI: defines the functions and events of the smart contract
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

// Sepolia testnet configuration for MetaMask network switching
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
  // React state variables
  const [account, setAccount] = useState("")           // currently connected wallet account
  const [contract, setContract] = useState(null)       // ethers contract instance
  const [provider, setProvider] = useState(null)       // ethers provider
  const [loading, setLoading] = useState(true)         // loading state
  const [connected, setConnected] = useState(false)    // wallet connection state
  const [activeTab, setActiveTab] = useState("upload") // active dashboard tab
  const [contractAddress, setContractAddress] = useState("0x2662b183bC1883e15B8E4D1E8DE1Da5ca126A626") // deployed contract address
  const [networkError, setNetworkError] = useState(false) // if user is on wrong network
  const [showLanding, setShowLanding] = useState(true)  // whether to show landing page
  const [showDragon, setShowDragon] = useState(false)   // animation visibility flag
  const [dragonDirection, setDragonDirection] = useState('right') // animation direction

  // Function to trigger arrow/dragon transition animation
  const triggerDragonTransition = (direction = 'right') => {
    setDragonDirection(direction)       // set animation direction
    setShowDragon(true)                 // show animation
    setTimeout(() => setShowDragon(false), 2000) // hide animation after 2 seconds
  }

  // Handle tab change in dashboard
  const handleTabChange = (newTab) => {
    triggerDragonTransition()           // trigger animation
    setTimeout(() => setActiveTab(newTab), 500) // switch tab after animation
  }

  // Logout function
  const handleLogout = () => {
    triggerDragonTransition('left')    // animation to left
    setTimeout(() => {
      // Clear wallet and app state
      setConnected(false)
      setAccount("")
      setContract(null)
      setProvider(null)
      setActiveTab("upload")
      setShowLanding(true)
      
      // Clear localStorage to prevent auto-reconnect
      localStorage.removeItem('walletConnected')
      localStorage.removeItem('connectedAccount')
      
      // Attempt to disconnect from MetaMask (optional)
      if (window.ethereum && window.ethereum.selectedAddress) {
        try {
          window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          }).catch(() => {})
        } catch (error) {}
      }
    }, 1000)
  }

  // Custom cursor effect using DOM manipulation
  useEffect(() => {
    const cursor = document.createElement('div')
    cursor.className = 'cursor'       // custom cursor div
    document.body.appendChild(cursor)

    // Move cursor with mouse
    const moveCursor = (e) => {
      cursor.style.left = e.clientX - 10 + 'px'
      cursor.style.top = e.clientY - 10 + 'px'
    }

    // Create wave effect on click
    const createWave = (e) => {
      const wave = document.createElement('div')
      wave.className = 'cursor-wave'
      wave.style.left = e.clientX - 20 + 'px'
      wave.style.top = e.clientY - 20 + 'px'
      document.body.appendChild(wave)
      setTimeout(() => { document.body.removeChild(wave) }, 600)
    }

    // Attach mouse event listeners
    document.addEventListener('mousemove', moveCursor)
    document.addEventListener('click', createWave)

    // Cleanup listeners on unmount
    return () => {
      document.removeEventListener('mousemove', moveCursor)
      document.removeEventListener('click', createWave)
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor)
      }
    }
  }, [])

  // Switch user MetaMask to Sepolia network
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

  // Check if user is on correct network
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

  // Connect wallet function
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
        
        // Save connection info in localStorage
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

  // Initialize contract with a given address
  const initializeContract = (address) => {
    if (provider && account) {
      const signer = provider.getSigner()
      const contract = new ethers.Contract(address, CONTRACT_ABI, signer)
      setContract(contract)
      setContractAddress(address)
    }
  }

  // useEffect for app initialization
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        await checkNetwork()
        
        // Auto-connect wallet if previously connected
        const wasConnected = localStorage.getItem('walletConnected')
        const savedAccount = localStorage.getItem('connectedAccount')
        
        if (wasConnected === 'true' && savedAccount) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0 && accounts[0].toLowerCase() === savedAccount.toLowerCase()) {
            await connectWallet()
            setShowLanding(false)
          } else {
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

    // Listen to account and chain changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected accounts
          localStorage.removeItem('walletConnected')
          localStorage.removeItem('connectedAccount')
          setConnected(false)
          setAccount("")
          setContract(null)
          setShowLanding(true)
        } else {
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

  // Show loading spinner while initializing
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Initializing STORIUM...</p>
      </div>
    )
  }

  // Show landing page if not yet entered
  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />
  }

  // Main app UI
  return (
    <div className="app">
      {!connected ? (
        // Show connect wallet screen if not connected
        <ConnectWallet 
          onConnect={connectWallet}
          networkError={networkError}
          onSwitchNetwork={switchToSepolia}
          onBack={() => setShowLanding(true)}
        />
      ) : (
        <>
          {/* Header with account info and tabs */}
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
            {/* Render different dashboard tabs based on activeTab */}
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
          
          {/* Arrow/dragon transition animation */}
          {showDragon && (
            <ArrowAnimation direction={dragonDirection} />
          )}
        </>
      )}
    </div>
  )
}

// Export App component
export default App
