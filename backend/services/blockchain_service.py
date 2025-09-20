"""
Blockchain Service for Jharkhand Tourism
Phase 4: Backend Integration - Complete Web3 functionality

Handles:
- Certificate NFT minting
- Loyalty points system
- Booking verification
- Review authentication
"""
import os
import json
import uuid
import hashlib
from datetime import datetime, date
from typing import Optional, Dict, Any, List
from decimal import Decimal

from web3 import Web3
from web3.exceptions import TransactionNotFound, ContractLogicError
from eth_account import Account
from hexbytes import HexBytes
from dotenv import load_dotenv

load_dotenv()

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
        """Certificate NFT contract ABI"""
        return [
            {
                "inputs": [
                    {"name": "to", "type": "address"},
                    {"name": "tokenURI", "type": "string"},
                    {"name": "certificateType", "type": "string"},
                    {"name": "destinationName", "type": "string"}
                ],
                "name": "mintCertificate",
                "outputs": [{"name": "tokenId", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "tokenId", "type": "uint256"}],
                "name": "tokenURI",
                "outputs": [{"type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"name": "owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def _get_loyalty_abi(self) -> List[Dict]:
        """Loyalty points contract ABI"""
        return [
            {
                "inputs": [
                    {"name": "user", "type": "address"},
                    {"name": "points", "type": "uint256"}
                ],
                "name": "awardPoints",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"name": "user", "type": "address"},
                    {"name": "points", "type": "uint256"}
                ],
                "name": "redeemPoints",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "user", "type": "address"}],
                "name": "getPoints",
                "outputs": [{"type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def _get_booking_abi(self) -> List[Dict]:
        """Booking verification contract ABI"""
        return [
            {
                "inputs": [
                    {"name": "bookingId", "type": "string"},
                    {"name": "bookingHash", "type": "bytes32"},
                    {"name": "user", "type": "address"}
                ],
                "name": "verifyBooking",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "bookingId", "type": "string"}],
                "name": "isBookingVerified",
                "outputs": [{"type": "bool"}],
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
                             destination_name: str, certificate_type: str = "tour_completion") -> Dict:
        """Mint a tourism certificate NFT"""
        try:
            # Create metadata for the certificate
            metadata = {
                "name": f"Tourism Certificate - {destination_name}",
                "description": f"Certificate of {certificate_type} for visiting {destination_name}",
                "image": f"https://certificates.jharkhandtourism.com/{booking_id}.png",
                "attributes": [
                    {"trait_type": "Destination", "value": destination_name},
                    {"trait_type": "Type", "value": certificate_type},
                    {"trait_type": "Issue Date", "value": datetime.now().isoformat()},
                    {"trait_type": "Network", "value": self.network}
                ]
            }
            
            # Generate metadata URL (in production, upload to IPFS)
            metadata_url = f"https://metadata.jharkhandtourism.com/{booking_id}.json"
            
            # Get contract
            contract = self.w3.eth.contract(
                address=self.contracts['certificates'],
                abi=self.contract_abis['certificates']
            )
            
            # Build transaction
            transaction = contract.functions.mintCertificate(
                user_wallet,
                metadata_url,
                certificate_type,
                destination_name
            ).build_transaction({
                'from': self.wallet_address,
                'gas': 300000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            # Sign and send transaction
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            # Extract token ID from logs (simplified for MVP)
            token_id = receipt.logs[0]['topics'][3] if receipt.logs else 1
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex(),
                'token_id': int.from_bytes(token_id, byteorder='big') if isinstance(token_id, bytes) else token_id,
                'metadata_url': metadata_url,
                'gas_used': receipt.gasUsed
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_user_certificates(self, wallet_address: str) -> List[Dict]:
        """Get all certificates owned by a user"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['certificates'],
                abi=self.contract_abis['certificates']
            )
            
            balance = contract.functions.balanceOf(wallet_address).call()
            certificates = []
            
            # In a real implementation, iterate through token IDs
            for i in range(balance):
                certificates.append({
                    'token_id': i + 1,
                    'metadata_url': f"https://metadata.jharkhandtourism.com/cert_{i+1}.json"
                })
            
            return certificates
            
        except Exception as e:
            print(f"Error getting certificates: {str(e)}")
            return []
    
    # ===========================================
    # LOYALTY POINTS FUNCTIONS
    # ===========================================
    
    async def award_loyalty_points(self, user_wallet: str, points: int, 
                                 booking_id: str) -> Dict:
        """Award loyalty points to user"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['loyalty'],
                abi=self.contract_abis['loyalty']
            )
            
            transaction = contract.functions.awardPoints(
                user_wallet,
                points
            ).build_transaction({
                'from': self.wallet_address,
                'gas': 100000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
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
        """Redeem loyalty points"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['loyalty'],
                abi=self.contract_abis['loyalty']
            )
            
            transaction = contract.functions.redeemPoints(
                user_wallet,
                points
            ).build_transaction({
                'from': self.wallet_address,
                'gas': 100000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
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
        """Get user's loyalty points balance"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['loyalty'],
                abi=self.contract_abis['loyalty']
            )
            
            balance = contract.functions.getPoints(wallet_address).call()
            return balance
            
        except Exception as e:
            print(f"Error getting loyalty points: {str(e)}")
            return 0
    
    # ===========================================
    # BOOKING VERIFICATION FUNCTIONS
    # ===========================================
    
    async def verify_booking_on_blockchain(self, booking_id: str, booking_data: Dict, 
                                         user_wallet: str) -> Dict:
        """Verify booking on blockchain"""
        try:
            # Create booking hash
            booking_string = f"{booking_id}_{booking_data.get('destination_id')}_{booking_data.get('total_price')}_{booking_data.get('booking_date')}"
            booking_hash = self.generate_hash(booking_string)
            
            contract = self.w3.eth.contract(
                address=self.contracts['booking'],
                abi=self.contract_abis['booking']
            )
            
            transaction = contract.functions.verifyBooking(
                booking_id,
                booking_hash,
                user_wallet
            ).build_transaction({
                'from': self.wallet_address,
                'gas': 150000,
                'gasPrice': self.w3.to_wei('20', 'gwei'),
                'nonce': self.w3.eth.get_transaction_count(self.wallet_address)
            })
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
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
    
    async def is_booking_verified(self, booking_id: str) -> bool:
        """Check if booking is verified on blockchain"""
        try:
            contract = self.w3.eth.contract(
                address=self.contracts['booking'],
                abi=self.contract_abis['booking']
            )
            
            return contract.functions.isBookingVerified(booking_id).call()
            
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
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.raw_transaction)
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

# Global blockchain service instance
blockchain_service = BlockchainService()