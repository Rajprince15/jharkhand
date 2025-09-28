-- Marketplace Schema for Jharkhand Tourism (MySQL 8.0 Compatible)
-- Adding handicrafts marketplace tables and extending providers system for homestays
-- Compatible with existing role system: tourist, provider, admin

USE jharkhand_tourism;

-- Handicrafts Marketplace Table
CREATE TABLE IF NOT EXISTS `handicrafts` (
  `id` varchar(255) NOT NULL,
  `seller_id` varchar(255) NOT NULL, -- References users table (providers only)
  `name` varchar(255) NOT NULL,
  `category` ENUM('pottery','textiles','jewelry','woodcraft','metalwork','paintings','sculptures','baskets','other') NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int NOT NULL DEFAULT 1,
  `rating` decimal(2,1) DEFAULT 0.0,
  `total_reviews` int DEFAULT 0,
  `images` JSON, -- Array of image URLs
  `materials` varchar(500) DEFAULT NULL, -- Materials used
  `dimensions` varchar(200) DEFAULT NULL, -- Size/dimensions
  `weight` decimal(5,2) DEFAULT NULL, -- Weight in kg
  `origin_village` varchar(255) DEFAULT NULL, -- Village/area of origin
  `cultural_significance` text DEFAULT NULL, -- Cultural background
  `care_instructions` text DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `tags` JSON, -- Search tags
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_handicrafts_category` (`category`),
  KEY `idx_handicrafts_seller` (`seller_id`),
  KEY `idx_handicrafts_rating` (`rating`),
  KEY `idx_handicrafts_price` (`price`),
  KEY `idx_handicrafts_featured` (`is_featured`),
  KEY `idx_handicrafts_available` (`is_available`),
  CONSTRAINT `handicrafts_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Handicraft Orders/Bookings Table
CREATE TABLE IF NOT EXISTS `handicraft_orders` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL, -- Buyer (any role)
  `handicraft_id` varchar(255) NOT NULL,
  `seller_id` varchar(255) NOT NULL, -- Provider
  `quantity` int NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` ENUM('pending','confirmed','preparing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  `payment_status` ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  `shipping_address` JSON NOT NULL, -- Full address object
  `shipping_method` ENUM('standard','express','pickup') DEFAULT 'standard',
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
  `rating` int NOT NULL,
  `review_text` text DEFAULT NULL,
  `images` JSON, -- Review images
  `quality_rating` int DEFAULT NULL,
  `delivery_rating` int DEFAULT NULL,
  `seller_rating` int DEFAULT NULL,
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
  CONSTRAINT `handicraft_reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `handicraft_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rating` CHECK ((`rating` >= 1) and (`rating` <= 5)),
  CONSTRAINT `chk_quality_rating` CHECK ((`quality_rating` >= 1) and (`quality_rating` <= 5)),
  CONSTRAINT `chk_delivery_rating` CHECK ((`delivery_rating` >= 1) and (`delivery_rating` <= 5)),
  CONSTRAINT `chk_seller_rating` CHECK ((`seller_rating` >= 1) and (`seller_rating` <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Events Table (for cultural events, festivals, workshops)
CREATE TABLE IF NOT EXISTS `cultural_events` (
  `id` varchar(255) NOT NULL,
  `organizer_id` varchar(255) NOT NULL, -- References users table (providers only)
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `event_type` ENUM('festival','workshop','performance','exhibition','tour','ceremony','other') NOT NULL,
  `location` varchar(255) NOT NULL,
  `venue_details` text DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00, -- 0 for free events
  `max_participants` int DEFAULT NULL,
  `current_bookings` int DEFAULT 0,
  `images` JSON,
  `cultural_significance` text DEFAULT NULL,
  `what_to_expect` text DEFAULT NULL,
  `what_to_bring` text DEFAULT NULL,
  `age_restrictions` varchar(100) DEFAULT NULL,
  `languages` varchar(200) DEFAULT 'Hindi, English',
  `contact_info` JSON,
  `cancellation_policy` text DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `total_reviews` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `tags` JSON,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_organizer` (`organizer_id`),
  KEY `idx_events_type` (`event_type`),
  KEY `idx_events_date` (`start_date`),
  KEY `idx_events_location` (`location`),
  KEY `idx_events_featured` (`is_featured`),
  KEY `idx_events_active` (`is_active`),
  CONSTRAINT `cultural_events_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Event Bookings Table
CREATE TABLE IF NOT EXISTS `event_bookings` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL, -- Any role can book
  `event_id` varchar(255) NOT NULL,
  `organizer_id` varchar(255) NOT NULL, -- Provider who organized
  `participants` int NOT NULL DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `status` ENUM('pending','confirmed','cancelled','completed','refunded') DEFAULT 'pending',
  `payment_status` ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  `participant_details` JSON, -- Names, ages etc.
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
  KEY `idx_event_bookings_organizer` (`organizer_id`),
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
  `rating` int NOT NULL,
  `review_text` text DEFAULT NULL,
  `experience_rating` int DEFAULT NULL,
  `organization_rating` int DEFAULT NULL,
  `value_rating` int DEFAULT NULL,
  `images` JSON,
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
  CONSTRAINT `event_reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `event_bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_event_rating` CHECK ((`rating` >= 1) and (`rating` <= 5)),
  CONSTRAINT `chk_experience_rating` CHECK ((`experience_rating` >= 1) and (`experience_rating` <= 5)),
  CONSTRAINT `chk_organization_rating` CHECK ((`organization_rating` >= 1) and (`organization_rating` <= 5)),
  CONSTRAINT `chk_value_rating` CHECK ((`value_rating` >= 1) and (`value_rating` <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Update providers table to better support homestays and marketplace
-- Add additional fields for marketplace integration
ALTER TABLE `providers` 
  ADD COLUMN IF NOT EXISTS `amenities` JSON COMMENT 'List of amenities for accommodation',
  ADD COLUMN IF NOT EXISTS `house_rules` text COMMENT 'Rules for homestays',
  ADD COLUMN IF NOT EXISTS `check_in_time` time DEFAULT '14:00:00',
  ADD COLUMN IF NOT EXISTS `check_out_time` time DEFAULT '11:00:00',
  ADD COLUMN IF NOT EXISTS `max_guests` int DEFAULT 2,
  ADD COLUMN IF NOT EXISTS `rooms_available` int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS `cultural_activities` JSON COMMENT 'Cultural activities offered',
  ADD COLUMN IF NOT EXISTS `meal_options` JSON COMMENT 'Meal services available',
  ADD COLUMN IF NOT EXISTS `family_type` varchar(100) COMMENT 'Type of family hosting',
  ADD COLUMN IF NOT EXISTS `marketplace_enabled` tinyint(1) DEFAULT 0 COMMENT 'Whether provider participates in marketplace';

-- Real-time notifications table for marketplace activities
CREATE TABLE IF NOT EXISTS `marketplace_notifications` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `type` ENUM('new_order','order_update','review_received','event_booking','payment_received','inventory_low','new_message') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_id` varchar(255) DEFAULT NULL, -- ID of related order/event/etc
  `related_type` varchar(50) DEFAULT NULL, -- Type of related entity
  `is_read` tinyint(1) DEFAULT 0,
  `priority` ENUM('low','medium','high','urgent') DEFAULT 'medium',
  `action_url` varchar(500) DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_type` (`type`),
  KEY `idx_notifications_read` (`is_read`),
  KEY `idx_notifications_created` (`created_at`),
  CONSTRAINT `marketplace_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_handicrafts_search` ON `handicrafts` (`name`, `category`, `origin_village`);
CREATE INDEX IF NOT EXISTS `idx_events_search` ON `cultural_events` (`title`, `event_type`, `location`);
CREATE INDEX IF NOT EXISTS `idx_providers_homestay` ON `providers` (`category`, `location`, `is_active`);

-- Insert sample users for marketplace (providers)
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`, `created_at`) VALUES
('user_artisan_001', 'Kamala Devi', 'kamala.pottery@jharkhandi.com', '$2b$12$LQv3c1yqBwKXhj8C8oRoMOKnAWQ2l8qT.N0sQqJ1YQGjPWTXsGrYm', '+91-9876543201', 'provider', NOW()),
('user_artisan_002', 'Sita Hansda', 'sita.weaver@jharkhandi.com', '$2b$12$LQv3c1yqBwKXhj8C8oRoMOKnAWQ2l8qT.N0sQqJ1YQGjPWTXsGrYm', '+91-9876543202', 'provider', NOW()),
('user_artisan_003', 'Birsa Kumar', 'birsa.jewelry@jharkhandi.com', '$2b$12$LQv3c1yqBwKXhj8C8oRoMOKnAWQ2l8qT.N0sQqJ1YQGjPWTXsGrYm', '+91-9876543203', 'provider', NOW()),
('user_organizer_001', 'Tribal Cultural Society', 'events@tribalculture.org', '$2b$12$LQv3c1yqBwKXhj8C8oRoMOKnAWQ2l8qT.N0sQqJ1YQGjPWTXsGrYm', '+91-9876543204', 'provider', NOW()),
('user_organizer_002', 'Hazaribagh Art Center', 'workshops@hazaribagharts.org', '$2b$12$LQv3c1yqBwKXhj8C8oRoMOKnAWQ2l8qT.N0sQqJ1YQGjPWTXsGrYm', '+91-9876543205', 'provider', NOW()),
('user_host_001', 'Soma Oraon', 'soma.homestay@jharkhandi.com', '$2b$12$LQv3c1yqBwKXhj8C8oRoMOKnAWQ2l8qT.N0sQqJ1YQGjPWTXsGrYm', '+91-9876543206', 'provider', NOW()),
('user_host_002', 'Phulo Hansda', 'phulo.homestay@jharkhandi.com', '$2b$12$LQv3c1yqBwKXhj8C8oRoMOKnAWQ2l8qT.N0sQqJ1YQGjPWTXsGrYm', '+91-9876543207', 'provider', NOW());

-- Insert sample handicrafts
INSERT IGNORE INTO `handicrafts` (`id`, `seller_id`, `name`, `category`, `description`, `price`, `stock_quantity`, `images`, `materials`, `dimensions`, `origin_village`, `cultural_significance`, `tags`, `is_featured`) VALUES
('hc_pottery_001', 'user_artisan_001', 'Traditional Sohrai Clay Pot', 'pottery', 'Authentic Sohrai art painted clay pot used for storing water and grains. Hand-crafted by tribal artisans from Hazaribagh district with traditional natural pigments.', 850.00, 15, '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500", "https://images.unsplash.com/photo-1610736467671-b14d0b2b5aaf?w=500"]', 'Clay, Natural pigments, Organic materials', '25cm x 20cm (H x D)', 'Hazaribagh', 'Sohrai art is a traditional wall painting practiced by tribal women during harvest festivals, representing prosperity and connection with nature', '["pottery", "sohrai", "tribal", "traditional", "water-pot", "handmade"]', 1),
('hc_textile_001', 'user_artisan_002', 'Handwoven Tussar Silk Dupatta', 'textiles', 'Beautiful handwoven Tussar silk dupatta with traditional tribal motifs. Made by skilled weavers from Khunti district using traditional techniques passed down through generations.', 1250.00, 8, '["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500", "https://images.unsplash.com/photo-1583846112559-6581b5e39e4f?w=500"]', 'Tussar Silk, Natural dyes, Zari work', '200cm x 90cm', 'Khunti', 'Traditional weaving patterns passed down through generations of tribal women, each motif tells a story of tribal heritage', '["silk", "handwoven", "dupatta", "tribal", "khunti", "tussar"]', 1),
('hc_jewelry_001', 'user_artisan_003', 'Silver Tribal Necklace Set', 'jewelry', 'Oxidized silver necklace with traditional tribal designs. Includes matching earrings. Crafted by Santhal artisans using ancient jewelry-making techniques.', 2100.00, 5, '["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500", "https://images.unsplash.com/photo-1572598162957-8245c94a9f69?w=500"]', 'Pure Silver 925, Oxidized coating, Traditional beads', 'Necklace: 45cm, Earrings: 6cm', 'Dumka', 'Worn during tribal festivals and ceremonies as a symbol of cultural identity and marital status', '["silver", "tribal", "necklace", "santhal", "traditional", "handcrafted"]', 1),
('hc_pottery_002', 'user_artisan_001', 'Decorative Sohrai Wall Plate', 'pottery', 'Beautiful decorative wall plate featuring traditional Sohrai patterns. Perfect for home decoration or gifting.', 650.00, 20, '["https://images.unsplash.com/photo-1578928675669-6d4b7c6c5bbf?w=500"]', 'Clay, Natural pigments', '30cm diameter', 'Hazaribagh', 'Sohrai patterns represent fertility, prosperity, and connection with nature', '["pottery", "sohrai", "wall-decor", "tribal", "decorative"]', 0),
('hc_textile_002', 'user_artisan_002', 'Traditional Tribal Shawl', 'textiles', 'Warm and beautiful tribal shawl with traditional patterns, handwoven by tribal women.', 950.00, 12, '["https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500"]', 'Cotton, Natural dyes', '180cm x 80cm', 'Khunti', 'Traditional shawls worn by tribal elders during important ceremonies', '["shawl", "tribal", "handwoven", "traditional", "cotton"]', 0),
('hc_jewelry_002', 'user_artisan_003', 'Tribal Brass Bangles Set', 'jewelry', 'Set of 6 traditional brass bangles with tribal engravings. Worn during festivals and special occasions.', 750.00, 25, '["https://images.unsplash.com/photo-1611955167811-4711904bb9f8?w=500"]', 'Brass, Traditional engravings', 'Multiple sizes available', 'Dumka', 'Brass bangles are considered auspicious and worn for protection and good fortune', '["brass", "bangles", "tribal", "traditional", "festival"]', 0);

-- Insert sample cultural events
INSERT IGNORE INTO `cultural_events` (`id`, `organizer_id`, `title`, `event_type`, `description`, `location`, `start_date`, `end_date`, `price`, `max_participants`, `cultural_significance`, `what_to_expect`, `what_to_bring`, `tags`, `is_featured`) VALUES
('evt_sarhul_001', 'user_organizer_001', 'Sarhul Festival Celebration 2025', 'festival', 'Experience the authentic Sarhul festival with Oraon and Munda tribes. Participate in traditional dances, songs and rituals celebrating nature and spring season. This is the most important festival of tribal communities.', 'Ranchi, Tribal Village Ormanjhi', '2025-03-21 06:00:00', '2025-03-21 22:00:00', 500.00, 50, 'Sarhul is the most important festival of tribal communities, celebrating the worship of nature and Sal trees. It marks the beginning of the new year for tribals.', 'Traditional dances, tribal music, ritual ceremonies, authentic tribal food, cultural performances, interaction with tribal elders', 'Comfortable clothing, water bottle, camera (with permission), small gifts for tribal families', '["festival", "sarhul", "tribal", "oraon", "munda", "traditional", "spring"]', 1),
('evt_workshop_001', 'user_organizer_002', 'Sohrai Art Workshop - Traditional Wall Painting', 'workshop', 'Learn the traditional art of Sohrai painting from expert tribal women. Create your own artwork using natural pigments and traditional techniques. Take home your creations.', 'Hazaribagh Cultural Center', '2025-02-15 09:00:00', '2025-02-15 17:00:00', 800.00, 20, 'Sohrai art is a UNESCO recognized traditional art form practiced during harvest season by tribal women of Hazaribagh', 'Hands-on painting experience, learning about natural pigments, interaction with master artists, lunch, certificate of participation', 'Old clothes, enthusiasm to learn, camera for memories', '["workshop", "sohrai", "art", "painting", "tribal", "hazaribagh", "hands-on"]', 1),
('evt_performance_001', 'user_organizer_001', 'Santhal Traditional Dance Performance', 'performance', 'Authentic Santhal tribal dance performance featuring traditional instruments, folk songs, and storytelling. A mesmerizing evening of tribal culture.', 'Dumka Cultural Ground', '2025-02-28 18:00:00', '2025-02-28 21:00:00', 300.00, 100, 'Santhal dances are performed during various life events and festivals, each dance has specific cultural significance', 'Traditional dance performances, folk music, storytelling, cultural explanation, refreshments', 'Comfortable seating arrangement provided, just bring your enthusiasm', '["performance", "santhal", "dance", "tribal", "folk-music", "storytelling"]', 0),
('evt_workshop_002', 'user_organizer_002', 'Tribal Jewelry Making Workshop', 'workshop', 'Learn traditional jewelry making techniques from tribal artisans. Create your own piece of jewelry using traditional methods and materials.', 'Hazaribagh Arts Center', '2025-03-10 10:00:00', '2025-03-10 16:00:00', 600.00, 15, 'Traditional jewelry making has been passed down through generations, each piece tells a story', 'Hands-on jewelry making, learning traditional techniques, interaction with master craftsmen, materials provided', 'Comfortable clothes, apron if you have one', '["workshop", "jewelry", "handicraft", "tribal", "hands-on", "traditional"]', 0);

-- Insert sample homestay providers (updating existing providers table)
INSERT IGNORE INTO `providers` (`id`, `user_id`, `name`, `category`, `service_name`, `description`, `price`, `location`, `contact`, `destination_id`, `amenities`, `house_rules`, `max_guests`, `rooms_available`, `cultural_activities`, `meal_options`, `family_type`, `marketplace_enabled`, `is_active`) VALUES
('hs_oraon_001', 'user_host_001', 'Soma Oraon', 'accommodation', 'Oraon Family Homestay Experience', 'Experience authentic tribal lifestyle with the Oraon family. Participate in daily activities, learn traditional cooking, enjoy cultural performances, and immerse yourself in tribal traditions.', 1200.00, 'Ranchi Rural, Ormanjhi Village', '+91-9876543210', '1', '["clean_rooms", "shared_bathroom", "traditional_meals", "cultural_activities", "nature_walks", "bonfire", "traditional_music"]', 'No smoking inside house, No alcohol, Respect local customs and traditions, Participate respectfully in family activities, No loud music after 9 PM', 6, 2, '["traditional_dance", "cooking_lessons", "craft_making", "folk_stories", "farming_activities", "festival_participation"]', '["breakfast", "lunch", "dinner", "traditional_tribal_food", "organic_vegetables", "herbal_tea"]', 'Indigenous Oraon family with 3 generations living together', 1, 1),
('hs_santhal_001', 'user_host_002', 'Phulo Hansda', 'accommodation', 'Santhal Cultural Homestay', 'Stay with a traditional Santhal family and immerse yourself in their rich cultural heritage. Learn about their customs, participate in festivals, and enjoy organic farm-to-table meals in a traditional setting.', 1000.00, 'Dumka District, Santhal Village', '+91-9876543211', '2', '["organic_garden", "traditional_huts", "shared_facilities", "bonfire_area", "nature_trails", "farm_experience", "traditional_instruments"]', 'Participate respectfully in family activities, No outside food, Help in daily activities if interested, Respect village customs', 4, 1, '["tribal_music", "dance_performances", "farming_activities", "handicraft_making", "village_walks", "traditional_games"]', '["organic_breakfast", "traditional_lunch", "dinner", "herbal_teas", "fresh_milk", "seasonal_fruits"]', 'Traditional Santhal joint family with elders, parents and children', 1, 1);

-- Update ratings and reviews count for sample items
UPDATE `handicrafts` SET `rating` = 4.5, `total_reviews` = 12 WHERE `id` = 'hc_pottery_001';
UPDATE `handicrafts` SET `rating` = 4.8, `total_reviews` = 8 WHERE `id` = 'hc_textile_001';
UPDATE `handicrafts` SET `rating` = 4.7, `total_reviews` = 15 WHERE `id` = 'hc_jewelry_001';
UPDATE `handicrafts` SET `rating` = 4.2, `total_reviews` = 6 WHERE `id` = 'hc_pottery_002';
UPDATE `handicrafts` SET `rating` = 4.4, `total_reviews` = 9 WHERE `id` = 'hc_textile_002';
UPDATE `handicrafts` SET `rating` = 4.3, `total_reviews` = 11 WHERE `id` = 'hc_jewelry_002';

UPDATE `cultural_events` SET `rating` = 4.9, `total_reviews` = 23, `current_bookings` = 35 WHERE `id` = 'evt_sarhul_001';
UPDATE `cultural_events` SET `rating` = 4.6, `total_reviews` = 14, `current_bookings` = 18 WHERE `id` = 'evt_workshop_001';
UPDATE `cultural_events` SET `rating` = 4.4, `total_reviews` = 8, `current_bookings` = 45 WHERE `id` = 'evt_performance_001';
UPDATE `cultural_events` SET `rating` = 4.7, `total_reviews` = 11, `current_bookings` = 12 WHERE `id` = 'evt_workshop_002';

-- Insert sample notifications for real-time functionality
INSERT IGNORE INTO `marketplace_notifications` (`id`, `user_id`, `type`, `title`, `message`, `related_id`, `related_type`, `priority`) VALUES
('notif_001', 'user_artisan_001', 'new_order', 'New Order Received!', 'You have received a new order for Traditional Sohrai Clay Pot', 'hc_pottery_001', 'handicraft', 'high'),
('notif_002', 'user_organizer_001', 'event_booking', 'Event Booking Confirmed', 'A new participant has booked for Sarhul Festival Celebration 2025', 'evt_sarhul_001', 'event', 'medium'),
('notif_003', 'user_artisan_002', 'inventory_low', 'Low Stock Alert', 'Your Handwoven Tussar Silk Dupatta is running low on stock (8 remaining)', 'hc_textile_001', 'handicraft', 'high');

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW `marketplace_dashboard_stats` AS
SELECT 
    (SELECT COUNT(*) FROM handicrafts WHERE is_available = 1) as total_handicrafts,
    (SELECT COUNT(*) FROM cultural_events WHERE is_active = 1 AND start_date > NOW()) as active_events,
    (SELECT COUNT(*) FROM providers WHERE category = 'accommodation' AND marketplace_enabled = 1) as active_homestays,
    (SELECT COUNT(*) FROM handicraft_orders WHERE status IN ('pending', 'confirmed', 'preparing')) as pending_orders,
    (SELECT COUNT(*) FROM event_bookings WHERE status = 'confirmed') as confirmed_bookings,
    (SELECT COALESCE(SUM(total_price), 0) FROM handicraft_orders WHERE status = 'delivered' AND MONTH(delivered_at) = MONTH(NOW())) as monthly_revenue,
    (SELECT COUNT(DISTINCT seller_id) FROM handicrafts WHERE is_available = 1) as active_sellers,
    (SELECT COALESCE(AVG(rating), 0) FROM handicrafts WHERE total_reviews > 0) as avg_handicraft_rating,
    (SELECT COALESCE(AVG(rating), 0) FROM cultural_events WHERE total_reviews > 0) as avg_event_rating;

-- Add full-text search capabilities (MySQL 8.0 compatible)
ALTER TABLE `handicrafts` ADD FULLTEXT(`name`, `description`, `materials`, `cultural_significance`);
ALTER TABLE `cultural_events` ADD FULLTEXT(`title`, `description`, `cultural_significance`);

COMMIT;