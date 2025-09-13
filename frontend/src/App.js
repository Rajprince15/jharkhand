import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DestinationsPage from "./pages/DestinationsPage";
import ProvidersPage from "./pages/ProvidersPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import TouristDashboard from "./pages/TouristDashboard";
import AIPlanner from "./pages/AIPlanner";
import BookingsPage from "./pages/BookingsPage";
import WishlistPage from "./pages/WishlistPage";
import AddServicePage from "./pages/AddServicePage";
import ProviderBookingsPage from "./pages/ProviderBookingsPage";
import DestinationDetailPage from "./pages/DestinationDetailPage";
import MapPage from "./pages/MapPage";
import SustainableTripPage from "./pages/SustainableTripPage";
import PracticalTipsPage from "./pages/PracticalTipsPage";
import AboutUsPage from "./pages/AboutUsPage";
import BookingPage from "./pages/BookingPage";
import { Toaster } from "./components/ui/toaster";
function App() {
  return (
    <div className="App">
       <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/destinations" element={<DestinationsPage />} />
              <Route path="/providers" element={<ProvidersPage />} />
              <Route path="/ai-planner" element={<AIPlanner />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/provider-dashboard" element={<ProviderDashboard />} />
              <Route path="/tourist-dashboard" element={<TouristDashboard />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/add-service" element={<AddServicePage />} />
              <Route path="/provider-bookings" element={<ProviderBookingsPage />} />
              <Route path="/destination/:id" element={<DestinationDetailPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/sustainable-trip" element={<SustainableTripPage />} />
              <Route path="/practical-tips" element={<PracticalTipsPage />} />
              <Route path="/travel-tips" element={<PracticalTipsPage />} />
              <Route path="/about-us" element={<AboutUsPage />} />
              <Route path="/booking" element={<BookingPage />} />
            </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
       </LanguageProvider>
      
    </div>
  );
}

export default App;
