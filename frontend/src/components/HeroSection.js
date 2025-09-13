import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { heroVideoUrl } from '../data/mock';

const link = document.createElement('link');
link.href = 'https://fonts.cdnfonts.com/css/isidora-soft-alt';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Optionally apply it
document.body.style.fontFamily = "'Isidora', sans-serif";



const HeroSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <video
          src="/lele.mp4"   // put your file in public/hero.mp4
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-family:Isidora lg:text-7xl font-bold mb-6 leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
            {t('heroSubtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
            
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                window.location.href = "/destinations"; // 🔗 change this URL
              }}
            >
              {t('exploreDestinations')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-sm md:text-base text-gray-300">Tourist Places</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">32</div>
              <div className="text-sm md:text-base text-gray-300">Tribal Communities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">15+</div>
              <div className="text-sm md:text-base text-gray-300">Major Parks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">70+</div>
              <div className="text-sm md:text-base text-gray-300">Waterfalls</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
