import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

const BlockchainStatus = () => {
  const [networkStatus, setNetworkStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNetworkStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNetworkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNetworkStatus = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/blockchain/status`);

      if (!response.ok) {
        throw new Error('Failed to fetch blockchain status');
      }

      const data = await response.json();
      setNetworkStatus(data);
      setError('');
    } catch (error) {
      console.error('Error fetching network status:', error);
      setError('Failed to load blockchain status');
    } finally {
      setLoading(false);
    }
  };

  const formatGasPrice = (gwei) => {
    if (!gwei) return 'N/A';
    return `${parseFloat(gwei).toFixed(2)} gwei`;
  };

  const getStatusColor = (isConnected) => {
    return isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = (isConnected) => {
    return isConnected ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-500" />
          Blockchain Status
        </h3>
        <button
          onClick={fetchNetworkStatus}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {/* Network Connection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(networkStatus?.network_connected)}
            <span className="ml-2 text-sm text-gray-700">Network Connection</span>
          </div>
          <span className={`text-sm font-medium ${getStatusColor(networkStatus?.network_connected)}`}>
            {networkStatus?.network_connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Network Name */}
        {networkStatus?.network_name && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Network</span>
            <span className="text-sm font-medium text-gray-900">
              {networkStatus.network_name}
            </span>
          </div>
        )}

        {/* Block Number */}
        {networkStatus?.block_number && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">Latest Block</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              #{networkStatus.block_number.toLocaleString()}
            </span>
          </div>
        )}

        {/* Gas Price */}
        {networkStatus?.gas_price && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-700">Gas Price</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {formatGasPrice(networkStatus.gas_price)}
            </span>
          </div>
        )}
      </div>

      {/* Contract Addresses */}
      {networkStatus?.contract_addresses && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Smart Contracts
          </h4>
          <div className="space-y-2">
            {Object.entries(networkStatus.contract_addresses).map(([name, address]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">
                  {name.replace('_', ' ')}
                </span>
                <span className="text-xs font-mono bg-gray-50 px-2 py-1 rounded">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not set'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default BlockchainStatus;