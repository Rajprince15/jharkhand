-- ================================================
-- SAMPLE DATA INSERT SCRIPT FOR JHARKHAND TOURISM
-- ================================================

USE jharkhand_tourism;

-- ================================================
-- 1. INSERT SAMPLE USERS (TOURISTS & PROVIDERS)
-- ================================================

INSERT IGNORE INTO users (id, name, email, password, phone, role, created_at, updated_at) VALUES
-- Sample Tourist Users
('user_tourist_001', 'Rahul Kumar', 'rahul.tourist@example.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543210', 'tourist', NOW(), NOW()),
('user_tourist_002', 'Priya Sharma', 'priya.sharma@example.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543211', 'tourist', NOW(), NOW()),
('user_tourist_003', 'Amit Singh', 'amit.singh@example.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543212', 'tourist', NOW(), NOW()),
('user_tourist_004', 'Sneha Gupta', 'sneha.gupta@example.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543213', 'tourist', NOW(), NOW()),
('user_tourist_005', 'Rajesh Yadav', 'rajesh.yadav@example.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543214', 'tourist', NOW(), NOW()),
('user_tourist_006', 'Anita Kumari', 'anita.kumari@example.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543215', 'tourist', NOW(), NOW()),
('user_tourist_007', 'Vikash Prasad', 'vikash.prasad@example.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543216', 'tourist', NOW(), NOW()),

-- Sample Provider Users (corresponding to existing providers)
('provider1', 'Provider One', 'provider1@example.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543220', 'provider', NOW(), NOW()),
('provider2', 'Provider Two', 'provider2@example.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543221', 'provider', NOW(), NOW()),
('admin_user', 'Admin User', 'admin@jharkhandtourism.com', '$2b$12$LQv3c1yqBwEHFpw5qfvH7eSHKdg4KGDjZ8U6MqBqQlc7W9Z5F2J2S', '+91-9876543222', 'admin', NOW(), NOW());

-- ================================================
-- 2. INSERT SAMPLE BOOKINGS WITH REALISTIC DATA
-- ================================================

INSERT INTO bookings (
    id, user_id, provider_id, destination_id, booking_date, check_in, check_out, 
    guests, rooms, total_amount, status, package_type, package_name, calculated_price, 
    addons, special_requests, created_at, updated_at
) VALUES 
-- Booking 1: Ranchi Heritage Tour
('booking_001', 'user_tourist_001', 'prov_001', 63, '2025-01-15', '2025-01-20', '2025-01-22', 
 2, 1, 25000.00, 'confirmed', 'heritage', 'Heritage Explorer - Ranchi', 25000.00,
 '["pickup_service", "guide", "insurance"]', 'Vegetarian meals preferred', NOW(), NOW()),

-- Booking 2: Netarhat Hill Station Tour  
('booking_002', 'user_tourist_002', 'prov_003', 64, '2025-01-18', '2025-01-25', '2025-01-27',
 4, 2, 35000.00, 'confirmed', 'premium', 'Premium Hill Station Experience', 35000.00,
 '["luxury_accommodation", "pickup_service", "meals", "guide"]', 'Need wheelchair accessible room', NOW(), NOW()),

-- Booking 3: Betla Wildlife Safari
('booking_003', 'user_tourist_003', 'prov_004', 65, '2025-01-20', '2025-01-28', '2025-01-30',
 3, 2, 28000.00, 'pending', 'adventure', 'Adventure Seeker - Wildlife Safari', 28000.00,
 '["safari_vehicle", "naturalist_guide", "camping"]', 'Early morning safari preferred', NOW(), NOW()),

-- Booking 4: Parasnath Pilgrimage
('booking_004', 'user_tourist_004', 'prov_008', 66, '2025-01-22', '2025-02-01', '2025-02-03',
 2, 1, 22000.00, 'confirmed', 'spiritual', 'Spiritual Journey - Parasnath', 22000.00,
 '["temple_guide", "prayer_arrangements", "pickup"]', 'Need pure vegetarian food only', NOW(), NOW()),

-- Booking 5: Dimna Lake Activities
('booking_005', 'user_tourist_005', 'prov_002', 67, '2025-01-25', '2025-02-05', '2025-02-06',
 6, 3, 18000.00, 'confirmed', 'adventure', 'Family Adventure - Water Sports', 18000.00,
 '["water_sports", "boating", "family_activities"]', 'Family with children - safety priority', NOW(), NOW()),

