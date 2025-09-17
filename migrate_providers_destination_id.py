#!/usr/bin/env python3
"""
Migration script to add destination_id column to providers table
and populate it based on location matching
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

async def migrate_database():
    """Add destination_id column and populate it"""
    try:
        # Create connection
        connection = await aiomysql.connect(**DB_CONFIG)
        
        async with connection.cursor(aiomysql.DictCursor) as cursor:
            print("🔄 Starting migration...")
            
            # Check if destination_id column already exists
            await cursor.execute("""
                SELECT COUNT(*) as count 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'jharkhand_tourism' 
                AND TABLE_NAME = 'providers' 
                AND COLUMN_NAME = 'destination_id'
            """)
            result = await cursor.fetchone()
            
            if result['count'] > 0:
                print("✅ destination_id column already exists")
            else:
                print("📝 Adding destination_id column to providers table...")
                await cursor.execute("ALTER TABLE providers ADD COLUMN destination_id VARCHAR(255) NULL")
                await cursor.execute("ALTER TABLE providers ADD KEY idx_providers_destination_id (destination_id)")
                await cursor.execute("""
                    ALTER TABLE providers 
                    ADD CONSTRAINT fk_providers_destination 
                    FOREIGN KEY (destination_id) REFERENCES destinations(id) 
                    ON DELETE SET NULL
                """)
                print("✅ destination_id column added successfully")
            
            # Get all destinations for mapping
            await cursor.execute("SELECT id, name, location FROM destinations")
            destinations = await cursor.fetchall()
            
            # Get all providers without destination_id
            await cursor.execute("SELECT id, location FROM providers WHERE destination_id IS NULL")
            providers = await cursor.fetchall()
            
            print(f"📋 Found {len(providers)} providers to update")
            print(f"📋 Available destinations: {len(destinations)}")
            
            updated_count = 0
            for provider in providers:
                provider_location = provider['location'].lower().strip()
                best_match = None
                
                # Try to find the best matching destination
                for dest in destinations:
                    dest_name = dest['name'].lower().strip()
                    dest_location = dest['location'].lower().strip()
                    
                    # Check if provider location contains destination name or location
                    if (dest_name in provider_location or 
                        provider_location in dest_location or
                        dest_location.startswith(provider_location) or
                        provider_location.startswith(dest_name)):
                        best_match = dest['id']
                        print(f"   🔗 Mapping '{provider['location']}' -> '{dest['name']}' ({dest['location']})")
                        break
                
                if best_match:
                    await cursor.execute("""
                        UPDATE providers 
                        SET destination_id = %s 
                        WHERE id = %s
                    """, (best_match, provider['id']))
                    updated_count += 1
                else:
                    print(f"   ⚠️  No match found for provider location: {provider['location']}")
            
            print(f"✅ Migration completed! Updated {updated_count} providers")
            
            # Show final stats
            await cursor.execute("""
                SELECT 
                    COUNT(*) as total_providers,
                    COUNT(destination_id) as providers_with_destination,
                    COUNT(*) - COUNT(destination_id) as providers_without_destination
                FROM providers
            """)
            stats = await cursor.fetchone()
            
            print(f"📊 Final stats:")
            print(f"   Total providers: {stats['total_providers']}")
            print(f"   With destination_id: {stats['providers_with_destination']}")
            print(f"   Without destination_id: {stats['providers_without_destination']}")
        
        await connection.commit()
        connection.close()
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(migrate_database())