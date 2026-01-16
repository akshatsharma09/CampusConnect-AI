# Campus Connect AI

A next-generation AI-powered platform that helps college students find internships, hackathons, and workshops with **explainable AI ranking, campus-specific filtering, and personalized recommendations**.

---

## ✨ Why Campus Connect?

**Problem:** Students waste hours scrolling through LinkedIn and Internshala, finding irrelevant opportunities that don't match their year, branch, skills, or campus.

**Solution:** Campus Connect leverages **explainable AI** to deliver personalized, campus-verified opportunities with transparent ranking reasons.

### Key Differentiators

✅ **Explainable AI Ranking** - Know exactly why each opportunity is recommended  
✅ **Campus-Specific** - Opportunities verified for your college, year, and branch  
✅ **Personalized** - Tailored to your skills, interests, and academic profile  
✅ **Transparent** - Clear ranking reasons: "Matches your Python skills; deadline in 5 days; verified for your campus"  
✅ **3-Step User Journey** - Profile → AI Analysis → Personalized Recommendations  

---

## 🎯 Core Features

### 1️⃣ Explainable AI Ranking System

Every opportunity is ranked using **transparent, user-visible factors**:

- **Year & Branch Alignment** - Eligibility matches your academic profile
- **Skills Match** - Python, React, Machine Learning, etc. from your profile
- **Deadline Urgency** - Opportunities closing soon prioritized
- **Campus Verification** - Opportunities verified for your specific college

**Example Ranking Reason:**
> "Recommended: Matches your skills in Python & AI; deadline is in 5 days; verified for your campus"

### 2️⃣ Campus-Specific Filtering

- **Verified Opportunities** - Faculty/admin posted opportunities marked with ✓ Verified badge
- **Branch-Focused** - Filter opportunities by your branch (CSE, ECE, ME, etc.)
- **Year-Appropriate** - Only see opportunities matching your year
- **Campus Priority** - Campus-verified opportunities prioritized in search results

### 3️⃣ User Profile System (3-Step Journey)

**Step 1: 👤 Complete Profile**
- Enter: Year, Branch, Technical Skills, Areas of Interest
- Saved locally (localStorage) for instant personalization

**Step 2: 🤖 AI Analyzes**
- Gemini AI analyzes your profile against all opportunities
- Calculates relevance scores based on multiple factors

**Step 3: ⭐ Get Recommendations**
- See ranked opportunities with clear ranking reasons
- Each recommendation explains why it's right for you

### 4️⃣ Smart Campus Assistant Chatbot

- **Sample Queries** - Quick-start suggestions for first-time users
- **Campus-Only Knowledge** - Refuses non-campus questions politely
- **RAG-Based Answers** - Retrieves from campus knowledge base
- **Intent Classification** - Uses AI to classify campus vs. non-campus queries

**Sample Questions:**
- "When is the placement drive?"
- "How do I register for internships?"
- "What are the hostel rules?"
- "How do I use CampusConnect?"

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **AI Engine**: Google Gemini API (explainable ranking + campus assistant)
- **Architecture**: Modular, scalable service-based design

---

## 📁 Project Structure

```
src/
├── components/
│   ├── CampusAssistant.jsx       # Chatbot with sample queries
│   ├── HowItWorks.jsx            # 3-step user journey visualization
│   ├── Hero.jsx                  # Landing page hero section
│   ├── HeroBackground.jsx        # Hero background effects
│   ├── OpportunityCard.jsx       # Enhanced with ranking badges
│   ├── SearchBar.jsx             # Search input component
│   └── UserProfile.jsx           # Profile creation modal
├── pages/
│   ├── Home.jsx                  # Main dashboard
│   ├── Login.jsx                 # Login/auth page
│   ├── Admin.jsx                 # Admin panel
│   └── firebase.js               # Firebase config
├── services/
│   ├── rankingEngine.js          # Explainable AI ranking
│   ├── gemini.js                 # AI search & NLP
│   ├── opportunityService.js     # Opportunity management
│   ├── campusChatbot.js          # Chatbot AI logic
│   ├── campusService.js          # Campus knowledge base
│   └── firebase.js               # Firebase setup
├── utils/                        # Utility functions
├── App.jsx                       # Auth routing
├── index.css                     # Global styles
└── main.jsx                      # Entry point
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env` file in the project root:
```
# Firebase Config (get from Firebase Console)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Gemini API Key (get from Google AI Studio)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Set Up Firebase

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Google Authentication
3. Create Firestore Database
4. Create collections: `opportunities`, `campus_info`
5. Copy your credentials to `.env`

### 4. Set Up Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add it to `.env` as `VITE_GEMINI_API_KEY`

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production
```bash
npm run build
```

---

## 📖 How to Use

### 🔍 Search for Opportunities

1. Sign in with your Google account
2. Click "➕ Add Profile" and fill in your year, branch, and skills
3. Type search queries like:
   - "Internships for 3rd year AI students"
   - "ML hackathons for CSE"
   - "Web development workshops"
4. View ranked results with clear explanations of why each opportunity is recommended

### 💬 Use Campus Assistant

1. Click the chat button (bottom-right corner)
2. See sample campus questions
3. Ask about placements, internships, hostel rules, events, etc.
4. Get instant campus-specific answers

### 📱 Your Profile

- **Purpose**: Personalizes opportunity ranking and recommendations
- **Data Stored**: Locally in browser (localStorage)
- **Update**: Click "Profile" button in navbar to edit

---

## 🎯 User Journey Demo

**New User:**
```
1. Sign in with Google
   ↓
