#!/usr/bin/env python3
"""
🔍 COMPLETE BLOCKCHAIN IMPLEMENTATION VALIDATION SCRIPT
Tests Phases 1-6 of Jharkhand Tourism Blockchain Integration
✅ Phase 1: Dependencies & Setup
✅ Phase 2: Smart Contracts  
✅ Phase 3: Database Schema
✅ Phase 4: Backend Integration
✅ Phase 5: Frontend Components
✅ Phase 6: System Integration
"""

import os
import sys
import json
import time
import requests
import subprocess
from pathlib import Path
import importlib.util

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_status(status, message):
    if status == "PASS":
        print(f"{Colors.GREEN}✅ PASS{Colors.END}: {message}")
        return True
    elif status == "FAIL":
        print(f"{Colors.RED}❌ FAIL{Colors.END}: {message}")
        return False
    elif status == "WARN":
        print(f"{Colors.YELLOW}⚠️  WARN{Colors.END}: {message}")
        return True
    elif status == "INFO":
        print(f"{Colors.BLUE}ℹ️  INFO{Colors.END}: {message}")
        return True

def check_file_exists(filepath, description):
    """Check if a file exists"""
    if os.path.exists(filepath):
        return print_status("PASS", f"{description} exists: {filepath}")
    else:
        return print_status("FAIL", f"{description} missing: {filepath}")

def check_backend_dependency(package_name):
    """Check if Python package is installed"""
    try:
        __import__(package_name)
        return print_status("PASS", f"Backend dependency '{package_name}' installed")
    except ImportError:
        return print_status("FAIL", f"Backend dependency '{package_name}' missing")

def check_frontend_dependency(package_name, package_json_path):
    """Check if npm package is in package.json"""
    try:
        with open(package_json_path, 'r') as f:
            package_data = json.load(f)
        
        dependencies = package_data.get('dependencies', {})
        if package_name in dependencies:
            version = dependencies[package_name]
            return print_status("PASS", f"Frontend dependency '{package_name}@{version}' found")
        else:
            return print_status("FAIL", f"Frontend dependency '{package_name}' missing")
    except Exception as e:
        return print_status("FAIL", f"Error checking frontend dependencies: {str(e)}")

def test_blockchain_service():
    """Test blockchain service functionality"""
    try:
        sys.path.append('/jharkhand')
        from backend.services.blockchain_service import BlockchainService 
        
        service = BlockchainService()
        print_status("PASS", "Blockchain service initializes successfully")
        
        # Test Web3 connection
        is_connected = service.w3.is_connected()
        if is_connected:
            print_status("PASS", "Web3 connected to Sepolia network")
            
            # Test latest block
            try:
                latest_block = service.w3.eth.get_block('latest')
                print_status("PASS", f"Can fetch latest block: #{latest_block.number}")
            except Exception as e:
                print_status("FAIL", f"Cannot fetch latest block: {str(e)}")
                
        else:
            print_status("FAIL", "Web3 not connected to network")
        
        # Test account configuration
        if service.account:
            print_status("PASS", f"Wallet account configured: {service.account.address}")
            
            # Test balance
            try:
                balance = service.w3.eth.get_balance(service.account.address)
                balance_eth = service.w3.from_wei(balance, 'ether')
                if float(balance_eth) > 0:
                    print_status("PASS", f"Wallet has sufficient balance: {balance_eth} ETH")
                else:
                    print_status("WARN", f"Wallet has low balance: {balance_eth} ETH")
            except Exception as e:
                print_status("FAIL", f"Cannot check wallet balance: {str(e)}")
        else:
            print_status("FAIL", "No wallet account configured")
        
        # Test contract addresses
        contracts_configured = 0
        for name, address in service.contracts.items():
            if address:
                print_status("PASS", f"Contract '{name}' address configured: {address}")
                contracts_configured += 1
            else:
                print_status("FAIL", f"Contract '{name}' address missing")
        
        if contracts_configured == 4:
            print_status("PASS", "All 4 smart contract addresses configured")
        else:
            print_status("FAIL", f"Only {contracts_configured}/4 contract addresses configured")
            
        return is_connected and service.account and contracts_configured == 4
        
    except Exception as e:
        print_status("FAIL", f"Blockchain service error: {str(e)}")
        return False

