// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Authentic Reviews System (Integrated Version - Stack Optimized)
 * @dev Smart contract for verified tourism reviews with BookingVerification integration
 * @author Jharkhand Tourism Blockchain System
 */

interface IBookingVerification {
    function isBookingValid(bytes32 _bookingHash) external view returns (bool);
    function getBookingDetails(bytes32 _bookingHash) external view returns (
        address tourist,
        address provider,
        string memory destination,
        uint256 amount,
        uint256 bookingDate,
        uint256 verificationDate,
        uint8 status,
        string memory ipfsHash
    );
}

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
        bool isBookingVerified; // New field for booking verification status
    }
    
    // Review statistics structure
    struct ReviewStats {
        uint256 totalReviews;
        uint256 verifiedReviews;
        uint256 averageRating;
        uint256 fiveStars;
        uint256 fourStars;
        uint256 threeStars;
        uint256 twoStars;
        uint256 oneStar;
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
    IBookingVerification public bookingVerification;
    
    // Events
    event ReviewSubmitted(uint256 indexed reviewId, address indexed reviewer, string destination, bool bookingVerified);
    event ReviewLiked(uint256 indexed reviewId, address indexed liker);
    event ReviewReported(uint256 indexed reviewId, address indexed reporter);
    event ReviewModerated(uint256 indexed reviewId, address indexed moderator, bool approved);
    event ModeratorAuthorized(address indexed moderator);
    event ModeratorRevoked(address indexed moderator);
    event BookingVerificationUpdated(address indexed newBookingVerification);
    
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
    
    constructor(address _bookingVerificationAddress) validAddress(_bookingVerificationAddress) {
        owner = msg.sender;
        authorizedModerators[msg.sender] = true;
        bookingVerification = IBookingVerification(_bookingVerificationAddress);
    }
    
    /**
     * @dev Submit a review with booking verification
     * @param _bookingHash Hash of the booking to verify
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
        
        // Verify booking authenticity
        bool isBookingValid = bookingVerification.isBookingValid(_bookingHash);
        bool isAuthorizedReviewer = false;
        
        if (isBookingValid) {
            isAuthorizedReviewer = _verifyReviewer(_bookingHash);
        }
        
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
            isVerified: true, // Reviews are verified by default, but booking verification is separate
            likes: 0,
            reports: 0,
            isBookingVerified: isBookingValid && isAuthorizedReviewer
        });
        
        // Update mappings
        destinationReviews[_destination].push(reviewId);
        userReviews[msg.sender].push(reviewId);
        bookingToReview[_bookingHash] = reviewId;
        
        // Update destination statistics
        _updateDestinationStats(_destination, _rating, isBookingValid && isAuthorizedReviewer);
        
        emit ReviewSubmitted(reviewId, msg.sender, _destination, isBookingValid && isAuthorizedReviewer);
        return reviewId;
    }
    
    /**
     * @dev Internal function to verify reviewer is the tourist from booking
     * @param _bookingHash Hash of the booking to verify
     */
    function _verifyReviewer(bytes32 _bookingHash) internal view returns (bool) {
        try bookingVerification.getBookingDetails(_bookingHash) returns (
            address tourist,
            address,  // provider
            string memory,  // destination
            uint256,  // amount
            uint256,  // bookingDate
            uint256,  // verificationDate
            uint8,    // status
            string memory  // ipfsHash
        ) {
            return (tourist == msg.sender);
        } catch {
            return false;
        }
    }
    
    /**
     * @dev Get all reviews for a destination
     * @param _destination Name of the destination
     */
    function getReviews(string memory _destination) public view returns (uint256[] memory) {
        return destinationReviews[_destination];
    }
    
    /**
     * @dev Get only booking-verified reviews for a destination
     * @param _destination Name of the destination
     */
    function getVerifiedReviews(string memory _destination) public view returns (uint256[] memory) {
        uint256[] memory allReviews = destinationReviews[_destination];
        uint256 verifiedCount = 0;
        
        // Count verified reviews first
        for (uint256 i = 0; i < allReviews.length; i++) {
            if (reviews[allReviews[i]].isBookingVerified) {
                verifiedCount++;
            }
        }
        
        // Create array of verified reviews
        uint256[] memory verifiedReviews = new uint256[](verifiedCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < allReviews.length; i++) {
            if (reviews[allReviews[i]].isBookingVerified) {
                verifiedReviews[currentIndex] = allReviews[i];
                currentIndex++;
            }
        }
        
        return verifiedReviews;
    }
    
    /**
     * @dev Get basic review details (optimized to avoid stack too deep)
     * @param _reviewId ID of the review
     */
    function getReviewBasics(uint256 _reviewId) public view reviewExists(_reviewId) returns (
        address reviewer,
        string memory destination,
        string memory provider,
        uint8 rating,
        uint256 timestamp,
        bool isBookingVerified
    ) {
        Review storage review = reviews[_reviewId];
        return (
            review.reviewer,
            review.destination,
            review.provider,
            review.rating,
            review.timestamp,
            review.isBookingVerified
        );
    }
    
    /**
     * @dev Get review content and interaction data
     * @param _reviewId ID of the review
     */
    function getReviewContent(uint256 _reviewId) public view reviewExists(_reviewId) returns (
        string memory reviewText,
        string[] memory images,
        uint256 likes,
        uint256 reports,
        bool isVerified
    ) {
        Review storage review = reviews[_reviewId];
        return (
            review.reviewText,
            review.images,
            review.likes,
            review.reports,
            review.isVerified
        );
    }
    
    /**
     * @dev Get review booking information
     * @param _reviewId ID of the review
     */
    function getReviewBookingInfo(uint256 _reviewId) public view reviewExists(_reviewId) returns (
        bytes32 bookingHash,
        bool isBookingVerified
    ) {
        Review storage review = reviews[_reviewId];
        return (
            review.bookingHash,
            review.isBookingVerified
        );
    }
    
    /**
     * @dev Get destination statistics including verified review count
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
     * @dev Get user's booking-verified reviews count
     * @param _user Address of the user
     */
    function getUserVerifiedReviewCount(address _user) public view validAddress(_user) returns (uint256) {
        uint256[] memory userReviewIds = userReviews[_user];
        uint256 verifiedCount = 0;
        
        for (uint256 i = 0; i < userReviewIds.length; i++) {
            if (reviews[userReviewIds[i]].isBookingVerified) {
                verifiedCount++;
            }
        }
        
        return verifiedCount;
    }
    
    /**
     * @dev Update BookingVerification contract address
     * @param _newBookingVerification New BookingVerification contract address
     */
    function updateBookingVerification(address _newBookingVerification) public onlyOwner validAddress(_newBookingVerification) {
        bookingVerification = IBookingVerification(_newBookingVerification);
        emit BookingVerificationUpdated(_newBookingVerification);
    }
    
    /**
     * @dev Get booking verification contract address
     */
    function getBookingVerificationAddress() public view returns (address) {
        return address(bookingVerification);
    }
    
    /**
     * @dev Check if a review is booking-verified
     * @param _reviewId ID of the review
     */
    function isReviewBookingVerified(uint256 _reviewId) public view reviewExists(_reviewId) returns (bool) {
        return reviews[_reviewId].isBookingVerified;
    }
    
    /**
     * @dev Get top booking-verified reviews for a destination
     * @param _destination Name of the destination
     * @param _limit Maximum number of reviews to return
     */
    function getTopVerifiedReviews(string memory _destination, uint256 _limit) public view returns (uint256[] memory) {
        uint256[] memory allReviews = destinationReviews[_destination];
        
        if (allReviews.length == 0 || _limit == 0) {
            return new uint256[](0);
        }
        
        // Count verified high-rating reviews
        uint256 eligibleCount = 0;
        for (uint256 i = 0; i < allReviews.length; i++) {
            if (reviews[allReviews[i]].isBookingVerified && 
                reviews[allReviews[i]].isVerified && 
                reviews[allReviews[i]].rating >= 4) {
                eligibleCount++;
            }
        }
        
        uint256 returnSize = eligibleCount < _limit ? eligibleCount : _limit;
        uint256[] memory topReviews = new uint256[](returnSize);
        uint256 added = 0;
        
        // Get high-rating verified reviews first
        for (uint256 i = 0; i < allReviews.length && added < returnSize; i++) {
            if (reviews[allReviews[i]].isBookingVerified && 
                reviews[allReviews[i]].isVerified && 
                reviews[allReviews[i]].rating >= 4) {
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
     * @dev Internal function to update destination statistics
     * @param _destination Name of the destination
     * @param _rating New rating to add
     * @param _isBookingVerified Whether the review is booking-verified
     */
    function _updateDestinationStats(string memory _destination, uint8 _rating, bool _isBookingVerified) internal {
        ReviewStats storage stats = destinationStats[_destination];
        
        // Update total reviews
        stats.totalReviews++;
        
        // Update verified review count
        if (_isBookingVerified) {
            stats.verifiedReviews++;
        }
        
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
    
    /**
     * @dev Get total number of booking-verified reviews in the system
     */
    function getTotalVerifiedReviews() public view returns (uint256) {
        uint256 verifiedCount = 0;
        for (uint256 i = 1; i < nextReviewId; i++) {
            if (reviews[i].isBookingVerified) {
                verifiedCount++;
            }
        }
        return verifiedCount;
    }
}