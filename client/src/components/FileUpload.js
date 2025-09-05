import { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = ({ contract, account, provider }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  const getFileType = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv'];
    const audioTypes = ['mp3', 'wav', 'flac', 'aac'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (documentTypes.includes(extension)) return 'document';
    if (videoTypes.includes(extension)) return 'video';
    if (audioTypes.includes(extension)) return 'audio';
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const resFile = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
          pinata_api_key: `Enter Your Key`,
          pinata_secret_api_key: `Enter Your Secret Key`,
          "Content-Type": "multipart/form-data",
        },
      });

      const ipfsHash = resFile.data.IpfsHash;
      const fileType = getFileType(file);
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await contract.addFile(
        file.name,
        fileType,
        ipfsHash,
        file.size,
        isPublic,
        description,
        tagArray
      );
      
      alert("File uploaded successfully!");
      setFileName("No file selected");
      setFile(null);
      setDescription("");
      setTags("");
      setIsPublic(false);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const retrieveFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
    e.preventDefault();
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="card-header">
          <div className="header-icon">🚀</div>
          <div>
            <h2> your memories are safe with blockchain</h2>
            <p className="upload-description">
              Deploy any file to the distributed matrix
            </p>
          </div>
        </div>
        
        <form className="upload-form" onSubmit={handleSubmit}>
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <div className="upload-icon-container">
                <svg className="upload-icon" width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              </div>
              
              <div className="drop-zone-text">
                <p className="drop-main">Initialize file transfer or</p>
                <label htmlFor="file-upload" className="browse-btn">
                  access local storage
                </label>
              </div>
              
              <input
                disabled={!account || uploading}
                type="file"
                id="file-upload"
                onChange={retrieveFile}
                accept="*/*"
              />
            </div>
          </div>

          {file && (
            <div className="file-preview">
              <div className="file-info">
                <div className="file-icon">
                  {getFileType(file) === 'image' && '🖼️'}
                  {getFileType(file) === 'document' && '📄'}
                  {getFileType(file) === 'video' && '🎥'}
                  {getFileType(file) === 'audio' && '🎵'}
                  {getFileType(file) === 'other' && '📁'}
                </div>
                <div className="file-details">
                  <p className="file-name">{fileName}</p>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button 
                type="button" 
                className="remove-file"
                onClick={() => {
                  setFile(null);
                  setFileName("No file selected");
                }}
              >
                ×
              </button>
            </div>
          )}

          {file && (
            <div className="file-metadata">
              <div className="metadata-row">
                <label className="metadata-label">Description</label>
                <input
                  type="text"
                  className="metadata-input"
                  placeholder="Optional file description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="metadata-row">
                <label className="metadata-label">Tags</label>
                <input
                  type="text"
                  className="metadata-input"
                  placeholder="tech, document, important (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
              
              <div className="metadata-row">
                <label className="visibility-toggle">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-label">
                    {isPublic ? 'Public Access' : 'Private Access'}
                  </span>
                </label>
              </div>
            </div>
          )}
          <button 
            type="submit" 
            className={`upload-btn ${uploading ? 'uploading' : ''}`}
            disabled={!file || uploading || !account}
          >
            {uploading ? (
              <>
                <div className="btn-spinner"></div>
                Deploying to Matrix...
              </>
            ) : (
              'Deploy to Global Network'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FileUpload;