# Titan Marketplace - File Structure

This document explains the straightforward file structure of the Titan Marketplace application.

## Main App Directory (`src/app/`)

### Core Pages
- **`page.tsx`** - Homepage with main navigation and use case overview
- **`login/page.tsx`** - User login and signup form
- **`profile/page.tsx`** - User profile and account settings

### Browse & Search
- **`browse-listings/page.tsx`** - Browse and search all marketplace listings
  - Shows all available items for sale
  - Has search and category filters
  - Links to individual listing details

### Selling Items
- **`sell-item/create-listing/page.tsx`** - Create new item listing
  - Form to add new items for sale
  - Includes title, description, price, category, condition
  - TODO: Image upload with Firebase Storage
- **`sell-item/view-listing/[id]/page.tsx`** - View individual listing details
  - Shows full item details and images
  - Contact seller functionality
  - Report listing button

### Communication
- **`chat/page.tsx`** - Messaging system
  - List of conversations with other users
  - Real-time chat interface
  - TODO: Firebase Firestore integration

### Reporting
- **`report-content/page.tsx`** - Report inappropriate content
  - Form to report items, users, or messages
  - Admin review system (TODO)

## Components (`src/components/`)

### Layout Components
- **`Layout/Layout.tsx`** - Main app wrapper with navbar
- **`Layout/Navbar.tsx`** - Top navigation bar
- **`Layout/Footer.tsx`** - Footer component (not used in simplified version)

## Key Features by File

### Authentication Flow
1. `login/page.tsx` - User signs in with @csu.fullerton.edu email
2. `page.tsx` - Shows welcome screen with navigation options

### Selling Flow
1. `sell-item/create-listing/page.tsx` - Seller creates listing
2. `browse-listings/page.tsx` - Listing appears in marketplace
3. `sell-item/view-listing/[id]/page.tsx` - Buyers view details

### Buying Flow
1. `browse-listings/page.tsx` - Browse available items
2. `sell-item/view-listing/[id]/page.tsx` - View item details
3. `chat/page.tsx` - Message seller about item

### Reporting Flow
1. `report-content/page.tsx` - Report inappropriate content
2. Admin review (TODO: implement admin dashboard)

## Database Integration (TODOs)
- **Firebase Storage** - Image uploads for listings
- **Firestore** - Store listings, messages, and user data
- **Admin Panel** - Review reported content

## File Naming Convention
All files use descriptive, straightforward names:
- `browse-listings` instead of `explore`
- `sell-item` instead of `listings`
- `create-listing` instead of `new`
- `chat` instead of `messages`
- `report-content` instead of `report`
- `view-listing` instead of `[id]`

This makes it easy to understand what each file does without looking at the code.
