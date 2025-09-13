import React from 'react';
import { featuredArticles } from '../data/mock';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const ArticlesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Latest travel stories and tips from Jharkhand
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Dive into inspiring travel articles, practical tips, and local recommendations 
            from across Jharkhand to make your trip unforgettable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredArticles.map((article) => (
            <Card key={article.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-600 text-white">
                    {article.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {article.excerpt}
                </p>
                <button className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline transition-colors">
                  Read more →
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;