-- Booking 6: Hundru Falls Tour
('booking_006', 'user_tourist_001', 'prov_006', 73, '2025-02-01', '2025-02-10', '2025-02-11',
 2, 1, 15000.00, 'pending', 'nature', 'Nature Explorer - Waterfall Tour', 15000.00,
 '["trekking_guide", "photography", "meals"]', 'Photography enthusiast - need good spots', NOW(), NOW()),

-- Booking 7: Deoghar Pilgrimage
('booking_007', 'user_tourist_002', 'prov_007', 62, '2025-02-05', '2025-02-15', '2025-02-17',
 4, 2, 32000.00, 'confirmed', 'spiritual', 'Spiritual Journey - Baidyanath Dham', 32000.00,
 '["temple_guide", "accommodation", "meals", "pickup"]', 'Senior citizens in group - comfortable accommodation', NOW(), NOW()),

-- Booking 8: Jamshedpur City Tour
('booking_008', 'user_tourist_003', 'prov_009', 59, '2025-02-08', '2025-02-18', '2025-02-19',
 3, 2, 20000.00, 'confirmed', 'heritage', 'Industrial Heritage Tour', 20000.00,
 '["city_guide", "industrial_visits", "transport"]', 'Interest in steel industry history', NOW(), NOW()),

-- Booking 9: Dhanbad Mining Tour
('booking_009', 'user_tourist_004', 'prov_010', 68, '2025-02-10', '2025-02-20', '2025-02-21',
 2, 1, 16000.00, 'pending', 'educational', 'Mining Heritage Experience', 16000.00,
 '["mining_guide", "museum_visit", "safety_gear"]', 'Educational tour for students', NOW(), NOW()),

-- Booking 10: Palamau Tiger Reserve
('booking_010', 'user_tourist_005', 'prov_004', 11, '2025-02-12', '2025-02-25', '2025-02-27',
 4, 2, 42000.00, 'confirmed', 'premium', 'Premium Wildlife Experience', 42000.00,
 '["luxury_safari", "expert_naturalist", "premium_accommodation", "meals"]', 'Wildlife photography focused trip', NOW(), NOW()),

-- Booking 11: Ranchi City Tour
('booking_011', 'user_tourist_006', 'prov_ranchi_guide_1', 63, '2025-02-15', '2025-02-22', '2025-02-23',
 2, 1, 19000.00, 'confirmed', 'heritage', 'Ranchi Heritage Tour', 19000.00,
 '["city_guide", "transportation", "lunch"]', 'First time visitors to Ranchi', NOW(), NOW()),

-- Booking 12: Betla Safari Adventure
('booking_012', 'user_tourist_007', 'prov_betla_safari_1', 65, '2025-02-18', '2025-02-28', '2025-03-01',
 3, 2, 38000.00, 'pending', 'adventure', 'Wildlife Photography Safari', 38000.00,
 '["professional_guide", "photography_equipment", "camping", "meals"]', 'Professional wildlife photography trip', NOW(), NOW());

-- ================================================
-- 3. INSERT SAMPLE WISHLIST ITEMS
-- ================================================

INSERT IGNORE INTO wishlist (id, user_id, destination_id, created_at) VALUES
('wish_001', 'user_tourist_001', 63, NOW()),
('wish_002', 'user_tourist_001', 64, NOW()),
('wish_003', 'user_tourist_001', 37, NOW()),
('wish_004', 'user_tourist_002', 65, NOW()),
('wish_005', 'user_tourist_002', 66, NOW()),
('wish_006', 'user_tourist_002', 22, NOW()),
('wish_007', 'user_tourist_003', 67, NOW()),
('wish_008', 'user_tourist_003', 36, NOW()),
('wish_009', 'user_tourist_003', 46, NOW()),
('wish_010', 'user_tourist_004', 73, NOW()),
('wish_011', 'user_tourist_004', 69, NOW()),
('wish_012', 'user_tourist_005', 8, NOW()),
('wish_013', 'user_tourist_005', 11, NOW()),
('wish_014', 'user_tourist_006', 59, NOW()),
('wish_015', 'user_tourist_007', 62, NOW());

-- ================================================
-- 4. ENSURE FIRST 5 DESTINATIONS HAVE MULTIPLE PROVIDERS
-- (For "Select Service Provider" functionality)
-- ================================================

