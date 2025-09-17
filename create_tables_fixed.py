#!/usr/bin/env python3
"""
Create tables with correct collation for MariaDB
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

CREATE_TABLES_SQL = [
    """
    CREATE TABLE IF NOT EXISTS users (
      id varchar(255) NOT NULL,
      name varchar(255) NOT NULL,
      email varchar(255) NOT NULL,
      password varchar(255) NOT NULL,
      role enum('tourist','provider','admin') DEFAULT 'tourist',
      phone varchar(20) DEFAULT NULL,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS destinations (
      id varchar(255) NOT NULL,
      name varchar(255) NOT NULL,
      location varchar(255) NOT NULL,
      description text,
      image_url varchar(500) DEFAULT NULL,
      rating decimal(2,1) DEFAULT '0.0',
      price decimal(10,2) NOT NULL,
      category varchar(100) DEFAULT NULL,
      highlights json DEFAULT NULL,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      region varchar(50) DEFAULT NULL,
      PRIMARY KEY (id),
      KEY idx_destinations_category (category),
      KEY idx_destinations_rating (rating),
      KEY idx_destinations_price (price),
      KEY idx_destinations_region (region)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS providers (
      id varchar(255) NOT NULL,
      user_id varchar(255) DEFAULT NULL,
      name varchar(255) NOT NULL,
      category enum('guide','transport','accommodation','activity') NOT NULL,
      service_name varchar(255) NOT NULL,
      description text,
      price decimal(10,2) NOT NULL,
      rating decimal(2,1) DEFAULT '4.5',
      location varchar(255) NOT NULL,
      contact varchar(20) NOT NULL,
      image_url varchar(500) DEFAULT NULL,
      is_active tinyint(1) DEFAULT '1',
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY user_id (user_id),
      KEY idx_providers_category (category),
      KEY idx_providers_location (location),
      KEY idx_providers_rating (rating),
      CONSTRAINT providers_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS regions (
      id varchar(255) NOT NULL,
      name varchar(255) NOT NULL,
      description text,
      image_url varchar(500) DEFAULT NULL,
      highlights text,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS bookings (
      id varchar(255) NOT NULL,
      user_id varchar(255) DEFAULT NULL,
      provider_id varchar(255) DEFAULT NULL,
      destination_id varchar(255) DEFAULT NULL,
      user_name varchar(255) NOT NULL,
      provider_name varchar(255) NOT NULL,
      destination_name varchar(255) NOT NULL,
      booking_date date NOT NULL,
      check_in date DEFAULT NULL,
      check_out date DEFAULT NULL,
      guests int DEFAULT '1',
      rooms int DEFAULT '1',
      status enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
      total_price decimal(10,2) NOT NULL,
      special_requests text,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      package_type varchar(50) DEFAULT NULL,
      package_name varchar(100) DEFAULT NULL,
      addons text,
      booking_full_name varchar(255) DEFAULT NULL,
      booking_email varchar(255) DEFAULT NULL,
      booking_phone varchar(20) DEFAULT NULL,
      city_origin varchar(100) DEFAULT NULL,
      reference_number varchar(20) DEFAULT NULL,
      PRIMARY KEY (id),
      KEY provider_id (provider_id),
      KEY destination_id (destination_id),
      KEY idx_bookings_status (status),
      KEY idx_bookings_user_id (user_id),
      KEY idx_bookings_date (booking_date),
      KEY idx_booking_email (booking_email),
      KEY idx_booking_phone (booking_phone),
      KEY idx_reference_number (reference_number),
      CONSTRAINT bookings_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      CONSTRAINT bookings_ibfk_2 FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE CASCADE,
      CONSTRAINT bookings_ibfk_3 FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS reviews (
      id varchar(255) NOT NULL,
      user_id varchar(255) DEFAULT NULL,
      destination_id varchar(255) DEFAULT NULL,
      provider_id varchar(255) DEFAULT NULL,
      rating int DEFAULT NULL,
      comment text,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY user_id (user_id),
      KEY destination_id (destination_id),
      KEY provider_id (provider_id),
      CONSTRAINT reviews_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      CONSTRAINT reviews_ibfk_2 FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE,
      CONSTRAINT reviews_ibfk_3 FOREIGN KEY (provider_id) REFERENCES providers (id) ON DELETE CASCADE,
      CONSTRAINT reviews_chk_1 CHECK ((rating >= 1) and (rating <= 5))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS itineraries (
      id varchar(255) NOT NULL,
      user_id varchar(255) DEFAULT NULL,
      destination varchar(255) NOT NULL,
      days int NOT NULL,
      budget decimal(10,2) NOT NULL,
      content text,
      preferences json DEFAULT NULL,
      generated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      interests json DEFAULT NULL,
      travel_style varchar(100) DEFAULT NULL,
      group_size int DEFAULT '1',
      schedule json DEFAULT NULL,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY user_id (user_id),
      CONSTRAINT itineraries_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS wishlist (
      id varchar(255) NOT NULL,
      user_id varchar(255) NOT NULL,
      destination_id varchar(255) NOT NULL,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY unique_user_destination (user_id,destination_id),
      KEY idx_wishlist_user_id (user_id),
      KEY idx_wishlist_destination_id (destination_id),
      CONSTRAINT wishlist_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      CONSTRAINT wishlist_ibfk_2 FOREIGN KEY (destination_id) REFERENCES destinations (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """,
    """
    CREATE TABLE IF NOT EXISTS chat_logs (
      id varchar(255) NOT NULL,
      user_id varchar(255) DEFAULT NULL,
      session_id varchar(255) DEFAULT NULL,
      message text NOT NULL,
      response text NOT NULL,
      created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_chat_logs_user_session (user_id,session_id),
      KEY idx_chat_logs_created (created_at),
      CONSTRAINT chat_logs_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
]

async def create_tables():
    """Create database tables with correct collation"""
    try:
        connection = await aiomysql.connect(**DB_CONFIG)
        
        async with connection.cursor() as cursor:
            print("🔄 Creating database tables...")
            
            for i, sql in enumerate(CREATE_TABLES_SQL, 1):
                table_name = sql.split('CREATE TABLE IF NOT EXISTS ')[1].split(' (')[0].strip('`')
                print(f"   {i}. Creating table: {table_name}")
                await cursor.execute(sql)
            
            print("✅ All tables created successfully!")
        
        await connection.commit()
        connection.close()
        
    except Exception as e:
        print(f"❌ Table creation failed: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(create_tables())