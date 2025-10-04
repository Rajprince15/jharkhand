-- Artisan Marketplace Database Schema
-- This file contains all necessary database changes for artisan marketplace functionality

-- 1. First, modify the users table to add 'artisan' role
ALTER TABLE `users` MODIFY COLUMN `role` ENUM('tourist','provider','admin','artisan') DEFAULT 'tourist';

-- 2. Create handicrafts table for artisan products
CREATE TABLE IF NOT EXISTS `handicrafts` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `artisan_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `category` ENUM('pottery','textiles','jewelry','woodcraft','metalwork','paintings','sculptures','baskets','other') NOT NULL,
  `description` TEXT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `discount_price` DECIMAL(10,2) DEFAULT NULL,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `images` JSON DEFAULT NULL,
  `materials` VARCHAR(500) DEFAULT NULL,
  `dimensions` VARCHAR(200) DEFAULT NULL,
  `weight` DECIMAL(8,2) DEFAULT NULL,
  `origin_village` VARCHAR(255) DEFAULT NULL,
  `cultural_significance` TEXT DEFAULT NULL,
  `care_instructions` TEXT DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_available` BOOLEAN DEFAULT TRUE,
  `is_tribal_made` BOOLEAN DEFAULT FALSE,
  `tribal_community_name` VARCHAR(255) DEFAULT NULL,
  `rating` DECIMAL(3,2) DEFAULT 0.00,
  `total_reviews` INT DEFAULT 0,
  `total_sold` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`artisan_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_handicrafts_artisan` (`artisan_id`),
  INDEX `idx_handicrafts_category` (`category`),
  INDEX `idx_handicrafts_tribal` (`is_tribal_made`),
  INDEX `idx_handicrafts_available` (`is_available`),
  INDEX `idx_handicrafts_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Create events table for community-posted events  
CREATE TABLE IF NOT EXISTS `events` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `event_type` ENUM('festival','workshop','performance','exhibition','tour','ceremony','other') NOT NULL,
  `date` DATE NOT NULL,
  `time` TIME DEFAULT NULL,
  `location` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `posted_by` VARCHAR(255) NOT NULL,
  `poster_role` ENUM('artisan','provider','admin') NOT NULL,
  `is_approved` BOOLEAN DEFAULT FALSE,
  `approval_notes` TEXT DEFAULT NULL,
  `max_participants` INT DEFAULT NULL,
  `current_participants` INT DEFAULT 0,
  `entry_fee` DECIMAL(10,2) DEFAULT 0.00,
  `contact_info` VARCHAR(255) DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`posted_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_events_poster` (`posted_by`),
  INDEX `idx_events_approved` (`is_approved`),
  INDEX `idx_events_date` (`date`),
  INDEX `idx_events_type` (`event_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Create handicraft_orders table for sales tracking
CREATE TABLE IF NOT EXISTS `handicraft_orders` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `handicraft_id` VARCHAR(255) NOT NULL,
  `buyer_id` VARCHAR(255) NOT NULL,
  `seller_id` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `order_status` ENUM('pending','confirmed','preparing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_status` ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  `shipping_method` ENUM('standard','express','pickup') DEFAULT 'standard',
  `shipping_address` TEXT DEFAULT NULL,
  `delivery_date` DATE DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`handicraft_id`) REFERENCES `handicrafts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_orders_handicraft` (`handicraft_id`),
  INDEX `idx_orders_buyer` (`buyer_id`),
  INDEX `idx_orders_seller` (`seller_id`),
  INDEX `idx_orders_status` (`order_status`),
  INDEX `idx_orders_date` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Create event_bookings table for event participation
CREATE TABLE IF NOT EXISTS `event_bookings` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `event_id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `participants` INT NOT NULL DEFAULT 1,
  `total_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `booking_status` ENUM('pending','confirmed','cancelled','completed','refunded') DEFAULT 'pending',
  `payment_status` ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  `contact_name` VARCHAR(255) NOT NULL,
  `contact_email` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(20) NOT NULL,
  `special_requests` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_event_bookings_event` (`event_id`),
  INDEX `idx_event_bookings_user` (`user_id`),
  INDEX `idx_event_bookings_status` (`booking_status`),
  UNIQUE KEY `unique_user_event` (`event_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Create handicraft_reviews table for product reviews
