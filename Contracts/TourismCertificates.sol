// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Tourism Certificates NFT Contract
 * @dev NFT contract for issuing tourism completion certificates
 * @author Jharkhand Tourism Blockchain System
 */

contract TourismCertificates {
    // Certificate structure
    struct Certificate {
        uint256 tokenId;
        address tourist;
        string destination;
        string tourDate;
        uint256 issuedDate;
        bool isActive;
    }
    
    // State variables
    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public userCertificates;
    mapping(address => bool) public authorizedIssuers;
    
    uint256 private nextTokenId = 1;
    address public owner;
    string public name = "Jharkhand Tourism Certificates";
    string public symbol = "JTC";
    
    // Events
    event CertificateIssued(uint256 indexed tokenId, address indexed tourist, string destination);
    event IssuerAuthorized(address indexed issuer);
    event IssuerRevoked(address indexed issuer);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedIssuers[msg.sender] || msg.sender == owner, "Not authorized to issue certificates");
        _;
    }
    
    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }
    
    /**
     * @dev Issue a new tourism certificate
     * @param _tourist Address of the tourist
     * @param _destination Name of the destination
     * @param _tourDate Date of the tour completion
     */
    function mintCertificate(
        address _tourist,
        string memory _destination,
        string memory _tourDate
    ) public onlyAuthorized validAddress(_tourist) returns (uint256) {
        require(bytes(_destination).length > 0, "Destination cannot be empty");
        require(bytes(_tourDate).length > 0, "Tour date cannot be empty");
        
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        certificates[tokenId] = Certificate({
            tokenId: tokenId,
            tourist: _tourist,
            destination: _destination,
            tourDate: _tourDate,
            issuedDate: block.timestamp,
            isActive: true
        });
        
        userCertificates[_tourist].push(tokenId);
        
        emit CertificateIssued(tokenId, _tourist, _destination);
        return tokenId;
    }
    
    /**
     * @dev Get certificate details by token ID
     * @param _tokenId Token ID of the certificate
     */
    function getCertificate(uint256 _tokenId) public view returns (Certificate memory) {
        require(_tokenId > 0 && _tokenId < nextTokenId, "Certificate does not exist");
        return certificates[_tokenId];
    }
    
    /**
     * @dev Get all certificates for a user
     * @param _user Address of the user
     */
    function getUserCertificates(address _user) public view validAddress(_user) returns (uint256[] memory) {
        return userCertificates[_user];
    }
    
    /**
     * @dev Get user certificate count
     * @param _user Address of the user
     */
    function getUserCertificateCount(address _user) public view validAddress(_user) returns (uint256) {
        return userCertificates[_user].length;
    }
    
    /**
     * @dev Check if certificate exists and is active
     * @param _tokenId Token ID to check
     */
    function isCertificateValid(uint256 _tokenId) public view returns (bool) {
        if (_tokenId == 0 || _tokenId >= nextTokenId) {
            return false;
        }
        return certificates[_tokenId].isActive;
    }
    
    /**
     * @dev Authorize an address to issue certificates
     * @param _issuer Address to authorize
     */
    function authorizeIssuer(address _issuer) public onlyOwner validAddress(_issuer) {
        authorizedIssuers[_issuer] = true;
        emit IssuerAuthorized(_issuer);
    }
    
    /**
     * @dev Revoke authorization from an issuer
     * @param _issuer Address to revoke
     */
    function revokeIssuer(address _issuer) public onlyOwner validAddress(_issuer) {
        authorizedIssuers[_issuer] = false;
        emit IssuerRevoked(_issuer);
    }
    
    /**
     * @dev Deactivate a certificate (in case of fraud)
     * @param _tokenId Token ID to deactivate
     */
    function deactivateCertificate(uint256 _tokenId) public onlyOwner {
        require(_tokenId > 0 && _tokenId < nextTokenId, "Certificate does not exist");
        certificates[_tokenId].isActive = false;
    }
    
    /**
     * @dev Get total number of certificates issued
     */
    function getTotalCertificates() public view returns (uint256) {
        return nextTokenId - 1;
    }
}