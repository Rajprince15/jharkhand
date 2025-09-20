#!/usr/bin/env python3
"""
Apply blockchain schema to the database
"""
import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

def apply_blockchain_schema():
    # Database connection
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': int(os.getenv('DB_PORT', '3001')),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'Prince1504'),
        'database': os.getenv('DB_NAME', 'jharkhand_tourism')
    }
    
    try:
        # Connect to database
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()
        
        # Read blockchain schema
        with open('/jharkhand/backend/database/blockchain_schema.sql', 'r') as file:
            schema_sql = file.read()
        
        # Split by statements and execute
        statements = [stmt.strip() for stmt in schema_sql.split(';') if stmt.strip()]
        
        for statement in statements:
            if statement.upper().startswith(('CREATE', 'ALTER', 'INSERT', 'COMMIT')):
                try:
                    cursor.execute(statement)
                    print(f"✅ Executed: {statement[:50]}...")
                except mysql.connector.Error as e:
                    if "already exists" in str(e) or "Duplicate column" in str(e):
                        print(f"⚠️  Skipped (already exists): {statement[:50]}...")
                    else:
                        print(f"❌ Error: {e}")
                        print(f"Statement: {statement[:100]}...")
        
        # Commit changes
        connection.commit()
        print("\n✅ Blockchain schema applied successfully!")
        
        # Verify tables created
        cursor.execute("SHOW TABLES")
        all_tables = cursor.fetchall()
        blockchain_tables = [table for table in all_tables if any(keyword in table[0] for keyword in ['wallet', 'certificate', 'loyalty', 'blockchain'])]
        
        print(f"\n📋 Blockchain tables found: {len(blockchain_tables)}")
        for table in blockchain_tables:
            print(f"  - {table[0]}")
            
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'connection' in locals() and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    apply_blockchain_schema()