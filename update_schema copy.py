#!/usr/bin/env python3
import asyncio
import aiomysql
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3001)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', 'Prince1504'),
    'db': os.getenv('DB_NAME', 'jharkhand_tourism'),
    'autocommit': True
}

async def update_schema():
    try:
        # Create connection pool
        pool = await aiomysql.create_pool(**DB_CONFIG)
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                # Check if wishlist table exists
                await cur.execute("SHOW TABLES LIKE 'wishlist'")
                result = await cur.fetchone()
                
                if not result:
                    print("Creating wishlist table...")
                    # Create wishlist table
                    await cur.execute("""
                        CREATE TABLE wishlist (
                            id VARCHAR(255) PRIMARY KEY,
                            user_id VARCHAR(255) NOT NULL,
                            destination_id VARCHAR(255) NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
                            UNIQUE KEY unique_user_destination (user_id, destination_id)
                        )
                    """)
                    
                    # Create indexes
                    await cur.execute("CREATE INDEX idx_wishlist_user_id ON wishlist(user_id)")
                    await cur.execute("CREATE INDEX idx_wishlist_destination_id ON wishlist(destination_id)")
                    
                    # Add sample wishlist items
                    await cur.execute("""
                        INSERT INTO wishlist (id, user_id, destination_id) VALUES
                        ('wl1', 'user1', '2'),
                        ('wl2', 'user1', '4'),
                        ('wl3', 'user2', '3'),
                        ('wl4', 'user2', '5')
                        ON DUPLICATE KEY UPDATE id=id
                    """)
                    
                    print("Wishlist table created successfully!")
                else:
                    print("Wishlist table already exists.")
                
                # Verify the table was created
                await cur.execute("SELECT COUNT(*) FROM wishlist")
                count = await cur.fetchone()
                print(f"Wishlist table has {count[0]} records.")
                
        pool.close()
        await pool.wait_closed()
        print("Database schema update completed!")
        
    except Exception as e:
        print(f"Error updating schema: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(update_schema())