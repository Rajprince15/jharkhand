#!/usr/bin/env python3
"""
Artisan Backend Testing Script
Run this script to test all artisan marketplace endpoints
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"

def test_artisan_registration():
    """Test artisan user registration"""
    print("\n🔐 Testing Artisan Registration...")
    
    url = f"{BASE_URL}/auth/register"
    data = {
        "name": "Test Artisan",
        "email": "test.artisan@example.com",
        "password": "password123",
        "phone": "+91-9876543210",
        "role": "artisan"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Registration successful!")
            print(f"User ID: {result['user']['id']}")
            print(f"Role: {result['user']['role']}")
            return result['access_token']
        else:
            print(f"❌ Registration failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error during registration: {str(e)}")
        return None

def test_artisan_login():
    """Test artisan login"""
    print("\n🔐 Testing Artisan Login...")
    
    url = f"{BASE_URL}/auth/login"
    data = {
        "email": "test.artisan@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Login successful!")
            print(f"Token received: {result['access_token'][:50]}...")
            return result['access_token']
        else:
            print(f"❌ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error during login: {str(e)}")
        return None

def test_artisan_dashboard(token):
    """Test artisan dashboard endpoint"""
    print("\n📊 Testing Artisan Dashboard...")
    
    url = f"{BASE_URL}/artisans/dashboard"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Dashboard loaded successfully!")
            print(f"Handicrafts Stats: {result['data']['handicrafts_stats']}")
            print(f"Events Stats: {result['data']['events_stats']}")
            print(f"Orders Stats: {result['data']['orders_stats']}")
            return True
        else:
            print(f"❌ Dashboard failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error loading dashboard: {str(e)}")
        return False

def test_create_handicraft(token):
    """Test handicraft creation"""
    print("\n🎨 Testing Handicraft Creation...")
    
    url = f"{BASE_URL}/artisans/handicrafts"
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": "Traditional Pottery Vase",
        "category": "pottery",
        "description": "Handmade clay vase with traditional tribal patterns from Jharkhand",
        "price": 1500.00,
        "discount_price": 1200.00,
        "stock_quantity": 10,
        "materials": "Clay, Natural pigments",
        "dimensions": "Height: 25cm, Diameter: 15cm",
        "weight": 2.5,
        "origin_village": "Ranchi",
        "cultural_significance": "Traditional tribal art form passed down through generations",
        "care_instructions": "Clean with dry cloth, avoid water",
        "tags": ["tribal", "pottery", "handicraft", "traditional"],
        "is_featured": False
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Handicraft created successfully!")
            print(f"Handicraft ID: {result['data']['handicraft_id']}")
            return result['data']['handicraft_id']
        else:
            print(f"❌ Handicraft creation failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error creating handicraft: {str(e)}")
        return None

def test_get_handicrafts(token):
    """Test getting artisan's handicrafts"""
    print("\n📦 Testing Get Handicrafts...")
    
    url = f"{BASE_URL}/artisans/handicrafts"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Handicrafts loaded successfully!")
            print(f"Total items: {result['data']['total']}")
            print(f"Items on this page: {len(result['data']['items'])}")
            
            if result['data']['items']:
                item = result['data']['items'][0]
                print(f"First item: {item['name']} - ₹{item['price']}")
            
            return True
        else:
            print(f"❌ Get handicrafts failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error getting handicrafts: {str(e)}")
        return False

def test_marketplace_handicrafts():
    """Test public marketplace endpoint (no auth required)"""
    print("\n🛒 Testing Public Marketplace...")
    
    url = f"{BASE_URL}/marketplace/handicrafts"
    params = {"limit": 5, "category": "pottery"}
    
    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Marketplace loaded successfully!")
            print(f"Total items available: {result['data']['total']}")
            print(f"Items shown: {len(result['data']['items'])}")
            
            for item in result['data']['items']:
                print(f"- {item['name']} by {item['artisan_name']} - ₹{item['price']}")
            
            return True
        else:
            print(f"❌ Marketplace failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error loading marketplace: {str(e)}")
        return False

def test_server_running():
    """Test if server is running"""
    print("🚀 Testing Server Connection...")
    
    try:
        response = requests.get("http://localhost:8001/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Server is running!")
            return True
        else:
            print(f"❌ Server responded with: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Server connection failed: {str(e)}")
        print("Make sure the server is running on port 8001")
        return False

def main():
    """Run all tests"""
    print("🧪 ARTISAN BACKEND TESTING")
    print("=" * 50)
    
    # Test server connection
    if not test_server_running():
        print("\n❌ Cannot connect to server. Please start the backend server first:")
        print("cd /jharkhand/backend")
        print("python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload")
        sys.exit(1)
    
    # Test registration (try both registration and login)
    token = test_artisan_registration()
    if not token:
        # If registration fails (user might already exist), try login
        token = test_artisan_login()
        if not token:
            print("\n❌ Cannot get authentication token. Stopping tests.")
            sys.exit(1)
    
    # Test authenticated endpoints
    dashboard_success = test_artisan_dashboard(token)
    
    # Test handicraft operations
    handicraft_id = test_create_handicraft(token)
    handicrafts_success = test_get_handicrafts(token)
    
    # Test public marketplace
    marketplace_success = test_marketplace_handicrafts()
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    tests = [
        ("Server Connection", True),  # Already confirmed above
        ("Authentication", bool(token)),
        ("Artisan Dashboard", dashboard_success),
        ("Handicraft Creation", bool(handicraft_id)),
        ("Get Handicrafts", handicrafts_success),
        ("Public Marketplace", marketplace_success)
    ]
    
    passed = sum(1 for _, success in tests if success)
    total = len(tests)
    
    for test_name, success in tests:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name:<20} {status}")
    
    print(f"\n🎯 Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Artisan backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
    
    return passed == total

if __name__ == "__main__":
    main()