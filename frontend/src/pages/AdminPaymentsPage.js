import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, XCircle, Clock, Eye, Filter, RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { paymentsAPI } from '../services/payments';
import { useToast } from '../hooks/use-toast';

const AdminPaymentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [adminNote, setAdminNote] = useState('');
  const [verifiedAmount, setVerifiedAmount] = useState('');
  const [filterStatus, setFilterStatus] = useState('verification_required');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPayments();
      loadPendingPayments();
    }
  }, [user, filterStatus]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentsAPI.admin.getAll(filterStatus);
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingPayments = async () => {
    try {
      const data = await paymentsAPI.admin.getPending();
      setPendingPayments(data);
    } catch (error) {
      console.error('Error loading pending payments:', error);
    }
  };

  const handleApproval = async () => {
    if (!selectedPayment) return;

    setLoading(true);
    try {
      await paymentsAPI.admin.approve({
        payment_id: selectedPayment.id,
        action: approvalAction,
        admin_note: adminNote,
        verified_amount: verifiedAmount ? parseFloat(verifiedAmount) : null
      });

      toast({
        title: `Payment ${approvalAction === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `Payment has been ${approvalAction === 'approve' ? 'approved' : 'rejected'} successfully`,
      });

      setShowApprovalModal(false);
      setSelectedPayment(null);
      setAdminNote('');
      setVerifiedAmount('');
      
      // Reload data
      loadPayments();
      loadPendingPayments();

    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: 'Error',
        description: `Failed to ${approvalAction} payment`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (payment, action) => {
    setSelectedPayment(payment);
    setApprovalAction(action);
    setVerifiedAmount(payment.amount.toString());
    setShowApprovalModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      verification_required: { color: 'bg-blue-100 text-blue-800', text: 'Verification Required' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} border-0`}>
        {config.text}
      </Badge>
    );
  };

  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      payment.booking_full_name?.toLowerCase().includes(search) ||
      payment.booking_email?.toLowerCase().includes(search) ||
      payment.booking_phone?.includes(search) ||
      payment.upi_transaction_id?.toLowerCase().includes(search) ||
      payment.transaction_reference?.toLowerCase().includes(search)
    );
  });

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
          <p className="text-gray-600">Review and approve customer payments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Pending Verification</p>
                  <p className="text-2xl font-bold">{pendingPayments.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Completed</p>
                  <p className="text-2xl font-bold">
                    {payments.filter(p => p.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Failed/Rejected</p>
                  <p className="text-2xl font-bold">
                    {payments.filter(p => p.status === 'failed').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Amount</p>
                  <p className="text-2xl font-bold">
                    ₹{payments.reduce((sum, p) => sum + (p.verified_amount || p.amount), 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-2xl">₹</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Payments</option>
                    <option value="pending">Pending</option>
                    <option value="verification_required">Verification Required</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <Button 
                  onClick={loadPayments}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by customer, email, phone, or transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-80 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Payments ({filteredPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading payments...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No payments found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold">Package</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{payment.booking_full_name}</p>
                            <p className="text-sm text-gray-600">{payment.booking_email}</p>
                            <p className="text-sm text-gray-600">{payment.booking_phone}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{payment.package_name || 'Tourism Package'}</p>
                            <p className="text-sm text-gray-600">Ref: {payment.transaction_reference}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                          {payment.verified_amount && payment.verified_amount !== payment.amount && (
                            <p className="text-sm text-green-600">
                              Verified: ₹{payment.verified_amount.toLocaleString()}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-mono text-sm">
                            {payment.upi_transaction_id || 'N/A'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.created_at).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {payment.status === 'verification_required' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => openApprovalModal(payment, 'approve')}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openApprovalModal(payment, 'reject')}
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval Modal */}
        {showApprovalModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full">
              <CardHeader>
                <CardTitle className={`${approvalAction === 'approve' ? 'text-green-700' : 'text-red-700'}`}>
                  {approvalAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Payment Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Customer:</strong> {selectedPayment.booking_full_name}</p>
                    <p><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString()}</p>
                    <p><strong>Transaction ID:</strong> {selectedPayment.upi_transaction_id}</p>
                    <p><strong>Package:</strong> {selectedPayment.package_name}</p>
                    {selectedPayment.customer_note && (
                      <p><strong>Customer Note:</strong> {selectedPayment.customer_note}</p>
                    )}
                  </div>
                </div>
                
                {approvalAction === 'approve' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verified Amount
                    </label>
                    <input
                      type="number"
                      value={verifiedAmount}
                      onChange={(e) => setVerifiedAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Note
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={`Reason for ${approvalAction === 'approve' ? 'approval' : 'rejection'}...`}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleApproval}
                    disabled={loading}
                    className={`flex-1 ${
                      approvalAction === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white`}
                  >
                    {loading ? 'Processing...' : `${approvalAction === 'approve' ? 'Approve' : 'Reject'} Payment`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Details Modal */}
        {selectedPayment && !showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {selectedPayment.booking_full_name}</p>
                      <p><strong>Email:</strong> {selectedPayment.booking_email}</p>
                      <p><strong>Phone:</strong> {selectedPayment.booking_phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Payment Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Amount:</strong> ₹{selectedPayment.amount.toLocaleString()}</p>
                      <p><strong>Status:</strong> {getStatusBadge(selectedPayment.status)}</p>
                      <p><strong>Method:</strong> {selectedPayment.payment_method?.toUpperCase()}</p>
                      <p><strong>Reference:</strong> {selectedPayment.transaction_reference}</p>
                    </div>
                  </div>
                </div>
                
                {selectedPayment.upi_transaction_id && (
                  <div>
                    <h4 className="font-semibold mb-2">Transaction Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>UPI Transaction ID:</strong> {selectedPayment.upi_transaction_id}</p>
                      <p><strong>UPI ID:</strong> {selectedPayment.upi_id}</p>
                    </div>
                  </div>
                )}
                
                {selectedPayment.customer_note && (
                  <div>
                    <h4 className="font-semibold mb-2">Customer Note</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedPayment.customer_note}</p>
                  </div>
                )}
                
                {selectedPayment.admin_note && (
                  <div>
                    <h4 className="font-semibold mb-2">Admin Note</h4>
                    <p className="text-sm bg-blue-50 p-3 rounded">{selectedPayment.admin_note}</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPayment(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentsPage;