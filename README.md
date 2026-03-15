# Simalem Resort - Activity Booking System

A modern web application for booking activities at Simalem Resort with integrated community and environmental impact tracking. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Supabase Setup](#supabase-setup)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Building for Production](#building-for-production)

## ✨ Features

- **Activity Browsing**: View and filter activities by category (Cultural, Environmental, Adventure)
- **Impact Tracking**: Track community and environmental impact for each activity
- **Booking System**: Date/time selection for activities with a booking cart
- **Community Hub**: View shared itineraries and activity reviews from other guests
- **Admin Portal**: Supervisor dashboard to view all guest bookings and impact metrics
- **Purpose Engagement Ratio (PER)**: Automatic calculation of community and environmental impact ratios
- **Dual User Roles**: Separate experiences for guests and supervisors

## 🛠 Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router 7** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **date-fns** - Date utilities

### Backend
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL database
  - Edge Functions (Deno runtime)
  - Row Level Security (RLS)

## 📁 Project Structure

```
simalem-resort-booking/
├── index.html                 # HTML entry point
├── src/
│   ├── main.tsx              # Application entry point
│   ├── types/
│   │   └── index.ts          # Centralized TypeScript types
│   ├── services/
│   │   ├── supabase.ts       # Supabase client configuration
│   │   └── api.ts            # API service layer (data fetching)
│   ├── utils/
│   │   └── formatters.ts     # Utility functions (formatting, calculations)
│   ├── app/
│   │   ├── App.tsx           # Root application component
│   │   ├── routes.tsx        # React Router configuration
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      # Authentication state management
│   │   │   └── BookingContext.tsx   # Booking cart state management
│   │   ├── pages/
│   │   │   ├── Activities.tsx       # Activities listing page
│   │   │   ├── Community.tsx        # Community hub page
│   │   │   ├── Checkout.tsx         # Booking checkout page
│   │   │   ├── Summary.tsx          # Booking summary page
│   │   │   ├── Login.tsx            # Login page
│   │   │   └── Admin.tsx            # Supervisor admin portal
│   │   ├── components/
│   │   │   ├── ActivityCard.tsx     # Activity display card
│   │   │   ├── BookingModal.tsx     # Date/time booking modal
│   │   │   ├── Header.tsx           # Navigation header
│   │   │   ├── Layout.tsx           # Page layout wrapper
│   │   │   ├── ProtectedRoute.tsx   # Route authentication guard
│   │   │   └── ui/                  # Radix UI components
│   │   └── data/
│   │       ├── activities.ts        # Mock activities (unused - for reference)
│   │       ├── communityData.ts     # Mock community data (unused - for reference)
│   │       └── mockGuestBookings.ts # Mock admin data (still in use)
│   └── styles/
│       ├── index.css         # Global styles
│       ├── tailwind.css      # Tailwind imports
│       ├── theme.css         # Custom theme tokens
│       └── fonts.css         # Font imports
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx     # Edge function routes
│           └── kv_store.tsx  # Key-value store utilities
├── package.json              # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── .env.example             # Environment variables template
└── README.md                # This file
```

## 📋 Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ (or npm/yarn)
- **Supabase account** ([create one free](https://supabase.com))

## 🚀 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd simalem-resort-booking
```

2. **Install dependencies**

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

## ⚙️ Configuration

### 1. Environment Variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project details:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SERVER_URL=https://your-project-id.supabase.co/functions/v1
```

**Where to find these values:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

### 2. Update Supabase Info (if needed)

If you were previously using Figma Make, you may need to remove the old Supabase info file:

```bash
rm -f utils/supabase/info.tsx
```

The app will now use environment variables instead.

## 🏃 Running Locally

1. **Start the development server**

```bash
pnpm dev
```

The application will open at `http://localhost:5173`

2. **Access the application**
   - **Guest View**: Click "Access Guest Booking" on the login page
   - **Supervisor View**: Click "Access Admin Portal" on the login page

## 🗄 Supabase Setup

### Database Schema

Your Supabase project needs the following tables:

#### 1. `activities` Table

```sql
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  community_impact TEXT NOT NULL CHECK (community_impact IN ('Direct Local Partner', 'Internal Community Support', 'No Direct Community Link')),
  environmental_impact TEXT NOT NULL CHECK (environmental_impact IN ('Low', 'Medium', 'High')),
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Cultural', 'Environmental', 'Adventure')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. `activity_reviews` Table

```sql
CREATE TABLE public.activity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_avatar_url TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. `shared_itineraries` Table

```sql
CREATE TABLE public.shared_itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_avatar_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shared_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `shared_itinerary_items` Table

```sql
CREATE TABLE public.shared_itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_itinerary_id UUID REFERENCES public.shared_itineraries(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  booking_date DATE,
  booking_time TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Edge Functions

The application uses Supabase Edge Functions located in `supabase/functions/server/`.

**Deploy the edge function:**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Deploy the function
supabase functions deploy server
```

The edge function provides these endpoints:
- `GET /make-server-01df2f8f/activities` - Fetch all active activities
- `GET /make-server-01df2f8f/activity-reviews` - Fetch all reviews
- `GET /make-server-01df2f8f/shared-itineraries` - Fetch all shared itineraries
- `GET /make-server-01df2f8f/health` - Health check

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous public key | Yes |
| `VITE_SERVER_URL` | Edge functions URL (optional, auto-generated if not provided) | No |

## 💻 Development

### Key Files to Know

- **Entry Point**: `/src/main.tsx` - Renders the React app into the DOM
- **Root Component**: `/src/app/App.tsx` - Wraps the app with providers
- **Routing**: `/src/app/routes.tsx` - Defines all application routes
- **Types**: `/src/types/index.ts` - All TypeScript type definitions
- **API Layer**: `/src/services/api.ts` - All data fetching functions
- **Supabase Client**: `/src/services/supabase.ts` - Supabase configuration

### Adding New Features

1. **Add types** to `/src/types/index.ts`
2. **Create API functions** in `/src/services/api.ts`
3. **Create UI components** in `/src/app/components/`
4. **Create pages** in `/src/app/pages/`
5. **Add routes** in `/src/app/routes.tsx`

### State Management

- **Authentication**: Uses React Context (`AuthContext`)
- **Booking Cart**: Uses React Context (`BookingContext`)
- **Local Storage**: Auth state persists via localStorage

## 🏗 Building for Production

```bash
# Build the application
pnpm build

# Preview the production build
pnpm preview
```

The build output will be in the `dist/` directory.

## 🔍 Debugging

### Common Issues

**1. "Missing Supabase environment variables" error**
- Ensure `.env` file exists and contains valid Supabase credentials
- Restart the dev server after changing `.env`

**2. Activities not loading**
- Check browser console for error messages
- Verify edge function is deployed: `supabase functions list`
- Check Supabase dashboard for database connection

**3. Build errors related to imports**
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Clear Vite cache: `rm -rf .vite`

## 📝 Notes

### Mock Data

Some files in `/src/app/data/` contain mock data:
- `activities.ts` - No longer used (activities come from database)
- `communityData.ts` - No longer used (reviews/itineraries come from database)  
- `mockGuestBookings.ts` - Still used for admin portal demo

### Migrating from Figma Make

If you're migrating from Figma Make:
1. Remove `/utils/supabase/info.tsx` (hardcoded credentials)
2. Create `.env` file with environment variables
3. Install missing dependency: `pnpm add @supabase/supabase-js`
4. Deploy edge functions to your Supabase project

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

For questions or contributions, please contact the development team.