CREATE TABLE IF NOT EXISTS `handicraft_reviews` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `handicraft_id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `order_id` VARCHAR(255) DEFAULT NULL,
  `rating` INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `title` VARCHAR(255) DEFAULT NULL,
  `comment` TEXT DEFAULT NULL,
  `images` JSON DEFAULT NULL,
  `is_verified_purchase` BOOLEAN DEFAULT FALSE,
  `helpful_count` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`handicraft_id`) REFERENCES `handicrafts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `handicraft_orders`(`id`) ON DELETE SET NULL,
  INDEX `idx_handicraft_reviews_handicraft` (`handicraft_id`),
  INDEX `idx_handicraft_reviews_user` (`user_id`),
  INDEX `idx_handicraft_reviews_verified` (`is_verified_purchase`),
  UNIQUE KEY `unique_user_handicraft_review` (`handicraft_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. Create marketplace_notifications table for real-time updates
CREATE TABLE IF NOT EXISTS `marketplace_notifications` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('new_order','order_update','review_received','event_booking','payment_received','inventory_low','new_message') NOT NULL,
  `priority` ENUM('low','medium','high','urgent') DEFAULT 'medium',
  `is_read` BOOLEAN DEFAULT FALSE,
  `related_id` VARCHAR(255) DEFAULT NULL,
  `action_url` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_read` (`is_read`),
  INDEX `idx_notifications_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Add marketplace-specific fields to providers table (for existing providers who want to enable marketplace)
ALTER TABLE `providers` 
ADD COLUMN `marketplace_enabled` BOOLEAN DEFAULT FALSE AFTER `is_active`,
ADD COLUMN `marketplace_commission` DECIMAL(5,2) DEFAULT 5.00 AFTER `marketplace_enabled`,
ADD COLUMN `marketplace_categories` JSON DEFAULT NULL AFTER `marketplace_commission`;

-- Insert sample artisan users for testing
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `phone`, `created_at`, `updated_at`) VALUES
('artisan_001', 'Kamala Devi', 'kamala.pottery@email.com', '$2b$12$VtjqMmKHc8Nc41sDgpVsbOcJO4gUApXsj72q3jGA8bbQS2GMGIp4W', 'artisan', '+91-9876543201', NOW(), NOW()),
('artisan_002', 'Sita Hansda', 'sita.weaver@email.com', '$2b$12$VtjqMmKHc8Nc41sDgpVsbOcJO4gUApXsj72q3jGA8bbQS2GMGIp4W', 'artisan', '+91-9876543202', NOW(), NOW()),
('artisan_003', 'Birsa Kumar', 'birsa.jewelry@email.com', '$2b$12$VtjqMmKHc8Nc41sDgpVsbOcJO4gUApXsj72q3jGA8bbQS2GMGIp4W', 'artisan', '+91-9876543203', NOW(), NOW());

-- Insert sample handicrafts for testing
INSERT IGNORE INTO `handicrafts` (`id`, `artisan_id`, `name`, `category`, `description`, `price`, `stock_quantity`, `is_tribal_made`, `tribal_community_name`, `origin_village`, `cultural_significance`) VALUES
('handicraft_001', 'artisan_001', 'Tribal Clay Pot', 'pottery', 'Handcrafted clay pot made using traditional tribal techniques passed down through generations.', 899.00, 25, TRUE, 'Oraon', 'Sisai Village', 'Used in traditional cooking and water storage rituals'),
('handicraft_002', 'artisan_002', 'Santal Handloom Saree', 'textiles', 'Beautiful handwoven saree with traditional Santal patterns and natural dyes.', 2499.00, 10, TRUE, 'Santal', 'Dumka Village', 'Worn during festivals and special ceremonies'),
('handicraft_003', 'artisan_003', 'Silver Tribal Necklace', 'jewelry', 'Intricate silver necklace with traditional tribal motifs and precious stones.', 1899.00, 15, TRUE, 'Munda', 'Khunti Village', 'Symbolizes prosperity and protection in tribal culture');

-- Insert sample events for testing
INSERT IGNORE INTO `events` (`id`, `title`, `description`, `event_type`, `date`, `location`, `posted_by`, `poster_role`, `is_approved`) VALUES
('event_001', 'Sarhul Festival Celebration', 'Traditional Sarhul festival celebrating the arrival of spring with tribal dances, music, and local food.', 'festival', '2025-04-15', 'Ranchi Cultural Center', 'artisan_001', 'artisan', TRUE),
('event_002', 'Tribal Handicraft Workshop', 'Learn traditional pottery making techniques from experienced tribal artisans.', 'workshop', '2025-02-20', 'Sisai Village Community Hall', 'artisan_001', 'artisan', TRUE),
('event_003', 'Cultural Dance Performance', 'Evening performance featuring traditional Santal and Oraon dances.', 'performance', '2025-03-10', 'Birsa Munda Stadium', 'artisan_002', 'artisan', FALSE);