2. Click "➕ Add Profile" → Enter year, branch, skills
   ↓
3. See "How It Works" section (3-step process)
   ↓
4. Type search query: "3rd year CSE internships"
   ↓
5. See ranked opportunities with explanations:
   ✓ Matches your year
   ✓ Matches your branch
   ✓ Matches your skills
   ✓ Deadline urgency: 5 days
   ✓ Campus verified
```

---

## 📊 Ranking Algorithm

**File:** `src/services/rankingEngine.js`

**Factors (with weights):**
- Year eligibility: 30 points
- Branch match: 20 points
- Skills match: 25 points
- Deadline urgency: 20 points
- Campus verification: 15 points
- Query keyword match: 20 points

**Output Format:**
```javascript
{
  "opportunity_id": {
    "reason": "Recommended: Matches your 3rd year; CSE branch; Python skills; deadline in 5 days; verified for your campus",
    "factors": [
      { "name": "Year Match", "score": 30 },
      { "name": "Branch Match", "score": 20 },
      { "name": "Skills Match", "score": 25 }
    ],
    "score": 95
  }
}
```

---

## 📊 Sample Data

The app seeds with **10 realistic opportunities**:

- **Global AI Hackathon 2026** - CSE/IT/ECE, All years ✓ Verified
- **React Frontend Internship** - CSE/IT, 3rd year ✓ Verified
- **Machine Learning Workshop** - CSE/IT/ECE, 2nd-3rd year ✓ Verified
- **Backend Developer Internship** - CSE/IT, 3rd-4th year ✓ Verified
- **Data Science Fellowship** - CSE/ECE/IT, 3rd-4th year ✓ Verified
- **Annual Tech Fest Hackathon** - All branches, All years ✓ Verified
- **Mobile App Development** - CSE/IT, 2nd-3rd year ✓ Verified
- **DevOps Internship** - CSE/IT, 3rd-4th year ✓ Verified
- **Cybersecurity Bootcamp** - All branches
- **Open Source Program** - All branches

---

## 🔐 Security & Safety

✅ **AI Validation** - Gemini only ranks existing opportunities (no hallucination)  
✅ **Low Temperature** - 0.2 temperature for deterministic results  
✅ **Context Grounding** - All responses grounded in database/knowledge base  
✅ **Campus-Only Chatbot** - Refuses non-campus queries by default  
✅ **Transparent Reasoning** - All ranking factors visible to users  
✅ **No Sensitive Data** - API keys in environment variables only  

---

## 📈 Competitive Advantages

| Feature | Campus Connect | LinkedIn | Internshala |
|---------|---|---|---|
| Campus-Verified Opportunities | ✅ Yes | ❌ No | ❌ No |
| Explainable AI Ranking | ✅ Yes | ❌ No | ❌ No |
| Personalized Profile | ✅ Yes (Simple) | ✅ Yes (Complex) | ✅ Yes (Complex) |
| Campus-Specific Filtering | ✅ Yes | ❌ No | ⚠️ Limited |
| AI Assistant for Q&A | ✅ Yes | ❌ No | ❌ No |
| Transparent Ranking Reasons | ✅ Yes | ❌ No | ❌ No |

---

## 🔮 Future Enhancements

- [ ] Mentor matching system
- [ ] Application tracking dashboard
- [ ] Interview prep resources
- [ ] Peer reviews & ratings
- [ ] Email notifications
- [ ] Admin panel for faculty
- [ ] Multi-college support
- [ ] Mobile app (React Native)

---

## 🧪 Testing

1. Click "Seed Database" button in dev tools
2. Try search: "3rd year internships"
3. Click chat button and ask: "When is placement drive?"
4. Edit profile to see ranking changes

---

## 📝 License

MIT License - Feel free to use and modify!

---

**Made with ❤️ for students.**
