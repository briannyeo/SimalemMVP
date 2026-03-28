I cleaned it up for accuracy, consistency, and readability. I also fixed a few likely issues in the setup steps, especially around the Supabase CLI and some wording in the feature and structure sections. Source: 

Use this revised version:

````md
# Simalem Resort - Activity Booking System

A modern web application for browsing and booking resort activities at Simalem Resort, with integrated community and environmental impact visibility. The application is built with React, TypeScript, Tailwind CSS, and Supabase.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Debugging](#debugging)
- [Notes](#notes)
- [License](#license)

## Features

- **Activity browsing**: View and filter activities by category
- **Impact visibility**: Display community and environmental impact information for each activity
- **Booking flow**: Select activity dates and times with a booking cart and summary flow
- **Community hub**: View shared itineraries and activity reviews from other guests
- **Admin portal**: Supervisor dashboard for viewing guest bookings and impact-related metrics
- **Purpose Engagement Ratio (PER)**: Calculate overall engagement with community- and environmentally-linked activities
- **Dual user roles**: Separate user experiences for guests and supervisors

## Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Static typing
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **date-fns** - Date utilities

### Backend

- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL database
  - Edge Functions
  - Row Level Security (RLS)

## Project Structure

```text
simalem-resort-booking/
├── index.html
├── src/
│   ├── main.tsx
│   ├── types/
│   │   └── index.ts
│   ├── services/
│   │   ├── supabase.ts
│   │   └── api.ts
│   ├── utils/
│   │   └── formatters.ts
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── BookingContext.tsx
│   │   ├── pages/
│   │   │   ├── Activities.tsx
│   │   │   ├── Community.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Summary.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Admin.tsx
│   │   ├── components/
│   │   │   ├── ActivityCard.tsx
│   │   │   ├── BookingModal.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ui/
│   │   └── data/
│   │       ├── activities.ts
│   │       ├── communityData.ts
│   │       └── mockGuestBookings.ts
│   └── styles/
│       ├── index.css
│       ├── tailwind.css
│       ├── theme.css
│       └── fonts.css
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx
│           └── kv_store.tsx
├── package.json
├── vite.config.ts
├── .env.example
└── README.md
````

## Prerequisites

* **Node.js** 18 or above
* **pnpm** 8 or above, or **npm**
* A **Supabase** account and project

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd simalem-resort-booking
```

### 2. Install dependencies

Using pnpm:

```bash
pnpm install
```

Using npm:

```bash
npm install
```

## Configuration

### 1. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then update `.env` with your Supabase project details:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SERVER_URL=https://your-project-id.supabase.co/functions/v1
```

### 2. Find your Supabase credentials

In the Supabase dashboard:

1. Open your project
2. Go to **Settings → API**
3. Copy:

   * **Project URL**
   * **anon public key**

### 3. Remove old hardcoded config if applicable

If this project was previously connected through Figma Make or another hardcoded setup, remove any obsolete Supabase config file if it still exists:

```bash
rm -f utils/supabase/info.tsx
```

## Running Locally

Start the development server:

```bash
pnpm dev
```

Or with npm:

```bash
npm run dev
```

The app should be available at:

```text
http://localhost:5173
```

### Demo access

* **Guest view**: Click **Access Guest Booking** on the login page
* **Supervisor view**: Click **Access Admin Portal** on the login page

## Supabase Setup

### Database Schema

The Supabase project should include the following tables.

#### `activities`

```sql
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  community_impact TEXT NOT NULL CHECK (
    community_impact IN (
      'Direct Local Partner',
      'Internal Community Support',
      'No Direct Community Link'
    )
  ),
  environmental_impact TEXT NOT NULL CHECK (
    environmental_impact IN ('Low', 'Medium', 'High')
  ),
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('Cultural', 'Environmental', 'Adventure')
  ),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `activity_reviews`

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

#### `shared_itineraries`

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

#### `shared_itinerary_items`

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

This project uses Supabase Edge Functions located in:

```text
supabase/functions/server/
```

#### Deploy the function

Project-local CLI approach:

```bash
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase functions deploy server
```

If you already have the Supabase CLI installed globally, you can also use:

```bash
supabase login
supabase link --project-ref your-project-id
supabase functions deploy server
```

### Available endpoints

Depending on how your edge function routes are implemented, the server exposes endpoints such as:

* `GET /make-server-01df2f8f/activities`
* `GET /make-server-01df2f8f/activity-reviews`
* `GET /make-server-01df2f8f/shared-itineraries`
* `GET /make-server-01df2f8f/health`

If your function base path changes, update this section to reflect the actual deployed route.

## Environment Variables

| Variable                 | Description                          | Required    |
| ------------------------ | ------------------------------------ | ----------- |
| `VITE_SUPABASE_URL`      | Supabase project URL                 | Yes         |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key             | Yes         |
| `VITE_SERVER_URL`        | Base URL for Supabase Edge Functions | Usually yes |

## Development

### Key files

* **`src/main.tsx`** - Application entry point
* **`src/app/App.tsx`** - Root component and providers
* **`src/app/routes.tsx`** - Route definitions
* **`src/types/index.ts`** - Shared TypeScript types
* **`src/services/api.ts`** - API and data-fetching logic
* **`src/services/supabase.ts`** - Supabase client setup

### Adding new features

1. Add or update types in `src/types/index.ts`
2. Add API logic in `src/services/api.ts`
3. Add components in `src/app/components/`
4. Add pages in `src/app/pages/`
5. Register routes in `src/app/routes.tsx`

### State management

* **Authentication**: React Context via `AuthContext`
* **Booking cart**: React Context via `BookingContext`
* **Persistence**: Selected client-side state persists in `localStorage`

## Building for Production

Build the app:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

Or with npm:

```bash
npm run build
npm run preview
```

The production output is generated in:

```text
dist/
```

## Debugging

### Common issues

#### 1. Missing Supabase environment variables

* Confirm that `.env` exists
* Confirm all required values are present
* Restart the development server after updating environment variables

#### 2. Activities not loading

* Check the browser console for errors
* Confirm the edge function is deployed
* Confirm the database tables exist and contain data
* Confirm `VITE_SERVER_URL` points to the correct function base URL

#### 3. Build or import errors

Reinstall dependencies:

```bash
rm -rf node_modules
pnpm install
```

If needed, clear cached files as well.

## Notes

### Mock data

Some files under `src/app/data/` are mock or transitional data:

* `activities.ts` - Legacy mock activity data
* `communityData.ts` - Legacy mock community data
* `mockGuestBookings.ts` - Demo admin data still in use

### Migrating from Figma Make

If migrating from Figma Make:

1. Remove any obsolete hardcoded Supabase config
2. Add a valid `.env` file
3. Ensure `@supabase/supabase-js` is installed
4. Deploy the Supabase Edge Function to your own project
5. Verify the frontend points to the correct backend URLs

## License

This project is private and proprietary.

## Contributing

For internal questions, updates, or contributions, please contact the project owner or development team.

```

Main fixes I made:
- Standardised headings, tone, and naming.
- Removed some awkward phrasing and made the README sound more professional.
- Softened a few claims that might be inaccurate unless verified from the codebase.
- Corrected the Supabase CLI section so it does not rely only on global npm install, which is often not the best path.
- Made `VITE_SERVER_URL` wording less contradictory.
- Cleaned up grammar, capitalisation, and formatting throughout.

If you want, I can also turn this into a more polished **GitHub-style README** with badges, screenshots, and a short architecture diagram section.
```
