import { useState, useEffect } from "react"
import "./PublicExplorer.css"

const PublicExplorer = ({ contract, account }) => {
  const [publicFiles, setPublicFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const loadPublicFiles = async () => {
    setLoading(true)
    try {
      const files = await contract.getPublicFiles()
      const formattedFiles = files.map((file, index) => ({
        id: index,
        fileName: file.fileName,
        fileType: file.fileType,
        ipfsHash: file.ipfsHash,
        fileSize: parseInt(file.fileSize.toString()),
        uploadTime: new Date(parseInt(file.uploadTime.toString()) * 1000),
        owner: file.owner,
        description: file.description,
        tags: file.tags,
        url: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`
      }))
      
      setPublicFiles(formattedFiles)
    } catch (error) {
      console.error("Error loading public files:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return '🖼️'
      case 'document': return '📄'
      case 'video': return '🎥'
      case 'audio': return '🎵'
      default: return '📁'
    }
  }

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const filteredFiles = publicFiles.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterType === 'all' || file.fileType === filterType
    return matchesSearch && matchesFilter
  })

  useEffect(() => {
    if (contract) {
      loadPublicFiles()
    }
  }, [contract])

  return (
    <div className="public-explorer">
      <div className="explorer-header">
        <div className="header-content">
          <div className="header-icon">🌐</div>
          <div>
            <h2>Public Files</h2>
            <p className="explorer-description">
              Explore files shared by the community
            </p>
          </div>
        </div>
        <button className="refresh-btn" onClick={loadPublicFiles}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2"/>
          </svg>
        </button>
      </div>

      <div className="explorer-controls">
        <input
          type="text"
          placeholder="Search public files..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-explorer">
          <div className="quantum-loader">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
          </div>
          <p>Scanning the network...</p>
        </div>
      ) : (
        <div className="files-grid">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-header">
                  <div className="file-type-info">
                    <span className="file-type-icon">{getFileIcon(file.fileType)}</span>
                    <span className="file-type-badge">{file.fileType}</span>
                  </div>
                  <div className="file-owner">
                    <span className="owner-label">by</span>
                    <span className="owner-address">{formatAddress(file.owner)}</span>
                  </div>
                </div>
                
                <div className="file-content">
                  {file.fileType === 'image' ? (
                    <img 
                      src={file.url} 
                      alt={file.fileName}
                      className="file-thumbnail"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : file.fileType === 'video' ? (
                    <video 
                      src={file.url}
                      className="file-thumbnail"
                      controls
                      preload="metadata"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : file.fileType === 'audio' ? (
                    <div className="audio-preview">
                      <audio 
                        src={file.url}
                        controls
                        preload="metadata"
                        style={{ width: '100%' }}
                      />
                      <div className="audio-icon">🎵</div>
                    </div>
                  ) : file.fileType === 'document' && file.fileName.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={file.url}
                      className="file-thumbnail"
                      title={file.fileName}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : (
                    <div className="file-placeholder">
                      <span className="placeholder-icon">{getFileIcon(file.fileType)}</span>
                    </div>
                  )}
                  <div className="file-placeholder" style={{ display: 'none' }}>
                    <span className="placeholder-icon">{getFileIcon(file.fileType)}</span>
                  </div>
                </div>
                
                <div className="file-info">
                  <h3 className="file-title">{file.fileName}</h3>
                  {file.description && (
                    <p className="file-description">{file.description}</p>
                  )}
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.fileSize)}</span>
                    <span className="upload-date">
                      {file.uploadTime.toLocaleDateString()}
                    </span>
                  </div>
                  {file.tags && file.tags.length > 0 && (
                    <div className="file-tags">
                      {file.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                      {file.tags.length > 3 && (
                        <span className="tag-more">+{file.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="file-actions">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-btn view-btn"
                  >
                    View
                  </a>
                  <a 
                    href={file.url} 
                    download={file.fileName}
                    className="action-btn download-btn"
                  >
                    Download
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="no-files">
              <div className="no-files-icon">🌐</div>
              <h3>No public files</h3>
              <p>Be the first to share files with the community</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PublicExplorer