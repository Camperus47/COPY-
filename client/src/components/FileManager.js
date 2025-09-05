import { useState, useEffect } from "react";
import "./FileManager.css";

const FileManager = ({ contract, account }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");

  const getFiles = async (userAddress = null) => {
    setLoading(true);
    try {
      const targetAddress = userAddress || account;
      const fileData = userAddress ? 
        await contract.getUserFiles(targetAddress) : 
        await contract.getMyFiles();
      
      const formattedFiles = fileData.map((file, index) => ({
        id: index,
        fileName: file.fileName,
        fileType: file.fileType,
        ipfsHash: file.ipfsHash,
        fileSize: parseInt(file.fileSize.toString()),
        uploadTime: new Date(parseInt(file.uploadTime.toString()) * 1000),
        owner: file.owner,
        isPublic: file.isPublic,
        description: file.description,
        tags: file.tags,
        url: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`
      }));
      
      setFiles(formattedFiles);
      setViewingUser(userAddress || "");
    } catch (error) {
      console.error("Error fetching files:", error);
      alert("You don't have access to view these files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFiles = () => {
    const address = document.querySelector(".address-input").value.trim();
    getFiles(address);
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

  const filteredAndSortedFiles = files
    .filter(file => {
      const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
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
    if (account && contract) {
      getFiles();
    }
  }, [account, contract]);

  return (
    <div className="file-manager">
      <div className="manager-header">
        <div className="header-content">
          <div className="header-icon">📁</div>
          <div>
            <h2>Neural File System</h2>
            <p className="manager-description">
              {viewingUser ? `Accessing neural patterns from: ${viewingUser}` : "Manage your quantum file matrix"}
            </p>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search files..."
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
          
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="size">Size (Large to Small)</option>
          </select>
        </div>

        <div className="access-controls">
          <input
            type="text"
            placeholder="Enter neural address to access their matrix"
            className="address-input"
          />
          <button className="view-files-btn" onClick={handleViewFiles}>
            Access Matrix
          </button>
          <button className="my-files-btn" onClick={() => getFiles()}>
            My Matrix
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-files">
          <div className="quantum-loader">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
          </div>
          <p>Accessing neural matrix...</p>
        </div>
      ) : (
        <>
          <div className="files-stats">
            <span className="file-count">
              {filteredAndSortedFiles.length} file{filteredAndSortedFiles.length !== 1 ? 's' : ''}
            </span>
            {files.length > 0 && (
              <span className="total-size">
                Total: {formatFileSize(files.reduce((acc, file) => acc + file.fileSize, 0))}
              </span>
            )}
          </div>

          <div className="files-grid">
            {filteredAndSortedFiles.length > 0 ? (
              filteredAndSortedFiles.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-header">
                    <span className="file-type-icon">{getFileIcon(file.fileType)}</span>
                    <span className="file-type-badge">{file.fileType}</span>
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
                    {file.isPublic && (
                      <div className="public-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M2 12h20" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        Public
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
                <h3>Neural matrix empty</h3>
                <p>
                  {searchTerm || filterType !== 'all' 
                    ? "Adjust neural scan parameters to locate files"
                    : "Deploy your first file to initialize the matrix"
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

export default FileManager;