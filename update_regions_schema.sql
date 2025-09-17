-- Add region column to destinations table (works in MySQL)
ALTER TABLE destinations ADD COLUMN region VARCHAR(50);

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    highlights TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert the four main regions of Jharkhand
INSERT IGNORE INTO regions (id, name, description, image_url, highlights) VALUES
('east', 'East Jharkhand', 'Home to the capital city Ranchi and major urban centers with scenic waterfalls and cultural attractions', 'https://images.unsplash.com/photo-1672154702113-b65ccc7b1f0e?crop=entropy&cs=srgb&fm=jpg&q=85', '["Ranchi", "Hundru Falls", "Jonha Falls", "Urban Culture"]'),
('west', 'West Jharkhand', 'Wildlife sanctuaries, pristine forests and the beautiful hill station Netarhat for nature lovers', 'https://images.unsplash.com/photo-1662018508173-c686afc56b48?crop=entropy&cs=srgb&fm=jpg&q=85', '["Betla National Park", "Netarhat", "Wildlife Safari", "Forest Trails"]'),
('north', 'North Jharkhand', 'Spiritual destinations, sacred hills and religious sites with panoramic views', 'https://images.unsplash.com/photo-1609222057381-2395dd20f6f9?crop=entropy&cs=srgb&fm=jpg&q=85', '["Parasnath Hill", "Deoghar Temple", "Giridih", "Spiritual Tourism"]'),
('south', 'South Jharkhand', 'Industrial heritage, scenic lakes and modern urban development', 'https://images.unsplash.com/photo-1609991148865-40902bd1f594?crop=entropy&cs=srgb&fm=jpg&q=85', '["Jamshedpur", "Dimna Lake", "Steel City", "Industrial Tourism"]');

-- Update existing destinations with appropriate regions based on their locations
UPDATE destinations SET region = 'east' WHERE location LIKE '%Ranchi%';
UPDATE destinations SET region = 'west' WHERE location LIKE '%Netarhat%' OR location LIKE '%Latehar%';
UPDATE destinations SET region = 'north' WHERE location LIKE '%Giridih%' OR location LIKE '%Deoghar%' OR location LIKE '%Hazaribagh%';
UPDATE destinations SET region = 'south' WHERE location LIKE '%Jamshedpur%' OR location LIKE '%Ramgarh%';

-- For destinations that didn't get updated, assign based on common knowledge
UPDATE destinations SET region = 'east' WHERE name LIKE '%Ranchi%' OR name LIKE '%Jonha%' OR name LIKE '%Dassam%' OR name LIKE '%Jagannath%';
UPDATE destinations SET region = 'west' WHERE name LIKE '%Betla%' OR name LIKE '%Netarhat%';
UPDATE destinations SET region = 'north' WHERE name LIKE '%Parasnath%' OR name LIKE '%Deoghar%' OR name LIKE '%Hazaribagh%';
UPDATE destinations SET region = 'south' WHERE name LIKE '%Dimna%' OR name LIKE '%Dalma%' OR name LIKE '%Jamshedpur%';

-- Set default region for any remaining destinations
UPDATE destinations SET region = 'east' WHERE region IS NULL;

-- Safely create index (only if it doesn’t exist)
SET @index_exists = (
    SELECT COUNT(1)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'destinations'
      AND INDEX_NAME = 'idx_destinations_region'
);

SET @sql = IF(@index_exists = 0,
              'CREATE INDEX idx_destinations_region ON destinations(region)',
              'SELECT "Index already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
