import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, Heart, Users, MapPin, Leaf, Award, Globe } from 'lucide-react';

const AboutUsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t('aboutUs')}
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Discover our passion for sustainable tourism and preserving Jharkhand's natural beauty
            </p>
            <Link to="/">
              <Button variant="outline" className="text-white border-white hover:bg-white hover:text-green-600">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToHome')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Our Mission */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We are dedicated to promoting sustainable tourism in Jharkhand while preserving its rich cultural heritage 
              and pristine natural environment for future generations. Our platform connects travelers with authentic 
              experiences and responsible travel options.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Sustainability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We promote eco-friendly travel practices that protect Jharkhand's natural ecosystems 
                  and support local communities.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Cultural Respect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We honor and celebrate the rich tribal heritage and traditions of Jharkhand's 
                  indigenous communities.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We work directly with local guides, artisans, and service providers to ensure 
                  tourism benefits reach the grassroots level.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What We Offer */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-6 w-6 mr-3 text-green-600" />
                  Curated Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Handpicked destinations showcasing Jharkhand's pristine waterfalls, wildlife sanctuaries, 
                  and cultural sites.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-3 text-green-600" />
                  Local Guides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Experienced local guides who share authentic stories and ensure respectful 
                  interaction with communities.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-6 w-6 mr-3 text-green-600" />
                  Eco-Tourism
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sustainable accommodation options and eco-friendly activities that minimize 
                  environmental impact.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-6 w-6 mr-3 text-green-600" />
                  Cultural Experiences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Immersive experiences in tribal villages, traditional festivals, and 
                  handicraft workshops.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-6 w-6 mr-3 text-green-600" />
                  Quality Assurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Verified service providers and quality-checked experiences to ensure 
                  memorable and safe travel.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-6 w-6 mr-3 text-green-600" />
                  Digital Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  User-friendly platform with AI-powered trip planning and multilingual 
                  support for global travelers.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Our Impact */}
        <section className="mb-16">
          <div className="bg-green-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <p className="text-gray-600">Happy Travelers</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                <p className="text-gray-600">Local Partners</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">25+</div>
                <p className="text-gray-600">Destinations Covered</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">₹10L+</div>
                <p className="text-gray-600">Community Revenue</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Be part of our mission to promote responsible tourism in Jharkhand. Together, we can 
            preserve this beautiful state for generations to come.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/destinations">
              <Button className="bg-green-600 hover:bg-green-700">
                Explore Destinations
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline">
                {t('contactUs')}
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUsPage;