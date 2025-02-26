# MatchFlix
like tinder, but for movies

## Features  
### 🔹 **User Profiles & Preferences**
- Sign in with **Google Authentication (Firebase)**
- Set preferences: **Favorite genres, streaming services, favorite actors**
- Sync preferences with your partner

### 🔹 **Movie Matching (Swipe to Choose)**
- **Swipe right ✅** to like a movie  
- **Swipe left ❌** to skip  
- If both users like the same movie, it's a **match!** 🎉  

### 🔹 **Smart AI Recommendations**
- Fetches movie & TV show data from **TMDb API**  
- Suggests movies based on **mutual preferences**  
- Filters by **genres, streaming platforms, and IMDb ratings**  

### 🔹 **Quick Decision Mode (Surprise Me!)**
- One-click random movie selection **(based on shared likes)**  
- Cool animation before revealing the pick 🎭  

### 🔹 **Wishlist & Watch History**
- Save movies for later  
- Track previously watched movies & ratings  

### 🔹 **Polls & Voting (For Tough Decisions)**
- Let each partner vote on a **shortlist of movies**  
- Automatically selects the winner 🏆  

### 🔹 **Chat & Notifications**
- **Chat feature** to discuss movie choices in-app  
- **Real-time notifications** when a match is found  

## Tech Stack  
- **Frontend:** React.js / Next.js  
- **Backend:** Firebase (Authentication & Database)  
- **Database:** Firestore (for user preferences & history)  
- **API Integration:** TMDb API (Movie/TV Data)  
- **Hosting:** Vercel / Firebase Hosting  

## How It Works  
1. **Sign in** and set up your preferences 🎭  
2. **Sync with your partner** and start swiping 🎬  
3. If both swipe right on the same movie → **It’s a match!** 🎉  
4. Click **"Watch Now"** to start streaming 🍿  

## Deployment  
MatchFlix is **hosted on Vercel/Firebase** for a fast & seamless experience. To set up locally:  

```bash
git clone https://github.com/yourusername/MatchFlix.git
cd MatchFlix
npm install
npm start

