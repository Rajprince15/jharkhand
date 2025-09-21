#!/usr/bin/env python3
"""
Comprehensive Blockchain Implementation Validation Script
Tests Phases 1-4 of Jharkhand Tourism Blockchain Integration
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
            'blockchain_bookings',
            'blockchain_reviews', 
            'certificates',
            'user_wallets'
        ]
        
        tables_exist = 0
        cursor.execute("SHOW TABLES")
        existing_tables = [table[0] for table in cursor.fetchall()]
        
        for table in blockchain_tables:
            if table in existing_tables:
                print_status("PASS", f"Blockchain table '{table}' exists")
                tables_exist += 1
            else:
                print_status("FAIL", f"Blockchain table '{table}' missing")
        
        cursor.close()
        connection.close()
        
        return tables_exist >= 3  # At least 3 out of 4 tables should exist
        
    except Exception as e:
        print_status("FAIL", f"Database schema test error: {str(e)}")
        return False

def test_backend_apis():
    """Test backend API endpoints on Windows without sudo/supervisorctl"""
    try:
        import platform
        is_windows = platform.system() == "Windows"
        
        print_status("INFO", "Checking if backend service is running...")
        backend_running = False

        # Try connecting first
        try:
            response = requests.get('http://localhost:8000/api/', timeout=5)
            if response.status_code < 500:
                backend_running = True
        except:
            backend_running = False

        # If backend not running, start it
        if not backend_running:
            print_status("WARN", "Backend not running, attempting to start...")
            if is_windows:
                # Windows: use subprocess.Popen
                backend_process = subprocess.Popen(
                    ['python', 'backend/main.py'],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                print_status("INFO", "Waiting 5 seconds for backend to start...")
                time.sleep(5)
            else:
                # Linux: original supervisorctl approach
                subprocess.run(['sudo', 'supervisorctl', 'restart', 'backend'])
                time.sleep(5)

        # Test basic API connectivity
        try:
            response = requests.get('http://localhost:8000/api/', timeout=5)
            print_status("PASS", "Backend API is accessible")
        except requests.exceptions.ConnectionError:
            print_status("FAIL", "Cannot connect to backend API on port 8000")
            return False
        except Exception as e:
            print_status("FAIL", f"Backend API connectivity error: {str(e)}")
            return False

        # Test blockchain status endpoint
        try:
            response = requests.get('http://localhost:8000/api/blockchain/status', timeout=10)
            if response.status_code == 200:
                data = response.json()
                print_status("PASS", f"Blockchain status API working: {data.get('network', 'unknown')} network")
            else:
                print_status("FAIL", f"Blockchain status API returned {response.status_code}")
                return False
        except Exception as e:
            print_status("FAIL", f"Blockchain status API error: {str(e)}")
            return False

        # Test other blockchain endpoints (basic connectivity)
        blockchain_endpoints = ['/blockchain/gas/estimate/mint']
        for endpoint in blockchain_endpoints:
            try:
                response = requests.get(f'http://localhost:8000/api{endpoint}', timeout=5)
                if response.status_code in [200, 422, 401]:
                    print_status("PASS", f"Blockchain API endpoint accessible: {endpoint}")
                else:
                    print_status("FAIL", f"Blockchain API endpoint error {response.status_code}: {endpoint}")
            except Exception as e:
                print_status("WARN", f"Blockchain API endpoint test failed: {endpoint} - {str(e)}")

        return True

    except Exception as e:
        print_status("FAIL", f"Backend API test error: {str(e)}")
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
    
    tests = [
        # Backend dependencies
        lambda: check_backend_dependency('web3'),
        lambda: check_backend_dependency('eth_account'),
        lambda: check_backend_dependency('cytoolz'),
        
        # Frontend dependencies
        lambda: check_frontend_dependency('ethers', '/jharkhand/frontend/package.json'),
        lambda: check_frontend_dependency('@metamask/sdk', '/jharkhand/frontend/package.json'),
        lambda: check_frontend_dependency('react-qr-code', '/jharkhand/frontend/package.json'),
        
        # Environment configuration
        lambda: check_file_exists('/jharkhand/backend/.env', 'Backend environment file'),
    ]
    
    for test in tests:
        total_tests += 1
        if test():
            passed_tests += 1
    
    # PHASE 2: SMART CONTRACTS
    print(f"\n{Colors.BOLD}📋 PHASE 2: SMART CONTRACTS{Colors.END}")
    print("-" * 30)
    
    contracts = [
        '/jharkhand/Contracts/TourismCertificates.sol',
        '/jharkhand/Contracts/LoyaltyRewards.sol', 
        '/jharkhand/Contracts/BookingVerification.sol',
        '/jharkhand/Contracts/AuthenticReviews.sol'
    ]
    
    for contract in contracts:
        total_tests += 1
        if check_file_exists(contract, f"Smart contract"):
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
        print(f"\n{Colors.GREEN}🎉 Blockchain implementation is ready for Phase 5 (Frontend Integration)!{Colors.END}")
    elif percentage >= 75:
        print(f"\n{Colors.YELLOW}⚠️ Most components working, but some issues need fixing before Phase 5.{Colors.END}")
    else:
        print(f"\n{Colors.RED}❌ Significant issues found. Please address failures before proceeding.{Colors.END}")
    
    return percentage >= 75

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)