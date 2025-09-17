import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { providers } from '../data/mock';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, MapPin, Phone, IndianRupee } from 'lucide-react';
import { Button } from '../components/ui/button';

const ProvidersPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Local Service Providers
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Connect with experienced local guides, transport services, and activity providers 
              to make your Jharkhand experience authentic and memorable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((provider) => (
              <Card 
                key={provider.id}
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={provider.image_url}
                    alt={provider.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-blue-600 text-white capitalize">
                      {provider.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">{provider.rating}</span>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {provider.name}
                  </h3>
                  
                  <p className="text-lg font-semibold text-green-600 mb-2">
                    {provider.service_name}
                  </p>
                  
                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{provider.location}</span>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 text-sm">
                    {provider.description}
                  </p>
                  
                  <div className="flex items-center text-muted-foreground mb-4">
                    <Phone className="h-4 w-4 mr-2" />
                    <span className="text-sm">{provider.contact}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-green-600 font-bold">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span>{provider.price.toLocaleString('en-IN')}</span>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ProvidersPage;