import { useState, useEffect } from "react";
import "./PublicExplorer.css";

const PublicExplorer = ({ contract, account }) => {
  const [publicFiles, setPublicFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const loadPublicFiles = async () => {
    setLoading(true);
    try {
      const files = await contract.getPublicFiles();
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
      }));
      
      setPublicFiles(formattedFiles);
    } catch (error) {
      console.error("Error loading public files:", error);
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

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image': return '🖼️';
      case 'document': return '📄';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      default: return '📁';
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const filteredAndSortedFiles = publicFiles
    .filter(file => {
      const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'all' || file.fileType === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.uploadTime - a.uploadTime;
        case 'oldest':
          return a.uploadTime - b.uploadTime;
        case 'name':
          return a.fileName.localeCompare(b.fileName);
        case 'size':
          return b.fileSize - a.fileSize;
        default:
          return 0;
      }
    });

  useEffect(() => {
    if (contract) {
      loadPublicFiles();
    }
  }, [contract]);

  return (
    <div className="public-explorer">
      <div className="explorer-header">
        <div className="header-content">
          <div className="header-icon">🌐</div>
          <div>
            <h2>Global Matrix Explorer</h2>
            <p className="explorer-description">
              Discover files shared across the distributed network
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
        <div className="search-bar">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            type="text"
            placeholder="Search files, descriptions, tags..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
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
          
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-explorer">
          <div className="quantum-loader">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
          </div>
          <p>Scanning the matrix...</p>
        </div>
      ) : (
        <>
          <div className="explorer-stats">
            <div className="stat-item">
              <span className="stat-value">{filteredAndSortedFiles.length}</span>
              <span className="stat-label">Files Found</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{publicFiles.length}</span>
              <span className="stat-label">Total Public</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {formatFileSize(publicFiles.reduce((acc, file) => acc + file.fileSize, 0))}
              </span>
              <span className="stat-label">Total Size</span>
            </div>
          </div>

          <div className="files-grid">
            {filteredAndSortedFiles.length > 0 ? (
              filteredAndSortedFiles.map((file) => (
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
                      />
                    ) : (
                      <div className="file-placeholder">
                        <span className="placeholder-icon">{getFileIcon(file.fileType)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="file-info">
                    <h3 className="file-title" title={file.fileName}>
                      {file.fileName}
                    </h3>
                    {file.description && (
                      <p className="file-description">{file.description}</p>
                    )}
                    <div className="file-meta">
                      <span className="file-size">{formatFileSize(file.fileSize)}</span>
                      <span className="upload-date">
                        {file.uploadTime.toLocaleDateString()}
                      </span>
                    </div>
                    {file.tags.length > 0 && (
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
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      View
                    </a>
                    <a 
                      href={file.url} 
                      download={file.fileName}
                      className="action-btn download-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-files">
                <div className="no-files-icon">🌌</div>
                <h3>No files in the matrix</h3>
                <p>
                  {searchTerm || filterType !== 'all' 
                    ? "Adjust your search parameters to discover more files"
                    : "Be the first to share files with the global network"
                  }
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PublicExplorer;