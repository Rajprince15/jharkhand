import os
import json
import uuid
import hashlib
import asyncio
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from decimal import Decimal

from web3 import Web3
from web3.exceptions import TransactionNotFound, ContractLogicError
from eth_account import Account
from hexbytes import HexBytes
from dotenv import load_dotenv

load_dotenv()

class BlockchainEventMonitor:
    """Real-time blockchain event monitoring for data synchronization"""
    
    def __init__(self, blockchain_service, db_pool):
        self.blockchain_service = blockchain_service
        self.db_pool = db_pool
        self.w3 = blockchain_service.w3
        self.running = False
        
    async def start_monitoring(self):
        """Start monitoring blockchain events"""
        self.running = True
        await asyncio.gather(
            self.monitor_certificate_events(),
            self.monitor_loyalty_events(),
            self.monitor_booking_events()
        )
    
    async def stop_monitoring(self):
        """Stop monitoring blockchain events"""
        self.running = False
    
    async def monitor_certificate_events(self):
        """Monitor certificate minting events"""
        try:
            contract = self.w3.eth.contract(
                address=self.blockchain_service.contracts['certificates'],
                abi=self.blockchain_service.contract_abis['certificates']
            )
            
            # Create event filter for CertificateIssued events
            event_filter = contract.events.CertificateIssued.createFilter(fromBlock='latest')
            
            while self.running:
                try:
                    for event in event_filter.get_new_entries():
                        await self.handle_certificate_event(event)
                    await asyncio.sleep(10)  # Check every 10 seconds
                except Exception as e:
                    print(f"Error in certificate monitoring: {e}")
                    await asyncio.sleep(30)  # Wait longer on error
                    
        except Exception as e:
            print(f"Error setting up certificate monitoring: {e}")
    
    async def handle_certificate_event(self, event):
        """Handle certificate minting event"""
        try:
            token_id = event['args']['tokenId']
            tourist_address = event['args']['tourist']
            destination = event['args']['destination']
            tx_hash = event['transactionHash'].hex()
            
            # Update database
            # Note: In real implementation, this would use the actual database connection
            print(f"✅ Certificate minted: TokenID={token_id}, Tourist={tourist_address}, Destination={destination}")
            
        except Exception as e:
            print(f"Error handling certificate event: {e}")
    
    async def monitor_loyalty_events(self):
        """Monitor loyalty point events"""
        try:
            contract = self.w3.eth.contract(
                address=self.blockchain_service.contracts['loyalty'],
                abi=self.blockchain_service.contract_abis['loyalty']
            )
            
            # Monitor both PointsEarned and PointsRedeemed events
            earned_filter = contract.events.PointsEarned.createFilter(fromBlock='latest')
            redeemed_filter = contract.events.PointsRedeemed.createFilter(fromBlock='latest')
            
            while self.running:
                try:
                    for event in earned_filter.get_new_entries():
                        await self.handle_loyalty_event(event, 'earned')
                    for event in redeemed_filter.get_new_entries():
                        await self.handle_loyalty_event(event, 'redeemed')
                    await asyncio.sleep(10)
                except Exception as e:
                    print(f"Error in loyalty monitoring: {e}")
                    await asyncio.sleep(30)
                    
        except Exception as e:
            print(f"Error setting up loyalty monitoring: {e}")
    
    async def handle_loyalty_event(self, event, event_type):
        """Handle loyalty point events"""
        try:
            user_address = event['args']['user']
            amount = event['args']['amount']
            description = event['args']['description']
            tx_hash = event['transactionHash'].hex()
            
            print(f"✅ Loyalty {event_type}: User={user_address}, Amount={amount}, Description={description}")
            
        except Exception as e:
            print(f"Error handling loyalty event: {e}")
    
    async def monitor_booking_events(self):
        """Monitor booking verification events"""
        try:
            contract = self.w3.eth.contract(
                address=self.blockchain_service.contracts['booking'],
                abi=self.blockchain_service.contract_abis['booking']
            )
            
            # Monitor BookingCreated and BookingVerified events
            created_filter = contract.events.BookingCreated.createFilter(fromBlock='latest')
            verified_filter = contract.events.BookingVerified.createFilter(fromBlock='latest')
            
            while self.running:
                try:
                    for event in created_filter.get_new_entries():
                        await self.handle_booking_event(event, 'created')
                    for event in verified_filter.get_new_entries():
                        await self.handle_booking_event(event, 'verified')
                    await asyncio.sleep(10)
                except Exception as e:
                    print(f"Error in booking monitoring: {e}")
                    await asyncio.sleep(30)
                    
        except Exception as e:
            print(f"Error setting up booking monitoring: {e}")
    
    async def handle_booking_event(self, event, event_type):
        """Handle booking verification events"""
        try:
            booking_hash = event['args']['bookingHash'].hex()
            tourist = event['args']['tourist']
            provider = event['args']['provider']
            tx_hash = event['transactionHash'].hex()
            
            print(f"✅ Booking {event_type}: Hash={booking_hash}, Tourist={tourist}, Provider={provider}")
            
        except Exception as e:
            print(f"Error handling booking event: {e}")

