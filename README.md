# Titan Marketplace

A clean, polished marketplace for buying and selling on campus. Built with Next.js 15, React 19, TypeScript, and Firebase.

## What It Does

Think of it like a campus-specific Craigslist, but way nicer. Students can list items for sale, browse what others are selling, and message each other directly—all with a smooth, modern interface.

**Key Features:**
- Sign in with Google (no passwords to remember)
- Create listings with photos (up to 5 images per listing)
- Browse everything without signing in
- Real-time messaging between buyers and sellers
- View other users' profiles to see what else they're selling
- Report anything sketchy
- Works great on mobile and desktop

## Tech Stack

**Frontend:**
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion for smooth animations
- shadcn/ui components

**Backend:**
- Firebase Authentication (Google Sign-In)
- Firestore for data
- Firebase Storage for images

## Getting Started

### What You'll Need

- Node.js 18 or higher
- A Firebase project (free tier works fine)
- About 10 minutes

### Setup Steps

1. **Clone the repo:**
git clone <your-repo-url>
cd titan-marketplace2. **Install dependencies:**
npm install3. **Set up Firebase:**
   - Head to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Google Sign-In in Authentication
   - Create a Firestore database (start in test mode, we'll add rules next)
   - Enable Storage
   - Grab your config from Project Settings → General → Your apps

4. **Create `.env.local` in the root:**
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id5. **Run it:**
npm run devOpen [http://localhost:3000](http://localhost:3000) and you're good to go!

## How It's Organized

Install dependencies:

npm install
- `/` - Homepage
- `/browse-listings` - See all listings (anyone can view)
- `/sell-item/create-listing` - Post something new
- `/sell-item/view-listing/[id]` - View a specific listing
- `/chat` - Your messages
- `/profile` - Your profile and listings
- `/profile/[userId]` - Someone else's profile
- `/login` - Sign in

## Firebase Configuration

### Authentication
Just enable Google Sign-In. That's it. No email/password setup needed.

### Firestore Rules

Copy these into Firestore → Rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read user profiles (needed to show seller info)
    match /users/{userId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can browse listings, only sellers can create/edit
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.sellerId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.sellerId;
    }
    
    // Only conversation participants can read/write
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
    
    // Reports: only the reporter and admins can read
    match /reports/{reportId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.reporterId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true);
      allow create: if request.auth != null && request.auth.uid == request.resource.data.reporterId;
    }
  }
}### Storage Rules

For Storage → Rules:
ript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Listing images: anyone can view, authenticated users can upload
    match /listings/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Profile photos: anyone can view, only owner can upload
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}## How Things Work

**First Time User:**
1. Sign in with Google
2. Get redirected to profile setup (name, major, grad year, bio, photo)
3. Start browsing and listing

**Creating a Listing:**
- Fill out the form, upload up to 5 photos
- Hit "Create Listing"
- It shows up in browse immediately

**Messaging:**
- Click "Message Seller" on any listing
- Conversation starts automatically
- Messages update in real-time (no refresh needed)

**Viewing Profiles:**
- Click on a seller's name anywhere
- See their profile and all their listings
- Browse their other items

## Development
h
npm run dev    # Start dev server
npm run build  # Build for production
npm run start  # Run production build
npm run lint   # Check for issues## Deploying

**Vercel (easiest):**
1. Push to GitHub
2. Import project in Vercel
3. Add your `.env.local` variables
4. Deploy

Works on any platform that supports Next.js (Netlify, Railway, etc.).

## Contributing

Found a bug? Want to add a feature? PRs welcome!

1. Fork it
2. Make your changes
3. Submit a pull request

## License

MIT License - use it however you want.

---

Made for the CSUF community 🧡
