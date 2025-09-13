import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <MapPin className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">
                {t('ExploreJharkhand')}
              </span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              {t('footerDescription')}
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('quickLinks')}</h3>
            <ul className="space-y-3">
              <li><Link to="/destinations" className="text-gray-300 hover:text-white transition-colors">{t('destinations')}</Link></li>
              <li><Link to="/providers" className="text-gray-300 hover:text-white transition-colors">{t('thingsToDo')}</Link></li>
              <li><Link to="/travel-tips" className="text-gray-300 hover:text-white transition-colors">{t('travelTips')}</Link></li>
              <li><Link to="/about-us" className="text-gray-300 hover:text-white transition-colors">{t('aboutUs')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('support')}</h3>
            <ul className="space-y-3">
              <li><Link to="/help" className="text-gray-300 hover:text-white transition-colors">{t('helpCenter')}</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">{t('contactUs')}</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-white transition-colors">{t('privacyPolicy')}</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-white transition-colors">{t('termsOfService')}</Link></li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 {t('visitJharkhand')}. {t('allRightsReserved')}.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">
            {t('footerTagline')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;