def test_database_schema():
    """Test database schema for blockchain tables"""
    try:
        sys.path.append('/jharkhand/backend')
        import aiomysql
        from dotenv import load_dotenv
        
        load_dotenv('/jharkhand/backend/.env')
        
        # Database connection config
        config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 3001)),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD'),
            'db': os.getenv('DB_NAME', 'jharkhand_tourism')
        }
        
        print_status("INFO", f"Testing database connection to {config['host']}:{config['port']}")
        
        import pymysql
        connection = pymysql.connect(**config)
        cursor = connection.cursor()
        
        print_status("PASS", "Database connection successful")
        
        # Check blockchain tables
        blockchain_tables = [
            'user_wallets',
            'certificates', 
            'loyalty_points',
            'loyalty_transactions',
            'blockchain_bookings',
            'blockchain_reviews'
        ]
        
        tables_exist = 0
        cursor.execute("SHOW TABLES")
        existing_tables = [table[0] for table in cursor.fetchall()]
        
        for table in blockchain_tables:
            if table in existing_tables:
                print_status("PASS", f"Blockchain table '{table}' exists")
                tables_exist += 1
            else:
                print_status("WARN", f"Blockchain table '{table}' missing (may be optional)")
        
        # Check if bookings table has blockchain columns
        try:
            cursor.execute("DESCRIBE bookings")
            columns = [row[0] for row in cursor.fetchall()]
            blockchain_cols = ['blockchain_verified', 'blockchain_hash', 'certificate_eligible']
            for col in blockchain_cols:
                if col in columns:
                    print_status("PASS", f"Bookings table has blockchain column '{col}'")
                else:
                    print_status("WARN", f"Bookings table missing blockchain column '{col}'")
        except Exception as e:
            print_status("WARN", f"Could not check bookings table structure: {str(e)}")
        
        cursor.close()
        connection.close()
        
        return tables_exist >= 3  # At least half the blockchain tables should exist
        
    except Exception as e:
        print_status("FAIL", f"Database schema test error: {str(e)}")
        return False

def test_backend_apis():
    """Test backend blockchain API endpoints"""
    try:
        print_status("INFO", "Testing blockchain API endpoints...")
        
        # Backend URL configuration
        backend_url = 'http://localhost:8000'  # Updated to correct port
        
        # Test basic API connectivity
        try:
            response = requests.get(f'{backend_url}/api/', timeout=5)
            if response.status_code < 500:
                print_status("PASS", "Backend API is accessible")
            else:
                print_status("WARN", f"Backend API returned status {response.status_code}")
        except requests.exceptions.ConnectionError:
            print_status("FAIL", "Cannot connect to backend API on port 8000")
            return False
        except Exception as e:
            print_status("FAIL", f"Backend API connectivity error: {str(e)}")
            return False

        # Test blockchain status endpoint
        try:
            response = requests.get(f'{backend_url}/api/blockchain/status', timeout=10)
            if response.status_code == 200:
                data = response.json()
                print_status("PASS", f"Blockchain status API working: {data.get('network', 'unknown')} network")
                print_status("INFO", f"Connected: {data.get('connected', False)}")
                if data.get('contract_addresses'):
                    print_status("INFO", f"Contracts configured: {len(data['contract_addresses'])}")
            else:
                print_status("FAIL", f"Blockchain status API returned {response.status_code}")
                return False
        except Exception as e:
            print_status("FAIL", f"Blockchain status API error: {str(e)}")
            return False

        # Test blockchain endpoints (basic connectivity)
        blockchain_endpoints = {
            '/blockchain/wallet/status': 'GET',
            '/blockchain/certificates/my': 'GET', 
            '/blockchain/loyalty/balance': 'GET',
            '/blockchain/gas/estimate/mint_certificate': 'GET'
        }
        
        passed_endpoints = 0
        for endpoint, method in blockchain_endpoints.items():
            try:
                response = requests.get(f'{backend_url}/api{endpoint}', timeout=5)
                # 401 is expected for protected endpoints without auth
                if response.status_code in [200, 401, 422]:
                    print_status("PASS", f"Blockchain API endpoint accessible: {method} {endpoint}")
                    passed_endpoints += 1
                else:
                    print_status("WARN", f"Blockchain API endpoint returned {response.status_code}: {endpoint}")
            except Exception as e:
                print_status("WARN", f"Blockchain API endpoint test failed: {endpoint} - {str(e)}")

        return passed_endpoints >= 2  # At least half the endpoints should be accessible

    except Exception as e:
        print_status("FAIL", f"Backend API test error: {str(e)}")
        return False


