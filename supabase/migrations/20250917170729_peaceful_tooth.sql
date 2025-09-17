-- Simple Regions Update (Alternative to complex dynamic SQL)
-- This is a simplified version of update_regions_schema.sql

-- Add region column if it doesn't exist
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS region VARCHAR(50);

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    highlights TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert regions
INSERT INTO regions (id, name, description, image_url, highlights) VALUES
('east', 'East Jharkhand', 'Home to the capital city Ranchi and major urban centers', 'https://images.unsplash.com/photo-1672154702113-b65ccc7b1f0e?crop=entropy&cs=srgb&fm=jpg&q=85', '["Ranchi", "Hundru Falls", "Jonha Falls", "Urban Culture"]'),
('west', 'West Jharkhand', 'Wildlife sanctuaries and pristine forests', 'https://images.unsplash.com/photo-1662018508173-c686afc56b48?crop=entropy&cs=srgb&fm=jpg&q=85', '["Betla National Park", "Netarhat", "Wildlife Safari"]'),
('north', 'North Jharkhand', 'Spiritual destinations and sacred hills', 'https://images.unsplash.com/photo-1609222057381-2395dd20f6f9?crop=entropy&cs=srgb&fm=jpg&q=85', '["Parasnath Hill", "Deoghar Temple", "Spiritual Tourism"]'),
('south', 'South Jharkhand', 'Industrial heritage and scenic lakes', 'https://images.unsplash.com/photo-1609991148865-40902bd1f594?crop=entropy&cs=srgb&fm=jpg&q=85', '["Jamshedpur", "Dimna Lake", "Industrial Tourism"]')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Update destinations with regions
UPDATE destinations SET region = 'east' WHERE name IN ('Ranchi', 'Jonha Falls', 'Dassam Falls', 'Jagannath Temple');
UPDATE destinations SET region = 'west' WHERE name IN ('Netarhat', 'Betla National Park');
UPDATE destinations SET region = 'north' WHERE name IN ('Parasnath Hill', 'Hirakud Waterfalls', 'Hazaribagh National Park', 'Deoghar Baidyanath Temple');
UPDATE destinations SET region = 'south' WHERE name IN ('Dalma Wildlife Sanctuary', 'Rajrappa Temple');

-- Create index
CREATE INDEX IF NOT EXISTS idx_destinations_region ON destinations(region);