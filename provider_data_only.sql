-- Create provider_destinations junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS provider_destinations (
    id VARCHAR(255) PRIMARY KEY,
    provider_id VARCHAR(255) NOT NULL,
    destination_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_destination (provider_id, destination_id)
);

-- Safely recreate indexes for better performance
DROP INDEX IF EXISTS idx_provider_destinations_provider ON provider_destinations;
DROP INDEX IF EXISTS idx_provider_destinations_destination ON provider_destinations;

CREATE INDEX idx_provider_destinations_provider ON provider_destinations(provider_id);
CREATE INDEX idx_provider_destinations_destination ON provider_destinations(destination_id);

-- Insert sample providers with services for different destinations
-- Insert sample providers with services for different destinations
INSERT INTO providers (id, user_id, name, category, service_name, description, price, rating, location, contact, image_url) VALUES
-- Ranchi Providers
('prov_ranchi_guide_1', 'provider1', 'Ranchi Heritage Tours', 'guide', 'Complete Ranchi City Tour', 'Professional guided tours covering all major Ranchi attractions including Tagore Hill, Rock Garden, and Hundru Falls.', 2500, 4.8, 'Ranchi', '+91 98765 11111', 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400'),
('prov_ranchi_transport_1', 'provider2', 'Ranchi Cab Services', 'transport', 'Private Car Rental', 'Comfortable AC cars for Ranchi sightseeing with experienced drivers.', 3000, 4.6, 'Ranchi', '+91 98765 22222', 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400'),
('prov_ranchi_hotel_1', 'provider1', 'Ranchi Stay Inn', 'accommodation', 'Budget Hotel Accommodation', 'Clean and comfortable budget accommodation in heart of Ranchi city.', 1800, 4.4, 'Ranchi', '+91 98765 33333', 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400'),

-- Netarhat Providers  
('prov_netarhat_guide_1', 'provider1', 'Netarhat Hill Adventures', 'guide', 'Netarhat Trekking & Sunrise Tours', 'Experience the Queen of Chotanagpur with guided treks and sunrise point visits.', 2800, 4.9, 'Netarhat', '+91 98765 44444', 'https://images.pexels.com/photos/261187/pexels-photo-261187.jpeg?auto=compress&cs=tinysrgb&w=400'),
('prov_netarhat_hotel_1', 'provider2', 'Hill View Resort Netarhat', 'accommodation', 'Hill Station Resort', 'Beautiful resort with panoramic views of Netarhat hills and valleys.', 4500, 4.7, 'Netarhat', '+91 98765 55555', 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=400'),

-- Betla National Park Providers
('prov_betla_safari_1', 'provider1', 'Betla Wildlife Safaris', 'activity', 'Jeep Safari & Wildlife Photography', 'Professional wildlife safari with expert naturalist guides and photography assistance.', 3500, 4.8, 'Betla National Park', '+91 98765 66666', 'https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=400'),
('prov_betla_guide_1', 'provider2', 'Betla Nature Guides', 'guide', 'Wildlife & Nature Tours', 'Experienced local guides for wildlife spotting and nature walks in Betla.', 2200, 4.6, 'Betla National Park', '+91 98765 77777', 'https://images.pexels.com/photos/1172105/pexels-photo-1172105.jpeg?auto=compress&cs=tinysrgb&w=400'),

-- Parasnath Hill Providers
('prov_parasnath_guide_1', 'provider1', 'Parasnath Pilgrimage Services', 'guide', 'Jain Temple Tours & Trekking', 'Spiritual tours and trekking to Parasnath Hill Jain temples with religious significance explanations.', 2000, 4.7, 'Parasnath Hill', '+91 98765 88888', 'https://images.pexels.com/photos/1795725/pexels-photo-1795725.jpeg?auto=compress&cs=tinysrgb&w=400'),
('prov_parasnath_transport_1', 'provider2', 'Parasnath Hill Transport', 'transport', 'Hill Transportation Service', 'Safe and reliable transportation to Parasnath Hill summit and temples.', 1500, 4.5, 'Parasnath Hill', '+91 98765 99999', 'https://images.pexels.com/photos/1164674/pexels-photo-1164674.jpeg?auto=compress&cs=tinysrgb&w=400'),

-- Dimna Lake Providers
('prov_dimna_water_1', 'provider1', 'Dimna Lake Water Sports', 'activity', 'Boating & Water Activities', 'Boating, kayaking and other water sports at beautiful Dimna Lake.', 1800, 4.5, 'Dimna Lake', '+91 98765 10101', 'https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=400'),
('prov_dimna_restaurant_1', 'provider2', 'Lakeview Restaurant', 'accommodation', 'Lakeside Dining Experience', 'Multi-cuisine restaurant with beautiful lake views and fresh local ingredients.', 1200, 4.3, 'Dimna Lake', '+91 98765 20202', 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=400');

-- Now link providers to destinations
INSERT INTO provider_destinations (id, provider_id, destination_id) VALUES
-- Ranchi (destination id = '1')
('pd1', 'prov_ranchi_guide_1', '1'),
('pd2', 'prov_ranchi_transport_1', '1'),  
('pd3', 'prov_ranchi_hotel_1', '1'),

-- Netarhat (destination id = '2')  
('pd4', 'prov_netarhat_guide_1', '2'),
('pd5', 'prov_netarhat_hotel_1', '2'),

-- Betla National Park (destination id = '3')
('pd6', 'prov_betla_safari_1', '3'),
('pd7', 'prov_betla_guide_1', '3'),

-- Parasnath Hill (destination id = '4')
('pd8', 'prov_parasnath_guide_1', '4'),
('pd9', 'prov_parasnath_transport_1', '4'),

-- Dimna Lake (destination id = '10')
('pd10', 'prov_dimna_water_1', '10'),
('pd11', 'prov_dimna_restaurant_1', '10'),

-- Some providers can also serve nearby destinations
-- Ranchi transport can also serve nearby Jonha Falls (id = '7')
('pd12', 'prov_ranchi_transport_1', '7');
