import React, { useState, useEffect } from 'react';
import { Wallet, Shield, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const WalletConnector = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [networkInfo, setNetworkInfo] = useState(null);
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          await fetchNetworkInfo();
          if (onConnectionChange) onConnectionChange(true, accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const fetchNetworkInfo = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const networkName = chainId === '0x1' ? 'Mainnet' : 
                         chainId === '0xaa36a7' ? 'Sepolia Testnet' : 
                         'Unknown Network';
      
      setNetworkInfo({
        chainId: parseInt(chainId, 16),
        name: networkName,
        isTestnet: chainId === '0xaa36a7'
      });
    } catch (error) {
      console.error('Error fetching network info:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        setIsConnected(true);
        await fetchNetworkInfo();

        // Register wallet with backend
        if (user && token) {
          await registerWalletWithBackend(address);
        }

        if (onConnectionChange) onConnectionChange(true, address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const registerWalletWithBackend = async (address) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/blockchain/wallet/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          wallet_address: address,
          wallet_provider: 'metamask'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to register wallet with backend');
      }
    } catch (error) {
      console.error('Error registering wallet:', error);
      // Don't throw error as wallet connection should still work
    }
  };

  const disconnectWallet = async () => {
    setWalletAddress('');
    setIsConnected(false);
    setNetworkInfo(null);
    if (onConnectionChange) onConnectionChange(false, '');
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia
      });
      await fetchNetworkInfo();
    } catch (error) {
      if (error.code === 4902) {
        // Network not added to MetaMask, add it
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
          });
          await fetchNetworkInfo();
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
        }
      }
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300">
        <div className="text-center">
          <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 mb-4">
            Connect your MetaMask wallet to access blockchain features like certificates, loyalty points, and verified bookings.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {isConnecting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Wallet className="h-4 w-4 mr-2" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>

          {typeof window.ethereum === 'undefined' && (
            <div className="mt-4">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center"
              >
                Install MetaMask
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-6 border border-green-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-green-100 rounded-full p-3 mr-4">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-green-800 font-medium">Wallet Connected</span>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              {formatAddress(walletAddress)}
            </p>
            {networkInfo && (
              <p className="text-xs text-gray-500 mt-1">
                Network: {networkInfo.name}
                {!networkInfo.isTestnet && (
                  <button
                    onClick={switchToSepolia}
                    className="ml-2 text-blue-600 hover:text-blue-700 underline"
                  >
                    Switch to Sepolia
                  </button>
                )}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={disconnectWallet}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default WalletConnector;