// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/**
 * @title GlobalStorage
 * @dev Decentralized file storage contract with selective access control
 * @author Lies_Of_Code
 */
contract GlobalStorage {
    
    // File structure containing all metadata
    struct FileInfo {
        string fileName;        // Original file name
        string fileType;        // File category (image, document, video, audio, other)
        string ipfsHash;        // IPFS hash for file retrieval
        uint256 fileSize;       // File size in bytes
        uint256 uploadTime;     // Timestamp when file was uploaded
        address owner;          // Address of file owner
        bool isPublic;          // Public visibility flag
        string description;     // Optional file description
        string[] tags;          // Array of tags for categorization
    }

    // Access control structure for individual files
    struct FileAccess {
        uint256 fileId;         // File ID
        address user;           // User address
        bool hasAccess;         // Access permission status
    }

    // General access structure (for backward compatibility)
    struct Access {
        address user;           // User address
        bool access;            // Access permission status
    }

    // State variables
    FileInfo[] public globalFiles;                              // Array of all files
    mapping(address => uint256[]) private userFileIds;          // User's file IDs
    mapping(address => mapping(address => bool)) private ownership; // General access permissions
    mapping(address => Access[]) private accessList;           // General access list per user
    
    // New mappings for selective file access
    mapping(uint256 => mapping(address => bool)) private fileAccess; // fileId => user => hasAccess
    mapping(address => mapping(address => uint256[])) private userSharedFiles; // owner => user => fileIds[]
    mapping(address => FileAccess[]) private fileAccessList;   // owner => FileAccess[]

    // Events for frontend integration
    event FileUploaded(
        address indexed user, 
        uint256 indexed fileId, 
        string fileName, 
        string ipfsHash
    );
    
    event AccessGranted(
        address indexed owner, 
        address indexed user
    );
    
    event AccessRevoked(
        address indexed owner, 
        address indexed user
    );
    
    event FileDeleted(
        address indexed user, 
        uint256 indexed fileId
    );

    event FileAccessGranted(
        address indexed owner,
        address indexed user,
        uint256 indexed fileId
    );

    event FileAccessRevoked(
        address indexed owner,
        address indexed user,
        uint256 indexed fileId
    );

    /**
     * @dev Upload a new file to the global storage
     */
    function addFile(
        string memory _fileName,
        string memory _fileType,
        string memory _ipfsHash,
        uint256 _fileSize,
        bool _isPublic,
        string memory _description,
        string[] memory _tags
    ) external {
        require(bytes(_fileName).length > 0, "File name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_fileSize > 0, "File size must be greater than 0");

        // Create new file info
        FileInfo memory newFile = FileInfo({
            fileName: _fileName,
            fileType: _fileType,
            ipfsHash: _ipfsHash,
            fileSize: _fileSize,
            uploadTime: block.timestamp,
            owner: msg.sender,
            isPublic: _isPublic,
            description: _description,
            tags: _tags
        });

        // Add to global files array
        globalFiles.push(newFile);
        uint256 fileId = globalFiles.length - 1;
        
        // Add to user's file list
        userFileIds[msg.sender].push(fileId);

        emit FileUploaded(msg.sender, fileId, _fileName, _ipfsHash);
    }

    /**
     * @dev Get all files owned by the caller
     */
    function getMyFiles() external view returns (FileInfo[] memory) {
        uint256[] memory myFileIds = userFileIds[msg.sender];
        FileInfo[] memory myFiles = new FileInfo[](myFileIds.length);
        
        for (uint256 i = 0; i < myFileIds.length; i++) {
            myFiles[i] = globalFiles[myFileIds[i]];
        }
        
        return myFiles;
    }

    /**
     * @dev Get all public files in the system
     */
    function getPublicFiles() external view returns (FileInfo[] memory) {
        // Count public files first
        uint256 publicCount = 0;
        for (uint256 i = 0; i < globalFiles.length; i++) {
            if (globalFiles[i].isPublic) {
                publicCount++;
            }
        }

        // Create array of public files
        FileInfo[] memory publicFiles = new FileInfo[](publicCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < globalFiles.length; i++) {
            if (globalFiles[i].isPublic) {
                publicFiles[currentIndex] = globalFiles[i];
                currentIndex++;
            }
        }
        
        return publicFiles;
    }

    /**
     * @dev Get files that a user has access to (including selective access)
     */
    function getUserFiles(address _user) external view returns (FileInfo[] memory) {
        require(_user == msg.sender || ownership[_user][msg.sender], 
                "Access denied: You don't have permission to view these files");

        uint256[] memory userFiles = userFileIds[_user];
        
        // Count accessible files
        uint256 accessibleCount = 0;
        for (uint256 i = 0; i < userFiles.length; i++) {
            uint256 fileId = userFiles[i];
            if (globalFiles[fileId].isPublic || 
                ownership[_user][msg.sender] || 
                fileAccess[fileId][msg.sender]) {
                accessibleCount++;
            }
        }
        
        // Create array of accessible files
        FileInfo[] memory files = new FileInfo[](accessibleCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < userFiles.length; i++) {
            uint256 fileId = userFiles[i];
            if (globalFiles[fileId].isPublic || 
                ownership[_user][msg.sender] || 
                fileAccess[fileId][msg.sender]) {
                files[currentIndex] = globalFiles[fileId];
                currentIndex++;
            }
        }
        
        return files;
    }

    /**
     * @dev Grant access to a specific file
     */
    function grantFileAccess(uint256 _fileId, address _user) external {
        require(_fileId < globalFiles.length, "File does not exist");
        require(globalFiles[_fileId].owner == msg.sender, "Only owner can grant access");
        require(_user != msg.sender, "Cannot grant access to yourself");
        require(_user != address(0), "Invalid user address");

        fileAccess[_fileId][_user] = true;
        
        // Add to shared files list
        userSharedFiles[msg.sender][_user].push(_fileId);
        
        // Update file access list
        bool userExists = false;
        for (uint256 i = 0; i < fileAccessList[msg.sender].length; i++) {
            if (fileAccessList[msg.sender][i].fileId == _fileId && 
                fileAccessList[msg.sender][i].user == _user) {
                fileAccessList[msg.sender][i].hasAccess = true;
                userExists = true;
                break;
            }
        }
        
        if (!userExists) {
            fileAccessList[msg.sender].push(FileAccess(_fileId, _user, true));
        }

        emit FileAccessGranted(msg.sender, _user, _fileId);
    }

    /**
     * @dev Revoke access from a specific file
     */
    function revokeFileAccess(uint256 _fileId, address _user) external {
        require(_fileId < globalFiles.length, "File does not exist");
        require(globalFiles[_fileId].owner == msg.sender, "Only owner can revoke access");
        require(fileAccess[_fileId][_user], "User doesn't have access to this file");

        fileAccess[_fileId][_user] = false;
        
        // Remove from shared files list
        uint256[] storage sharedFiles = userSharedFiles[msg.sender][_user];
        for (uint256 i = 0; i < sharedFiles.length; i++) {
            if (sharedFiles[i] == _fileId) {
                sharedFiles[i] = sharedFiles[sharedFiles.length - 1];
                sharedFiles.pop();
                break;
            }
        }
        
        // Update file access list
        for (uint256 i = 0; i < fileAccessList[msg.sender].length; i++) {
            if (fileAccessList[msg.sender][i].fileId == _fileId && 
                fileAccessList[msg.sender][i].user == _user) {
                fileAccessList[msg.sender][i].hasAccess = false;
                break;
            }
        }

        emit FileAccessRevoked(msg.sender, _user, _fileId);
    }

    /**
     * @dev Get file access list for the caller
     */
    function getFileAccessList() external view returns (FileAccess[] memory) {
        return fileAccessList[msg.sender];
    }

    /**
     * @dev Check if a user has access to a specific file
     */
    function hasFileAccess(uint256 _fileId, address _user) external view returns (bool) {
        require(_fileId < globalFiles.length, "File does not exist");
        
        FileInfo memory file = globalFiles[_fileId];
        
        // Owner always has access
        if (file.owner == _user) {
            return true;
        }
        
        // Public files are accessible to everyone
        if (file.isPublic) {
            return true;
        }
        
        // Check specific file access
        return fileAccess[_fileId][_user];
    }

    /**
     * @dev Grant general access to another user (backward compatibility)
     */
    function allow(address user) external {
        require(user != msg.sender, "Cannot grant access to yourself");
        require(user != address(0), "Invalid user address");

        ownership[msg.sender][user] = true;
        
        // Update access list
        bool userExists = false;
        for (uint256 i = 0; i < accessList[msg.sender].length; i++) {
            if (accessList[msg.sender][i].user == user) {
                accessList[msg.sender][i].access = true;
                userExists = true;
                break;
            }
        }
        
        if (!userExists) {
            accessList[msg.sender].push(Access(user, true));
        }

        emit AccessGranted(msg.sender, user);
    }

    /**
     * @dev Revoke general access from a user (backward compatibility)
     */
    function disallow(address user) external {
        require(ownership[msg.sender][user], "User doesn't have access");

        ownership[msg.sender][user] = false;
        
        // Update access list
        for (uint256 i = 0; i < accessList[msg.sender].length; i++) {
            if (accessList[msg.sender][i].user == user) {
                accessList[msg.sender][i].access = false;
                break;
            }
        }

        emit AccessRevoked(msg.sender, user);
    }

    /**
     * @dev Get the general access list for the caller (backward compatibility)
     */
    function shareAccess() external view returns (Access[] memory) {
        return accessList[msg.sender];
    }

    /**
     * @dev Delete a file (only owner can delete)
     */
    function deleteFile(uint256 _fileId) external {
        require(_fileId < globalFiles.length, "File does not exist");
        require(globalFiles[_fileId].owner == msg.sender, "Only owner can delete file");

        // Remove from user's file list
        uint256[] storage userFiles = userFileIds[msg.sender];
        for (uint256 i = 0; i < userFiles.length; i++) {
            if (userFiles[i] == _fileId) {
                userFiles[i] = userFiles[userFiles.length - 1];
                userFiles.pop();
                break;
            }
        }

        // Mark file as deleted (set owner to zero address)
        globalFiles[_fileId].owner = address(0);
        
        emit FileDeleted(msg.sender, _fileId);
    }

    /**
     * @dev Get total number of files in the system
     */
    function getTotalFiles() external view returns (uint256) {
        return globalFiles.length;
    }

    /**
     * @dev Check if a user has general access to another user's files
     */
    function hasAccess(address owner, address user) external view returns (bool) {
        return owner == user || ownership[owner][user];
    }
}