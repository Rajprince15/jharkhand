-- Marketplace Schema for Jharkhand Tourism
-- Adding handicrafts marketplace tables and extending providers system for homestays

USE jharkhand_tourism;

-- Handicrafts Marketplace Table
CREATE TABLE IF NOT EXISTS `handicrafts` (
  `id` varchar(255) NOT NULL,
  `seller_id` varchar(255) NOT NULL, -- References users table (artisans)
  `name` varchar(255) NOT NULL,
  `category` enum('pottery','textiles','jewelry','woodcraft','metalwork','paintings','sculptures','baskets','other') NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int NOT NULL DEFAULT 1,
  `rating` decimal(2,1) DEFAULT 0.0,
  `total_reviews` int DEFAULT 0,
  `images` json DEFAULT NULL, -- Array of image URLs
  `materials` varchar(500) DEFAULT NULL, -- Materials used
  `dimensions` varchar(200) DEFAULT NULL, -- Size/dimensions
  `weight` decimal(5,2) DEFAULT NULL, -- Weight in kg
  `origin_village` varchar(255) DEFAULT NULL, -- Village/area of origin
  `cultural_significance` text DEFAULT NULL, -- Cultural background
  `care_instructions` text DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `tags` json DEFAULT NULL, -- Search tags
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_handicrafts_category` (`category`),
  KEY `idx_handicrafts_seller` (`seller_id`),
  KEY `idx_handicrafts_rating` (`rating`),
  KEY `idx_handicrafts_price` (`price`),
  KEY `idx_handicrafts_featured` (`is_featured`),
  CONSTRAINT `handicrafts_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Handicraft Orders/Bookings Table
CREATE TABLE IF NOT EXISTS `handicraft_orders` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL, -- Buyer
  `handicraft_id` varchar(255) NOT NULL,
  `seller_id` varchar(255) NOT NULL, -- Artisan
  `quantity` int NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','preparing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `shipping_address` json NOT NULL, -- Full address object
  `shipping_method` enum('standard','express','pickup') DEFAULT 'standard',
  `estimated_delivery` date DEFAULT NULL,
  `tracking_id` varchar(100) DEFAULT NULL,
  `buyer_notes` text DEFAULT NULL,
  `seller_notes` text DEFAULT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_handicraft_orders_user` (`user_id`),
  KEY `idx_handicraft_orders_handicraft` (`handicraft_id`),
  KEY `idx_handicraft_orders_seller` (`seller_id`),
  KEY `idx_handicraft_orders_status` (`status`),
  KEY `idx_handicraft_orders_date` (`order_date`),
  CONSTRAINT `handicraft_orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `handicraft_orders_ibfk_2` FOREIGN KEY (`handicraft_id`) REFERENCES `handicrafts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `handicraft_orders_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Handicraft Reviews Table  
CREATE TABLE IF NOT EXISTS `handicraft_reviews` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `handicraft_id` varchar(255) NOT NULL,
  `order_id` varchar(255) NOT NULL, -- Link to actual purchase
  `rating` int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `review_text` text DEFAULT NULL,
  `images` json DEFAULT NULL, -- Review images
  `quality_rating` int DEFAULT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  `delivery_rating` int DEFAULT NULL CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  `seller_rating` int DEFAULT NULL CHECK (seller_rating >= 1 AND seller_rating <= 5),
  `is_verified` tinyint(1) DEFAULT 1, -- Verified purchase
  `helpful_count` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_handicraft_order` (`user_id`, `handicraft_id`, `order_id`),
  KEY `idx_handicraft_reviews_handicraft` (`handicraft_id`),
  KEY `idx_handicraft_reviews_user` (`user_id`),
  KEY `idx_handicraft_reviews_rating` (`rating`),
  CONSTRAINT `handicraft_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `handicraft_reviews_ibfk_2` FOREIGN KEY (`handicraft_id`) REFERENCES `handicrafts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `handicraft_reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `handicraft_orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Events Table (for cultural events, festivals, workshops)
CREATE TABLE IF NOT EXISTS `cultural_events` (
  `id` varchar(255) NOT NULL,
  `organizer_id` varchar(255) NOT NULL, -- References users table
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `event_type` enum('festival','workshop','performance','exhibition','tour','ceremony','other') NOT NULL,
  `location` varchar(255) NOT NULL,
  `venue_details` text DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00, -- 0 for free events
  `max_participants` int DEFAULT NULL,
  `current_bookings` int DEFAULT 0,
  `images` json DEFAULT NULL,
  `cultural_significance` text DEFAULT NULL,
  `what_to_expect` text DEFAULT NULL,
  `what_to_bring` text DEFAULT NULL,
  `age_restrictions` varchar(100) DEFAULT NULL,
  `languages` varchar(200) DEFAULT 'Hindi, English',
  `contact_info` json DEFAULT NULL,
  `cancellation_policy` text DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `total_reviews` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `tags` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_organizer` (`organizer_id`),
  KEY `idx_events_type` (`event_type`),
  KEY `idx_events_date` (`start_date`),
  KEY `idx_events_location` (`location`),
  KEY `idx_events_featured` (`is_featured`),
  CONSTRAINT `cultural_events_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Event Bookings Table
CREATE TABLE IF NOT EXISTS `event_bookings` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `organizer_id` varchar(255) NOT NULL,
  `participants` int NOT NULL DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed','refunded') DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `participant_details` json DEFAULT NULL, -- Names, ages etc.
  `special_requirements` text DEFAULT NULL,
  `booking_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `attended` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_bookings_user` (`user_id`),
  KEY `idx_event_bookings_event` (`event_id`),
  KEY `idx_event_bookings_status` (`status`),
  KEY `idx_event_bookings_date` (`booking_date`),
  CONSTRAINT `event_bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_bookings_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `cultural_events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_bookings_ibfk_3` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Event Reviews Table
CREATE TABLE IF NOT EXISTS `event_reviews` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `event_id` varchar(255) NOT NULL,
  `booking_id` varchar(255) NOT NULL,
  `rating` int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `review_text` text DEFAULT NULL,
  `experience_rating` int DEFAULT NULL CHECK (experience_rating >= 1 AND experience_rating <= 5),
  `organization_rating` int DEFAULT NULL CHECK (organization_rating >= 1 AND organization_rating <= 5),
  `value_rating` int DEFAULT NULL CHECK (value_rating >= 1 AND value_rating <= 5),
  `images` json DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 1,
  `helpful_count` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_event_booking` (`user_id`, `event_id`, `booking_id`),
  KEY `idx_event_reviews_event` (`event_id`),
  KEY `idx_event_reviews_user` (`user_id`),
  KEY `idx_event_reviews_rating` (`rating`),
  CONSTRAINT `event_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_reviews_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `cultural_events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `event_bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Update providers table to better support homestays (this extends existing accommodation category)
-- Add additional fields if not already present
ALTER TABLE `providers` 
  ADD COLUMN IF NOT EXISTS `amenities` json DEFAULT NULL COMMENT 'List of amenities for accommodation',
  ADD COLUMN IF NOT EXISTS `house_rules` text DEFAULT NULL COMMENT 'Rules for homestays',
  ADD COLUMN IF NOT EXISTS `check_in_time` time DEFAULT '14:00:00',
  ADD COLUMN IF NOT EXISTS `check_out_time` time DEFAULT '11:00:00',
  ADD COLUMN IF NOT EXISTS `max_guests` int DEFAULT 2,
  ADD COLUMN IF NOT EXISTS `rooms_available` int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS `cultural_activities` json DEFAULT NULL COMMENT 'Cultural activities offered',
  ADD COLUMN IF NOT EXISTS `meal_options` json DEFAULT NULL COMMENT 'Meal services available',
  ADD COLUMN IF NOT EXISTS `family_type` varchar(100) DEFAULT NULL COMMENT 'Type of family hosting';

-- Sample Data Inserts for Testing

-- Insert sample handicrafts
INSERT INTO `handicrafts` (`id`, `seller_id`, `name`, `category`, `description`, `price`, `stock_quantity`, `images`, `materials`, `dimensions`, `origin_village`, `cultural_significance`, `tags`) VALUES
('hc_pottery_001', 'user_artisan_001', 'Traditional Sohrai Clay Pot', 'pottery', 'Authentic Sohrai art painted clay pot used for storing water and grains. Hand-crafted by tribal artisans from Hazaribagh district.', 850.00, 5, '["https://example.com/sohrai-pot-1.jpg", "https://example.com/sohrai-pot-2.jpg"]', 'Clay, Natural pigments', '25cm x 20cm', 'Hazaribagh', 'Sohrai art is a traditional wall painting practiced by tribal women during harvest festivals', '["pottery", "sohrai", "tribal", "traditional", "water-pot"]'),
('hc_textile_001', 'user_artisan_002', 'Handwoven Tussar Silk Dupatta', 'textiles', 'Beautiful handwoven Tussar silk dupatta with traditional tribal motifs. Made by skilled weavers from Khunti district.', 1250.00, 3, '["https://example.com/tussar-dupatta-1.jpg"]', 'Tussar Silk, Natural dyes', '200cm x 90cm', 'Khunti', 'Traditional weaving patterns passed down through generations of tribal women', '["silk", "handwoven", "dupatta", "tribal", "khunti"]'),
('hc_jewelry_001', 'user_artisan_003', 'Silver Tribal Necklace Set', 'jewelry', 'Oxidized silver necklace with traditional tribal designs. Includes matching earrings. Crafted by Santhal artisans.', 2100.00, 2, '["https://example.com/silver-necklace-1.jpg"]', 'Silver, Oxidized coating', 'Necklace: 45cm, Earrings: 6cm', 'Dumka', 'Worn during tribal festivals and ceremonies as a symbol of cultural identity', '["silver", "tribal", "necklace", "santhal", "traditional"]');

-- Insert sample cultural events
INSERT INTO `cultural_events` (`id`, `organizer_id`, `title`, `event_type`, `description`, `location`, `start_date`, `end_date`, `price`, `max_participants`, `cultural_significance`, `tags`) VALUES
('evt_sarhul_001', 'user_organizer_001', 'Sarhul Festival Celebration', 'festival', 'Experience the authentic Sarhul festival with Oraon and Munda tribes. Participate in traditional dances, songs and rituals celebrating nature and spring season.', 'Ranchi, Tribal Village', '2025-03-21 06:00:00', '2025-03-21 22:00:00', 500.00, 50, 'Sarhul is the most important festival of tribal communities, celebrating the worship of nature and Sal trees', '["festival", "sarhul", "tribal", "oraon", "munda", "traditional"]'),
('evt_workshop_001', 'user_organizer_002', 'Sohrai Art Workshop', 'workshop', 'Learn the traditional art of Sohrai painting from expert tribal women. Create your own artwork using natural pigments and traditional techniques.', 'Hazaribagh Cultural Center', '2025-02-15 09:00:00', '2025-02-15 17:00:00', 800.00, 20, 'Sohrai art is a UNESCO recognized traditional art form practiced during harvest season', '["workshop", "sohrai", "art", "painting", "tribal", "hazaribagh"]');

-- Insert sample homestay providers (extending existing providers table)
INSERT INTO `providers` (`id`, `user_id`, `name`, `category`, `service_name`, `description`, `price`, `location`, `contact`, `destination_id`, `amenities`, `house_rules`, `max_guests`, `rooms_available`, `cultural_activities`, `meal_options`, `family_type`) VALUES
('hs_oraon_001', 'user_host_001', 'Oraon Family Homestay', 'accommodation', 'Traditional Tribal Homestay Experience', 'Experience authentic tribal lifestyle with the Oraon family. Participate in daily activities, learn traditional cooking, and enjoy cultural performances.', 1200.00, 'Ranchi Rural', '+91-9876543210', '1', '["clean_rooms", "shared_bathroom", "traditional_meals", "cultural_activities", "nature_walks"]', 'No smoking, No alcohol, Respect local customs', 6, 2, '["traditional_dance", "cooking_lessons", "craft_making", "folk_stories"]', '["breakfast", "lunch", "dinner", "traditional_tribal_food"]', 'Indigenous Oraon family with 3 generations'),
('hs_santhal_001', 'user_host_002', 'Santhal Heritage Home', 'accommodation', 'Santhal Cultural Homestay', 'Stay with a traditional Santhal family and immerse yourself in their rich cultural heritage. Learn about their customs, participate in festivals, and enjoy organic farm-to-table meals.', 1000.00, 'Dumka District', '+91-9876543211', '2', '["organic_garden", "traditional_huts", "shared_facilities", "bonfire_area", "nature_trails"]', 'Participate respectfully in family activities, No outside food', 4, 1, '["tribal_music", "dance_performances", "farming_activities", "handicraft_making"]', '["organic_breakfast", "traditional_lunch", "dinner", "herbal_teas"]', 'Traditional Santhal joint family');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_handicrafts_search` ON `handicrafts` (`name`, `category`, `origin_village`);
CREATE INDEX IF NOT EXISTS `idx_events_search` ON `cultural_events` (`title`, `event_type`, `location`);
CREATE INDEX IF NOT EXISTS `idx_providers_homestay` ON `providers` (`category`, `location`, `is_active`) WHERE `category` = 'accommodation';

-- Update sample users to include artisans, organizers, and hosts (you may need to run this separately)
-- These would be the user IDs referenced above
/*
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `created_at`) VALUES
('user_artisan_001', 'Kamala Devi', 'kamala.pottery@email.com', '$2b$12$...', '+91-9876543201', 'provider', NOW()),
('user_artisan_002', 'Sita Hansda', 'sita.weaver@email.com', '$2b$12$...', '+91-9876543202', 'provider', NOW()),
('user_artisan_003', 'Birsa Kumar', 'birsa.jewelry@email.com', '$2b$12$...', '+91-9876543203', 'provider', NOW()),
('user_organizer_001', 'Tribal Cultural Society', 'events@tribalculture.org', '$2b$12$...', '+91-9876543204', 'provider', NOW()),
('user_organizer_002', 'Hazaribagh Art Center', 'workshops@hazaribagharts.org', '$2b$12$...', '+91-9876543205', 'provider', NOW()),
('user_host_001', 'Soma Oraon', 'soma.homestay@email.com', '$2b$12$...', '+91-9876543206', 'provider', NOW()),
('user_host_002', 'Phulo Hansda', 'phulo.homestay@email.com', '$2b$12$...', '+91-9876543207', 'provider', NOW());
*/