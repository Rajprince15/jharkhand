"""
Blockchain Service for Jharkhand Tourism
Handles Ethereum Sepolia testnet interactions
"""
import os
import json
from typing import Optional, Dict, Any, List
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()

class BlockchainService:
    def __init__(self):
        self.network = os.getenv('ETHEREUM_NETWORK', 'sepolia')
        self.infura_project_id = os.getenv('INFURA_PROJECT_ID')
        self.private_key = os.getenv('BLOCKCHAIN_PRIVATE_KEY')
        
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
            return {
                'connected': True,
                'network': self.network,
                'chain_id': chain_id,
                'latest_block': latest_block
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

# Global blockchain service instance
blockchain_service = BlockchainService()