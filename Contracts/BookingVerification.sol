// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Booking Verification System
 * @dev Smart contract for verifying tourism booking authenticity
 * @author Jharkhand Tourism Blockchain System
 */

contract BookingVerification {
    // Booking verification structure
    struct BookingRecord {
        bytes32 bookingHash;
        address tourist;
        address provider;
        string destination;
        uint256 amount;
        uint256 bookingDate;
        uint256 verificationDate;
        VerificationStatus status;
        string ipfsHash; // For storing booking documents
    }
    
    // Verification status enum
    enum VerificationStatus {
        Pending,
        Verified,
        Completed,
        Cancelled,
        Disputed
    }
    
    // State variables
    mapping(bytes32 => BookingRecord) public bookingRecords;
    mapping(address => bytes32[]) public touristBookings;
    mapping(address => bytes32[]) public providerBookings;
    mapping(address => bool) public authorizedVerifiers;
    
    bytes32[] public allBookings;
    address public owner;
    uint256 public totalBookings;
    uint256 public verifiedBookings;
    
    // Events
    event BookingCreated(bytes32 indexed bookingHash, address indexed tourist, address indexed provider);
    event BookingVerified(bytes32 indexed bookingHash, address indexed verifier);
    event BookingCompleted(bytes32 indexed bookingHash);
    event BookingCancelled(bytes32 indexed bookingHash, string reason);
    event BookingDisputed(bytes32 indexed bookingHash, string reason);
    event VerifierAuthorized(address indexed verifier);
    event VerifierRevoked(address indexed verifier);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedVerifiers[msg.sender] || msg.sender == owner, "Not authorized to verify bookings");
        _;
    }
    
    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }
    
    modifier bookingExists(bytes32 _bookingHash) {
        require(bookingRecords[_bookingHash].bookingHash != bytes32(0), "Booking does not exist");
        _;
    }
    
    modifier onlyTouristOrProvider(bytes32 _bookingHash) {
        BookingRecord memory booking = bookingRecords[_bookingHash];
        require(
            msg.sender == booking.tourist || msg.sender == booking.provider,
            "Only tourist or provider can perform this action"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
    }
    
    /**
     * @dev Create a new booking verification record
     * @param _tourist Address of the tourist
     * @param _provider Address of the service provider
     * @param _destination Name of the destination
     * @param _amount Booking amount in wei
     * @param _bookingDate Timestamp of the booking
     * @param _ipfsHash IPFS hash of booking documents
     */
    function verifyBooking(
        address _tourist,
        address _provider,
        string memory _destination,
        uint256 _amount,
        uint256 _bookingDate,
        string memory _ipfsHash
    ) public onlyAuthorized validAddress(_tourist) validAddress(_provider) returns (bytes32) {
        require(bytes(_destination).length > 0, "Destination cannot be empty");
        require(_amount > 0, "Booking amount must be greater than 0");
        require(_bookingDate > 0, "Invalid booking date");
        
        // Generate unique booking hash
        bytes32 bookingHash = keccak256(
            abi.encodePacked(
                _tourist,
                _provider,
                _destination,
                _amount,
                _bookingDate,
                block.timestamp
            )
        );
        
        // Ensure booking doesn't already exist
        require(bookingRecords[bookingHash].bookingHash == bytes32(0), "Booking already exists");
        
        // Create booking record
        bookingRecords[bookingHash] = BookingRecord({
            bookingHash: bookingHash,
            tourist: _tourist,
            provider: _provider,
            destination: _destination,
            amount: _amount,
            bookingDate: _bookingDate,
            verificationDate: block.timestamp,
            status: VerificationStatus.Verified,
            ipfsHash: _ipfsHash
        });
        
        // Update mappings
        touristBookings[_tourist].push(bookingHash);
        providerBookings[_provider].push(bookingHash);
        allBookings.push(bookingHash);
        
        // Update counters
        totalBookings++;
        verifiedBookings++;
        
        emit BookingCreated(bookingHash, _tourist, _provider);
        emit BookingVerified(bookingHash, msg.sender);
        
        return bookingHash;
    }
    
    /**
     * @dev Check if a booking is valid and verified
     * @param _bookingHash Hash of the booking to check
     */
    function isBookingValid(bytes32 _bookingHash) public view returns (bool) {
        BookingRecord memory booking = bookingRecords[_bookingHash];
        return booking.bookingHash != bytes32(0) && 
               (booking.status == VerificationStatus.Verified || 
                booking.status == VerificationStatus.Completed);
    }
    
    /**
     * @dev Get booking details
     * @param _bookingHash Hash of the booking
     */
    function getBookingDetails(bytes32 _bookingHash) public view bookingExists(_bookingHash) returns (
        address tourist,
        address provider,
        string memory destination,
        uint256 amount,
        uint256 bookingDate,
        uint256 verificationDate,
        VerificationStatus status,
        string memory ipfsHash
    ) {
        BookingRecord memory booking = bookingRecords[_bookingHash];
        return (
            booking.tourist,
            booking.provider,
            booking.destination,
            booking.amount,
            booking.bookingDate,
            booking.verificationDate,
            booking.status,
            booking.ipfsHash
        );
    }
    
    /**
     * @dev Mark booking as completed
     * @param _bookingHash Hash of the booking
     */
    function completeBooking(bytes32 _bookingHash) 
        public 
        bookingExists(_bookingHash) 
        onlyTouristOrProvider(_bookingHash) 
    {
        BookingRecord storage booking = bookingRecords[_bookingHash];
        require(booking.status == VerificationStatus.Verified, "Booking must be verified first");
        
        booking.status = VerificationStatus.Completed;
        emit BookingCompleted(_bookingHash);
    }
    
    /**
     * @dev Cancel a booking
     * @param _bookingHash Hash of the booking
     * @param _reason Reason for cancellation
     */
    function cancelBooking(bytes32 _bookingHash, string memory _reason) 
        public 
        bookingExists(_bookingHash) 
        onlyTouristOrProvider(_bookingHash) 
    {
        BookingRecord storage booking = bookingRecords[_bookingHash];
        require(
            booking.status == VerificationStatus.Pending || 
            booking.status == VerificationStatus.Verified,
            "Cannot cancel completed or disputed booking"
        );
        
        booking.status = VerificationStatus.Cancelled;
        if (booking.status == VerificationStatus.Verified) {
            verifiedBookings--;
        }
        
        emit BookingCancelled(_bookingHash, _reason);
    }
    
    /**
     * @dev Dispute a booking
     * @param _bookingHash Hash of the booking
     * @param _reason Reason for dispute
     */
    function disputeBooking(bytes32 _bookingHash, string memory _reason) 
        public 
        bookingExists(_bookingHash) 
        onlyTouristOrProvider(_bookingHash) 
    {
        BookingRecord storage booking = bookingRecords[_bookingHash];
        require(
            booking.status != VerificationStatus.Cancelled,
            "Cannot dispute cancelled booking"
        );
        
        booking.status = VerificationStatus.Disputed;
        emit BookingDisputed(_bookingHash, _reason);
    }
    
    /**
     * @dev Get all bookings for a tourist
     * @param _tourist Address of the tourist
     */
    function getTouristBookings(address _tourist) public view validAddress(_tourist) returns (bytes32[] memory) {
        return touristBookings[_tourist];
    }
    
    /**
     * @dev Get all bookings for a provider
     * @param _provider Address of the provider
     */
    function getProviderBookings(address _provider) public view validAddress(_provider) returns (bytes32[] memory) {
        return providerBookings[_provider];
    }
    
    /**
     * @dev Get booking count for a tourist
     * @param _tourist Address of the tourist
     */
    function getTouristBookingCount(address _tourist) public view validAddress(_tourist) returns (uint256) {
        return touristBookings[_tourist].length;
    }
    
    /**
     * @dev Get booking count for a provider
     * @param _provider Address of the provider
     */
    function getProviderBookingCount(address _provider) public view validAddress(_provider) returns (uint256) {
        return providerBookings[_provider].length;
    }
    
    /**
     * @dev Get system statistics
     */
    function getSystemStats() public view returns (
        uint256 total,
        uint256 verified,
        uint256 completed,
        uint256 cancelled,
        uint256 disputed
    ) {
        uint256 completedCount = 0;
        uint256 cancelledCount = 0;
        uint256 disputedCount = 0;
        
        for (uint256 i = 0; i < allBookings.length; i++) {
            VerificationStatus status = bookingRecords[allBookings[i]].status;
            if (status == VerificationStatus.Completed) completedCount++;
            else if (status == VerificationStatus.Cancelled) cancelledCount++;
            else if (status == VerificationStatus.Disputed) disputedCount++;
        }
        
        return (totalBookings, verifiedBookings, completedCount, cancelledCount, disputedCount);
    }
    
    /**
     * @dev Authorize an address to verify bookings
     * @param _verifier Address to authorize
     */
    function authorizeVerifier(address _verifier) public onlyOwner validAddress(_verifier) {
        authorizedVerifiers[_verifier] = true;
        emit VerifierAuthorized(_verifier);
    }
    
    /**
     * @dev Revoke authorization from a verifier
     * @param _verifier Address to revoke
     */
    function revokeVerifier(address _verifier) public onlyOwner validAddress(_verifier) {
        authorizedVerifiers[_verifier] = false;
        emit VerifierRevoked(_verifier);
    }
    
    /**
     * @dev Batch verify multiple bookings
     * @param _bookingHashes Array of booking hashes to verify
     */
    function batchVerifyBookings(bytes32[] memory _bookingHashes) public onlyAuthorized {
        for (uint256 i = 0; i < _bookingHashes.length; i++) {
            bytes32 bookingHash = _bookingHashes[i];
            if (bookingRecords[bookingHash].bookingHash != bytes32(0)) {
                BookingRecord storage booking = bookingRecords[bookingHash];
                if (booking.status == VerificationStatus.Pending) {
                    booking.status = VerificationStatus.Verified;
                    booking.verificationDate = block.timestamp;
                    verifiedBookings++;
                    emit BookingVerified(bookingHash, msg.sender);
                }
            }
        }
    }
    
    /**
     * @dev Get all booking hashes
     */
    function getAllBookings() public view returns (bytes32[] memory) {
        return allBookings;
    }
}