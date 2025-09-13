import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './ui/button';
import { MapPin, Menu, X, User, LogOut } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'provider':
        return '/provider-dashboard';
      case 'tourist':
        return '/tourist-dashboard';
      default:
        return '/';
    }
  };

  const handlePracticalTips = () => {
    if (location.pathname === '/') {
      // If on home page, scroll to plan trip section
    const element = document.getElementById('plan-trip-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    } else {
      // If on other pages, navigate to practical tips page
      navigate('/practical-tips');
    }
  };
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <MapPin className="h-8 w-8 text-green-600" />
          <span className="text-2xl font-bold text-foreground">
            Explore Jharkhand
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/destinations"
            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
          >
            {t('placesToGo')}
          </Link>
          <Link
            to="/providers"
            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
          >
            {t('thingsToDo')}
          </Link>
          <button
            onClick={() => navigate('/practical-tips')}
            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
          >
            {t('practicalTips')}
          </button>

          <Link
            to="/ai-planner"
            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
          >
            {t('aiPlanner')}
          </Link>
          <Link
            to="/map"
            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
          >
            {t('map')}
          </Link>
          <Link
            to="/sustainable-trip"
            className="text-foreground/80 hover:text-foreground transition-colors font-medium"
          >
            {t('sustainableTrip')}
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          <LanguageToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                  <User className="mr-2 h-4 w-4" />
                  {t('dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/login')}>
              {t('login')}
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border/40">
          <nav className="flex flex-col space-y-4 p-4">
            <Link
              to="/destinations"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('placesToGo')}
            </Link>
            <Link
              to="/providers"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('thingsToDo')}
            </Link>
            <button
              onClick={() => {
                navigate('/practical-tips');
                setIsMenuOpen(false);
              }}
              className="text-foreground/80 hover:text-foreground transition-colors font-medium text-left"
            >
              {t('practicalTips')}
            </button>

            <Link
              to="/ai-planner"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('aiPlanner')}
            </Link>
            <Link
              to="/map"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('map')}
            </Link>
            <Link
              to="/sustainable-trip"
              className="text-foreground/80 hover:text-foreground transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('sustainableTrip')}
            </Link>
            <div className="pt-2">
              <LanguageToggle className="w-full justify-start" />
            </div>
            <hr className="border-border/40" />
            {user ? (
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    navigate(getDashboardRoute());
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  {t('dashboard')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
              >
                {t('login')}
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