-- Additional mappings for Ranchi (destination_id = 63)
INSERT IGNORE INTO provider_destinations (id, provider_id, destination_id, created_at) VALUES
('pd_ranchi_extra_001', 'prov_ranchi_guide_1', 63, NOW()),
('pd_ranchi_extra_002', 'prov_ranchi_hotel_1', 63, NOW()),
('pd_ranchi_extra_003', 'prov_ranchi_transport_1', 63, NOW()),
('pd_ranchi_extra_004', '1', 63, NOW()),
('pd_ranchi_extra_005', 'f3b612d6-ec81-4165-bf20-ed58f8e51939', 63, NOW());

-- Additional mappings for Netarhat (destination_id = 64)  
INSERT IGNORE INTO provider_destinations (id, provider_id, destination_id, created_at) VALUES
('pd_netarhat_extra_001', 'prov_netarhat_guide_1', 64, NOW()),
('pd_netarhat_extra_002', 'prov_netarhat_hotel_1', 64, NOW()),
('pd_netarhat_extra_003', '2', 64, NOW()),
('pd_netarhat_extra_004', 'prov2', 64, NOW()),
('pd_netarhat_extra_005', '1bf9df24-1be8-4b0f-88f7-22730cfb5262', 64, NOW());

-- Additional mappings for Betla National Park (destination_id = 65)
INSERT IGNORE INTO provider_destinations (id, provider_id, destination_id, created_at) VALUES
('pd_betla_extra_001', 'prov_betla_guide_1', 65, NOW()),
('pd_betla_extra_002', 'prov_betla_safari_1', 65, NOW()),
('pd_betla_extra_003', '3', 65, NOW()),
('pd_betla_extra_004', 'prov3', 65, NOW());

-- Additional mappings for Parasnath Hill (destination_id = 66)
INSERT IGNORE INTO provider_destinations (id, provider_id, destination_id, created_at) VALUES
('pd_parasnath_extra_001', 'prov_parasnath_guide_1', 66, NOW()),
('pd_parasnath_extra_002', 'prov_parasnath_transport_1', 66, NOW()),
('pd_parasnath_extra_003', '4', 66, NOW()),
('pd_parasnath_extra_004', 'prov4', 66, NOW());

-- Additional mappings for Dimna Lake (destination_id = 67)
INSERT IGNORE INTO provider_destinations (id, provider_id, destination_id, created_at) VALUES
('pd_dimna_extra_001', 'prov_dimna_water_1', 67, NOW()),
('pd_dimna_extra_002', 'prov_dimna_restaurant_1', 67, NOW()),
('pd_dimna_extra_003', '6', 67, NOW()),
('pd_dimna_extra_004', 'prov5', 67, NOW());

-- ================================================
-- 5. INSERT SAMPLE REVIEWS FOR DESTINATIONS & PROVIDERS
-- ================================================

INSERT IGNORE INTO reviews (id, user_id, destination_id, provider_id, rating, comment, created_at, updated_at) VALUES
('review_001', 'user_tourist_001', 63, 'prov_001', 5, 'Amazing experience in Ranchi! The guide was very knowledgeable and showed us all the best spots. Highly recommended!', NOW(), NOW()),
('review_002', 'user_tourist_002', 64, 'prov_003', 4, 'Beautiful hill station! The accommodation was comfortable and the views were breathtaking. Perfect for a weekend getaway.', NOW(), NOW()),
('review_003', 'user_tourist_003', 65, 'prov_004', 5, 'Outstanding wildlife safari! We saw tigers, elephants, and many birds. The naturalist guide was excellent.', NOW(), NOW()),
('review_004', 'user_tourist_004', 66, 'prov_008', 4, 'Spiritual and peaceful journey to Parasnath Hill. The trekking was challenging but worth it for the temple visits.', NOW(), NOW()),
('review_005', 'user_tourist_005', 67, 'prov_002', 4, 'Great family day out at Dimna Lake! Kids loved the water sports and the scenery was beautiful.', NOW(), NOW()),
('review_006', 'user_tourist_001', 73, 'prov_006', 5, 'Hundru Falls is absolutely stunning! The trek was moderate and the photography opportunities were endless.', NOW(), NOW()),
('review_007', 'user_tourist_002', 62, 'prov_007', 5, 'Wonderful pilgrimage experience at Baidyanath Dham. The accommodation was clean and the staff was very helpful.', NOW(), NOW());

-- ================================================
-- 6. INSERT SAMPLE CHAT LOGS FOR AI CHATBOT TESTING
-- ================================================

