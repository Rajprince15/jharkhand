import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Leaf, 
  Users, 
  TreePine, 
  Droplets, 
  Home, 
  Bike, 
  Bus, 
  Shield,
  Heart,
  Camera,
  Map,
  ArrowRight,
  CheckCircle,
  Target
} from 'lucide-react';

const SustainableTripPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const mainSections = [
    {
      title: "Think Climate and Nature",
      subtitle: "Make use of sustainable ways to explore Jharkhand",
      description: "Getting around in Jharkhand offers many options. Choose eco-friendly transport, practice slow travel, and connect with nature responsibly.",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: TreePine,
      actionText: "Learn about sustainable transport",
      actionLink: "/practical-tips"
    },
    {
              title: "Have Respect for Heritage",
      subtitle: "Treat tribal communities and their culture with respect",
      description: "Living in harmony with nature is deep-rooted in Jharkhand's tribal culture. Preserve this beautiful heritage for generations by treating communities and traditions with respect.",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Users,
      actionText: "Discover tribal culture",
      actionLink: "/destinations"
    },
    {
      title: "Buy and Support Local",
      subtitle: "Eat local, seasonal food and support artisans",
      description: "The taste of Jharkhand can be found everywhere: fresh produce from fertile lands, tribal handicrafts, and traditional cuisine. Supporting local communities enhances your experience.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      icon: Heart,
      actionText: "Explore local experiences",
      actionLink: "/providers"
    }
  ];

  const pledgeItems = [
    "I will respect the natural environment and wildlife",
    "I will support local communities and businesses", 
    "I will learn about and respect tribal cultures",
    "I will minimize my environmental impact",
    "I will travel responsibly and sustainably"
  ];
    
      
    
    
  

  
return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Finnish Style */}
      <section className="relative h-[70vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Sustainable Travel"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-20">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl md:text-7xl font-light mb-4">
                Travel sustainably
              </h1>
              <p className="text-xl md:text-2xl font-light opacity-90">
                Make mindful choices as you explore Jharkhand
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Jharkhand Pledge */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <Target className="h-12 w-12 text-green-600" />
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-green-800 mb-4">
                      Sustainable Jharkhand Pledge
                    </h2>
                    <div className="space-y-3 mb-6">
                      {pledgeItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Take the pledge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Want to Know More Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12">Want to know more?</h2>
          
          <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/practical-tips')}>
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Sustainable travel tips"
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4">Sustainable travel tips</h3>
                <p className="text-gray-600 mb-6">
                  Experience Jharkhand to the fullest and leave nothing but footprints.
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  Learn more <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Sections */}
      {mainSections.map((section, index) => (
        <section key={index} className={`py-16 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-8">
              <section.icon className="h-8 w-8 text-green-600 mr-4" />
              <h2 className="text-3xl font-bold">{section.title}</h2>
            </div>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(section.actionLink)}>
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={section.image}
                    alt={section.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">{section.subtitle}</h3>
                  <p className="text-gray-600 mb-6">
                    {section.description}
                  </p>
                  <div className="flex items-center text-green-600 font-semibold">
                    {section.actionText} <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      ))}

      {/* Sustainability Impact Section */}
      <section className="py-16 bg-green-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Sustainability matters because we love to travel
            </h2>
            <div className="text-lg space-y-6 text-green-100">
              <p>
                Travelling is great. But for us to be able to continue exploring Jharkhand and learning about tribal cultures, we need to ensure that tourism is ecologically, socio-culturally and financially sound.
              </p>
              <p>
                In Jharkhand, these three aspects form the basis of our sustainability work. We believe it's our job to make mindful actions easier for everyone.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-center">
              <div>
                <TreePine className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Think climate and nature</h3>
                <p className="text-green-100 text-sm">
                  Use public transport, eat local, choose eco-friendly accommodations
                </p>
              </div>
              <div>
                <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Have respect for heritage</h3>
                <p className="text-green-100 text-sm">
                  Learn about tribal traditions, support local communities
                </p>
              </div>
              <div>
                <Heart className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Buy and support local</h3>
                <p className="text-green-100 text-sm">
                  Choose local products, eat seasonal food, support artisans
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
   

export default SustainableTripPage;