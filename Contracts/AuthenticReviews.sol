// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Authentic Reviews System
 * @dev Smart contract for verified tourism reviews linked to completed bookings
 * @author Jharkhand Tourism Blockchain System
 */

contract AuthenticReviews {
    // Review structure
    struct Review {
        uint256 reviewId;
        address reviewer;
        bytes32 bookingHash;
        string destination;
        string provider;
        uint8 rating; // 1-5 stars
        string reviewText;
        string[] images; // IPFS hashes of review images
        uint256 timestamp;
        bool isVerified;
        uint256 likes;
        uint256 reports;
    }
    
    // Review statistics structure
    struct ReviewStats {
        uint256 totalReviews;
        uint256 averageRating;
        uint256 fiveStars;
        uint256 fourStars;
        uint256 threeStars;
        uint256 twoStars;
        uint256 oneStar;
    }
    
    // Verification status enum (must match BookingVerification contract)
    enum VerificationStatus {
        Pending,
        Verified,
        Completed,
        Cancelled,
        Disputed
    }

    // Interface for BookingVerification contract
    interface IBookingVerification {
        function isBookingValid(bytes32 _bookingHash) external view returns (bool);
        function getBookingDetails(bytes32 _bookingHash) external view returns (
            address tourist,
            address provider,
            string memory destination,
            uint256 amount,
            uint256 bookingDate,
            uint256 verificationDate,
            VerificationStatus status,
            string memory ipfsHash
        );
    }
    
    // State variables
    mapping(uint256 => Review) public reviews;
    mapping(string => uint256[]) public destinationReviews;
    mapping(string => ReviewStats) public destinationStats;
    mapping(address => uint256[]) public userReviews;
    mapping(bytes32 => uint256) public bookingToReview; // One review per booking
    mapping(uint256 => mapping(address => bool)) public reviewLikes;
    mapping(uint256 => mapping(address => bool)) public reviewReports;
    mapping(address => bool) public authorizedModerators;
    
    uint256 private nextReviewId = 1;
    address public owner;
    address public bookingVerificationContract;
    
    // Events
    event ReviewSubmitted(uint256 indexed reviewId, address indexed reviewer, string destination);
    event ReviewLiked(uint256 indexed reviewId, address indexed liker);
    event ReviewReported(uint256 indexed reviewId, address indexed reporter);
    event ReviewModerated(uint256 indexed reviewId, address indexed moderator, bool approved);
    event ModeratorAuthorized(address indexed moderator);
    event ModeratorRevoked(address indexed moderator);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyModerator() {
        require(authorizedModerators[msg.sender] || msg.sender == owner, "Not authorized to moderate");
        _;
    }
    
    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }
    
    modifier reviewExists(uint256 _reviewId) {
        require(_reviewId > 0 && _reviewId < nextReviewId, "Review does not exist");
        _;
    }
    
    modifier validRating(uint8 _rating) {
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        _;
    }
    
    constructor(address _bookingVerificationContract) {
        owner = msg.sender;
        bookingVerificationContract = _bookingVerificationContract;
        authorizedModerators[msg.sender] = true;
    }
    
    /**
     * @dev Submit a verified review for a completed booking
     * @param _bookingHash Hash of the completed booking
     * @param _destination Name of the destination
     * @param _provider Name of the service provider
     * @param _rating Rating from 1-5 stars
     * @param _reviewText Review content
     * @param _images Array of IPFS hashes for review images
     */
    function submitReview(
        bytes32 _bookingHash,
        string memory _destination,
        string memory _provider,
        uint8 _rating,
        string memory _reviewText,
        string[] memory _images
    ) public validRating(_rating) returns (uint256) {
        require(bytes(_destination).length > 0, "Destination cannot be empty");
        require(bytes(_provider).length > 0, "Provider cannot be empty");
        require(bytes(_reviewText).length >= 10, "Review text too short (minimum 10 characters)");
        require(bookingToReview[_bookingHash] == 0, "Review already exists for this booking");
        
        // Verify booking exists and is completed
        IBookingVerification bookingContract = IBookingVerification(bookingVerificationContract);
        require(bookingContract.isBookingValid(_bookingHash), "Invalid or unverified booking");
        
        // Get booking details to verify reviewer is the tourist
        (address tourist, , , , , , , ) = bookingContract.getBookingDetails(_bookingHash);
        require(msg.sender == tourist, "Only the tourist can review this booking");
        
        uint256 reviewId = nextReviewId;
        nextReviewId++;
        
        // Create review
        reviews[reviewId] = Review({
            reviewId: reviewId,
            reviewer: msg.sender,
            bookingHash: _bookingHash,
            destination: _destination,
            provider: _provider,
            rating: _rating,
            reviewText: _reviewText,
            images: _images,
            timestamp: block.timestamp,
            isVerified: true, // Auto-verified since linked to booking
            likes: 0,
            reports: 0
        });
        
        // Update mappings
        destinationReviews[_destination].push(reviewId);
        userReviews[msg.sender].push(reviewId);
        bookingToReview[_bookingHash] = reviewId;
        
        // Update destination statistics
        _updateDestinationStats(_destination, _rating);
        
        emit ReviewSubmitted(reviewId, msg.sender, _destination);
        return reviewId;
    }
    
    /**
     * @dev Check if a reviewer has completed a verified tour to the destination
     * @param _reviewer Address of the reviewer
     * @param _destination Name of the destination
     */
    function isReviewerVerified(address _reviewer, string memory _destination) public view returns (bool) {
        uint256[] memory userReviewIds = userReviews[_reviewer];
        
        for (uint256 i = 0; i < userReviewIds.length; i++) {
            Review memory review = reviews[userReviewIds[i]];
            if (keccak256(bytes(review.destination)) == keccak256(bytes(_destination)) && review.isVerified) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get all reviews for a destination
     * @param _destination Name of the destination
     */
    function getReviews(string memory _destination) public view returns (uint256[] memory) {
        return destinationReviews[_destination];
    }
    
    /**
     * @dev Get review details
     * @param _reviewId ID of the review
     */
    function getReviewDetails(uint256 _reviewId) public view reviewExists(_reviewId) returns (
        address reviewer,
        bytes32 bookingHash,
        string memory destination,
        string memory provider,
        uint8 rating,
        string memory reviewText,
        string[] memory images,
        uint256 timestamp,
        bool isVerified,
        uint256 likes,
        uint256 reports
    ) {
        Review memory review = reviews[_reviewId];
        return (
            review.reviewer,
            review.bookingHash,
            review.destination,
            review.provider,
            review.rating,
            review.reviewText,
            review.images,
            review.timestamp,
            review.isVerified,
            review.likes,
            review.reports
        );
    }
    
    /**
     * @dev Get destination statistics
     * @param _destination Name of the destination
     */
    function getDestinationStats(string memory _destination) public view returns (ReviewStats memory) {
        return destinationStats[_destination];
    }
    
    /**
     * @dev Like a review
     * @param _reviewId ID of the review to like
     */
    function likeReview(uint256 _reviewId) public reviewExists(_reviewId) {
        require(!reviewLikes[_reviewId][msg.sender], "Already liked this review");
        require(reviews[_reviewId].reviewer != msg.sender, "Cannot like your own review");
        
        reviewLikes[_reviewId][msg.sender] = true;
        reviews[_reviewId].likes++;
        
        emit ReviewLiked(_reviewId, msg.sender);
    }
    
    /**
     * @dev Report a review for inappropriate content
     * @param _reviewId ID of the review to report
     */
    function reportReview(uint256 _reviewId) public reviewExists(_reviewId) {
        require(!reviewReports[_reviewId][msg.sender], "Already reported this review");
        require(reviews[_reviewId].reviewer != msg.sender, "Cannot report your own review");
        
        reviewReports[_reviewId][msg.sender] = true;
        reviews[_reviewId].reports++;
        
        emit ReviewReported(_reviewId, msg.sender);
    }
    
    /**
     * @dev Moderate a review (approve/disapprove)
     * @param _reviewId ID of the review
     * @param _approved Whether the review is approved
     */
    function moderateReview(uint256 _reviewId, bool _approved) public onlyModerator reviewExists(_reviewId) {
        reviews[_reviewId].isVerified = _approved;
        emit ReviewModerated(_reviewId, msg.sender, _approved);
    }
    
    /**
     * @dev Get user's reviews
     * @param _user Address of the user
     */
    function getUserReviews(address _user) public view validAddress(_user) returns (uint256[] memory) {
        return userReviews[_user];
    }
    
    /**
     * @dev Get review count for a user
     * @param _user Address of the user
     */
    function getUserReviewCount(address _user) public view validAddress(_user) returns (uint256) {
        return userReviews[_user].length;
    }
    
    /**
     * @dev Get review count for a destination
     * @param _destination Name of the destination
     */
    function getDestinationReviewCount(string memory _destination) public view returns (uint256) {
        return destinationReviews[_destination].length;
    }
    
    /**
     * @dev Check if user liked a review
     * @param _reviewId ID of the review
     * @param _user Address of the user
     */
    function hasUserLikedReview(uint256 _reviewId, address _user) public view returns (bool) {
        return reviewLikes[_reviewId][_user];
    }
    
    /**
     * @dev Check if user reported a review
     * @param _reviewId ID of the review
     * @param _user Address of the user
     */
    function hasUserReportedReview(uint256 _reviewId, address _user) public view returns (bool) {
        return reviewReports[_reviewId][_user];
    }
    
    /**
     * @dev Get top-rated reviews for a destination
     * @param _destination Name of the destination
     * @param _limit Maximum number of reviews to return
     */
    function getTopReviews(string memory _destination, uint256 _limit) public view returns (uint256[] memory) {
        uint256[] memory allReviews = destinationReviews[_destination];
        
        if (allReviews.length == 0 || _limit == 0) {
            return new uint256[](0);
        }
        
        uint256 returnSize = allReviews.length < _limit ? allReviews.length : _limit;
        uint256[] memory topReviews = new uint256[](returnSize);
        
        // Simple selection based on rating and likes (could be improved with sorting)
        uint256 added = 0;
        for (uint256 i = 0; i < allReviews.length && added < returnSize; i++) {
            if (reviews[allReviews[i]].isVerified && reviews[allReviews[i]].rating >= 4) {
                topReviews[added] = allReviews[i];
                added++;
            }
        }
        
        // Fill remaining spots with any verified reviews
        for (uint256 i = 0; i < allReviews.length && added < returnSize; i++) {
            if (reviews[allReviews[i]].isVerified && reviews[allReviews[i]].rating < 4) {
                topReviews[added] = allReviews[i];
                added++;
            }
        }
        
        return topReviews;
    }
    
    /**
     * @dev Authorize a moderator
     * @param _moderator Address to authorize
     */
    function authorizeModerator(address _moderator) public onlyOwner validAddress(_moderator) {
        authorizedModerators[_moderator] = true;
        emit ModeratorAuthorized(_moderator);
    }
    
    /**
     * @dev Revoke moderator authorization
     * @param _moderator Address to revoke
     */
    function revokeModerator(address _moderator) public onlyOwner validAddress(_moderator) {
        authorizedModerators[_moderator] = false;
        emit ModeratorRevoked(_moderator);
    }
    
    /**
     * @dev Update booking verification contract address
     * @param _newContract New contract address
     */
    function updateBookingContract(address _newContract) public onlyOwner validAddress(_newContract) {
        bookingVerificationContract = _newContract;
    }
    
    /**
     * @dev Internal function to update destination statistics
     * @param _destination Name of the destination
     * @param _rating New rating to add
     */
    function _updateDestinationStats(string memory _destination, uint8 _rating) internal {
        ReviewStats storage stats = destinationStats[_destination];
        
        // Update total reviews
        stats.totalReviews++;
        
        // Update star counts
        if (_rating == 5) stats.fiveStars++;
        else if (_rating == 4) stats.fourStars++;
        else if (_rating == 3) stats.threeStars++;
        else if (_rating == 2) stats.twoStars++;
        else if (_rating == 1) stats.oneStar++;
        
        // Calculate new average rating
        uint256 totalRatingPoints = (stats.fiveStars * 5) + (stats.fourStars * 4) + 
                                  (stats.threeStars * 3) + (stats.twoStars * 2) + 
                                  (stats.oneStar * 1);
        
        stats.averageRating = totalRatingPoints / stats.totalReviews;
    }
    
    /**
     * @dev Get total number of reviews in the system
     */
    function getTotalReviews() public view returns (uint256) {
        return nextReviewId - 1;
    }
}