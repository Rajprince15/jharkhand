import os
import requests
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

class DeepseekService:
    def __init__(self):
        self.api_key = os.getenv('DEEPSEEK_API_KEY')
        self.base_url = os.getenv('DEEPSEEK_BASE_URL', 'https://api.deepseek.com')
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def generate_itinerary(self, user_preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate travel itinerary using Deepseek Reasoner model
        """
        try:
            # Prepare the prompt for itinerary generation
            prompt = self._create_itinerary_prompt(user_preferences)
            
            payload = {
                "model": "deepseek-reasoner",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert travel planner for Jharkhand, India. Generate detailed, practical itineraries with specific locations, timings, costs, and local insights. Always include authentic local experiences and respect for tribal culture."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2000,
                "temperature": 0.7
            }
            
            response = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._parse_itinerary_response(result, user_preferences)
            else:
                raise Exception(f"Deepseek API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"Error generating itinerary: {str(e)}")
            return self._generate_fallback_itinerary(user_preferences)
    
    def chat_response(self, user_message: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Generate chatbot response using Deepseek Chat model
        """
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful tourism assistant for Jharkhand, India. Provide accurate, friendly information about destinations, culture, travel tips, and bookings. Be concise but informative. Always promote sustainable and respectful tourism."
                }
            ]
            
            # Add conversation history if provided
            if conversation_history:
                messages.extend(conversation_history[-5:])  # Keep last 5 messages for context
            
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            payload = {
                "model": "deepseek-chat",
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.8
            }
            
            response = requests.post(
                f"{self.base_url}/v1/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "message": result['choices'][0]['message']['content'],
                    "timestamp": datetime.utcnow().isoformat(),
                    "model": "deepseek-chat"
                }
            else:
                raise Exception(f"Deepseek API error: {response.status_code}")
                
        except Exception as e:
            print(f"Error generating chat response: {str(e)}")
            return self._generate_fallback_chat_response(user_message)
    
    def _create_itinerary_prompt(self, preferences: Dict[str, Any]) -> str:
        """Create a detailed prompt for itinerary generation"""
        destinations = ', '.join(preferences.get('destinations', ['Ranchi']))
        budget = preferences.get('budget', 15000)
        days = preferences.get('days', 3)
        interests = ', '.join(preferences.get('interests', ['Sightseeing']))
        travel_style = preferences.get('travel_style', 'balanced')
        group_size = preferences.get('group_size', 2)
        
        return f"""
        Create a detailed {days}-day travel itinerary for Jharkhand, India with the following requirements:

        DESTINATIONS: {destinations}
        BUDGET: ₹{budget} total for {group_size} people
        INTERESTS: {interests}
        TRAVEL STYLE: {travel_style}
        GROUP SIZE: {group_size} people

        Please provide a structured response with:
        1. Day-by-day schedule with specific timings
        2. Recommended activities based on interests
        3. Estimated costs for each activity
        4. Local transportation suggestions
        5. Cultural etiquette tips for tribal areas
        6. Best local food recommendations
        7. Accommodation suggestions within budget

        Focus on authentic experiences, sustainable tourism practices, and respect for local communities.
        Include specific locations, contact information where possible, and practical tips.
        
        Format the response as a structured itinerary that can be easily parsed.
        """
    
    def _parse_itinerary_response(self, api_response: Dict, preferences: Dict) -> Dict[str, Any]:
        """Parse Deepseek response into structured itinerary format"""
        try:
            content = api_response['choices'][0]['message']['content']
            
            # For now, return the content as-is with metadata
            # In production, you might want to parse this into a more structured format
            return {
                "id": f"itinerary_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                "destination": ', '.join(preferences.get('destinations', ['Jharkhand'])),
                "days": preferences.get('days', 3),
                "budget": preferences.get('budget', 15000),
                "currency": "INR",
                "content": content,
                "preferences": preferences,
                "generated_at": datetime.utcnow().isoformat(),
                "model": "deepseek-reasoner",
                "status": "generated"
            }
        except Exception as e:
            print(f"Error parsing itinerary response: {str(e)}")
            return self._generate_fallback_itinerary(preferences)
    
    def _generate_fallback_itinerary(self, preferences: Dict) -> Dict[str, Any]:
        """Generate fallback itinerary when Deepseek API fails"""
        return {
            "id": f"fallback_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            "destination": ', '.join(preferences.get('destinations', ['Jharkhand'])),
            "days": preferences.get('days', 3),
            "budget": preferences.get('budget', 15000),
            "currency": "INR",
            "content": f"Fallback itinerary for {preferences.get('days', 3)} days in Jharkhand. Please try again later for AI-generated recommendations.",
            "preferences": preferences,
            "generated_at": datetime.utcnow().isoformat(),
            "model": "fallback",
            "status": "fallback"
        }
    
    def _generate_fallback_chat_response(self, user_message: str) -> Dict[str, Any]:
        """Generate fallback chat response when Deepseek API fails"""
        return {
            "message": "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment, or contact our support team for assistance with your Jharkhand travel questions.",
            "timestamp": datetime.utcnow().isoformat(),
            "model": "fallback"
        }