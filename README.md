# Jharkhand Tourism API

## Installation

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (including emergentintegrations):
   ```bash
   pip install emergentintegrations --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8001 --reload
   ```

## API Integration
The application now uses **Gemini AI** (gemini-2.0-flash) for:
- Travel itinerary planning (`/api/planner`)
- Tourism chatbot (`/api/chatbot`)
