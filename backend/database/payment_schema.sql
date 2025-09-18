-- Payments table for tracking UPI payments
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    booking_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'verification_required') DEFAULT 'pending',
    payment_method ENUM('upi', 'card', 'net_banking', 'wallet') DEFAULT 'upi',
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    upi_transaction_id VARCHAR(100) NULL,
    upi_id VARCHAR(100) NULL,
    qr_code_data TEXT NULL,
    customer_note TEXT NULL,
    admin_note TEXT NULL,
    verified_amount DECIMAL(10,2) NULL,
    verified_by VARCHAR(36) NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_booking_id (booking_id),
    INDEX idx_status (status),
    INDEX idx_transaction_ref (transaction_reference),
    INDEX idx_created_at (created_at)
);

-- Add payment-related columns to bookings table
ALTER TABLE bookings 
ADD COLUMN payment_status ENUM('not_required', 'required', 'pending', 'completed', 'failed') DEFAULT 'required' AFTER status,
ADD COLUMN payment_amount DECIMAL(10,2) NULL AFTER payment_status,
ADD COLUMN payment_deadline TIMESTAMP NULL AFTER payment_amount;

-- Update booking status enum to include payment-related statuses
ALTER TABLE bookings 
MODIFY COLUMN status ENUM('pending', 'payment_required', 'payment_pending', 'paid', 'confirmed', 'completed', 'cancelled', 'rejected') DEFAULT 'pending';

-- Create payment_logs table for audit trail
CREATE TABLE IF NOT EXISTS payment_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    payment_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NULL,
    user_id VARCHAR(36) NULL,
    user_role ENUM('customer', 'admin', 'system') NOT NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_payment_id (payment_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Insert sample payment statuses data for testing
INSERT IGNORE INTO payments (id, booking_id, amount, status, payment_method, transaction_reference, created_at) 
SELECT 
    CONCAT('pay_', SUBSTRING(id, -8)) as payment_id,
    id as booking_id,
    total_price as amount,
    'pending' as status,
    'upi' as payment_method,
    CONCAT('PAY_', DATE_FORMAT(created_at, '%Y%m%d'), '_', UPPER(SUBSTRING(id, -6))) as transaction_reference,
    created_at
FROM bookings 
WHERE id NOT IN (SELECT booking_id FROM payments)
LIMIT 5;

-- Update existing bookings to require payment
UPDATE bookings 
SET 
    status = 'payment_required',
    payment_status = 'required',
    payment_amount = total_price,
    payment_deadline = DATE_ADD(created_at, INTERVAL 24 HOUR)
WHERE status = 'pending' AND payment_status IS NULL;