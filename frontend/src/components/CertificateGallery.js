import React, { useState, useEffect } from 'react';
import { Award, Download, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CertificateGallery = ({ walletConnected = false }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (walletConnected && user) {
      fetchCertificates();
    }
  }, [walletConnected, user]);

  const fetchCertificates = async () => {
    setLoading(true);
    setError('');
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/blockchain/certificates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const mintCertificate = async (bookingId, destinationName) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${backendUrl}/blockchain/certificates/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          certificate_type: 'tour_completion',
          certificate_title: `${destinationName} Tour Completion`,
          certificate_description: `Successfully completed a tourism experience at ${destinationName}, Jharkhand`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mint certificate');
      }

      // Refresh certificates after minting
      await fetchCertificates();
    } catch (error) {
      console.error('Error minting certificate:', error);
      setError('Failed to mint certificate');
    }
  };

  const downloadCertificate = (certificate) => {
    // Generate a simple certificate image or PDF
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    ctx.fillRect(0, 0, 800, 600);

    // White background for certificate
    ctx.fillStyle = 'white';
    ctx.fillRect(50, 50, 700, 500);

    // Border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 5;
    ctx.strokeRect(70, 70, 660, 460);

    // Title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', 400, 150);

    // Subtitle
    ctx.font = '24px Arial';
    ctx.fillText('Jharkhand Tourism Experience', 400, 190);

    // Certificate title
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#667eea';
    ctx.fillText(certificate.certificate_title, 400, 280);

    // Description
    ctx.font = '18px Arial';
    ctx.fillStyle = '#666';
    const description = certificate.certificate_description || '';
    const words = description.split(' ');
    let line = '';
    let y = 320;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > 600 && n > 0) {
        ctx.fillText(line, 400, y);
        line = words[n] + ' ';
        y += 25;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 400, y);

    // Date
    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';
    const completionDate = new Date(certificate.completion_date || certificate.issued_at).toLocaleDateString();
    ctx.fillText(`Completed on: ${completionDate}`, 400, y + 50);

    // NFT Token ID (if minted)
    if (certificate.is_minted && certificate.nft_token_id) {
      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = '#667eea';
      ctx.fillText(`NFT Token ID: #${certificate.nft_token_id}`, 400, y + 80);
    }

    // Convert to image and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certificate.certificate_title.replace(/\s+/g, '_')}_Certificate.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const openInExplorer = (transactionHash) => {
    const explorerUrl = `https://sepolia.etherscan.io/tx/${transactionHash}`;
    window.open(explorerUrl, '_blank');
  };

  if (!walletConnected) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connect Wallet to View Certificates
        </h3>
        <p className="text-gray-600">
          Connect your MetaMask wallet to view and manage your tourism certificates.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Award className="h-6 w-6 mr-2 text-yellow-500" />
          My Certificates
        </h2>
        {certificates.length > 0 && (
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {certificates.length} Certificate{certificates.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {certificates.length === 0 && !loading && (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Complete your first tourism experience to earn a blockchain certificate!
          </p>
        </div>
      )}

      <div className="grid gap-6">
        {certificates.map((certificate) => (
          <div
            key={certificate.id}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Award className="h-5 w-5 text-yellow-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {certificate.certificate_title}
                    </h3>
                    {certificate.is_minted && (
                      <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        NFT Minted
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {certificate.certificate_description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {certificate.destination_name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(certificate.completion_date || certificate.issued_at).toLocaleDateString()}
                    </div>
                    {certificate.nft_token_id && (
                      <div>
                        Token ID: #{certificate.nft_token_id}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => downloadCertificate(certificate)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                  
                  {certificate.transaction_hash && (
                    <button
                      onClick={() => openInExplorer(certificate.transaction_hash)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View on Chain
                    </button>
                  )}
                </div>
              </div>

              {certificate.metadata_url && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={certificate.metadata_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                  >
                    View NFT Metadata
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificateGallery;