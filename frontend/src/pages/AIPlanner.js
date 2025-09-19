import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated, useTrail, config } from '@react-spring/web';
import { Canvas } from '@react-three/fiber';
import { Float, Text3D, OrbitControls, Sphere, MeshDistortMaterial, Box } from '@react-three/drei';
import { useInView } from 'react-intersection-observer';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { MapPin, Calendar, Users, IndianRupee, Sparkles, Download, Clock, MapIcon, CheckCircle, TrendingUp, Camera, Utensils, Mountain, Play, Pause, RotateCcw } from 'lucide-react';
import { aiAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// 3D Globe Component
const FloatingGlobe = ({ position = [0, 0, 0] }) => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <Sphere args={[1, 32, 32]} position={position}>
        <MeshDistortMaterial
          color="#22c55e"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.4}
        />
      </Sphere>
    </Float>
  );
};

// 3D Scene Component
const Scene3D = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <FloatingGlobe position={[0, 0, 0]} />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
    </Canvas>
  );
};

// Enhanced Timeline Component
const TimelineDay = ({ day, index, isLast }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const slideIn = useSpring({
    from: { opacity: 0, transform: 'translateX(-50px)' },
    to: { opacity: inView ? 1 : 0, transform: inView ? 'translateX(0px)' : 'translateX(-50px)' },
    delay: index * 200,
    config: config.gentle
  });

  const expandAnimation = useSpring({
    height: isExpanded ? 'auto' : '200px',
    config: config.gentle
  });

  return (
    <animated.div ref={ref} style={slideIn} className="relative">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative pl-8 pb-8"
      >
        {/* Timeline Line */}
        {!isLast && (
          <div className="absolute left-6 top-12 w-0.5 h-full bg-gradient-to-b from-green-400 to-blue-400 rounded-full" />
        )}
        
        {/* Timeline Dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.2, type: "spring" }}
          className="absolute left-4 top-8 w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full border-4 border-white shadow-lg z-10"
        />

        {/* Day Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-green-100 overflow-hidden ml-4"
        >
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6" />
                <h3 className="text-xl font-bold">{day.title}</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 bg-white/20 rounded-full"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Play className="h-4 w-4" />
                </motion.div>
              </motion.button>
            </div>
          </div>

          <animated.div style={expandAnimation} className="overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">{day.time || 'Full Day'}</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-600">
                  <MapIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{day.location || 'Multiple Locations'}</span>
                </div>
              </div>

              <div className="prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-green-700 bg-green-50 px-1 rounded">{children}</strong>,
                    ul: ({ children }) => <ul className="list-none space-y-2 mb-4">{children}</ul>,
                    li: ({ children }) => (
                      <motion.li
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start space-x-2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{children}</span>
                      </motion.li>
                    ),
                  }}
                >
                  {day.content}
                </ReactMarkdown>
              </div>

              {day.activities && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                    Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {day.activities.map((activity, i) => (
                      <motion.span
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 text-xs rounded-full border border-yellow-200"
                      >
                        {activity}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </animated.div>
        </motion.div>
      </motion.div>
    </animated.div>
  );
};

// Interactive Stats Component
const StatCard = ({ icon: Icon, title, value, color, delay = 0 }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const props = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: inView ? 1 : 0, transform: inView ? 'translateY(0px)' : 'translateY(30px)' },
    delay,
    config: config.gentle
  });

  return (
    <animated.div ref={ref} style={props}>
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg border border-white/20 text-white`}
      >
        <div className="flex items-center justify-between mb-3">
          <Icon className="h-8 w-8" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-2 h-2 bg-white/50 rounded-full"
          />
        </div>
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </motion.div>
    </animated.div>
  );
};

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
  const [parsedItinerary, setParsedItinerary] = useState(null);
  const itineraryRef = useRef(null);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Parse itinerary content into structured data
  const parseItinerary = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    const days = [];
    let currentDay = null;
    let currentContent = '';

    for (let line of lines) {
      line = line.trim();
      
      // Check if line is a day header
      if (line.match(/^\*?\*?Day\s+\d+/i) || line.match(/^\d+\.\s*Day\s+\d+/i)) {
        // Save previous day
        if (currentDay) {
          currentDay.content = currentContent.trim();
          days.push(currentDay);
        }
        
        // Start new day
        const dayMatch = line.match(/Day\s+(\d+)[:\-\s]*(.*)/i);
        if (dayMatch) {
          const dayNumber = dayMatch[1];
          const dayTitle = dayMatch[2] || `Day ${dayNumber}`;
          
          currentDay = {
            number: parseInt(dayNumber),
            title: `Day ${dayNumber}${dayTitle ? ` - ${dayTitle.replace(/^\*+|\*+$/g, '').trim()}` : ''}`,
            content: '',
            activities: [],
            time: 'Full Day',
            location: 'Multiple Locations'
          };
          currentContent = '';
        }
      } else if (line && currentDay) {
        // Add content to current day
        currentContent += line + '\n';
        
        // Extract activities (lines that start with bullet points or dashes)
        if (line.match(/^[•\-\*]\s+(.+)/)) {
          const activity = line.replace(/^[•\-\*]\s+/, '').replace(/\*\*/g, '').trim();
          if (activity.length > 0 && activity.length < 50) {
            currentDay.activities.push(activity);
          }
        }
      }
    }

    // Add the last day
    if (currentDay) {
      currentDay.content = currentContent.trim();
      days.push(currentDay);
    }

    return {
      days: days.length > 0 ? days : [
        {
          number: 1,
          title: 'Your Adventure Begins',
          content: content,
          activities: ['Explore', 'Discover', 'Experience'],
          time: 'Full Day',
          location: 'Multiple Locations'
        }
      ],
      totalDays: days.length,
      highlights: days.reduce((acc, day) => [...acc, ...day.activities], []).slice(0, 6)
    };
  };

  // Update parsed itinerary when plan is generated
  useEffect(() => {
    if (generatedPlan?.content) {
      const parsed = parseItinerary(generatedPlan.content);
      setParsedItinerary(parsed);
    }
  }, [generatedPlan]);

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

  if (generatedPlan && parsedItinerary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        
        {/* Hero Section with 3D Elements */}
        <section className="relative py-20 overflow-hidden">
          {/* 3D Background */}
          <div className="absolute inset-0 w-full h-full">
            <Scene3D />
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 backdrop-blur-sm" />
          
          <div className="relative z-10 container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="flex items-center justify-center mb-8"
              >
                <div className="relative">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-full shadow-2xl">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full"
                  />
                </div>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                Your Dream Journey
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl text-white/90 max-w-3xl mx-auto mb-6"
              >
                ✨ Personalized adventure through <span className="font-bold text-green-400">{generatedPlan.destination}</span>
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full border border-white/20"
              >
                <span className="text-green-400 font-semibold">🤖 Powered by Gemini AI</span>
                <div className="w-px h-4 bg-white/30" />
                <span className="text-blue-400 font-semibold">{parsedItinerary.totalDays} Days Adventure</span>
              </motion.div>
            </motion.div>

            {/* Interactive Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <StatCard
                icon={Calendar}
                title="Duration"
                value={`${generatedPlan.days} Days`}
                color="from-blue-500 to-indigo-600"
                delay={100}
              />
              <StatCard
                icon={IndianRupee}
                title="Budget"
                value={`₹${(generatedPlan.budget / 1000).toFixed(0)}K`}
                color="from-green-500 to-emerald-600"
                delay={200}
              />
              <StatCard
                icon={MapPin}
                title="Destinations"
                value={generatedPlan.destination.split(',').length}
                color="from-purple-500 to-pink-600"
                delay={300}
              />
              <StatCard
                icon={TrendingUp}
                title="Activities"
                value={parsedItinerary.highlights.length}
                color="from-orange-500 to-red-600"
                delay={400}
              />
            </div>
          </div>
        </section>

        {/* Enhanced Timeline Section */}
        <section ref={itineraryRef} className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative">
          {/* Floating Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 5 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`absolute w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20`}
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${10 + i * 20}%`,
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Your Day-by-Day Adventure
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover amazing experiences crafted just for you
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {/* Timeline */}
              <div className="space-y-8">
                {parsedItinerary.days.map((day, index) => (
                  <TimelineDay
                    key={day.number}
                    day={day}
                    index={index}
                    isLast={index === parsedItinerary.days.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Action Section */}
        <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Ready to Begin Your Adventure?
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => {
                      setGeneratedPlan(null);
                      setParsedItinerary(null);
                    }}
                    variant="outline" 
                    className="px-8 py-4 text-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 rounded-full"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Plan Another Trip
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={downloadItineraryPDF}
                    disabled={isDownloading}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-8 py-4 text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 rounded-full text-white border-0"
                  >
                    {isDownloading ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Download className="h-5 w-5 mr-2" />
                        </motion.div>
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        Download Itinerary
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/70 mt-8 text-lg"
              >
                💎 Your personalized journey awaits - save it and make memories!
              </motion.p>
            </motion.div>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0 w-full h-full opacity-30">
          <Scene3D />
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm" />
        
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="relative">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-full shadow-2xl">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                />
              </div>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              AI Travel Planner
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-8"
            >
              Create your perfect Jharkhand adventure with AI-powered personalization
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center space-x-6 text-sm text-white/60"
            >
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Sparkles className="h-4 w-4 mr-2 text-green-400" />
                <span>Powered by Gemini AI</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                <span>Personalized for Jharkhand</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -30, 0],
                x: [0, 10, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20`}
              style={{
                left: `${10 + i * 10}%`,
                top: `${5 + i * 10}%`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="max-w-6xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="p-10 space-y-12">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                      Plan Your Perfect Adventure
                    </h2>
                    <p className="text-gray-600 text-lg">Tell us your preferences and we'll create a magical journey for you</p>
                  </motion.div>

                  {/* Destination Input */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl border border-green-100 shadow-lg"
                  >
                    <Label className="text-2xl font-bold mb-6 block flex items-center text-gray-800">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <MapPin className="h-7 w-7 mr-3 text-green-600" />
                      </motion.div>
                      Where Would You Like to Go?
                    </Label>
                    <p className="text-gray-600 mb-8 text-lg">Select your dream destinations in Jharkhand</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {jharkhandDestinations.map((destination, index) => (
                        <motion.div
                          key={destination}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge
                            variant={formData.destinations.includes(destination) ? "default" : "outline"}
                            className={`cursor-pointer p-5 text-center justify-center transition-all duration-300 rounded-xl font-medium ${
                              formData.destinations.includes(destination)
                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl shadow-green-500/25 border-green-500'
                                : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:border-green-300 hover:shadow-lg'
                            }`}
                            onClick={() => handleDestinationChange(destination)}
                          >
                            {destination}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                    
                    <AnimatePresence>
                      {error && error.includes('destination') && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-500 text-sm mt-4 bg-red-50 p-3 rounded-lg border border-red-200"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Duration, Budget, Group Size */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100 shadow-lg"
                  >
                    <Label className="text-2xl font-bold mb-6 block flex items-center text-gray-800">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Calendar className="h-7 w-7 mr-3 text-blue-600" />
                      </motion.div>
                      Trip Details
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  </motion.div>

                  {/* Travel Style */}
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 shadow-lg"
                  >
                    <Label className="text-2xl font-bold mb-6 block flex items-center text-gray-800">
                      <motion.div
                        animate={{ rotateY: [0, 180, 360] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Users className="h-7 w-7 mr-3 text-purple-600" />
                      </motion.div>
                      Travel Style
                    </Label>
                    <p className="text-gray-600 mb-8 text-lg">How do you like to travel?</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {travelStyles.map((style, index) => (
                        <motion.div
                          key={style.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-8 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                            formData.travelStyle === style.id
                              ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl shadow-purple-500/25'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-25 hover:to-pink-25 hover:shadow-lg'
                          }`}
                          onClick={() => setFormData(prev => ({ ...prev, travelStyle: style.id }))}
                        >
                          <h4 className="font-bold text-xl mb-3 text-gray-800">{style.title}</h4>
                          <p className="text-gray-600">{style.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Interests */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-100 shadow-lg"
                  >
                    <Label className="text-2xl font-bold mb-6 block flex items-center text-gray-800">
                      <motion.div
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        <Sparkles className="h-7 w-7 mr-3 text-orange-600" />
                      </motion.div>
                      What Interests You?
                    </Label>
                    <p className="text-gray-600 mb-8 text-lg">Choose your favorite activities and experiences</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {interestOptions.map((interest, index) => (
                        <motion.div
                          key={interest}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge
                            variant={formData.interests.includes(interest) ? "default" : "outline"}
                            className={`cursor-pointer p-5 text-center justify-center transition-all duration-300 rounded-xl font-medium ${
                              formData.interests.includes(interest)
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl shadow-orange-500/25'
                                : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:border-orange-300 hover:shadow-lg'
                            }`}
                            onClick={() => handleInterestToggle(interest)}
                          >
                            {interest}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Error Display */}
                  <AnimatePresence>
                    {error && !error.includes('destination') && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg"
                      >
                        <p className="text-red-700 font-medium">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Generate Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center pt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-12 rounded-2xl border border-indigo-100 shadow-lg"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={generateItinerary}
                        disabled={isGenerating || !user}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-16 py-6 text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 border-0"
                      >
                        {isGenerating ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles className="h-7 w-7 mr-4" />
                            </motion.div>
                            Crafting Your Adventure...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-7 w-7 mr-4" />
                            Create My Journey
                          </>
                        )}
                      </Button>
                    </motion.div>
                    
                    <AnimatePresence>
                      {!isGenerating && user && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="mt-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl inline-block shadow-lg border border-white/50"
                        >
                          <p className="text-gray-700 text-lg">
                            ✨ Powered by <strong className="text-green-600">Gemini AI</strong> - Your personalized adventure in ~30 seconds
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                      {!user && (
                        <motion.p
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="text-red-600 mt-6 bg-red-50 p-4 rounded-2xl inline-block border border-red-200 font-medium text-lg"
                        >
                          🔐 Please log in to unlock the AI Planner
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AIPlanner;