class BlockchainService:
    def __init__(self):
        self.network = os.getenv('ETHEREUM_NETWORK', 'sepolia')
        self.infura_project_id = os.getenv('INFURA_PROJECT_ID')
        self.private_key = os.getenv('BLOCKCHAIN_PRIVATE_KEY')
        self.wallet_address = os.getenv('WALLET_ADDRESS')
        
        # Initialize Web3 connection
        if self.infura_project_id:
            self.w3 = Web3(Web3.HTTPProvider(f'https://{self.network}.infura.io/v3/{self.infura_project_id}'))
        else:
            # Fallback to public RPC for development
            self.w3 = Web3(Web3.HTTPProvider(f'https://{self.network}.gateway.tenderly.run'))
        
        # Load contract addresses
        self.contracts = {
            'certificates': os.getenv('CONTRACT_ADDRESS_CERTIFICATES'),
            'loyalty': os.getenv('CONTRACT_ADDRESS_LOYALTY'),  
            'booking': os.getenv('CONTRACT_ADDRESS_BOOKING'),
            'reviews': os.getenv('CONTRACT_ADDRESS_REVIEWS')
        }
        
        # Initialize account if private key is available
        self.account = None
        if self.private_key:
            self.account = Account.from_key(self.private_key)
            
        # Contract ABIs for tourism functions
        self.contract_abis = {
            'certificates': self._get_certificate_abi(),
            'loyalty': self._get_loyalty_abi(),
            'booking': self._get_booking_abi(),
            'reviews': self._get_reviews_abi()
        }
    
    def _get_certificate_abi(self) -> List[Dict]:
        """Certificate NFT contract ABI - CORRECTED to match deployed contract"""
        return [
            {
                "inputs": [
                    {"name": "_tourist", "type": "address"},
                    {"name": "_destination", "type": "string"},
                    {"name": "_tourDate", "type": "string"}
                ],
                "name": "mintCertificate",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "_user", "type": "address"}],
                "name": "getUserCertificates",
                "outputs": [{"type": "uint256[]"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_user", "type": "address"}],
                "name": "getUserCertificateCount",
                "outputs": [{"type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_tokenId", "type": "uint256"}],
                "name": "getCertificate",
                "outputs": [{
                    "components": [
                        {"name": "tokenId", "type": "uint256"},
                        {"name": "tourist", "type": "address"},
                        {"name": "destination", "type": "string"},
                        {"name": "tourDate", "type": "string"},
                        {"name": "issuedDate", "type": "uint256"},
                        {"name": "isActive", "type": "bool"}
                    ],
                    "type": "tuple"
                }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_tokenId", "type": "uint256"}],
                "name": "isCertificateValid",
                "outputs": [{"type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def _get_loyalty_abi(self) -> List[Dict]:
        """Loyalty points contract ABI - CORRECTED to match deployed contract"""
        return [
            {
                "inputs": [
                    {"name": "_user", "type": "address"},
                    {"name": "_bookingAmount", "type": "uint256"},
                    {"name": "_description", "type": "string"}
                ],
                "name": "earnPoints",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "_user", "type": "address"},
                    {"name": "_pointsToRedeem", "type": "uint256"},
                    {"name": "_description", "type": "string"}
                ],
                "name": "redeemPoints",
                "outputs": [{"type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "_user", "type": "address"}],
                "name": "getPointBalance",
                "outputs": [{"type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_user", "type": "address"}],
                "name": "getUserTransactions",
                "outputs": [{
                    "components": [
                        {"name": "user", "type": "address"},
                        {"name": "amount", "type": "int256"},
                        {"name": "transactionType", "type": "string"},
                        {"name": "description", "type": "string"},
                        {"name": "timestamp", "type": "uint256"}
                    ],
                    "type": "tuple[]"
                }],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_user", "type": "address"}],
                "name": "getUserStats",
                "outputs": [
                    {"name": "balance", "type": "uint256"},
                    {"name": "earned", "type": "uint256"},
                    {"name": "redeemed", "type": "uint256"},
                    {"name": "transactionCount", "type": "uint256"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_points", "type": "uint256"}],
                "name": "calculateDiscountValue",
                "outputs": [{"type": "uint256"}],
                "stateMutability": "pure",
                "type": "function"
            }
        ]
    
    def _get_booking_abi(self) -> List[Dict]:
        """Booking verification contract ABI - CORRECTED to match deployed contract"""
        return [
            {
                "inputs": [
                    {"name": "_tourist", "type": "address"},
                    {"name": "_provider", "type": "address"},
                    {"name": "_destination", "type": "string"},
                    {"name": "_amount", "type": "uint256"},
                    {"name": "_bookingDate", "type": "uint256"},
                    {"name": "_ipfsHash", "type": "string"}
                ],
                "name": "verifyBooking",
                "outputs": [{"type": "bytes32"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "_bookingHash", "type": "bytes32"}],
                "name": "isBookingValid",
                "outputs": [{"type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_bookingHash", "type": "bytes32"}],
                "name": "getBookingDetails",
                "outputs": [
                    {"name": "tourist", "type": "address"},
                    {"name": "provider", "type": "address"},
                    {"name": "destination", "type": "string"},
                    {"name": "amount", "type": "uint256"},
                    {"name": "bookingDate", "type": "uint256"},
                    {"name": "verificationDate", "type": "uint256"},
                    {"name": "status", "type": "uint8"},
                    {"name": "ipfsHash", "type": "string"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_tourist", "type": "address"}],
                "name": "getTouristBookings",
                "outputs": [{"type": "bytes32[]"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "_provider", "type": "address"}],
                "name": "getProviderBookings",
                "outputs": [{"type": "bytes32[]"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def _get_reviews_abi(self) -> List[Dict]:
        """Reviews verification contract ABI"""
        return [
            {
                "inputs": [
                    {"name": "reviewId", "type": "string"},
                    {"name": "reviewHash", "type": "bytes32"},
                    {"name": "user", "type": "address"},
                    {"name": "destinationId", "type": "string"}
                ],
                "name": "verifyReview", 
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "reviewId", "type": "string"}],
                "name": "isReviewVerified",
                "outputs": [{"type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def is_connected(self) -> bool:
        """Check if connected to Ethereum network"""
        try:
            return self.w3.is_connected()
        except Exception:
            return False
    
    def get_network_info(self) -> Dict[str, Any]:
        """Get current network information"""
        try:
            chain_id = self.w3.eth.chain_id
            latest_block = self.w3.eth.block_number
            gas_price = self.w3.eth.gas_price
            
            return {
                'connected': True,
                'network': self.network,
                'chain_id': chain_id,
                'latest_block': latest_block,
                'gas_price_gwei': float(self.w3.from_wei(gas_price, 'gwei')),
                'wallet_address': self.wallet_address,
                'contracts': self.contracts
            }
        except Exception as e:
            return {
                'connected': False,
                'error': str(e)
            }
    
    def get_balance(self, address: str) -> float:
        """Get ETH balance for an address"""
        try:
            balance_wei = self.w3.eth.get_balance(address)
            balance_eth = self.w3.from_wei(balance_wei, 'ether')
            return float(balance_eth)
        except Exception:
            return 0.0
    
    def validate_address(self, address: str) -> bool:
        """Validate Ethereum address format"""
        return Web3.is_address(address)
    
    async def deploy_contract(self, contract_name: str, abi: List, bytecode: str) -> Optional[str]:
        """Deploy a smart contract to the network"""
        if not self.account:
            raise Exception("No account configured for deployment")
        
        try:
            # Create contract instance
            contract = self.w3.eth.contract(abi=abi, bytecode=bytecode)
            
            # Build transaction
            transaction = contract.constructor().build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 2000000,
                'gasPrice': self.w3.to_wei('20', 'gwei')
            })
            
            # Sign transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            
            # Send transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            if receipt.status == 1:
                return receipt.contractAddress
            else:
                raise Exception("Contract deployment failed")
                
        except Exception as e:
            raise Exception(f"Contract deployment error: {str(e)}")
    
    def get_contract_instance(self, contract_name: str, abi: List):
        """Get contract instance for interactions"""
        contract_address = self.contracts.get(contract_name)
        if not contract_address:
            raise Exception(f"Contract address not found for {contract_name}")
        
        return self.w3.eth.contract(address=contract_address, abi=abi)
    
    async def call_contract_function(self, contract_name: str, abi: List, 
                                   function_name: str, *args, **kwargs) -> Any:
        """Call a read-only contract function"""
        try:
            contract = self.get_contract_instance(contract_name, abi)
            function = getattr(contract.functions, function_name)
            return function(*args).call()
        except Exception as e:
            raise Exception(f"Contract call error: {str(e)}")
    
    async def send_contract_transaction(self, contract_name: str, abi: List,
                                      function_name: str, *args, **kwargs) -> str:
        """Send a transaction to a contract function"""
        if not self.account:
            raise Exception("No account configured for transactions")
        
        try:
            contract = self.get_contract_instance(contract_name, abi)
            function = getattr(contract.functions, function_name)
            
            # Build transaction
            transaction = function(*args).build_transaction({
                'from': self.account.address,
                'nonce': self.w3.eth.get_transaction_count(self.account.address),
                'gas': 500000,
                'gasPrice': self.w3.to_wei('20', 'gwei')
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            return tx_hash.hex()
            
        except Exception as e:
            raise Exception(f"Transaction error: {str(e)}")
    
    def generate_hash(self, data: str) -> str:
        """Generate SHA-256 hash for blockchain verification"""
        return '0x' + hashlib.sha256(data.encode()).hexdigest()
    
    # ===========================================
    # CERTIFICATE FUNCTIONS
    # ===========================================
    
    async def mint_certificate(self, user_wallet: str, booking_id: str, 
                             destination_name: str, tour_date: str = None) -> Dict:
        """Mint a tourism certificate NFT using corrected ABI"""
        try:
            if not tour_date:
                tour_date = datetime.now().strftime("%Y-%m-%d")
            
            # Get contract with corrected ABI
            contract = self.w3.eth.contract(
                address=self.contracts['certificates'],
                abi=self.contract_abis['certificates']
            )
            
            # Use corrected function signature: mintCertificate(address _tourist, string _destination, string _tourDate)
            transaction = contract.functions.mintCertificate(
                user_wallet,
                destination_name,
                tour_date
            ).build_transaction({
                'from': self.wallet_address,
                'gas': await self.get_dynamic_gas_limit('mint_certificate'),
                'gasPrice': await self.get_dynamic_gas_price(),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Extract token ID from receipt
            token_id = None
            if receipt.logs:
                # Parse the CertificateIssued event
                for log in receipt.logs:
                    try:
                        decoded_log = contract.events.CertificateIssued().processLog(log)
                        token_id = decoded_log['args']['tokenId']
                        break
                    except:
                        continue
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'token_id': token_id,
                'destination': destination_name,
                'tour_date': tour_date,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_user_certificates(self, wallet_address: str) -> List[Dict]:
        """Get all certificates owned by a user - UPDATED to use corrected functions"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['certificates'],
                abi=self.contract_abis['certificates']
            )
            
            # Use corrected function: getUserCertificates(address _user)
            token_ids = contract.functions.getUserCertificates(wallet_address).call()
            certificates = []
            
            # Get details for each certificate
            for token_id in token_ids:
                try:
                    cert_details = contract.functions.getCertificate(token_id).call()
                    certificates.append({
                        'token_id': cert_details[0],  # tokenId
                        'tourist': cert_details[1],   # tourist
                        'destination': cert_details[2], # destination  
                        'tour_date': cert_details[3],   # tourDate
                        'issued_date': cert_details[4], # issuedDate
                        'is_active': cert_details[5]    # isActive
                    })
                except Exception as e:
                    print(f"Error getting certificate {token_id}: {e}")
                    continue
            
            return certificates
            
        except Exception as e:
            print(f"Error getting certificates: {str(e)}")
            return []
    
    # ===========================================
    # LOYALTY POINTS FUNCTIONS
    # ===========================================
    
    async def award_loyalty_points(self, user_wallet: str, points: int, 
                                 booking_id: str) -> Dict:
        """Award loyalty points to user - UPDATED to use corrected function"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['loyalty'],
                abi=self.contract_abis['loyalty']
            )
            
            # Use corrected function: earnPoints(address _user, uint256 _bookingAmount, string _description)
            description = f"Earned from booking {booking_id}"
            transaction = contract.functions.earnPoints(
                user_wallet,
                points,  # This should be booking amount, but using points for backward compatibility
                description
            ).build_transaction({
                'from': self.wallet_address,
                'gas': await self.get_dynamic_gas_limit('earn_points'),
                'gasPrice': await self.get_dynamic_gas_price(),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'points_awarded': points,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def redeem_loyalty_points(self, user_wallet: str, points: int) -> Dict:
        """Redeem loyalty points - UPDATED to use corrected function"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['loyalty'],
                abi=self.contract_abis['loyalty']
            )
            
            # Use corrected function: redeemPoints(address _user, uint256 _pointsToRedeem, string _description)
            description = f"Redeemed {points} points for discount"
            transaction = contract.functions.redeemPoints(
                user_wallet,
                points,
                description
            ).build_transaction({
                'from': self.wallet_address,
                'gas': await self.get_dynamic_gas_limit('redeem_points'),
                'gasPrice': await self.get_dynamic_gas_price(),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'points_redeemed': points,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_loyalty_points(self, wallet_address: str) -> int:
        """Get user's loyalty points balance - UPDATED to use corrected function"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['loyalty'],
                abi=self.contract_abis['loyalty']
            )
            
            # Use corrected function: getPointBalance(address _user)
            balance = contract.functions.getPointBalance(wallet_address).call()
            return balance
            
        except Exception as e:
            print(f"Error getting loyalty points: {str(e)}")
            return 0
    
    # ===========================================
    # BOOKING VERIFICATION FUNCTIONS
    # ===========================================
    
    async def verify_booking_on_blockchain(self, booking_id: str, booking_data: Dict, 
                                         user_wallet: str) -> Dict:
        """Verify booking on blockchain - UPDATED to use corrected function"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['booking'],
                abi=self.contract_abis['booking']
            )
            
            # Extract required data for corrected function signature
            provider_wallet = booking_data.get('provider_wallet', self.wallet_address)  # Fallback to system wallet
            destination = booking_data.get('destination_name', 'Unknown')
            amount = int(float(booking_data.get('total_price', 0)) * 100)  # Convert to cents/smallest unit
            booking_timestamp = int(datetime.now().timestamp())
            ipfs_hash = f"booking_{booking_id}"  # Simple IPFS hash placeholder
            
            # Use corrected function: verifyBooking(address _tourist, address _provider, string _destination, uint256 _amount, uint256 _bookingDate, string _ipfsHash)
            transaction = contract.functions.verifyBooking(
                user_wallet,
                provider_wallet,
                destination,
                amount,
                booking_timestamp,
                ipfs_hash
            ).build_transaction({
                'from': self.wallet_address,
                'gas': await self.get_dynamic_gas_limit('verify_booking'),
                'gasPrice': await self.get_dynamic_gas_price(),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Extract booking hash from transaction receipt
            booking_hash = None
            if receipt.logs:
                try:
                    # Try to decode BookingCreated event
                    for log in receipt.logs:
                        try:
                            decoded_log = contract.events.BookingCreated().processLog(log)
                            booking_hash = decoded_log['args']['bookingHash'].hex()
                            break
                        except:
                            continue
                except:
                    pass
            
            if not booking_hash:
                booking_hash = tx_hash.hex()  # Fallback to transaction hash
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'booking_hash': booking_hash,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def is_booking_verified(self, booking_hash: str) -> bool:
        """Check if booking is verified on blockchain - UPDATED to use bytes32 hash"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['booking'],
                abi=self.contract_abis['booking']
            )
            
            # Convert hex string to bytes32 if needed
            if isinstance(booking_hash, str) and booking_hash.startswith('0x'):
                booking_hash_bytes = bytes.fromhex(booking_hash[2:])
            else:
                booking_hash_bytes = booking_hash.encode() if isinstance(booking_hash, str) else booking_hash
            
            # Use corrected function: isBookingValid(bytes32 _bookingHash)
            return contract.functions.isBookingValid(booking_hash_bytes).call()
            
        except Exception as e:
            print(f"Error checking booking verification: {str(e)}")
            return False
    
    # ===========================================
    # REVIEW VERIFICATION FUNCTIONS
    # ===========================================
    
    async def verify_review_on_blockchain(self, review_id: str, review_data: Dict, 
                                        user_wallet: str, destination_id: str) -> Dict:
        """Verify review on blockchain"""
        try:
            # Create review hash
            review_string = f"{review_id}_{review_data.get('rating')}_{review_data.get('comment')}_{review_data.get('user_id')}"
            review_hash = self.generate_hash(review_string)
            
            contract = self.w3.eth.contract(
                address=self.contracts['reviews'],
                abi=self.contract_abis['reviews']
            )
            
            transaction = contract.functions.verifyReview(
                review_id,
                review_hash,
                user_wallet,
                destination_id
            ).build_transaction({
                'from': self.wallet_address,
                'gas': 150000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'review_hash': review_hash,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def is_review_verified(self, review_id: str) -> bool:
        """Check if review is verified on blockchain"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['reviews'],
                abi=self.contract_abis['reviews']
            )
            
            return contract.functions.isReviewVerified(review_id).call()
            
        except Exception as e:
            print(f"Error checking review verification: {str(e)}")
            return False
    
    def estimate_gas_cost(self, operation: str) -> Dict:
        """Estimate gas costs for operations"""
        gas_estimates = {
            'mint_certificate': 300000,
            'award_points': 100000,
            'redeem_points': 100000,
            'verify_booking': 150000,
            'verify_review': 150000
        }
        
        try:
            gas_price = self.w3.eth.gas_price
            gas_limit = gas_estimates.get(operation, 200000)
            cost_wei = gas_price * gas_limit
            cost_eth = self.w3.from_wei(cost_wei, 'ether')
            
            return {
                'operation': operation,
                'gas_limit': gas_limit,
                'gas_price_gwei': self.w3.from_wei(gas_price, 'gwei'),
                'estimated_cost_eth': float(cost_eth),
                'estimated_cost_usd': float(cost_eth) * 2000  # Rough ETH price
            }
        except Exception as e:
            return {
                'operation': operation,
                'error': str(e)
            }

    # ===========================================
    # ENHANCED GAS MANAGEMENT & RETRY LOGIC
    # ===========================================
    
    async def get_dynamic_gas_price(self) -> int:
        """Get dynamic gas price based on network conditions"""
        try:
            # Get current gas price from network
            current_gas_price = self.w3.eth.gas_price
            
            # Add 10% buffer for faster confirmation
            buffered_price = int(current_gas_price * 1.1)
            
            # Set reasonable limits (5 gwei minimum, 100 gwei maximum)
            min_price = self.w3.to_wei('5', 'gwei')
            max_price = self.w3.to_wei('100', 'gwei')
            
            return max(min_price, min(buffered_price, max_price))
            
        except Exception:
            # Fallback to 20 gwei
            return self.w3.to_wei('20', 'gwei')

    async def get_dynamic_gas_limit(self, operation: str) -> int:
        """Get dynamic gas limit for operations"""
        gas_limits = {
            'mint_certificate': 300000,
            'earn_points': 120000,
            'redeem_points': 150000,
            'verify_booking': 200000,
            'verify_review': 150000
        }
        
        base_limit = gas_limits.get(operation, 200000)
        # Add 20% buffer for safety
        return int(base_limit * 1.2)

    async def estimate_transaction_gas(self, transaction) -> int:
        """Estimate gas for transaction"""
        try:
            gas_estimate = self.w3.eth.estimate_gas(transaction)
            # Add 20% buffer
            return int(gas_estimate * 1.2)
        except Exception:
            # Return default based on operation type
            return 300000  # Default fallback

    async def execute_blockchain_transaction_with_retry(self, operation_func, max_retries=3):
        """Execute blockchain transaction with retry logic"""
        for attempt in range(max_retries):
            try:
                # Execute the blockchain operation
                result = await operation_func()
                
                if result.get('success'):
                    return result
                    
            except Exception as e:
                error_msg = str(e).lower()
                
                # Handle specific errors
                if 'nonce too low' in error_msg:
                    # Reset nonce and retry
                    await self.reset_nonce()
                elif 'gas price too low' in error_msg:
                    # Increase gas price and retry
                    await self.increase_gas_price()
                elif 'insufficient funds' in error_msg:
                    # Can't retry insufficient funds
                    return {'success': False, 'error': 'Insufficient ETH balance'}
                
                if attempt == max_retries - 1:
                    return {'success': False, 'error': str(e)}
                    
                # Wait before retry (exponential backoff)
                await asyncio.sleep(2 ** attempt)
        
        return {'success': False, 'error': 'Max retries exceeded'}

    async def reset_nonce(self):
        """Reset nonce for account"""
        try:
            if self.account:
                # Get latest nonce from network
                latest_nonce = self.w3.eth.get_transaction_count(self.account.address, 'latest')
                pending_nonce = self.w3.eth.get_transaction_count(self.account.address, 'pending')
                print(f"Nonce reset: latest={latest_nonce}, pending={pending_nonce}")
        except Exception as e:
            print(f"Error resetting nonce: {e}")

    async def increase_gas_price(self, multiplier=1.5):
        """Increase gas price for retries"""
        try:
            current_price = await self.get_dynamic_gas_price()
            new_price = int(current_price * multiplier)
            max_price = self.w3.to_wei('200', 'gwei')  # Emergency max limit
            
            return min(new_price, max_price)
        except Exception as e:
            print(f"Error increasing gas price: {e}")
            return self.w3.to_wei('30', 'gwei')  # Fallback

    # ===========================================
    # CORRECTED BLOCKCHAIN OPERATIONS
    # ===========================================
    
    async def award_loyalty_points_corrected(self, user_wallet: str, booking_amount: int, 
                                           description: str) -> Dict:
        """Award loyalty points using corrected earnPoints function"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['loyalty'],
                abi=self.contract_abis['loyalty']
            )
            
            # Use corrected function: earnPoints(address _user, uint256 _bookingAmount, string _description)
            transaction = contract.functions.earnPoints(
                user_wallet,
                booking_amount,
                description
            ).build_transaction({
                'from': self.wallet_address,
                'gas': await self.get_dynamic_gas_limit('earn_points'),
                'gasPrice': await self.get_dynamic_gas_price(),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'booking_amount': booking_amount,
                'description': description,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    async def verify_booking_corrected(self, tourist_wallet: str, provider_wallet: str,
                                     destination: str, amount: int, booking_date: int,
                                     ipfs_hash: str = "") -> Dict:
        """Verify booking using corrected function signature"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['booking'],
                abi=self.contract_abis['booking']
            )
            
            # Use corrected function: verifyBooking(address _tourist, address _provider, string _destination, uint256 _amount, uint256 _bookingDate, string _ipfsHash)
            transaction = contract.functions.verifyBooking(
                tourist_wallet,
                provider_wallet,
                destination,
                amount,
                booking_date,
                ipfs_hash
            ).build_transaction({
                'from': self.wallet_address,
                'gas': await self.get_dynamic_gas_limit('verify_booking'),
                'gasPrice': await self.get_dynamic_gas_price(),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Extract booking hash from return value
            booking_hash = None
            if receipt.logs:
                try:
                    decoded_log = contract.events.BookingCreated().processLog(receipt.logs[0])
                    booking_hash = decoded_log['args']['bookingHash'].hex()
                except:
                    booking_hash = tx_hash.hex()  # Fallback
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'booking_hash': booking_hash,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Global blockchain service instance
blockchain_service = BlockchainService()