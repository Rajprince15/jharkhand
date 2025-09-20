// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Loyalty Rewards System
 * @dev Smart contract for managing loyalty points in tourism ecosystem
 * @author Jharkhand Tourism Blockchain System
 */

contract LoyaltyRewards {
    // Point transaction structure
    struct PointTransaction {
        address user;
        int256 amount; // Can be positive (earned) or negative (redeemed)
        string transactionType; // "earned", "redeemed", "transferred"
        string description;
        uint256 timestamp;
    }
    
    // State variables
    mapping(address => uint256) public pointBalances;
    mapping(address => uint256) public totalEarned;
    mapping(address => uint256) public totalRedeemed;
    mapping(address => PointTransaction[]) public userTransactions;
    mapping(address => bool) public authorizedRewarders;
    
    PointTransaction[] public allTransactions;
    
    address public owner;
    uint256 public totalPointsIssued;
    uint256 public totalPointsRedeemed;
    
    // Conversion rates (points per rupee)
    uint256 public constant POINTS_PER_RUPEE = 10; // 1 Rupee = 10 Points
    uint256 public constant MIN_REDEEM_POINTS = 100; // Minimum points to redeem
    
    // Events
    event PointsEarned(address indexed user, uint256 amount, string description);
    event PointsRedeemed(address indexed user, uint256 amount, string description);
    event PointsTransferred(address indexed from, address indexed to, uint256 amount);
    event RewarderAuthorized(address indexed rewarder);
    event RewarderRevoked(address indexed rewarder);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedRewarders[msg.sender] || msg.sender == owner, "Not authorized to manage points");
        _;
    }
    
    modifier validAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }
    
    modifier sufficientBalance(address _user, uint256 _amount) {
        require(pointBalances[_user] >= _amount, "Insufficient point balance");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedRewarders[msg.sender] = true;
    }
    
    /**
     * @dev Award points to a user for booking completion
     * @param _user Address of the user
     * @param _bookingAmount Booking amount in rupees
     * @param _description Description of the earning
     */
    function earnPoints(
        address _user,
        uint256 _bookingAmount,
        string memory _description
    ) public onlyAuthorized validAddress(_user) {
        require(_bookingAmount > 0, "Booking amount must be greater than 0");
        
        uint256 pointsToEarn = _bookingAmount * POINTS_PER_RUPEE;
        
        pointBalances[_user] += pointsToEarn;
        totalEarned[_user] += pointsToEarn;
        totalPointsIssued += pointsToEarn;
        
        // Record transaction
        PointTransaction memory transaction = PointTransaction({
            user: _user,
            amount: int256(pointsToEarn),
            transactionType: "earned",
            description: _description,
            timestamp: block.timestamp
        });
        
        userTransactions[_user].push(transaction);
        allTransactions.push(transaction);
        
        emit PointsEarned(_user, pointsToEarn, _description);
    }
    
    /**
     * @dev Redeem points for discounts
     * @param _user Address of the user
     * @param _pointsToRedeem Number of points to redeem
     * @param _description Description of the redemption
     */
    function redeemPoints(
        address _user,
        uint256 _pointsToRedeem,
        string memory _description
    ) public onlyAuthorized validAddress(_user) sufficientBalance(_user, _pointsToRedeem) returns (uint256) {
        require(_pointsToRedeem >= MIN_REDEEM_POINTS, "Minimum redemption amount not met");
        
        pointBalances[_user] -= _pointsToRedeem;
        totalRedeemed[_user] += _pointsToRedeem;
        totalPointsRedeemed += _pointsToRedeem;
        
        // Calculate discount value (1 point = 0.1 rupee)
        uint256 discountValue = _pointsToRedeem / POINTS_PER_RUPEE;
        
        // Record transaction
        PointTransaction memory transaction = PointTransaction({
            user: _user,
            amount: -int256(_pointsToRedeem),
            transactionType: "redeemed",
            description: _description,
            timestamp: block.timestamp
        });
        
        userTransactions[_user].push(transaction);
        allTransactions.push(transaction);
        
        emit PointsRedeemed(_user, _pointsToRedeem, _description);
        return discountValue;
    }
    
    /**
     * @dev Transfer points between users
     * @param _to Address of the recipient
     * @param _amount Number of points to transfer
     */
    function transferPoints(
        address _to,
        uint256 _amount
    ) public validAddress(_to) sufficientBalance(msg.sender, _amount) {
        require(_to != msg.sender, "Cannot transfer points to yourself");
        require(_amount > 0, "Transfer amount must be greater than 0");
        
        pointBalances[msg.sender] -= _amount;
        pointBalances[_to] += _amount;
        
        // Record transaction for sender
        PointTransaction memory senderTransaction = PointTransaction({
            user: msg.sender,
            amount: -int256(_amount),
            transactionType: "transferred",
            description: string(abi.encodePacked("Transferred to ", addressToString(_to))),
            timestamp: block.timestamp
        });
        
        userTransactions[msg.sender].push(senderTransaction);
        allTransactions.push(senderTransaction);
        
        // Record transaction for recipient
        PointTransaction memory recipientTransaction = PointTransaction({
            user: _to,
            amount: int256(_amount),
            transactionType: "transferred",
            description: string(abi.encodePacked("Received from ", addressToString(msg.sender))),
            timestamp: block.timestamp
        });
        
        userTransactions[_to].push(recipientTransaction);
        allTransactions.push(recipientTransaction);
        
        emit PointsTransferred(msg.sender, _to, _amount);
    }
    
    /**
     * @dev Get point balance for a user
     * @param _user Address of the user
     */
    function getPointBalance(address _user) public view validAddress(_user) returns (uint256) {
        return pointBalances[_user];
    }
    
    /**
     * @dev Get user's transaction history
     * @param _user Address of the user
     */
    function getUserTransactions(address _user) public view validAddress(_user) returns (PointTransaction[] memory) {
        return userTransactions[_user];
    }
    
    /**
     * @dev Get user's transaction count
     * @param _user Address of the user
     */
    function getUserTransactionCount(address _user) public view validAddress(_user) returns (uint256) {
        return userTransactions[_user].length;
    }
    
    /**
     * @dev Calculate discount value from points
     * @param _points Number of points
     */
    function calculateDiscountValue(uint256 _points) public pure returns (uint256) {
        return _points / POINTS_PER_RUPEE;
    }
    
    /**
     * @dev Calculate points from booking amount
     * @param _bookingAmount Booking amount in rupees
     */
    function calculatePointsFromAmount(uint256 _bookingAmount) public pure returns (uint256) {
        return _bookingAmount * POINTS_PER_RUPEE;
    }
    
    /**
     * @dev Get user stats
     * @param _user Address of the user
     */
    function getUserStats(address _user) public view validAddress(_user) returns (
        uint256 balance,
        uint256 earned,
        uint256 redeemed,
        uint256 transactionCount
    ) {
        return (
            pointBalances[_user],
            totalEarned[_user],
            totalRedeemed[_user],
            userTransactions[_user].length
        );
    }
    
    /**
     * @dev Authorize an address to manage rewards
     * @param _rewarder Address to authorize
     */
    function authorizeRewarder(address _rewarder) public onlyOwner validAddress(_rewarder) {
        authorizedRewarders[_rewarder] = true;
        emit RewarderAuthorized(_rewarder);
    }
    
    /**
     * @dev Revoke authorization from a rewarder
     * @param _rewarder Address to revoke
     */
    function revokeRewarder(address _rewarder) public onlyOwner validAddress(_rewarder) {
        authorizedRewarders[_rewarder] = false;
        emit RewarderRevoked(_rewarder);
    }
    
    /**
     * @dev Get system statistics
     */
    function getSystemStats() public view returns (
        uint256 totalIssued,
        uint256 totalRedeemed_,
        uint256 totalActive,
        uint256 totalTransactions
    ) {
        return (
            totalPointsIssued,
            totalPointsRedeemed,
            totalPointsIssued - totalPointsRedeemed,
            allTransactions.length
        );
    }
    
    /**
     * @dev Helper function to convert address to string
     * @param _addr Address to convert
     */
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
}