import React, { useState, useEffect } from "react";
import "./FileManager.css";

const FileManager = ({ contract, account }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessAddress, setAccessAddress] = useState("");
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [fileAccessList, setFileAccessList] = useState([]);

  const getFiles = async () => {
    setLoading(true);
    try {
      const fileData = await contract.getMyFiles();
      
      const formattedFiles = fileData.map((file, index) => ({
        id: index,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: parseInt(file.fileSize.toString()),
        uploadTime: new Date(parseInt(file.uploadTime.toString()) * 1000),
        isPublic: file.isPublic,
        description: file.description,
        tags: file.tags,
        ipfsHash: file.ipfsHash,
        url: `https://gateway.pinata.cloud/ipfs/${file.ipfsHash}`
      }));
      
      setFiles(formattedFiles);
      
      // Load file access list
      await loadFileAccessList();
    } catch (error) {
      console.error("Error fetching files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFileAccessList = async () => {
    try {
      const accessList = await contract.getFileAccessList();
      const formattedAccessList = accessList.map(access => ({
        fileId: parseInt(access.fileId.toString()),
        user: access.user,
        hasAccess: access.hasAccess
      }));
      setFileAccessList(formattedAccessList);
    } catch (error) {
      console.error("Error loading file access list:", error);
    }
  };
  const toggleFileSelection = (fileId) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const grantFileAccess = async () => {
    if (!accessAddress.trim()) {
      alert("Please enter a valid address");
      return;
    }

    if (selectedFiles.size === 0) {
      alert("Please select at least one file");
      return;
    }

    setGrantingAccess(true);
    try {
      // Grant access for each selected file
      for (const fileId of selectedFiles) {
        const tx = await contract.grantFileAccess(fileId, accessAddress);
        await tx.wait(); // Wait for transaction confirmation
      }
      alert(`Access granted to ${selectedFiles.size} file(s) successfully!`);
      setShowAccessModal(false);
      setAccessAddress("");
      setSelectedFiles(new Set());
      await loadFileAccessList(); // Refresh access list
    } catch (error) {
      console.error("Error granting access:", error);
      alert("Failed to grant access. Please try again.");
    } finally {
      setGrantingAccess(false);
    }
  };

  const revokeFileAccess = async (fileId, userAddress) => {
    if (!window.confirm("Are you sure you want to revoke access to this file?")) {
      return;
    }

    try {
      const tx = await contract.revokeFileAccess(fileId, userAddress);
      await tx.wait();
      alert("Access revoked successfully!");
      await loadFileAccessList();
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Failed to revoke access. Please try again.");
    }
  };

  const getFileAccessForFile = (fileId) => {
    return fileAccessList.filter(access => access.fileId === fileId && access.hasAccess);
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
      const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || file.fileType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return a.uploadTime - b.uploadTime;
        case 'name': return a.fileName.localeCompare(b.fileName);
        case 'size': return b.fileSize - a.fileSize;
        default: return b.uploadTime - a.uploadTime;
      }
    });

  useEffect(() => {
    if (account && contract) {
      getFiles();
    }
  }, [account, contract]);

  return (
    <>
      <div className="file-manager">
      <div className="manager-header">
        <div className="header-content">
          <div className="header-icon">📁</div>
          <div>
            <h2>My Files</h2>
            <p className="manager-description">
              Manage your files stored on the blockchain
            </p>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search your files..."
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

        <div className="file-actions-bar">
          {selectedFiles.size > 0 && (
            <button 
              className="grant-access-btn"
              onClick={() => setShowAccessModal(true)}
            >
              Grant Access ({selectedFiles.size} files)
            </button>
          )}
          <button className="refresh-btn" onClick={getFiles}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Refresh
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
          <p>Loading your files...</p>
        </div>
      ) : (
        <>
          <div className="files-stats">
            <span className="files-count">{filteredAndSortedFiles.length} files</span>
            <span className="total-size">
              Total: {formatFileSize(filteredAndSortedFiles.reduce((sum, file) => sum + file.fileSize, 0))}
            </span>
          </div>
          
          <div className="files-grid">
            {filteredAndSortedFiles.length > 0 ? (
              filteredAndSortedFiles.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-select">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="file-checkbox"
                    />
                  </div>
                  
                  <div className="file-header">
                    <span className="file-type-icon">{getFileIcon(file.fileType)}</span>
                    <span className="file-type-badge">{file.fileType}</span>
                    <span className={`visibility-badge ${file.isPublic ? 'public' : 'private'}`}>
                      {file.isPublic ? '🌐 Public' : '🔒 Private'}
                    </span>
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
                    <h3 className="file-title" title={file.fileName}>
                      {file.fileName}
                    </h3>
                    
                    {/* Show file access information */}
                    {(() => {
                      const fileAccesses = getFileAccessForFile(file.id);
                      return fileAccesses.length > 0 && (
                        <div className="file-access-info">
                          <span className="access-label">Shared with:</span>
                          <div className="access-users">
                            {fileAccesses.slice(0, 2).map((access, index) => (
                              <span key={index} className="access-user">
                                {access.user.slice(0, 6)}...{access.user.slice(-4)}
                              </span>
                            ))}
                            {fileAccesses.length > 2 && (
                              <span className="access-more">+{fileAccesses.length - 2}</span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    
                    {file.description && (
                      <p className="file-description">{file.description}</p>
                    )}
                    <div className="file-meta">
                      <span className="file-size">{formatFileSize(file.fileSize)}</span>
                      <span className="file-date">{file.uploadTime.toLocaleDateString()}</span>
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
                    
                    {/* Individual file access management */}
                    <button 
                      className="action-btn manage-access-btn"
                      onClick={() => {
                        setSelectedFiles(new Set([file.id]));
                        setShowAccessModal(true);
                      }}
                      title="Manage file access"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                        <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
                        <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Share
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-files">
                <div className="no-files-icon">📁</div>
                <h3>No files uploaded yet</h3>
                <p>
                  {searchTerm || filterType !== 'all' 
                    ? "No files match your search criteria"
                    : "Upload your first file to get started"
                  }
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>

      {/* Access Modal */}
      {showAccessModal && (
        <div className="modal-overlay">
          <div className="access-modal">
            <div className="modal-header">
              <h3>Grant File Access</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowAccessModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Grant access to {selectedFiles.size} selected file(s)</p>
             {selectedFiles.size === 1 && (() => {
               const fileId = Array.from(selectedFiles)[0];
               const file = files.find(f => f.id === fileId);
               const fileAccesses = getFileAccessForFile(fileId);
               
               return (
                 <div className="selected-file-info">
                   <h4>File: {file?.fileName}</h4>
                   {fileAccesses.length > 0 && (
                     <div className="current-access">
                       <h5>Currently shared with:</h5>
                       <div className="access-list-preview">
                         {fileAccesses.map((access, index) => (
                           <div key={index} className="access-item-preview">
                             <span className="access-address">
                               {access.user.slice(0, 8)}...{access.user.slice(-8)}
                             </span>
                             <button
                               className="revoke-btn-small"
                               onClick={() => revokeFileAccess(fileId, access.user)}
                               title="Revoke access"
                             >
                               ×
                             </button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               );
             })()}
             
              <input
                type="text"
                className="access-address-input"
                placeholder="Enter wallet address (0x...)"
                value={accessAddress}
                onChange={(e) => setAccessAddress(e.target.value)}
              />
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowAccessModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="confirm-grant-btn"
                  onClick={grantFileAccess}
                  disabled={grantingAccess || !accessAddress.trim()}
                >
                  {grantingAccess ? "Granting..." : "Grant Access"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileManager;
