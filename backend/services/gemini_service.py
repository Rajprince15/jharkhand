import os
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
    
    async def generate_itinerary(self, user_preferences: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate travel itinerary using Gemini model
        """
        try:
            # Create a chat instance for itinerary generation
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"itinerary_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                system_message="You are an expert travel planner for Jharkhand, India. Generate detailed, practical itineraries with specific locations, timings, costs, and local insights. Always include authentic local experiences and respect for tribal culture."
            ).with_model("gemini", "gemini-2.0-flash")
            
            # Prepare the prompt for itinerary generation
            prompt = self._create_itinerary_prompt(user_preferences)
            
            # Create user message
            user_message = UserMessage(text=prompt)
            
            # Send message and get response
            response = await chat.send_message(user_message)
            
            return self._parse_itinerary_response(response, user_preferences)
                
        except Exception as e:
            print(f"Error generating itinerary: {str(e)}")
            return self._generate_fallback_itinerary(user_preferences)
    
    async def chat_response(self, user_message: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Generate chatbot response using Gemini model
        """
        try:
            # Create a chat instance for chatbot
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"chat_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                system_message="You are a helpful tourism assistant for Jharkhand, India. Provide accurate, friendly information about destinations, culture, travel tips, and bookings. Be concise but informative. Always promote sustainable and respectful tourism."
            ).with_model("gemini", "gemini-2.0-flash")
            
            # Create user message
            message = UserMessage(text=user_message)
            
            # Send message and get response
            response = await chat.send_message(message)
            
            return {
                "message": response,
                "timestamp": datetime.utcnow().isoformat(),
                "model": "gemini-2.0-flash"
            }
                
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
    
    def _parse_itinerary_response(self, response: str, preferences: Dict) -> Dict[str, Any]:
        """Parse Gemini response into structured itinerary format"""
        try:
            # Return the content with metadata
            return {
                "id": f"itinerary_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                "destination": ', '.join(preferences.get('destinations', ['Jharkhand'])),
                "days": preferences.get('days', 3),
                "budget": preferences.get('budget', 15000),
                "currency": "INR",
                "content": response,
                "preferences": preferences,
                "generated_at": datetime.utcnow().isoformat(),
                "model": "gemini-2.0-flash",
                "status": "generated"
            }
        except Exception as e:
            print(f"Error parsing itinerary response: {str(e)}")
            return self._generate_fallback_itinerary(preferences)
    
    def _generate_fallback_itinerary(self, preferences: Dict) -> Dict[str, Any]:
        """Generate fallback itinerary when Gemini API fails"""
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
        """Generate fallback chat response when Gemini API fails"""
        return {
            "message": "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment, or contact our support team for assistance with your Jharkhand travel questions.",
            "timestamp": datetime.utcnow().isoformat(),
            "model": "fallback"
        }