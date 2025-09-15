-- Create database
CREATE DATABASE IF NOT EXISTS jharkhand_tourism;
USE jharkhand_tourism;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('tourist', 'provider', 'admin') DEFAULT 'tourist',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    rating DECIMAL(2,1) DEFAULT 0,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    highlights JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    category ENUM('guide', 'transport', 'accommodation', 'activity') NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 4.5,
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    provider_id VARCHAR(255),
    destination_id VARCHAR(255),
    user_name VARCHAR(255) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    check_in DATE,
    check_out DATE,
    guests INT DEFAULT 1,
    rooms INT DEFAULT 1,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    package_type VARCHAR(50),
    package_name VARCHAR(100),
    addons TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Wishlist table (NEW)
CREATE TABLE IF NOT EXISTS wishlist (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    destination_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_destination (user_id, destination_id)
);

-- Itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    destination VARCHAR(255) NOT NULL,
    days INT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    interests JSON,
    travel_style VARCHAR(100),
    group_size INT DEFAULT 1,
    schedule JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    destination_id VARCHAR(255) NULL,
    provider_id VARCHAR(255) NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- Chat logs table (for AI chatbot)
CREATE TABLE IF NOT EXISTS chat_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_chat_logs_user_session (user_id, session_id),
    INDEX idx_chat_logs_created (created_at)
);

-- Sample users
INSERT INTO users (id, name, email, password, role, phone) VALUES
('user1', 'Priya Sharma', 'priya@example.com', '$2b$10$example_hash', 'tourist', '+91 98765 43210'),
('user2', 'Raj Patel', 'raj@example.com', '$2b$10$example_hash', 'tourist', '+91 98765 12345'),
('user3', 'Anita Kumar', 'anita@example.com', '$2b$10$example_hash', 'tourist', '+91 87654 32109'),
('admin1', 'Admin User', 'admin@tourism.com', '$2b$10$example_hash', 'admin', '+91 99999 99999'),
('provider1', 'Guide User', 'guide1@example.com', '$2b$10$example_hash', 'provider', '+91 98765 43210'),
('provider2', 'Transport User', 'transport1@example.com', '$2b$10$example_hash', 'provider', '+91 87654 32109');

