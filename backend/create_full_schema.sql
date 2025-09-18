-- Full schema for Jharkhand Tourism with Payment Integration

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('tourist', 'provider', 'admin') DEFAULT 'tourist',
    phone VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    highlights JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    region VARCHAR(255),
    highlights JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create providers table
CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    location VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    destination_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
);

-- Create bookings table with payment support
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    provider_id VARCHAR(36) NOT NULL,
    destination_id VARCHAR(36) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    rooms INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    status ENUM('pending', 'payment_required', 'payment_pending', 'paid', 'confirmed', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    payment_status ENUM('not_required', 'required', 'pending', 'completed', 'failed') DEFAULT 'required',
    payment_amount DECIMAL(10,2) NULL,
    payment_deadline TIMESTAMP NULL,
    addons TEXT,
    package_type VARCHAR(50),
    package_name VARCHAR(100),
    booking_full_name VARCHAR(255) NOT NULL,
    booking_email VARCHAR(255) NOT NULL,
    booking_phone VARCHAR(15) NOT NULL,
    city_origin VARCHAR(100),
    reference_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
);

-- Create payments table
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
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create payment_logs table for audit trail
CREATE TABLE IF NOT EXISTS payment_logs (
    id VARCHAR(36) PRIMARY KEY,
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    destination_id VARCHAR(36),
    provider_id VARCHAR(36),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
);

-- Create itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    days INT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    content TEXT NOT NULL,
    preferences JSON,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    model VARCHAR(100) DEFAULT 'gemini-2.0-flash',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create chat_logs table
CREATE TABLE IF NOT EXISTS chat_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_ref ON payments(transaction_reference);
CREATE INDEX idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_destination_id ON providers(destination_id);
CREATE INDEX idx_reviews_destination_id ON reviews(destination_id);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);

-- Insert sample regions
INSERT IGNORE INTO regions (id, name, description, image_url, highlights) VALUES
('east', 'East Jharkhand', 'Eastern region including Ranchi and surrounding areas', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', '["Capital City", "Government Hub", "Cultural Center", "Modern Infrastructure"]'),
('west', 'West Jharkhand', 'Western region with Netarhat and hill stations', 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800', '["Hill Stations", "Cool Climate", "Scenic Beauty", "Sunrise Points"]'),
('north', 'North Jharkhand', 'Northern region with industrial and cultural sites', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', '["Industrial Belt", "Cultural Heritage", "Historical Sites", "Tribal Culture"]'),
('south', 'South Jharkhand', 'Southern region with natural beauty and wildlife', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800', '["Wildlife Sanctuaries", "Natural Beauty", "Forest Reserves", "Adventure Tourism"]');

-- Insert sample destinations
INSERT IGNORE INTO destinations (id, name, location, description, image_url, rating, price, category, region, highlights) VALUES
('dest1', 'Ranchi', 'Ranchi, Jharkhand', 'Capital city of Jharkhand with modern amenities and cultural attractions', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 4.2, 5000.00, 'Cultural', 'Santhal Pargana Division', '["Rock Garden", "Tagore Hill", "Jagannath Temple", "Kanke Dam"]'),
('dest2', 'Netarhat', 'Netarhat, Latehar', 'Queen of Chotanagpur, famous for sunrise and sunset views', 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800', 4.5, 8000.00, 'Nature', 'Palamu Division', '["Sunrise Point", "Sunset Point", "Pine Forest", "Cool Climate"]'),
('dest3', 'Deoghar', 'Deoghar, Jharkhand', 'Famous pilgrimage site with Baidyanath Temple', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', 4.3, 6000.00, 'Religious', 'Santhal Pargana Division', '["Baidyanath Jyotirlinga", "Naulakha Temple", "Tapovan", "Trikuta Hill"]'),
('dest4', 'Betla National Park', 'Latehar, Jharkhand', 'Wildlife sanctuary famous for tigers and elephants', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800', 4.1, 7500.00, 'Wildlife', 'Palamu Division', '["Tiger Safari", "Elephant Reserve", "Watchtowers", "Forest Lodge"]'),
('dest5', 'Hazaribagh', 'Hazaribagh, Jharkhand', 'Scenic hill station with wildlife sanctuary', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800', 4.0, 5500.00, 'Nature', 'North Chhotanagpur Division', '["Wildlife Sanctuary", "Lake View", "Canary Hill", "Hazaribagh Lake"]');

-- Insert sample users (admin user)
INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES
('admin_1', 'Admin User', 'admin@jharkhandtourism.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeV.1YjvW1y6Y8nKu', 'admin', '9876543210');

-- Insert sample providers
INSERT IGNORE INTO providers (id, user_id, name, category, service_name, description, price, rating, location, contact, image_url, is_active, destination_id) VALUES
('prov1', 'admin_1', 'Ranchi Heritage Tours', 'Heritage', 'Cultural City Tour', 'Explore the cultural heritage of Ranchi with experienced guides', 3000.00, 4.5, 'Ranchi', '9876543210', 'https://images.unsplash.com/photo-1539650116574-75c0c6d73956?w=400', TRUE, 'dest1'),
('prov2', 'admin_1', 'Netarhat Adventure', 'Adventure', 'Hill Station Experience', 'Experience the beauty of Queen of Chotanagpur', 4500.00, 4.7, 'Netarhat', '9876543211', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400', TRUE, 'dest2'),
('prov3', 'admin_1', 'Deoghar Spiritual Tours', 'Spiritual', 'Pilgrimage Package', 'Complete spiritual journey to Baidyanath Dham', 3500.00, 4.4, 'Deoghar', '9876543212', 'https://images.unsplash.com/photo-1602216056504-db6f33c2f37f?w=400', TRUE, 'dest3'),
('prov4', 'admin_1', 'Betla Wildlife Safari', 'Wildlife', 'Tiger Safari Experience', 'Wildlife photography and safari experience', 5000.00, 4.6, 'Betla', '9876543213', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400', TRUE, 'dest4'),
('prov5', 'admin_1', 'Hazaribagh Nature Tours', 'Nature', 'Lake and Hills Tour', 'Scenic beauty and nature photography tours', 3800.00, 4.2, 'Hazaribagh', '9876543214', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', TRUE, 'dest5');