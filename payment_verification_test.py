#!/usr/bin/env python3
import asyncio
import aiomysql
import os
from pathlib import Path

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 3001,
    'user': 'root',
    'password': 'Prince1504',
    'db': 'jharkhand_tourism',
    'autocommit': True
}

async def setup_payment_schema():
    """Setup payment schema and tables"""
    try:
        # Read the SQL schema file
        schema_file = Path(__file__).parent / 'database' / 'payment_schema.sql'
        with open(schema_file, 'r') as f:
            schema_sql = f.read()
        
        # Split into individual statements
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
        
        # Connect to database
        conn = await aiomysql.connect(**DB_CONFIG)
        
        print("🔗 Connected to database")
        
        async with conn.cursor() as cur:
            for i, statement in enumerate(statements, 1):
                try:
                    if statement:
                        print(f"📝 Executing statement {i}: {statement[:50]}...")
                        await cur.execute(statement)
                        print(f"✅ Statement {i} executed successfully")
                except Exception as e:
                    if "already exists" in str(e) or "Duplicate column" in str(e):
                        print(f"⚠️  Statement {i} skipped (already exists): {str(e)}")
                    else:
                        print(f"❌ Error in statement {i}: {str(e)}")
                        # Continue with other statements
        
            # Verify tables created
            await cur.execute("SHOW TABLES LIKE 'payments'")
            if await cur.fetchone():
                print("✅ Payments table created successfully")
            
            await cur.execute("SHOW TABLES LIKE 'payment_logs'")
            if await cur.fetchone():
                print("✅ Payment logs table created successfully")
            
            # Check if new columns were added to bookings table
            await cur.execute("DESCRIBE bookings")
            columns = await cur.fetchall()
            column_names = [col[0] for col in columns]
            
            if 'payment_status' in column_names:
                print("✅ Payment status column added to bookings table")
            if 'payment_amount' in column_names:
                print("✅ Payment amount column added to bookings table")
            if 'payment_deadline' in column_names:
                print("✅ Payment deadline column added to bookings table")
        
        print("\n🎉 Payment schema setup completed successfully!")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error setting up payment schema: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(setup_payment_schema())