-- Sample destinations
INSERT INTO destinations (id, name, location, description, image_url, rating, price, category, highlights) VALUES
('1', 'Ranchi', 'Ranchi, Jharkhand, India', 'The capital city of Jharkhand with scenic waterfalls and cultural attractions.', 'https://images.pexels.com/photos/2418977/pexels-photo-2418977.jpeg?auto=compress&cs=tinysrgb&w=800', 4.6, 12000, 'City', '["Tagore Hill", "Rock Garden", "Hundru Falls", "Ranchi Lake"]'),
('2', 'Netarhat', 'Netarhat, Jharkhand, India', 'A beautiful hill station known as the "Queen of Chotanagpur".', 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=800', 4.8, 15000, 'Hill Station', '["Sunrise Point", "Waterfalls", "Mahuadanr", "Forest Trails"]'),
('3', 'Betla National Park', 'Latehar, Jharkhand, India', 'Wildlife sanctuary with tigers, elephants, and lush forest trails.', 'https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=800', 4.7, 18000, 'Wildlife', '["Safari", "Elephant Spotting", "Bird Watching", "Nature Walks"]'),
('4', 'Parasnath Hill', 'Giridih, Jharkhand, India', 'Sacred Jain pilgrimage site with panoramic views from the top of the hill.', 'https://images.pexels.com/photos/1795725/pexels-photo-1795725.jpeg?auto=compress&cs=tinysrgb&w=800', 4.9, 14000, 'Religious', '["Jain Temples", "Trekking", "Sunset Views", "Meditation Spots"]'),
('5', 'Hirakud Waterfalls', 'Hazaribagh, Jharkhand, India', 'A scenic waterfall surrounded by lush greenery and forest trails.', 'https://images.pexels.com/photos/373551/pexels-photo-373551.jpeg?auto=compress&cs=tinysrgb&w=800', 4.5, 11000, 'Nature', '["Picnic", "Photography", "Nature Walks", "Swimming Area"]'),
('6', 'Dhanbad Coalfield Tour', 'Dhanbad, Jharkhand, India', 'Explore the historic coal mining regions and learn about industrial heritage.', 'https://images.pexels.com/photos/348519/pexels-photo-348519.jpeg?auto=compress&cs=tinysrgb&w=800', 4.4, 10000, 'Industrial Tourism', '["Coal Mines", "Mining Museum", "Local Market", "Railway Views"]'),
('7', 'Jonha Falls', 'Ranchi, Jharkhand, India', 'A majestic waterfall surrounded by dense forest and natural beauty.', 'https://images.pexels.com/photos/340874/pexels-photo-340874.jpeg?auto=compress&cs=tinysrgb&w=800', 4.6, 13000, 'Nature', '["Waterfall Viewing", "Photography", "Hiking", "Picnic"]'),
('8', 'Rajrappa Temple', 'Ramgarh, Jharkhand, India', 'Famous Hindu temple dedicated to Goddess Chhinnamasta with spiritual significance.', 'https://images.pexels.com/photos/238106/pexels-photo-238106.jpeg?auto=compress&cs=tinysrgb&w=800', 4.7, 12000, 'Religious', '["Temple Visit", "Riverside Views", "Festivals", "Local Culture"]'),
('9', 'Deori Temple', 'Giridih, Jharkhand, India', 'Ancient temple with cultural and historic significance.', 'https://images.pexels.com/photos/541114/pexels-photo-541114.jpeg?auto=compress&cs=tinysrgb&w=800', 4.5, 11500, 'Religious', '["Temple Tour", "Cultural Exploration", "Photography"]'),
('10', 'Dimna Lake', 'Jamshedpur, Jharkhand, India', 'Popular recreational lake surrounded by lush green hills.', 'https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=800', 4.8, 12500, 'Nature', '["Boating", "Fishing", "Picnic", "Sunset Views"]');

-- Sample providers
INSERT INTO providers (id, user_id, name, category, service_name, description, price, rating, location, contact, image_url) VALUES
('1', 'provider1', 'Ranchi City Tours', 'guide', 'City Guide for Ranchi', 'Experienced local guide providing tours across Ranchi''s top spots.', 1500, 4.8, 'Ranchi', '+91 98765 43210', 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400'),
('2', 'provider1', 'Netarhat Trekking Adventures', 'guide', 'Hill Station Trekking Guide', 'Professional trekking guide for Netarhat and surrounding hills.', 2000, 4.9, 'Netarhat', '+91 87654 32109', 'https://images.pexels.com/photos/261187/pexels-photo-261187.jpeg?auto=compress&cs=tinysrgb&w=400'),
('3', 'provider2', 'Betla Safari Services', 'transport', 'Wildlife Safari Experience', 'Jeep safari and wildlife photography tours in Betla National Park.', 3000, 4.7, 'Betla National Park', '+91 76543 21098', 'https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=400'),
('4', 'provider1', 'Parasnath Pilgrimage Guide', 'guide', 'Religious Tour Guide', 'Expert guide for Parasnath Hill and nearby Jain temples.', 1800, 4.6, 'Parasnath Hill', '+91 65432 10987', 'https://images.pexels.com/photos/1795725/pexels-photo-1795725.jpeg?auto=compress&cs=tinysrgb&w=400'),
('5', 'provider1', 'Hirakud Waterfalls Adventure', 'guide', 'Nature Trek and Adventure', 'Guided trekking and adventure around Hirakud Waterfalls.', 1600, 4.5, 'Hazaribagh', '+91 99887 77665', 'https://images.pexels.com/photos/373551/pexels-photo-373551.jpeg?auto=compress&cs=tinysrgb&w=400'),
('6', 'provider2', 'Dimna Lake Boating', 'transport', 'Boat Ride Experience', 'Boating services and lakeside activities at Dimna Lake.', 1200, 4.8, 'Jamshedpur', '+91 98765 11223', 'https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=400'),
('7', 'provider1', 'Rajrappa Temple Guide', 'guide', 'Religious Tour Guide', 'Local guide for Rajrappa Temple and surrounding attractions.', 1300, 4.7, 'Ramgarh', '+91 91234 56789', 'https://images.pexels.com/photos/238106/pexels-photo-238106.jpeg?auto=compress&cs=tinysrgb&w=400'),
('8', 'provider1', 'Deori Temple Guide', 'guide', 'Cultural and Religious Guide', 'Expert guide for Deori Temple and historic sites in Giridih.', 1400, 4.6, 'Giridih', '+91 92345 67890', 'https://images.pexels.com/photos/541114/pexels-photo-541114.jpeg?auto=compress&cs=tinysrgb&w=400');

-- Sample bookings
INSERT INTO bookings (id, user_id, provider_id, destination_id, user_name, provider_name, destination_name, booking_date, check_in, check_out, guests, rooms, status, total_price) VALUES
('1', 'user1', '1', '1', 'Priya Sharma', 'Ranchi City Tours', 'Ranchi', '2025-02-15', '2025-02-15', '2025-02-18', 2, 1, 'confirmed', 13500),
('2', 'user2', '2', '2', 'Raj Patel', 'Netarhat Trekking Adventures', 'Netarhat', '2025-03-20', '2025-03-20', '2025-03-23', 2, 1, 'pending', 17000),
('3', 'user3', '3', '3', 'Anita Kumar', 'Betla Safari Services', 'Betla National Park', '2025-01-10', '2025-01-10', '2025-01-13', 4, 2, 'completed', 21000);

-- Sample wishlist items
INSERT INTO wishlist (id, user_id, destination_id) VALUES
('wl1', 'user1', '2'),
('wl2', 'user1', '4'),
('wl3', 'user2', '3'),
('wl4', 'user2', '5');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_destinations_category ON destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON destinations(rating);
CREATE INDEX IF NOT EXISTS idx_destinations_price ON destinations(price);
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_location ON providers(location);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_destination_id ON wishlist(destination_id);

