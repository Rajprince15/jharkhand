import React, { useState, useEffect } from 'react';
import { Coins, Gift, TrendingUp, History, Award, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoyaltyDashboard = ({ walletConnected = false }) => {
  const [loyaltyData, setLoyaltyData] = useState({
    points_balance: 0,
    total_earned: 0,
    total_redeemed: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (walletConnected && user) {
      fetchLoyaltyData();
    }
  }, [walletConnected, user]);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/blockchain/loyalty/points`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loyalty data');
      }

      const data = await response.json();
      setLoyaltyData(data);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
      setError('Failed to load loyalty points');
    } finally {
      setLoading(false);
    }
  };

  const redeemPoints = async () => {
    if (!redeemAmount || parseFloat(redeemAmount) <= 0) {
      setError('Please enter a valid redemption amount');
      return;
    }

    if (parseFloat(redeemAmount) > loyaltyData.points_balance) {
      setError('Insufficient points balance');
      return;
    }

    setIsRedeeming(true);
    setError('');

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/api/blockchain/loyalty/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          points_amount: parseFloat(redeemAmount),
          redemption_type: 'booking_discount'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to redeem points');
      }

      // Refresh loyalty data
      await fetchLoyaltyData();
      setRedeemAmount('');
    } catch (error) {
      console.error('Error redeeming points:', error);
      setError('Failed to redeem points');
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatPoints = (points) => {
    return new Intl.NumberFormat().format(points || 0);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'redeemed':
        return <ShoppingBag className="h-4 w-4 text-red-600" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-purple-600" />;
      default:
        return <Coins className="h-4 w-4 text-blue-600" />;
    }
  };

  if (!walletConnected) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Coins className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connect Wallet for Loyalty Points
        </h3>
        <p className="text-gray-600">
          Connect your MetaMask wallet to view and manage your blockchain-based loyalty points.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-32 mb-4"></div>
          <div className="bg-gray-200 rounded-lg h-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Coins className="h-6 w-6 mr-2 text-yellow-500" />
          Loyalty Points
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Current Balance</p>
              <p className="text-3xl font-bold">{formatPoints(loyaltyData.points_balance)}</p>
              <p className="text-blue-100 text-sm">Points</p>
            </div>
            <Coins className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Earned</p>
              <p className="text-3xl font-bold">{formatPoints(loyaltyData.total_earned)}</p>
              <p className="text-green-100 text-sm">Points</p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Redeemed</p>
              <p className="text-3xl font-bold">{formatPoints(loyaltyData.total_redeemed)}</p>
              <p className="text-purple-100 text-sm">Points</p>
            </div>
            <ShoppingBag className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Points Redemption */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Gift className="h-5 w-5 mr-2 text-purple-500" />
          Redeem Points
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points to Redeem
            </label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Enter points amount"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max={loyaltyData.points_balance}
              />
              <button
                onClick={redeemPoints}
                disabled={isRedeeming || !redeemAmount}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Available: {formatPoints(loyaltyData.points_balance)} points
            </p>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Redemption Benefits</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 100 points = ₹10 booking discount</li>
              <li>• 500 points = ₹55 booking discount</li>
              <li>• 1000 points = ₹120 booking discount</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <History className="h-5 w-5 mr-2 text-gray-500" />
            Transaction History
          </h3>
        </div>

        <div className="p-6">
          {loyaltyData.transactions && loyaltyData.transactions.length > 0 ? (
            <div className="space-y-4">
              {loyaltyData.transactions.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    {getTransactionIcon(transaction.type)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.description || `Points ${transaction.type}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction.type === 'earned' || transaction.type === 'bonus' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : '-'}
                      {formatPoints(transaction.points_amount)}
                    </p>
                    {transaction.transaction_hash && (
                      <button
                        onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transaction.transaction_hash}`, '_blank')}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        View on Chain
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <History className="mx-auto h-8 w-8 text-gray-400 mb-3" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Start booking tours to earn loyalty points!</p>
            </div>
          )}
        </div>
      </div>

      {/* How to Earn Points */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-blue-500" />
          How to Earn Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-700">Complete bookings: 100 points</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-700">Leave reviews: 25 points</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-700">Milestone rewards: 500 points</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-700">Referral bonus: 200 points</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-700">Special events: Variable</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></span>
              <span className="text-sm text-gray-700">Premium packages: Bonus points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;