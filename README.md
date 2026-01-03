# CampusConnect AI – AI Campus Opportunity Finder

A web application that helps college students find relevant hackathons, internships, workshops, and tech events using AI-powered natural language search.

## Tech Stack
- **Frontend**: React.js with Vite, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **AI**: Google Gemini API

## Features
- Google Sign-In authentication
- AI-powered opportunity search
- Clean, responsive UI
- Real-time data from Firestore

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual API keys in `.env`:
   - Firebase config from Firebase Console
   - Gemini API key from Google AI Studio

**⚠️ IMPORTANT**: Never commit your `.env` file with real API keys to version control!

### 3. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Google provider
4. Enable Firestore Database
5. Add your Firebase config values to `.env`
6. Add some sample opportunities to the "opportunities" collection in Firestore (or use the seed button in dev mode)

### 4. Google Gemini API Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add the API key to `.env` as `VITE_GEMINI_API_KEY`

### 5. Run the App
```bash
npm run dev
```

### 6. Test AI Features
- **AI Search**: Type natural language queries like "internships for AI students"
- **AI Suggestions**: Click "Show AI suggestions" for query ideas
- **Smart Filtering**: Gemini analyzes your query and finds the best matches

### 7. Deploy (Optional)
```bash
npm run build
firebase deploy
```

## Sample Opportunity Data
Add documents to Firestore "opportunities" collection with fields:
- title: string
- type: "hackathon" | "internship" | "workshop"
- eligibleYear: string (e.g., "2nd year")
- domain: string (e.g., "AI", "Web Dev")
- deadline: string
- description: string
- link: string

## Project Structure
```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # Firebase and Gemini services
├── utils/         # Utility functions
├── App.jsx        # Main app component
└── main.jsx       # Entry point
```

## Notes
- This is a hackathon project focused on simplicity and usability
- AI is used only for query understanding and filtering, not training
- All data is stored in Firebase Firestore