INSERT IGNORE INTO chat_logs (id, user_id, session_id, message, response, created_at) VALUES
('chat_001', 'user_tourist_001', 'session_001', 'What are the best places to visit in Ranchi?', 'Ranchi offers many beautiful attractions! Some must-visit places include Hundru Falls, Rock Garden, Tagore Hill, and Ranchi Lake. Each offers unique experiences from natural beauty to cultural significance.', NOW()),
('chat_002', 'user_tourist_001', 'session_001', 'How much does it cost to visit Hundru Falls?', 'Hundru Falls typically costs around ₹5,500 per person for a complete tour package including guide and transportation. You can also find individual providers offering different price ranges.', NOW()),
('chat_003', 'user_tourist_002', 'session_002', 'Tell me about Netarhat hill station', 'Netarhat is known as the "Queen of Chotanagpur" and is famous for its sunrise and sunset views. Its a perfect hill station for nature lovers with pleasant climate year-round.', NOW()),
('chat_004', 'user_tourist_003', 'session_003', 'What wildlife can I see at Betla National Park?', 'Betla National Park is home to tigers, elephants, leopards, wild boar, spotted deer, and over 174 bird species. Its one of the first tiger reserves in India and offers excellent safari experiences.', NOW());

-- ================================================
-- 7. INSERT SAMPLE ITINERARIES FOR AI PLANNER TESTING
-- ================================================

INSERT IGNORE INTO itineraries (id, user_id, destination, days, budget, content, preferences, generated_at, model, created_at) VALUES
('itinerary_001', 'user_tourist_001', 'Ranchi', 3, 15000, '# 3-Day Ranchi Itinerary\n\n## Day 1: City Exploration\n- Morning: Visit Tagore Hill and Rock Garden\n- Afternoon: Explore Ranchi Lake and nearby markets\n- Evening: Sunset at Pahari Mandir\n\n## Day 2: Natural Wonders\n- Early Morning: Trip to Hundru Falls\n- Afternoon: Visit Jonha Falls\n- Evening: Return to city, local cuisine tasting\n\n## Day 3: Cultural Experience\n- Morning: Jagannath Temple and local temples\n- Afternoon: Shopping at Main Road\n- Evening: Departure', '{"interests": ["sightseeing", "culture"], "travel_style": "balanced", "group_size": 2}', NOW(), 'gemini-2.0-flash', NOW()),
('itinerary_002', 'user_tourist_002', 'Netarhat', 2, 20000, '# 2-Day Netarhat Hill Station Experience\n\n## Day 1: Arrival and Exploration\n- Morning: Check-in at hill resort\n- Afternoon: Visit Netarhat School and local viewpoints\n- Evening: Sunset Point viewing\n\n## Day 2: Adventure and Departure\n- Early Morning: Sunrise Point experience\n- Morning: Upper and Lower Ghaghri Falls\n- Afternoon: Nature walks and departure', '{"interests": ["nature", "relaxation"], "travel_style": "luxury", "group_size": 4}', NOW(), 'gemini-2.0-flash', NOW());

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

SELECT 'Sample data insertion completed successfully!' as message;

-- Show summary of inserted data
SELECT 'SUMMARY OF INSERTED DATA:' as info;
SELECT 'Users created:' as type, COUNT(*) as count FROM users WHERE id LIKE 'user_%' OR id LIKE 'provider%' OR id = 'admin_user';
SELECT 'Bookings created:' as type, COUNT(*) as count FROM bookings WHERE id LIKE 'booking_%';
SELECT 'Wishlist items:' as type, COUNT(*) as count FROM wishlist WHERE id LIKE 'wish_%';
SELECT 'Reviews created:' as type, COUNT(*) as count FROM reviews WHERE id LIKE 'review_%';
SELECT 'Chat logs:' as type, COUNT(*) as count FROM chat_logs WHERE id LIKE 'chat_%';
SELECT 'Itineraries:' as type, COUNT(*) as count FROM itineraries WHERE id LIKE 'itinerary_%';

-- Show providers available for first 5 destinations
SELECT 'PROVIDERS FOR TOP 5 DESTINATIONS:' as info;
SELECT 
    d.name as destination,
    COUNT(DISTINCT pd.provider_id) as provider_count
FROM destinations d
LEFT JOIN provider_destinations pd ON d.id = pd.destination_id
WHERE d.id IN (63, 64, 65, 66, 67)
GROUP BY d.id, d.name
ORDER BY d.id;