def test_frontend_components():
    """Test frontend blockchain components"""
    try:
        print_status("INFO", "Testing frontend blockchain components...")
        
        # List of frontend blockchain components to check
        frontend_components = [
            '/jharkhand/frontend/src/components/WalletConnector.js',
            '/jharkhand/frontend/src/components/CertificateGallery.js',
            '/jharkhand/frontend/src/components/LoyaltyDashboard.js', 
            '/jharkhand/frontend/src/components/BlockchainBookingStatus.js',
            '/jharkhand/frontend/src/components/VerifiedReviewForm.js',
            '/jharkhand/frontend/src/components/BlockchainStatus.js'
        ]
        
        components_exist = 0
        for component in frontend_components:
            if check_file_exists(component, f"Frontend component"):
                components_exist += 1
        
        # Check frontend package.json for blockchain dependencies  
        package_json_path = '/jharkhand/frontend/package.json'
        blockchain_deps = ['ethers', '@metamask/sdk', 'react-qr-code']
        deps_found = 0
        
        for dep in blockchain_deps:
            if check_frontend_dependency(dep, package_json_path):
                deps_found += 1
        
        return (components_exist >= 4) and (deps_found >= 2)
        
    except Exception as e:
        print_status("FAIL", f"Frontend components test error: {str(e)}")
        return False


def test_system_integration():
    """Test Phase 6: System Integration"""
    try:
        print_status("INFO", "Testing system integration...")
        
        # Check if BookingsPage is integrated with blockchain
        bookings_page = '/jharkhand/frontend/src/pages/BookingsPage.js'
        booking_page = '/jharkhand/frontend/src/pages/BookingPage.js'
        
        integration_score = 0
        
        # Check BookingsPage integration
        if os.path.exists(bookings_page):
            with open(bookings_page, 'r') as f:
                content = f.read()
                if 'WalletConnector' in content and 'CertificateGallery' in content:
                    print_status("PASS", "BookingsPage has blockchain integration")
                    integration_score += 1
                else:
                    print_status("WARN", "BookingsPage missing some blockchain components")
        
        # Check BookingPage integration  
        if os.path.exists(booking_page):
            with open(booking_page, 'r') as f:
                content = f.read()
                if 'WalletConnector' in content or 'blockchain' in content.lower():
                    print_status("PASS", "BookingPage has blockchain integration")
                    integration_score += 1
                else:
                    print_status("WARN", "BookingPage missing blockchain integration")
        
        # Check backend loyalty endpoints
        try:
            backend_url = 'http://localhost:8000'
            response = requests.get(f'{backend_url}/api/', timeout=3)
            if response.status_code < 500:
                print_status("PASS", "Backend service available for integration testing")
                integration_score += 1
        except:
            print_status("WARN", "Backend service not available for integration testing")
        
        return integration_score >= 2
        
    except Exception as e:
        print_status("FAIL", f"System integration test error: {str(e)}")
        return False


def check_smart_contracts():
    """Check smart contract files exist and are properly structured"""
    try:
        contract_files = [
            ('/jharkhand/Contracts/TourismCertificates.sol', 'Tourism Certificates NFT'),
            ('/jharkhand/Contracts/LoyaltyRewards.sol', 'Loyalty Rewards Points'),
            ('/jharkhand/Contracts/BookingVerification.sol', 'Booking Verification'),
            ('/jharkhand/Contracts/AuthenticReviews.sol', 'Authentic Reviews')
        ]
        
        contracts_valid = 0
        for contract_path, contract_name in contract_files:
            if os.path.exists(contract_path):
                with open(contract_path, 'r') as f:
                    content = f.read()
                    # Check for basic Solidity structure
                    if 'pragma solidity' in content and 'contract' in content:
                        print_status("PASS", f"{contract_name} contract exists and valid")
                        contracts_valid += 1
                    else:
                        print_status("WARN", f"{contract_name} contract exists but may be incomplete")
            else:
                print_status("FAIL", f"{contract_name} contract missing: {contract_path}")
        
        return contracts_valid >= 3  # At least 3 out of 4 contracts should be valid
        
    except Exception as e:
        print_status("FAIL", f"Smart contracts check error: {str(e)}")
        return False


