import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, QrCode, CreditCard, CheckCircle, AlertCircle, Clock, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { paymentsAPI } from '../services/payments';
import { useToast } from '../hooks/use-toast';
import LanguageToggle from '../components/LanguageToggle';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  // Get booking data from navigation state
  const { bookingData } = location.state || {};
  
  const [paymentStep, setPaymentStep] = useState('create'); // create, qr, verify, success
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [verificationForm, setVerificationForm] = useState({
    transactionId: '',
    amount: '',
    note: ''
  });
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!bookingData) {
      toast({
        title: 'Error',
        description: 'Booking data not found. Please try again.',
        variant: 'destructive',
      });
      navigate('/bookings');
    }
  }, [bookingData, navigate, toast]);

  // Timer for payment expiry
  useEffect(() => {
    if (paymentStep === 'qr' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePaymentExpiry();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStep, timeLeft]);

  const handlePaymentExpiry = () => {
    toast({
      title: 'Payment Expired',
      description: 'Your payment session has expired. Please try again.',
      variant: 'destructive',
    });
    setPaymentStep('create');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createPayment = async () => {
    if (!bookingData) return;

    setLoading(true);
    try {
      const response = await paymentsAPI.create({
        booking_id: bookingId || bookingData.id,
        amount: bookingData.total_price || bookingData.calculated_price,
        payment_method: 'upi'
      });

      setPaymentData(response);
      setPaymentStep('qr');
      
      toast({
        title: 'Payment Created',
        description: 'UPI payment request created successfully',
      });

    } catch (error) {
      console.error('Payment creation error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Failed to create payment request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!bookingData) return;

    setLoading(true);
    try {
      const response = await paymentsAPI.generateQR({
        booking_id: bookingId || bookingData.id,
        amount: bookingData.total_price || bookingData.calculated_price,
        customer_name: bookingData.booking_full_name || user.name,
        customer_phone: bookingData.booking_phone || user.phone
      });

      setQrCodeData(response);
      setPaymentStep('qr');
      setTimeLeft(1800); // Reset timer

    } catch (error) {
      console.error('QR generation error:', error);
      toast({
        title: 'QR Generation Failed',
        description: 'Failed to generate QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    if (!validateVerificationForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await paymentsAPI.verify({
        payment_id: paymentData.id,
        transaction_id: verificationForm.transactionId,
        amount: parseFloat(verificationForm.amount),
        customer_note: verificationForm.note
      });

      setPaymentStep('success');
      
      toast({
        title: 'Payment Submitted',
        description: 'Your payment verification has been submitted successfully',
      });

    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: 'Verification Failed',
        description: 'Failed to submit payment verification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateVerificationForm = () => {
    const newErrors = {};
    
    if (!verificationForm.transactionId.trim()) {
      newErrors.transactionId = 'Transaction ID is required';
    } else if (verificationForm.transactionId.length < 8) {
      newErrors.transactionId = 'Please enter a valid transaction ID';
    }

    if (!verificationForm.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(verificationForm.amount) !== (bookingData.total_price || bookingData.calculated_price)) {
      newErrors.amount = `Amount must be exactly ₹${(bookingData.total_price || bookingData.calculated_price).toLocaleString()}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied',
        description: 'Copied to clipboard',
      });
    });
  };

  const handleInputChange = (field, value) => {
    setVerificationForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Booking data not found</p>
            <Button onClick={() => navigate('/bookings')} className="mt-4">
              Go to Bookings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Language Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20 mr-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
              Complete Your Payment
            </h1>
            <p className="text-xl opacity-90">
              Secure UPI Payment for {bookingData.package_name || 'Your Booking'}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Payment Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className={`flex items-center space-x-2 ${paymentStep === 'create' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep === 'create' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span>Create Payment</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div className={`flex items-center space-x-2 ${paymentStep === 'qr' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep === 'qr' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  <QrCode className="h-4 w-4" />
                </div>
                <span>Scan & Pay</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div className={`flex items-center space-x-2 ${paymentStep === 'verify' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep === 'verify' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span>Verify</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div className={`flex items-center space-x-2 ${paymentStep === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span>Success</span>
              </div>
            </div>
          </div>

          {/* Payment Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Booking Summary */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">
                    {bookingData.package_name || 'Tourism Package'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Package:</span>
                      <span>{bookingData.package_type || 'Premium'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Travelers:</span>
                      <span>{bookingData.guests || 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-in:</span>
                      <span>{new Date(bookingData.check_in).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-out:</span>
                      <span>{new Date(bookingData.check_out).toLocaleDateString()}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg text-green-700">
                        <span>Total Amount:</span>
                        <span>₹{(bookingData.total_price || bookingData.calculated_price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Customer:</strong> {bookingData.booking_full_name}</p>
                  <p><strong>Email:</strong> {bookingData.booking_email}</p>
                  <p><strong>Phone:</strong> {bookingData.booking_phone}</p>
                  {bookingData.reference_number && (
                    <p><strong>Reference:</strong> {bookingData.reference_number}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Payment Process */}
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">
                  {paymentStep === 'create' && 'Initialize Payment'}
                  {paymentStep === 'qr' && 'UPI Payment'}
                  {paymentStep === 'verify' && 'Verify Payment'}
                  {paymentStep === 'success' && 'Payment Submitted'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                
                {/* Step 1: Create Payment */}
                {paymentStep === 'create' && (
                  <div className="text-center space-y-6">
                    <CreditCard className="h-16 w-16 text-green-600 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Pay?</h3>
                      <p className="text-gray-600 mb-4">
                        Click below to generate your UPI payment QR code for
                        <span className="font-semibold text-green-600">
                          {' '}₹{(bookingData.total_price || bookingData.calculated_price).toLocaleString()}
                        </span>
                      </p>
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h4 className="font-semibold text-blue-700 mb-2">Payment Instructions:</h4>
                        <ul className="text-sm text-blue-600 space-y-1">
                          <li>• Scan QR code with any UPI app</li>
                          <li>• Complete payment with your UPI PIN</li>
                          <li>• Note down the transaction ID</li>
                          <li>• Enter transaction details for verification</li>
                        </ul>
                      </div>
                    </div>
                    <Button 
                      onClick={generateQRCode}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    >
                      {loading ? 'Generating...' : 'Generate UPI QR Code'}
                    </Button>
                  </div>
                )}

                {/* Step 2: QR Code Display */}
                {paymentStep === 'qr' && qrCodeData && (
                  <div className="text-center space-y-6">
                    <div className="bg-red-50 p-3 rounded-lg mb-4">
                      <div className="flex items-center justify-center space-x-2 text-red-700">
                        <Clock className="h-4 w-4" />
                        <span className="font-semibold">Time Remaining: {formatTime(timeLeft)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                      <img 
                        src={qrCodeData.qr_code_base64} 
                        alt="UPI QR Code" 
                        className="w-64 h-64 mx-auto mb-4"
                      />
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          <span>UPI ID: {qrCodeData.upi_id}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(qrCodeData.upi_id)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <span>Amount: ₹{qrCodeData.amount.toLocaleString()}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => copyToClipboard(qrCodeData.amount.toString())}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-gray-600">Merchant: {qrCodeData.merchant_name}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Supported apps: PhonePe, Google Pay, Paytm, BHIM, Amazon Pay
                      </p>
                      <Button 
                        onClick={() => setPaymentStep('verify')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        I Have Made the Payment
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setPaymentStep('create')}
                        className="w-full"
                      >
                        Generate New QR Code
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Verification */}
                {paymentStep === 'verify' && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <CheckCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Verify Your Payment</h3>
                      <p className="text-gray-600">
                        Please enter your transaction details to complete the verification
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UPI Transaction ID *
                        </label>
                        <input
                          type="text"
                          value={verificationForm.transactionId}
                          onChange={(e) => handleInputChange('transactionId', e.target.value)}
                          placeholder="Enter 12-digit transaction ID"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors.transactionId ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.transactionId && (
                          <p className="text-red-500 text-sm mt-1">{errors.transactionId}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount Paid *
                        </label>
                        <input
                          type="number"
                          value={verificationForm.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          placeholder={`${bookingData.total_price || bookingData.calculated_price}`}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                            errors.amount ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.amount && (
                          <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Note (Optional)
                        </label>
                        <textarea
                          value={verificationForm.note}
                          onChange={(e) => handleInputChange('note', e.target.value)}
                          placeholder="Any additional information about the payment"
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Button 
                        onClick={handleVerificationSubmit}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        {loading ? 'Submitting...' : 'Submit for Verification'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setPaymentStep('qr')}
                        className="w-full"
                      >
                        Back to QR Code
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Success */}
                {paymentStep === 'success' && (
                  <div className="text-center space-y-6">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-green-700">
                        Payment Verification Submitted!
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Your payment details have been submitted for verification. 
                        Our team will review and confirm your payment within 24 hours.
                      </p>
                      <div className="bg-green-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-green-700">
                          <strong>What's Next?</strong><br />
                          • You'll receive an email confirmation once verified<br />
                          • Your booking will be confirmed after payment approval<br />
                          • Check your booking status in "My Bookings"
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => navigate('/bookings')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        View My Bookings
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="w-full"
                      >
                        Back to Home
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;