import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock, AlertTriangle, ExternalLink, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const BlockchainBookingStatus = ({ bookingId, onVerificationComplete }) => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (bookingId) {
      checkVerificationStatus();
    }
  }, [bookingId]);

  const checkVerificationStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/blockchain/bookings/status/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }

      const data = await response.json();
      setVerificationStatus(data);
    } catch (error) {
      console.error('Error checking verification status:', error);
      setError('Failed to check verification status');
    } finally {
      setLoading(false);
    }
  };

  const verifyBookingOnBlockchain = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/blockchain/bookings/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify booking');
      }

      const data = await response.json();
      setVerificationStatus(data);
      
      if (onVerificationComplete) {
        onVerificationComplete(data);
      }
    } catch (error) {
      console.error('Error verifying booking:', error);
      setError('Failed to verify booking on blockchain');
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'not_requested':
        return <Shield className="h-5 w-5 text-blue-400" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'not_requested':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'verified':
        return 'Booking verified on blockchain';
      case 'pending':
        return 'Blockchain verification in progress';
      case 'failed':
        return 'Blockchain verification failed';
      case 'not_requested':
        return 'Blockchain verification not requested';
      default:
        return 'No blockchain verification';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center">
          <Loader className="h-5 w-5 text-gray-400 animate-spin mr-3" />
          <span className="text-gray-600">Checking blockchain status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={checkVerificationStatus}
            className="text-red-600 hover:text-red-700 text-sm underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const status = verificationStatus?.verification_status || 'not_verified';

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className={`rounded-lg p-4 border ${getStatusColor(status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getStatusIcon(status)}
            <div className="ml-3">
              <p className="font-medium">
                {getStatusMessage(status)}
              </p>
              {verificationStatus?.verified_at && (
                <p className="text-sm opacity-75 mt-1">
                  Verified on {new Date(verificationStatus.verified_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {verificationStatus?.transaction_hash && (
            <button
              onClick={() => window.open(`https://sepolia.etherscan.io/tx/${verificationStatus.transaction_hash}`, '_blank')}
              className="flex items-center text-sm hover:underline"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View Transaction
            </button>
          )}
        </div>
      </div>

      {/* Blockchain Details */}
      {verificationStatus && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Blockchain Details
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Booking Hash:</span>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 break-all">
                {verificationStatus.booking_hash}
              </p>
            </div>
            
            <div>
              <span className="text-gray-500">Contract Address:</span>
              <p className="font-mono text-xs bg-gray-50 p-2 rounded mt-1 break-all">
                {verificationStatus.contract_address}
              </p>
            </div>

            <div>
              <span className="text-gray-500">Network:</span>
              <p className="font-medium text-gray-900 mt-1">
                {verificationStatus.blockchain_network || 'Sepolia Testnet'}
              </p>
            </div>

            {verificationStatus.gas_fee_paid && (
              <div>
                <span className="text-gray-500">Gas Fee:</span>
                <p className="font-medium text-gray-900 mt-1">
                  {verificationStatus.gas_fee_paid} ETH
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verification Action */}
      {(!verificationStatus || status === 'not_verified' || status === 'failed') && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">
                Verify Booking on Blockchain
              </h4>
              <p className="text-blue-700 text-sm">
                Secure your booking with blockchain verification. This creates an immutable record 
                of your tourism experience and enables certificate minting upon completion.
              </p>
            </div>
            
            <button
              onClick={verifyBookingOnBlockchain}
              disabled={isVerifying}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isVerifying ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Verify Now
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Benefits Information */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
          Blockchain Verification Benefits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Immutable booking record
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Certificate eligibility
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Enhanced security
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              Loyalty point verification
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Fraud prevention
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Transparent tracking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainBookingStatus;