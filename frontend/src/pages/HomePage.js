import React, { useState } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeaturedDestinations from '../components/FeaturedDestinations';
import RegionsSection from '../components/RegionsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ArticlesSection from '../components/ArticlesSection';
import PlanTripSection from '../components/PlanTripSection';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedDestinations />
      <PlanTripSection />
      <RegionsSection />
      <ArticlesSection />
      <TestimonialsSection />
      <Footer />
      <ChatBot />
    </div>
  );
};

export default HomePage;