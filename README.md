# Titan Marketplace

A CSUF-exclusive buy/sell marketplace built with Next.js 14, TypeScript, Tailwind CSS, and Firebase.

## Features

- **Google Email Verification**: Only google emails are allowed
- **User Authentication**: Secure sign-up and sign-in with Firebase Auth
- **Listings Management**: Create, browse, and search listings with photos
- **In-App Messaging**: Direct communication between buyers and sellers
- **Moderation Tools**: Report listings and users, admin controls
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd titan-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage
   - Get your Firebase config

4. Configure environment variables:
   - Copy `env.template` to `.env.local`
   - Fill in your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── explore/           # Browse listings
│   ├── listings/          # Listing pages
│   │   ├── new/          # Create new listing
│   │   └── [id]/         # Listing detail page
│   ├── login/            # Authentication page
│   ├── messages/         # In-app messaging
│   ├── profile/          # User profile
│   └── layout.tsx        # Root layout
├── components/            # React components
│   └── Layout/           # Layout components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility libraries
│   └── firebase.ts       # Firebase configuration
└── types/                # TypeScript type definitions
    └── index.ts          # App types
```

## Available Routes

- `/` - Home page with hero section and features
- `/login` - Sign in/Sign up page
- `/explore` - Browse and search listings
- `/listings/new` - Create new listing (requires auth)
- `/listings/[id]` - View listing details and message seller
- `/messages` - In-app messaging (requires auth)
- `/profile` - User profile and settings (requires auth)

## Firebase Setup

### Authentication
1. Go to Authentication > Sign-in method
2. Enable Email/Password provider
3. Configure authorized domains

### Firestore Database
1. Create a Firestore database
2. Set up security rules (see below)
3. Create collections: `users`, `listings`, `messages`, `reports`

### Storage
1. Enable Cloud Storage
2. Configure security rules for image uploads

### Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listings are readable by all authenticated users
    match /listings/{listingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.uid == resource.data.sellerId || 
         request.auth.uid == request.resource.data.sellerId);
    }
    
    // Messages are readable by participants
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting (recommended)
- Tailwind CSS for styling

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email [your-email@csu.fullerton.edu] or create an issue in the repository.

---

Built with ❤️ for the CSUF community
