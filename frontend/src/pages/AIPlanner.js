import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar, Users, IndianRupee, Sparkles, Download } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AIPlanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    destinations: [],
    duration: '',
    budget: '',
    groupSize: '',
    travelStyle: 'balanced',
    interests: []
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const travelStyles = [
    {
      id: 'relaxed',
      title: t('balanced'),
      description: 'Fewer activities, more leisure time'
    },
    {
      id: 'balanced',
      title: t('balanced'),
      description: 'Mix of activities and relaxation'
    },
    {
      id: 'packed',
      title: t('luxury'),
      description: 'Maximum activities and experiences'
    }
  ];

  const interestOptions = [
    t('adventureActivities'),
    t('culturalSites'),
    t('natureWildlife'),
    'Photography',
    'Food & Cuisine',
    'Shopping',
    'Nightlife',
    t('religiousSites'),
    'Museums',
    'Beaches',
    'Mountains',
    'Historical Places'
  ];

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleDestinationChange = (destination) => {
    setFormData(prev => ({
      ...prev,
      destinations: prev.destinations.includes(destination)
        ? prev.destinations.filter(d => d !== destination)
        : [...prev.destinations, destination]
    }));
  };

  const downloadItineraryPDF = async () => {
    if (!generatedPlan) return;
    
    setIsDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      // Header with beautiful styling
      pdf.setFillColor(34, 197, 94); // Green background
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      pdf.setTextColor(255, 255, 255); // White text
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Jharkhand Tourism', margin, 25);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'normal');
      pdf.text('AI Generated Itinerary', margin, 38);
      
      // Reset text color for content
      pdf.setTextColor(0, 0, 0);
      
      // Trip Summary Box
      pdf.setFillColor(248, 250, 252); // Light gray background
      pdf.roundedRect(margin, 60, maxWidth, 35, 3, 3, 'F');
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Trip Summary:', margin + 5, 75);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.text(`📍 Destination: ${generatedPlan.destination}`, margin + 5, 85);
      pdf.text(`📅 Duration: ${generatedPlan.days} days`, margin + 5, 92);
      pdf.text(`💰 Budget: ₹${generatedPlan.budget?.toLocaleString()}`, margin + 100, 85);
      pdf.text(`📝 Generated: ${new Date().toLocaleDateString()}`, margin + 100, 92);
      
      // Parse and format markdown content
      let yPosition = 110;
      const content = generatedPlan.content;
      const contentLines = content.split('\n');
      
      for (let line of contentLines) {
        if (yPosition > pageHeight - margin - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        
        line = line.trim();
        if (!line) {
          yPosition += 6;
          continue;
        }
        
        // Handle different markdown elements
        if (line.startsWith('**') && line.endsWith('**')) {
          // Bold headers (Day headers)
          const cleanLine = line.replace(/\*\*/g, '');
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(34, 197, 94); // Green color for headers
          yPosition += 8;
          pdf.text(cleanLine, margin, yPosition);
          yPosition += 8;
          pdf.setTextColor(0, 0, 0); // Reset to black
        } else if (line.startsWith('• ') || line.startsWith('- ')) {
          // Bullet points
          const cleanLine = line.replace(/^[•-]\s*/, '').replace(/\*\*/g, '');
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const bullet = '• ';
          const bulletLines = pdf.splitTextToSize(bullet + cleanLine, maxWidth - 10);
          
          for (let bLine of bulletLines) {
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(bLine, margin + 5, yPosition);
            yPosition += 5;
          }
        } else if (line.includes('**') && !line.startsWith('**')) {
          // Mixed bold text within content
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          // Simple bold text handling for mixed content
          const cleanLine = line.replace(/\*\*(.*?)\*\*/g, '$1');
          const textLines = pdf.splitTextToSize(cleanLine, maxWidth);
          
          for (let tLine of textLines) {
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(tLine, margin, yPosition);
            yPosition += 5;
          }
        } else {
          // Regular text
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const textLines = pdf.splitTextToSize(line, maxWidth);
          
          for (let tLine of textLines) {
            if (yPosition > pageHeight - margin - 20) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(tLine, margin, yPosition);
            yPosition += 5;
          }
        }
      }
      
      // Beautiful footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Footer background
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 8);
        pdf.text('Generated by Jharkhand Tourism AI Planner', margin, pageHeight - 8);
      }
      
      pdf.save(`jharkhand-itinerary-${generatedPlan.destination.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const jharkhandDestinations = [
    'Ranchi', 'Netarhat', 'Betla National Park', 'Parasnath Hill',
    'Deoghar', 'Hazaribagh', 'Jamshedpur', 'Dassam Falls',
    'Hundru Falls', 'Jonha Falls', 'Rajrappa Temple'
  ];

  const generateItinerary = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (formData.destinations.length === 0) {
      setError(t('noResultsFound'));
      return;
    }

    // Validate budget - extract numeric value and ensure it's valid
    const budgetMatch = formData.budget?.match(/[₹]?([0-9,]+)/);
    const budgetAmount = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : 15000;
    
    if (isNaN(budgetAmount) || budgetAmount < 5000) {
      setError('Please enter a valid budget amount (minimum ₹5,000)');
      return;
    }

    // Validate duration
    const daysMatch = formData.duration?.match(/(\d+)/);
    const days = daysMatch ? parseInt(daysMatch[1]) : 3;
    
    if (isNaN(days) || days < 1 || days > 30) {
      setError('Please enter a valid duration (1-30 days)');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Prepare preferences for Gemini API
      const preferences = {
        destinations: formData.destinations,
        budget: budgetAmount,
        days: days,
        interests: formData.interests,
        travel_style: formData.travelStyle,
        group_size: parseInt(formData.groupSize?.split(' ')[0] || '2')
      };

      const result = await aiAPI.generateItinerary(preferences);
      setGeneratedPlan(result);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      setError(error.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 min-h-screen">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-8">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-full shadow-lg">
                  <Sparkles className="h-12 w-12 text-white animate-pulse" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {t('yourPersonalizedItinerary')}
              </h1>
              <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
                ✨ Personalized travel plan for <span className="font-bold text-green-600">{generatedPlan.destination}</span>
              </p>
              <div className="mt-6 inline-block bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                <span className="text-green-600 font-semibold">🤖 Generated by Gemini AI</span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Trip Summary */}
              <Card className="mb-10 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Overview</h2>
                    <p className="text-gray-600">Your personalized travel details</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex justify-center mb-4">
                        <Calendar className="h-12 w-12 text-blue-600" />
                      </div>
                      <p className="font-bold text-lg text-gray-800 mb-1">{t('duration')}</p>
                      <p className="text-2xl font-bold text-blue-600">{generatedPlan.days} {t('days')}</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="flex justify-center mb-4">
                        <IndianRupee className="h-12 w-12 text-green-600" />
                      </div>
                      <p className="font-bold text-lg text-gray-800 mb-1">Total {t('budget')}</p>
                      <p className="text-2xl font-bold text-green-600">₹{generatedPlan.budget?.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
                      <div className="flex justify-center mb-4">
                        <MapPin className="h-12 w-12 text-red-600" />
                      </div>
                      <p className="font-bold text-lg text-gray-800 mb-1">{t('destinations')}</p>
                      <p className="text-xl font-bold text-red-600">{generatedPlan.destination}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Generated Content */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-2xl">
                    <Sparkles className="h-8 w-8 mr-3 text-white animate-pulse" />
                    {t('yourPersonalizedItinerary')}
                  </CardTitle>
                  <p className="text-green-100 mt-2">Detailed day-by-day travel plan created just for you</p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-3xl font-bold text-green-700 mb-6 mt-8 first:mt-0 pb-2 border-b-2 border-green-200">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-bold text-blue-700 mb-4 mt-6 pb-1 border-b border-blue-200">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-semibold text-purple-700 mb-3 mt-5">{children}</h3>,
                        p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4 text-lg">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-gray-900 bg-yellow-100 px-1 rounded">{children}</strong>,
                        em: ({ children }) => <em className="italic text-blue-600 font-medium">{children}</em>,
                        ul: ({ children }) => <ul className="list-none pl-0 mb-6 space-y-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-2">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-700 flex items-start"><span className="text-green-500 mr-2 text-xl">•</span><span className="flex-1">{children}</span></li>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-green-500 pl-6 py-4 my-6 bg-gradient-to-r from-green-50 to-blue-50 text-gray-700 italic rounded-r-lg">{children}</blockquote>,
                        code: ({ children }) => <code className="bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1 rounded-lg text-sm font-mono text-gray-800 border">{children}</code>,
                        table: ({ children }) => <table className="w-full border-collapse border border-gray-300 mb-6 rounded-lg overflow-hidden shadow-sm">{children}</table>,
                        th: ({ children }) => <th className="border border-gray-300 px-4 py-3 bg-gradient-to-r from-green-100 to-blue-100 font-bold text-gray-800">{children}</th>,
                        td: ({ children }) => <td className="border border-gray-300 px-4 py-3 text-gray-700">{children}</td>,
                      }}
                    >
                      {generatedPlan.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Ready to explore Jharkhand?</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button 
                    onClick={() => setGeneratedPlan(null)}
                    variant="outline" 
                    className="px-8 py-3 text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t('planAnotherTrip')}
                  </Button>
                  <Button 
                    onClick={downloadItineraryPDF}
                    disabled={isDownloading}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isDownloading ? (
                      <>
                        <Download className="h-5 w-5 mr-2 animate-spin" />
                        {t('downloadingPdf')}
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        {t('downloadPdf')}
                      </>
                    )}
                  </Button>
                  
                </div>
                <p className="text-gray-600 mt-4">
                  💡 Save your itinerary as PDF or book your perfect Jharkhand adventure now!
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-full shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {t('aiTravelPlanner')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('planPerfectTrip')}
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-1 text-green-500" />
                <span>Powered by Gemini AI</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                <span>Personalized for Jharkhand</span>
              </div>
            </div>
          </div>

          <Card className="max-w-5xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-10">
              <div className="space-y-10">
                {/* Destination Input */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
                  <Label className="text-xl font-bold mb-4 block flex items-center">
                    <MapPin className="h-6 w-6 mr-2 text-green-600" />
                    {t('whereWouldYouLike')}
                  </Label>
                  <p className="text-gray-600 mb-6">{t('selectDestinations')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {jharkhandDestinations.map((destination) => (
                      <Badge
                        key={destination}
                        variant={formData.destinations.includes(destination) ? "default" : "outline"}
                        className={`cursor-pointer p-4 text-center justify-center transition-all duration-200 hover:scale-105 ${
                          formData.destinations.includes(destination)
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                            : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:border-green-300'
                        }`}
                        onClick={() => handleDestinationChange(destination)}
                      >
                        {destination}
                      </Badge>
                    ))}
                  </div>
                  {error && error.includes('destination') && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>

                {/* Duration, Budget, Group Size */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                  <Label className="text-xl font-bold mb-6 block flex items-center">
                    <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                    Trip Details
                  </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-base font-medium mb-2 block">{t('howManyDays')}</Label>
                    <div className="space-y-2">
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={`3 ${t('days')}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2 days">2 {t('days')}</SelectItem>
                          <SelectItem value="3 days">3 {t('days')}</SelectItem>
                          <SelectItem value="5 days">5 {t('days')}</SelectItem>
                          <SelectItem value="7 days">7 {t('days')}</SelectItem>
                          <SelectItem value="10 days">10 {t('days')}</SelectItem>
                          <SelectItem value="14 days">14 {t('days')}</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.duration === 'custom' && (
                        <Input
                          type="number"
                          min="1"
                          max="30"
                          placeholder={t('enterNumberOfDays')}
                          onChange={(e) => {
                            const days = parseInt(e.target.value);
                            if (days >= 1 && days <= 30) {
                              setFormData(prev => ({ ...prev, duration: `${days} days` }));
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-2 block">{t('budgetRange')}</Label>
                    <div className="space-y-2">
                      <Select onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="₹25,000 - Standard" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="₹15,000 - Budget">₹15,000 - {t('budget')}</SelectItem>
                          <SelectItem value="₹25,000 - Standard">₹25,000 - Standard</SelectItem>
                          <SelectItem value="₹50,000 - Premium">₹50,000 - Premium</SelectItem>
                          <SelectItem value="₹75,000 - Luxury">₹75,000 - {t('luxury')}</SelectItem>
                          <SelectItem value="₹1,00,000+ - Ultra Luxury">₹1,00,000+ - Ultra {t('luxury')}</SelectItem>
                          <SelectItem value="custom">Custom Amount</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.budget === 'custom' && (
                        <Input
                          type="number"
                          min="5000"
                          max="5000000"
                          placeholder="Enter budget amount (₹5,000 - ₹50,00,000)"
                          onChange={(e) => {
                            const amount = parseInt(e.target.value);
                            if (amount >= 5000 && amount <= 5000000) {
                              setFormData(prev => ({ ...prev, budget: `₹${amount.toLocaleString()} - Custom` }));
                            }
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-2 block">{t('groupSize')}</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, groupSize: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={`2 ${t('persons')}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 person">1 {t('person')}</SelectItem>
                        <SelectItem value="2 persons">2 {t('persons')}</SelectItem>
                        <SelectItem value="3-4 persons">3-4 {t('persons')}</SelectItem>
                        <SelectItem value="5-6 persons">5-6 {t('persons')}</SelectItem>
                        <SelectItem value="7+ persons">7+ {t('persons')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                </div>

                {/* Travel Style */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                  <Label className="text-xl font-bold mb-4 block flex items-center">
                    <Users className="h-6 w-6 mr-2 text-purple-600" />
                    {t('travelStyle')}
                  </Label>
                  <p className="text-gray-600 mb-6">{t('selectTravelStyle')}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {travelStyles.map((style) => (
                      <div
                        key={style.id}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                          formData.travelStyle === style.id
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-25 hover:to-pink-25'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, travelStyle: style.id }))}
                      >
                        <h4 className="font-bold text-lg mb-2 text-gray-800">{style.title}</h4>
                        <p className="text-gray-600">{style.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                  <Label className="text-xl font-bold mb-4 block flex items-center">
                    <Sparkles className="h-6 w-6 mr-2 text-orange-600" />
                    {t('whatInterestsYou')}
                  </Label>
                  <p className="text-gray-600 mb-6">{t('selectInterests')}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {interestOptions.map((interest) => (
                      <Badge
                        key={interest}
                        variant={formData.interests.includes(interest) ? "default" : "outline"}
                        className={`cursor-pointer p-4 text-center justify-center transition-all duration-200 hover:scale-105 ${
                          formData.interests.includes(interest)
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
                            : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:border-orange-300'
                        }`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {error && !error.includes('destination') && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {/* Generate Button */}
                <div className="text-center pt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-xl border border-indigo-100">
                  <Button
                    onClick={generateItinerary}
                    disabled={isGenerating || !user}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-12 py-4 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="h-6 w-6 mr-3 animate-spin" />
                        {t('generatingItinerary')}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-6 w-6 mr-3" />
                        {t('generateItinerary')}
                      </>
                    )}
                  </Button>
                  {!isGenerating && user && (
                    <div className="mt-6 bg-white/70 backdrop-blur-sm p-4 rounded-lg inline-block">
                      <p className="text-sm text-gray-600">
                        ✨ Powered by <strong>Gemini AI</strong> - Creating your personalized plan in ~30 seconds
                      </p>
                    </div>
                  )}
                  {!user && (
                    <p className="text-sm text-red-500 mt-4 bg-red-50 p-3 rounded-lg inline-block">
                      🔐 Please log in to use the AI Planner
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AIPlanner;