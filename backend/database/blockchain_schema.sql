-- Blockchain Schema Extensions for Jharkhand Tourism
-- Phase 3: Database Schema Update

USE jharkhand_tourism;

-- Table for storing user wallet information
CREATE TABLE IF NOT EXISTS user_wallets (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    wallet_provider VARCHAR(50) DEFAULT 'metamask',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_user_wallet (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for storing blockchain certificates (NFTs)
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    booking_id VARCHAR(255) NOT NULL,
    certificate_type ENUM('tour_completion', 'special_achievement', 'loyalty_milestone') DEFAULT 'tour_completion',
    nft_token_id BIGINT UNSIGNED,
    contract_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66),
    blockchain_network VARCHAR(20) DEFAULT 'sepolia',
    metadata_url TEXT,
    certificate_title VARCHAR(255) NOT NULL,
    certificate_description TEXT,
    destination_name VARCHAR(255),
    completion_date DATE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_minted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_user_certificates (user_id),
    INDEX idx_booking_certificates (booking_id),
    INDEX idx_token_id (nft_token_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for loyalty points on blockchain
CREATE TABLE IF NOT EXISTS loyalty_points (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    points_balance DECIMAL(10,2) DEFAULT 0.00,
    total_earned DECIMAL(10,2) DEFAULT 0.00,
    total_redeemed DECIMAL(10,2) DEFAULT 0.00,
    contract_address VARCHAR(42) NOT NULL,
    last_sync_block BIGINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_loyalty (user_id),
    INDEX idx_wallet_loyalty (wallet_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for loyalty point transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    transaction_type ENUM('earned', 'redeemed', 'bonus', 'expired') NOT NULL,
    points_amount DECIMAL(10,2) NOT NULL,
    booking_id VARCHAR(255),
    transaction_hash VARCHAR(66),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_user_loyalty_txn (user_id),
    INDEX idx_transaction_type (transaction_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for blockchain booking verification
CREATE TABLE IF NOT EXISTS blockchain_bookings (
    id VARCHAR(255) PRIMARY KEY,
    booking_id VARCHAR(255) NOT NULL UNIQUE,
    user_wallet VARCHAR(42) NOT NULL,
    booking_hash VARCHAR(66) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66),
    verification_status ENUM('pending', 'verified', 'completed', 'failed') DEFAULT 'pending',
    blockchain_network VARCHAR(20) DEFAULT 'sepolia',
    gas_fee_paid DECIMAL(18,8),
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_verification (booking_id),
    INDEX idx_wallet_bookings (user_wallet),
    INDEX idx_verification_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for verified reviews on blockchain
CREATE TABLE IF NOT EXISTS blockchain_reviews (
    id VARCHAR(255) PRIMARY KEY,
    review_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255) NOT NULL,
    booking_id VARCHAR(255) NOT NULL,
    destination_id VARCHAR(255) NOT NULL,
    review_hash VARCHAR(66) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    transaction_hash VARCHAR(66),
    verification_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
    is_authentic BOOLEAN DEFAULT TRUE,
    blockchain_network VARCHAR(20) DEFAULT 'sepolia',
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX idx_review_blockchain (review_id),
    INDEX idx_user_blockchain_reviews (user_id),
    INDEX idx_booking_reviews (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add blockchain-related columns to existing bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS blockchain_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blockchain_hash VARCHAR(66),
ADD COLUMN IF NOT EXISTS smart_contract_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS certificate_eligible BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT FALSE;

-- Add blockchain columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42) UNIQUE,
ADD COLUMN IF NOT EXISTS wallet_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS loyalty_points_balance DECIMAL(10,2) DEFAULT 0.00;

-- Add blockchain verification to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS blockchain_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blockchain_hash VARCHAR(66),
ADD COLUMN IF NOT EXISTS is_verified_tourist BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_blockchain ON bookings(blockchain_verified);
CREATE INDEX IF NOT EXISTS idx_bookings_certificate ON bookings(certificate_eligible, certificate_issued);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_reviews_blockchain ON reviews(blockchain_verified);

-- Insert initial data for smart contract addresses (using your provided addresses)
INSERT IGNORE INTO loyalty_points (id, user_id, wallet_address, contract_address) 
SELECT 
    CONCAT('loyalty_', users.id), 
    users.id, 
    users.wallet_address, 
    '0x0bc63df35c5ea71f0311cae56d68fbef83fc2346'
FROM users 
WHERE users.wallet_address IS NOT NULL;

COMMIT;