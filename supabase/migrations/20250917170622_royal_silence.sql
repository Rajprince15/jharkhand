-- Sample Data for Jharkhand Tourism Database
-- Run this AFTER creating the schema

-- Insert regions first
INSERT INTO regions (id, name, description, image_url, highlights) VALUES
('east', 'East Jharkhand', 'Home to the capital city Ranchi and major urban centers with scenic waterfalls and cultural attractions', 'https://images.unsplash.com/photo-1672154702113-b65ccc7b1f0e?crop=entropy&cs=srgb&fm=jpg&q=85', '["Ranchi", "Hundru Falls", "Jonha Falls", "Urban Culture"]'),
('west', 'West Jharkhand', 'Wildlife sanctuaries, pristine forests and the beautiful hill station Netarhat for nature lovers', 'https://images.unsplash.com/photo-1662018508173-c686afc56b48?crop=entropy&cs=srgb&fm=jpg&q=85', '["Betla National Park", "Netarhat", "Wildlife Safari", "Forest Trails"]'),
('north', 'North Jharkhand', 'Spiritual destinations, sacred hills and religious sites with panoramic views', 'https://images.unsplash.com/photo-1609222057381-2395dd20f6f9?crop=entropy&cs=srgb&fm=jpg&q=85', '["Parasnath Hill", "Deoghar Temple", "Giridih", "Spiritual Tourism"]'),
('south', 'South Jharkhand', 'Industrial heritage, scenic lakes and modern urban development', 'https://images.unsplash.com/photo-1609991148865-40902bd1f594?crop=entropy&cs=srgb&fm=jpg&q=85', '["Jamshedpur", "Dimna Lake", "Steel City", "Industrial Tourism"]')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert sample users
INSERT INTO users (id, name, email, password, role, phone) VALUES
('user1', 'Priya Sharma', 'tourist@example.com', '$2b$10$example_hash', 'tourist', '+91 98765 43210'),
('user2', 'Raj Patel', 'raj@example.com', '$2b$10$example_hash', 'tourist', '+91 98765 12345'),
('user3', 'Anita Kumar', 'anita@example.com', '$2b$10$example_hash', 'tourist', '+91 87654 32109'),
('admin1', 'Admin User', 'admin@example.com', '$2b$10$example_hash', 'admin', '+91 99999 99999'),
('provider1', 'Guide User', 'provider@example.com', '$2b$10$example_hash', 'provider', '+91 98765 43210'),
('provider2', 'Transport User', 'transport1@example.com', '$2b$10$example_hash', 'provider', '+91 87654 32109')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert sample destinations with regions
INSERT INTO destinations (id, name, location, description, image_url, rating, price, category, region, highlights) VALUES
('1', 'Ranchi', 'Ranchi, Jharkhand, India', 'The capital city of Jharkhand with scenic waterfalls and cultural attractions.', 'https://images.unsplash.com/photo-1672154702113-b65ccc7b1f0e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxqaGFya2hhbmQlMjB0b3VyaXNtfGVufDB8fHx8MTc1NzMzNTU0MXww&ixlib=rb-4.1.0&q=85', 4.6, 12000, 'City', 'east', '["Tagore Hill", "Rock Garden", "Hundru Falls", "Ranchi Lake"]'),
('2', 'Netarhat', 'Netarhat, Jharkhand, India', 'A beautiful hill station known as the "Queen of Chotanagpur".', 'https://images.unsplash.com/photo-1609222057381-2395dd20f6f9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxqaGFya2hhbmQlMjB0b3VyaXNtfGVufDB8fHx8MTc1NzMzNTU0MXww&ixlib=rb-4.1.0&q=85', 4.8, 15000, 'Hill Station', 'west', '["Sunrise Point", "Waterfalls", "Mahuadanr", "Forest Trails"]'),
('3', 'Betla National Park', 'Latehar, Jharkhand, India', 'Wildlife sanctuary with tigers, elephants, and lush forest trails.', 'https://images.unsplash.com/photo-1662018508173-c686afc56b48?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwzfHxqaGFya2hhbmR8ZW58MHx8fHwxNzU3MTY2NzE0fDA&ixlib=rb-4.1.0&q=85', 4.7, 18000, 'Wildlife', 'west', '["Safari", "Elephant Spotting", "Bird Watching", "Nature Walks"]'),
('4', 'Parasnath Hill', 'Giridih, Jharkhand, India', 'Sacred Jain pilgrimage site with panoramic views from the top of the hill.', 'https://images.unsplash.com/photo-1609991148865-40902bd1f594?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHw0fHxqaGFya2hhbmR8ZW58MHx8fHwxNzU3MTY2NzE0fDA&ixlib=rb-4.1.0&q=85', 4.9, 14000, 'Religious', 'north', '["Jain Temples", "Trekking", "Sunset Views", "Meditation Spots"]'),
('5', 'Hirakud Waterfalls', 'Hazaribagh, Jharkhand, India', 'A scenic waterfall surrounded by lush greenery and forest trails.', 'https://images.unsplash.com/photo-1597384532390-98ece5da73cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxqaGFya2hhbmQlMjB3YXRlcmZhbGxzfGVufDB8fHx8MTc1NzMzNTUzNXww&ixlib=rb-4.1.0&q=85', 4.5, 11000, 'Nature', 'north', '["Picnic", "Photography", "Nature Walks", "Swimming Area"]'),
('6', 'Jonha Falls', 'Ranchi, Jharkhand, India', 'A majestic waterfall surrounded by dense forest and natural beauty.', 'https://images.unsplash.com/photo-1609775015123-e7573e73a7a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxqaGFya2hhbmQlMjB3YXRlcmZhbGxzfGVufDB8fHx8MTc1NzMzNTUzNXww&ixlib=rb-4.1.0&q=85', 4.6, 13000, 'Nature', 'east', '["Waterfall Viewing", "Photography", "Hiking", "Picnic"]'),
('7', 'Dassam Falls', 'Ranchi, Jharkhand, India', 'Beautiful cascading waterfall surrounded by thick forest, perfect for nature lovers.', 'https://images.unsplash.com/photo-1675296321708-2971a2fbd7e9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHxqaGFya2hhbmQlMjB3YXRlcmZhbGxzfGVufDB8fHx8MTc1NzMzNTUzNXww&ixlib=rb-4.1.0&q=85', 4.4, 10000, 'Nature', 'east', '["Photography", "Nature Walks", "Picnic Spots", "Wildlife Spotting"]'),
('8', 'Hazaribagh National Park', 'Hazaribagh, Jharkhand, India', 'Wildlife sanctuary known for its diverse flora and fauna including sambars and leopards.', 'https://images.unsplash.com/photo-1549366021-9f761d040a94?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHx3aWxkbGlmZXxlbnwwfHx8fDE3NTcxNjY3MjJ8MA&ixlib=rb-4.1.0&q=85', 4.5, 16000, 'Wildlife', 'north', '["Safari Tours", "Bird Watching", "Nature Photography", "Wildlife Conservation"]'),
('9', 'Jagannath Temple', 'Ranchi, Jharkhand, India', 'Historic temple dedicated to Lord Jagannath, replica of the famous Puri temple.', 'https://images.unsplash.com/photo-1591698491296-ad9018314b05?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw1fHx0ZW1wbGV8ZW58MHx8fHwxNzU3MTY2NzIyfDA&ixlib=rb-4.1.0&q=85', 4.7, 5000, 'Religious', 'east', '["Temple Architecture", "Religious Ceremonies", "Cultural Heritage", "Festival Celebrations"]'),
('10', 'Dalma Wildlife Sanctuary', 'Jamshedpur, Jharkhand, India', 'Home to elephants and other wildlife species with scenic hills and valleys.', 'https://images.unsplash.com/photo-1549366021-9f761d040a94?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw2fHx3aWxkbGlmZXxlbnwwfHx8fDE3NTcxNjY3MjJ8MA&ixlib=rb-4.1.0&q=85', 4.3, 14000, 'Wildlife', 'south', '["Elephant Herds", "Trekking Trails", "Natural Springs", "Panoramic Views"]'),
('11', 'Rajrappa Temple', 'Ramgarh, Jharkhand, India', 'Sacred temple dedicated to Goddess Chinnamasta, situated at confluence of rivers.', 'https://images.unsplash.com/photo-1609991148865-40902bd1f594?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw3fHx0ZW1wbGV8ZW58MHx8fHwxNzU3MTY2NzIyfDA&ixlib=rb-4.1.0&q=85', 4.8, 8000, 'Religious', 'south', '["Goddess Temple", "River Confluence", "Religious Significance", "Peaceful Environment"]'),
('12', 'Deoghar Baidyanath Temple', 'Deoghar, Jharkhand, India', 'One of the twelve Jyotirlingas, major pilgrimage site for devotees of Lord Shiva.', 'https://images.unsplash.com/photo-1580500807294-7be6dff3caf1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw4fHx0ZW1wbGV8ZW58MHx8fHwxNzU3MTY2NzIyfDA&ixlib=rb-4.1.0&q=85', 4.9, 12000, 'Religious', 'north', '["Jyotirlinga", "Pilgrimage Site", "Ancient Architecture", "Spiritual Experience"]')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert sample providers
INSERT INTO providers (id, user_id, name, category, service_name, description, price, rating, location, contact, image_url) VALUES
('1', 'provider1', 'Ranchi City Tours', 'guide', 'City Guide for Ranchi', 'Experienced local guide providing tours across Ranchi''s top spots.', 1500, 4.8, 'Ranchi', '+91 98765 43210', 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400'),
('2', 'provider1', 'Netarhat Trekking Adventures', 'guide', 'Hill Station Trekking Guide', 'Professional trekking guide for Netarhat and surrounding hills.', 2000, 4.9, 'Netarhat', '+91 87654 32109', 'https://images.pexels.com/photos/261187/pexels-photo-261187.jpeg?auto=compress&cs=tinysrgb&w=400'),
('3', 'provider2', 'Betla Safari Services', 'transport', 'Wildlife Safari Experience', 'Jeep safari and wildlife photography tours in Betla National Park.', 3000, 4.7, 'Betla National Park', '+91 76543 21098', 'https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=400')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert sample bookings
INSERT INTO bookings (id, user_id, provider_id, destination_id, user_name, provider_name, destination_name, booking_date, check_in, check_out, guests, rooms, status, total_price) VALUES
('1', 'user1', '1', '1', 'Priya Sharma', 'Ranchi City Tours', 'Ranchi', '2025-02-15', '2025-02-15', '2025-02-18', 2, 1, 'confirmed', 13500),
('2', 'user2', '2', '2', 'Raj Patel', 'Netarhat Trekking Adventures', 'Netarhat', '2025-03-20', '2025-03-20', '2025-03-23', 2, 1, 'pending', 17000),
('3', 'user3', '3', '3', 'Anita Kumar', 'Betla Safari Services', 'Betla National Park', '2025-01-10', '2025-01-10', '2025-01-13', 4, 2, 'completed', 21000)
ON DUPLICATE KEY UPDATE user_name=VALUES(user_name);

-- Insert sample wishlist items
INSERT INTO wishlist (id, user_id, destination_id) VALUES
('wl1', 'user1', '2'),
('wl2', 'user1', '4'),
('wl3', 'user2', '3'),
('wl4', 'user2', '5')
ON DUPLICATE KEY UPDATE id=VALUES(id);