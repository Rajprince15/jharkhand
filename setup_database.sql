-- Jharkhand Tourism Database Schema
USE jharkhand_tourism;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('tourist', 'provider', 'admin') NOT NULL DEFAULT 'tourist',
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
    rating DECIMAL(3,2) DEFAULT 0.0,
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
    category VARCHAR(100),
    service_name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.0,
    location VARCHAR(255),
    contact VARCHAR(100),
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
    user_name VARCHAR(255),
    provider_name VARCHAR(255),
    destination_name VARCHAR(255),
    booking_date DATE,
    check_in DATE,
    check_out DATE,
    guests INT DEFAULT 1,
    rooms INT DEFAULT 1,
    total_price DECIMAL(10,2),
    special_requests TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    destination_id VARCHAR(255) NULL,
    provider_id VARCHAR(255) NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- Chat logs table
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

-- Itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    destination VARCHAR(255) NOT NULL,
    days INT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    content TEXT,
    preferences JSON,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
-- Sample admin user
INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES 
('admin-001', 'Admin User', 'admin@jharkhandtourism.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'admin', '+91-9876543200');

-- Sample destinations
INSERT IGNORE INTO destinations (id, name, location, description, image_url, rating, price, category, highlights) VALUES 
('dest-001', 'Ranchi Hill Station', 'Ranchi, Jharkhand', 'Beautiful hill station with scenic views and pleasant weather', 'https://example.com/ranchi.jpg', 4.5, 2500.00, 'Hill Station', '["Scenic Views", "Pleasant Weather", "Rock Garden", "Tagore Hill"]'),
('dest-002', 'Netarhat Sunrise Point', 'Netarhat, Jharkhand', 'Famous for spectacular sunrise and sunset views', 'https://example.com/netarhat.jpg', 4.8, 3000.00, 'Nature', '["Sunrise Views", "Sunset Point", "Pine Forests", "Cool Climate"]'),
('dest-003', 'Dassam Falls', 'Taimara, Jharkhand', 'Magnificent waterfall cascading from 144 feet height', 'https://example.com/dassam.jpg', 4.3, 1500.00, 'Waterfall', '["144 feet waterfall", "Natural Pool", "Trekking", "Photography"]'),
('dest-004', 'Betla National Park', 'Latehar, Jharkhand', 'Wildlife sanctuary with tigers, elephants and diverse flora', 'https://example.com/betla.jpg', 4.6, 4000.00, 'Wildlife', '["Tiger Safari", "Elephant Spotting", "Bird Watching", "Nature Trails"]'),
('dest-005', 'Hundru Falls', 'Ranchi, Jharkhand', 'Spectacular waterfall formed by Subarnarekha River', 'https://example.com/hundru.jpg', 4.4, 1800.00, 'Waterfall', '["320 feet waterfall", "River Rafting", "Rock Climbing", "Picnic Spots"]');

-- Sample providers
INSERT IGNORE INTO providers (id, user_id, name, category, service_name, description, price, rating, location, contact, image_url, is_active) VALUES 
('prov-001', NULL, 'Jharkhand Adventure Tours', 'Adventure', 'Trekking and Camping', 'Professional trekking and camping services', 2500.00, 4.5, 'Ranchi, Jharkhand', '+91-9876543201', 'https://example.com/adventure.jpg', TRUE),
('prov-002', NULL, 'Heritage Hotels Jharkhand', 'Accommodation', 'Luxury Stay', 'Premium accommodation with traditional hospitality', 5000.00, 4.7, 'Netarhat, Jharkhand', '+91-9876543202', 'https://example.com/hotel.jpg', TRUE),
('prov-003', NULL, 'Tribal Culture Tours', 'Cultural', 'Cultural Experience', 'Authentic tribal culture and handicraft tours', 1800.00, 4.3, 'Khunti, Jharkhand', '+91-9876543203', 'https://example.com/culture.jpg', TRUE),
('prov-004', NULL, 'Wildlife Safari Experts', 'Wildlife', 'Safari Tours', 'Expert-guided wildlife safari and bird watching', 3500.00, 4.6, 'Betla, Jharkhand', '+91-9876543204', 'https://example.com/safari.jpg', TRUE),
('prov-005', NULL, 'Waterfall Adventures', 'Adventure', 'Waterfall Tours', 'Specialized waterfall trekking and photography tours', 2200.00, 4.4, 'Ranchi, Jharkhand', '+91-9876543205', 'https://example.com/waterfall.jpg', TRUE);

-- Sample reviews
INSERT IGNORE INTO reviews (id, user_id, destination_id, provider_id, rating, comment) VALUES 
('rev-001', 'admin-001', 'dest-001', NULL, 5, 'Amazing place with breathtaking views! Perfect for weekend getaway.'),
('rev-002', 'admin-001', 'dest-002', NULL, 5, 'The sunrise view is absolutely spectacular. Must visit!'),
('rev-003', 'admin-001', NULL, 'prov-001', 4, 'Great service and professional guides. Highly recommended for adventure lovers.');