def main():
    """Main validation function"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}🔍 BLOCKCHAIN IMPLEMENTATION VALIDATION{Colors.END}")
    print("=" * 50)
    
    total_tests = 0
    passed_tests = 0
    
    # PHASE 1: DEPENDENCIES & SETUP
    print(f"\n{Colors.BOLD}📦 PHASE 1: DEPENDENCIES & SETUP{Colors.END}")
    print("-" * 35)
    
    phase1_tests = [
        # Backend dependencies
        lambda: check_backend_dependency('web3'),
        lambda: check_backend_dependency('eth_account'),
        
        # Frontend dependencies
        lambda: check_frontend_dependency('ethers', '/jharkhand/frontend/package.json'),
        lambda: check_frontend_dependency('@metamask/sdk', '/jharkhand/frontend/package.json'),
        lambda: check_frontend_dependency('react-qr-code', '/jharkhand/frontend/package.json'),
        
        # Environment configuration
        lambda: check_file_exists('/jharkhand/backend/.env', 'Backend environment file'),
    ]
    
    for test in phase1_tests:
        total_tests += 1
        if test():
            passed_tests += 1
    
    # PHASE 2: SMART CONTRACTS
    print(f"\n{Colors.BOLD}📋 PHASE 2: SMART CONTRACTS{Colors.END}")
    print("-" * 30)
    
    total_tests += 1
    if check_smart_contracts():
        passed_tests += 1
    
    # PHASE 3: DATABASE SCHEMA  
    print(f"\n{Colors.BOLD}🗄️ PHASE 3: DATABASE SCHEMA{Colors.END}")
    print("-" * 30)
    
    total_tests += 1
    if test_database_schema():
        passed_tests += 1
    
    # PHASE 4: BACKEND INTEGRATION
    print(f"\n{Colors.BOLD}🔧 PHASE 4: BACKEND INTEGRATION{Colors.END}")
    print("-" * 35)
    
    # Test blockchain service
    total_tests += 1
    if test_blockchain_service():
        passed_tests += 1
    
    # Test backend APIs
    total_tests += 1  
    if test_backend_apis():
        passed_tests += 1
    
    # PHASE 5: FRONTEND COMPONENTS
    print(f"\n{Colors.BOLD}🎨 PHASE 5: FRONTEND COMPONENTS{Colors.END}")
    print("-" * 35)
    
    total_tests += 1
    if test_frontend_components():
        passed_tests += 1
    
    # PHASE 6: SYSTEM INTEGRATION
    print(f"\n{Colors.BOLD}🔗 PHASE 6: SYSTEM INTEGRATION{Colors.END}")
    print("-" * 35)
    
    total_tests += 1
    if test_system_integration():
        passed_tests += 1
    
    # FINAL REPORT
    print(f"\n{Colors.BOLD}📊 VALIDATION SUMMARY{Colors.END}")
    print("=" * 25)
    
    percentage = (passed_tests / total_tests) * 100
    
    if percentage >= 90:
        status_color = Colors.GREEN
        status_text = "EXCELLENT"
    elif percentage >= 75:
        status_color = Colors.YELLOW  
        status_text = "GOOD"
    else:
        status_color = Colors.RED
        status_text = "NEEDS WORK"
    
    print(f"Tests Passed: {status_color}{passed_tests}/{total_tests} ({percentage:.1f}%){Colors.END}")
    print(f"Overall Status: {status_color}{status_text}{Colors.END}")
    
    if percentage >= 90:
        print(f"\n{Colors.GREEN}🎉 Blockchain implementation (Phases 1-6) is COMPLETE and ready for Phase 7 (Testing)!{Colors.END}")
        print(f"{Colors.GREEN}✅ Ready to proceed with comprehensive testing and deployment{Colors.END}")
    elif percentage >= 75:
        print(f"\n{Colors.YELLOW}⚠️ Most blockchain components working, but some issues need fixing before Phase 7.{Colors.END}")
        print(f"{Colors.YELLOW}📋 Review failed tests and address issues before comprehensive testing{Colors.END}")
    else:
        print(f"\n{Colors.RED}❌ Significant blockchain issues found. Please address failures before proceeding.{Colors.END}")
        print(f"{Colors.RED}🔧 Focus on fixing backend integration and database connectivity first{Colors.END}")
    
    # Phase recommendations
    if percentage >= 90:
        print(f"\n{Colors.BOLD}🚀 NEXT STEPS:{Colors.END}")
        print(f"{Colors.GREEN}1. Phase 7: Run comprehensive testing with testing agents{Colors.END}")
        print(f"{Colors.GREEN}2. Phase 8: Deploy to production environment{Colors.END}")
        print(f"{Colors.GREEN}3. User acceptance testing with MetaMask wallet{Colors.END}")
    elif percentage >= 75:
        print(f"\n{Colors.BOLD}🔧 FOCUS AREAS:{Colors.END}")
        print(f"{Colors.YELLOW}1. Fix any failed backend API endpoints{Colors.END}")
        print(f"{Colors.YELLOW}2. Verify smart contract deployments{Colors.END}")
        print(f"{Colors.YELLOW}3. Test frontend component integrations{Colors.END}")
    else:
        print(f"\n{Colors.BOLD}⚠️ CRITICAL FIXES NEEDED:{Colors.END}")
        print(f"{Colors.RED}1. Database connectivity and schema{Colors.END}")
        print(f"{Colors.RED}2. Backend service configuration{Colors.END}")
        print(f"{Colors.RED}3. Environment variables and dependencies{Colors.END}")
    
    return percentage >= 75

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)