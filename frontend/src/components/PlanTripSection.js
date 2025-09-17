import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useTranslation } from '../hooks/useTranslation';
import { destinations } from '../data/mock';
import { Calendar, Users, MapPin, Star } from 'lucide-react';

const PlanTripSection = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showRecommendation, setShowRecommendation] = useState(false);
  const { t } = useTranslation();

  const questions = [
    {
      id: 'activity',
      question: t('quizQuestions.activity'),
      options: [
        { value: 'nature', label: t('quizOptions.nature') },
        { value: 'culture', label: t('quizOptions.culture') },
        { value: 'adventure', label: t('quizOptions.adventure') },
        { value: 'relaxation', label: t('quizOptions.relaxation') }
      ]
    },
    {
      id: 'duration',
      question: t('quizQuestions.duration'),
      options: [
        { value: '2-3', label: t('quizOptions.2-3') },
        { value: '4-5', label: t('quizOptions.4-5') },
        { value: '6-7', label: t('quizOptions.6-7') },
        { value: '7+', label: t('quizOptions.7+') }
      ]
    },
    {
      id: 'group',
      question: t('quizQuestions.group'),
      options: [
        { value: 'solo', label: t('quizOptions.solo') },
        { value: 'couple', label: t('quizOptions.couple') },
        { value: 'family', label: t('quizOptions.family') },
        { value: 'friends', label: t('quizOptions.friends') }
      ]
    }
  ];

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowRecommendation(true);
    }
  };

  const getRecommendation = () => {
    const { activity } = answers;
    
    switch (activity) {
      case 'nature':
        return destinations.filter(d => d.category === 'Nature' || d.category === 'Hill Station');
      case 'culture':
        return destinations.filter(d => d.category === 'Religious' || d.category === 'City');
      case 'adventure':
        return destinations.filter(d => d.category === 'Wildlife' || d.category === 'Nature');
      case 'relaxation':
        return destinations.filter(d => d.category === 'Nature' || d.category === 'Hill Station');
      default:
        return destinations.slice(0, 3);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowRecommendation(false);
  };

  if (showRecommendation) {
    const recommendations = getRecommendation();
    
    return (
      <section id="plan-trip-section" className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('recommendationTitle')}
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t('recommendationSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {recommendations.slice(0, 3).map((destination) => (
              <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={destination.image_url}
                    alt={destination.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm">{destination.rating}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{destination.name}</h3>
                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{destination.location}</span>
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {destination.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {destination.highlights.slice(0, 2).map((highlight, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button onClick={resetQuiz} variant="outline" className="mr-4">
              {t('takeQuizAgain')}
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              {t('viewAllDestinations')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="plan-trip-section" className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('planTripTitle')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('planTripSubtitle')}
            </p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardContent className="p-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    {t('questionOf', { current: currentQuestion + 1, total: questions.length })}
                  </span>
                  <div className="flex space-x-2">
                    {questions.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index <= currentQuestion ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold mb-6">
                {questions[currentQuestion].question}
              </h3>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    className="w-full text-left justify-start p-4 h-auto hover:bg-green-50 hover:border-green-300"
                    onClick={() => handleAnswer(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PlanTripSection;