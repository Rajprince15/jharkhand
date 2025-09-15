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
        Create a detailed {days}-day travel itinerary for {destinations}, Jharkhand, India following this EXACT FORMAT:

        **TRIP PARAMETERS:**
        - Destinations: {destinations}
        - Duration: {days} days
        - Budget: ₹{budget} for {group_size} people
        - Interests: {interests}
        - Travel Style: {travel_style}
        - Group Size: {group_size} people

        **FORMAT REQUIREMENTS - Follow this structure exactly:**

        **Day 1: [Activity Theme]**
        • Morning (8:00 AM): [Activity with location and brief description]
        • Mid-morning (10:30 AM): [Activity with cost estimate]
        • Afternoon (2:00 PM): [Activity with travel time]
        • Evening (6:00 PM): [Activity with local experience]
        
        **Estimated Day 1 Cost (excluding hotel): ₹[amount] per person**

        **Day 2: [Activity Theme]**
        [Same time-based format]

        **Important Notes Before You Start:**
        • **Respect:** Cultural sensitivity guidelines
        • **Bargaining:** Local market tips
        • **Environmental Responsibility:** Sustainable practices
        • **Flexibility:** Weather and timing adjustments
        • **Safety:** Emergency contacts and precautions
        • **Language:** Basic Hindi/local phrases

        **Accommodation Recommendation:**
        [Specific hotel with contact details and why it's recommended]

        **Cultural Etiquette Tips for Tribal Areas:**
        • Photography permissions
        • Dress code recommendations
        • Interaction guidelines

        **Sustainable Tourism Practices:**
        • Local economy support
        • Environmental conservation
        • Community respect

        **Practical Tips:**
        • **Best Time to Visit:** [Season recommendations]
        • **Mobile Connectivity:** Network coverage info
        • **Currency:** ATM and exchange locations
        • **Medical Facilities:** Hospital/clinic details

        **Important Contact Information:**
        • Railway Enquiry: [Phone number]
        • Tourist Information: [Phone number]
        • Emergency Services: [Phone numbers]

        **Total Estimated Cost: ₹[total amount] for {group_size} people**
        
        Use authentic Jharkhand locations, real contact numbers where possible, include tribal cultural elements, mention specific local dishes, and ensure all costs are realistic for the budget provided.
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