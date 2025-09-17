#!/usr/bin/env python3
"""
Insert sample data for Jharkhand tourism database
"""

import asyncio
import aiomysql
import os
from dotenv import load_dotenv

# Load environment variables  
load_dotenv('/app/backend/.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3001)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'Prince1504'),
    'db': os.getenv('DB_NAME', 'jharkhand_tourism'),
    'autocommit': True
}

async def insert_sample_data():
    """Insert sample data into the database"""
    try:
        connection = await aiomysql.connect(**DB_CONFIG)
        
        async with connection.cursor() as cursor:
            print("🔄 Inserting sample data...")
            
            # Insert regions
            regions_sql = """
            INSERT IGNORE INTO regions (id, name, description, image_url, highlights) VALUES
            ('east', 'East Jharkhand', 'Eastern region featuring the capital city and waterfalls', 'https://images.pexels.com/photos/2418977/pexels-photo-2418977.jpeg?auto=compress&cs=tinysrgb&w=800', '["Ranchi", "Hundru Falls", "Urban Culture", "Administrative Hub"]'),
            ('west', 'West Jharkhand', 'Western hills and scenic beauty, Queen of Chotanagpur', 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=800', '["Netarhat", "Hill Stations", "Sunrise Points", "Cool Climate"]'),
            ('north', 'North Jharkhand', 'Northern wildlife and pilgrimage sites', 'https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=800', '["Betla National Park", "Parasnath Hill", "Wildlife", "Spiritual Sites"]'),
            ('south', 'South Jharkhand', 'Southern industrial and natural attractions', 'https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=800', '["Jamshedpur", "Dimna Lake", "Industrial Heritage", "Lakes"]');
            """
            await cursor.execute(regions_sql)
            print("   ✅ Regions inserted")
            
            # Insert destinations
            destinations_sql = """
            INSERT IGNORE INTO destinations (id, name, location, description, image_url, rating, price, category, highlights, region) VALUES
            ('1', 'Ranchi', 'Ranchi, Jharkhand, India', 'The capital city of Jharkhand with scenic waterfalls and cultural attractions.', 'https://images.pexels.com/photos/2418977/pexels-photo-2418977.jpeg?auto=compress&cs=tinysrgb&w=800', 4.6, 12000.00, 'City', '["Tagore Hill", "Rock Garden", "Hundru Falls", "Ranchi Lake"]', 'east'),
            ('2', 'Netarhat', 'Netarhat, Jharkhand, India', 'A beautiful hill station known as the "Queen of Chotanagpur".', 'https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=800', 4.8, 15000.00, 'Hill Station', '["Sunrise Point", "Waterfalls", "Mahuadanr", "Forest Trails"]', 'west'),
            ('3', 'Betla National Park', 'Latehar, Jharkhand, India', 'Wildlife sanctuary with tigers, elephants, and lush forest trails.', 'https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=800', 4.7, 18000.00, 'Wildlife', '["Safari", "Elephant Spotting", "Bird Watching", "Nature Walks"]', 'north'),
            ('4', 'Parasnath Hill', 'Giridih, Jharkhand, India', 'Sacred Jain pilgrimage site with panoramic views from the top of the hill.', 'https://images.pexels.com/photos/1795725/pexels-photo-1795725.jpeg?auto=compress&cs=tinysrgb&w=800', 4.9, 14000.00, 'Religious', '["Jain Temples", "Trekking", "Sunset Views", "Meditation Spots"]', 'north'),
            ('5', 'Dimna Lake', 'Jamshedpur, Jharkhand, India', 'Popular recreational lake surrounded by lush green hills.', 'https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=800', 4.8, 12500.00, 'Nature', '["Boating", "Fishing", "Picnic", "Sunset Views"]', 'south'),
            ('6', 'Jonha Falls', 'Ranchi, Jharkhand, India', 'A majestic waterfall surrounded by dense forest and natural beauty.', 'https://images.pexels.com/photos/340874/pexels-photo-340874.jpeg?auto=compress&cs=tinysrgb&w=800', 4.6, 13000.00, 'Nature', '["Waterfall Viewing", "Photography", "Hiking", "Picnic"]', 'east'),
            ('7', 'Rajrappa Temple', 'Ramgarh, Jharkhand, India', 'Famous Hindu temple dedicated to Goddess Chhinnamasta with spiritual significance.', 'https://images.pexels.com/photos/238106/pexels-photo-238106.jpeg?auto=compress&cs=tinysrgb&w=800', 4.7, 12000.00, 'Religious', '["Temple Visit", "Riverside Views", "Festivals", "Local Culture"]', 'south');
            """
            await cursor.execute(destinations_sql)
            print("   ✅ Destinations inserted")
            
            # Insert some sample users
            users_sql = """
            INSERT IGNORE INTO users (id, name, email, password, role, phone) VALUES
            ('user1', 'Tourist User', 'tourist@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHGz/7r0h5X9.WNC', 'tourist', '+91 9876543210'),
            ('provider1', 'Service Provider 1', 'provider1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHGz/7r0h5X9.WNC', 'provider', '+91 9876543211'),
            ('provider2', 'Service Provider 2', 'provider2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHGz/7r0h5X9.WNC', 'provider', '+91 9876543212'),
            ('admin1', 'Admin User', 'admin@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeHGz/7r0h5X9.WNC', 'admin', '+91 9876543213');
            """
            await cursor.execute(users_sql)
            print("   ✅ Users inserted")
            
            # Insert some sample providers
            providers_sql = """
            INSERT IGNORE INTO providers (id, user_id, name, category, service_name, description, price, rating, location, contact, image_url, is_active) VALUES
            ('prov1', 'provider1', 'Ranchi City Tours', 'guide', 'Complete Ranchi City Tour', 'Professional guided tours covering all major Ranchi attractions including Tagore Hill, Rock Garden, and Hundru Falls.', 2500.00, 4.8, 'Ranchi, Jharkhand, India', '+91 98765 11111', 'https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400', 1),
            ('prov2', 'provider1', 'Netarhat Hill Adventures', 'guide', 'Netarhat Trekking & Sunrise Tours', 'Experience the Queen of Chotanagpur with guided treks and sunrise point visits.', 2800.00, 4.9, 'Netarhat, Jharkhand, India', '+91 98765 44444', 'https://images.pexels.com/photos/261187/pexels-photo-261187.jpeg?auto=compress&cs=tinysrgb&w=400', 1),
            ('prov3', 'provider2', 'Betla Wildlife Safaris', 'activity', 'Jeep Safari & Wildlife Photography', 'Professional wildlife safari with expert naturalist guides and photography assistance.', 3500.00, 4.8, 'Latehar, Jharkhand, India', '+91 98765 66666', 'https://images.pexels.com/photos/1459399/pexels-photo-1459399.jpeg?auto=compress&cs=tinysrgb&w=400', 1),
            ('prov4', 'provider1', 'Parasnath Pilgrimage Services', 'guide', 'Jain Temple Tours & Trekking', 'Spiritual tours and trekking to Parasnath Hill Jain temples with religious significance explanations.', 2000.00, 4.7, 'Giridih, Jharkhand, India', '+91 98765 88888', 'https://images.pexels.com/photos/1795725/pexels-photo-1795725.jpeg?auto=compress&cs=tinysrgb&w=400', 1),
            ('prov5', 'provider2', 'Dimna Lake Water Sports', 'activity', 'Boating & Water Activities', 'Boating, kayaking and other water sports at beautiful Dimna Lake.', 1800.00, 4.5, 'Jamshedpur, Jharkhand, India', '+91 98765 10101', 'https://images.pexels.com/photos/1423370/pexels-photo-1423370.jpeg?auto=compress&cs=tinysrgb&w=400', 1);
            """
            await cursor.execute(providers_sql)
            print("   ✅ Providers inserted")
            
            print("✅ All sample data inserted successfully!")
        
        await connection.commit()
        connection.close()
        
    except Exception as e:
        print(f"❌ Data insertion failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(insert_sample_data())