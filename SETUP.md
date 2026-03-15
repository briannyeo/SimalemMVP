# Local Development Setup Guide

This guide walks you through setting up the Simalem Resort booking application for local development in VS Code.

## 🎯 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] pnpm installed (or npm/yarn)
- [ ] Supabase project created
- [ ] Database tables created
- [ ] Edge function deployed
- [ ] `.env` file configured
- [ ] Dependencies installed
- [ ] Development server running

## 📝 Step-by-Step Instructions

### Step 1: Install Prerequisites

#### Install Node.js
Download and install Node.js 18+ from [nodejs.org](https://nodejs.org)

Verify installation:
```bash
node --version  # Should show v18.x.x or higher
```

#### Install pnpm (Recommended)
```bash
npm install -g pnpm
```

Verify installation:
```bash
pnpm --version
```

### Step 2: Set Up Supabase Project

1. **Create a Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create a New Project**
   - Click "New Project"
   - Choose an organization
   - Set project name (e.g., "simalem-resort")
   - Set database password (save this!)
   - Choose a region close to you
   - Click "Create new project"

3. **Wait for Project Setup**
   - This takes 1-2 minutes
   - Coffee break! ☕

### Step 3: Create Database Tables

1. **Open SQL Editor**
   - In your Supabase dashboard, click "SQL Editor" in the sidebar

2. **Run Table Creation Scripts**

Copy and paste each script below into the SQL Editor and click "Run":

#### Create `activities` Table
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

-- Create index for faster queries
CREATE INDEX idx_activities_active ON public.activities(is_active);
CREATE INDEX idx_activities_category ON public.activities(category);
```

#### Create `activity_reviews` Table
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

-- Create index
CREATE INDEX idx_reviews_activity ON public.activity_reviews(activity_id);
CREATE INDEX idx_reviews_date ON public.activity_reviews(review_date DESC);
```

#### Create `shared_itineraries` Table
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

-- Create index
CREATE INDEX idx_itineraries_date ON public.shared_itineraries(shared_date DESC);
```

#### Create `shared_itinerary_items` Table
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

-- Create indexes
CREATE INDEX idx_itinerary_items_itinerary ON public.shared_itinerary_items(shared_itinerary_id);
CREATE INDEX idx_itinerary_items_sort ON public.shared_itinerary_items(shared_itinerary_id, sort_order);
```

3. **Verify Tables**
   - Click "Table Editor" in the sidebar
   - You should see all 4 tables listed

### Step 4: Deploy Edge Function

1. **Install Supabase CLI**
```bash
npm install -g supabase
```

2. **Login to Supabase**
```bash
supabase login
```
This will open a browser window to authenticate.

3. **Link Your Project**
```bash
cd /path/to/simalem-resort-booking
supabase link --project-ref your-project-id
```

To find your project ID:
- Go to Supabase Dashboard → Settings → General
- Copy the "Reference ID"

4. **Deploy the Edge Function**
```bash
supabase functions deploy server
```

5. **Verify Deployment**
```bash
supabase functions list
```

You should see the `server` function listed.

### Step 5: Configure Environment Variables

1. **Get Supabase Credentials**
   - In Supabase Dashboard, go to Settings → API
   - Copy:
     - Project URL (looks like `https://xxxxx.supabase.co`)
     - `anon` `public` key (long JWT token)

2. **Create `.env` File**
```bash
cp .env.example .env
```

3. **Edit `.env` File**
```env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
VITE_SERVER_URL=https://your-actual-project-id.supabase.co/functions/v1
```

Replace the placeholder values with your actual credentials.

### Step 6: Install Project Dependencies

```bash
# Navigate to project directory
cd /path/to/simalem-resort-booking

# Install dependencies
pnpm install
```

This will install all required packages (React, Tailwind, Supabase, etc.)

### Step 7: Seed Sample Data (Optional)

To test the application, you can add sample data via the Supabase SQL Editor:

```sql
-- Insert sample activities
INSERT INTO public.activities (name, description, duration_minutes, price, community_impact, environmental_impact, image_url, category, is_active) VALUES
('Village Cultural Tour', 'Explore local Batak villages and learn about traditional customs, crafts, and daily life.', 180, 45, 'Direct Local Partner', 'Low', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800', 'Cultural', true),
('Organic Farm Workshop', 'Learn sustainable farming practices and participate in harvesting organic vegetables.', 120, 30, 'Direct Local Partner', 'Low', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800', 'Environmental', true),
('Lake Laut Tawar Kayaking', 'Paddle through pristine waters while enjoying breathtaking mountain views.', 150, 40, 'Internal Community Support', 'Low', 'https://images.unsplash.com/photo-1699190866577-100e090dfe1d?w=800', 'Adventure', true);
```

### Step 8: Start Development Server

```bash
pnpm dev
```

The application will start at `http://localhost:5173`

## 🖥 VS Code Setup (Optional)

### Recommended Extensions

Install these VS Code extensions for the best development experience:

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
4. **TypeScript Vue Plugin (Volar)** - for better TS support

### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## ✅ Verification

### 1. Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Access Guest Booking"
3. You should see the Activities page
4. Activities should load from the database

### 2. Check Browser Console

- Press F12 to open Developer Tools
- Look for any errors in the Console tab
- Network tab should show successful requests to Supabase

### 3. Test Features

- [ ] Activities page loads with data from database
- [ ] Can filter activities by category
- [ ] Can click "Book Activity" and select date/time
- [ ] Can view Community page with reviews and itineraries
- [ ] Can access Admin portal (click logout, then "Access Admin Portal")

## 🐛 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
- Ensure `.env` file exists in the project root
- Check that environment variables start with `VITE_`
- Restart the dev server after editing `.env`

### Issue: Activities not loading

**Solution:**
- Check browser console for errors
- Verify edge function is deployed: `supabase functions list`
- Check Supabase Dashboard → Logs → Edge Functions for errors
- Ensure tables have data (add sample data)

### Issue: CORS errors

**Solution:**
- Verify edge function has CORS middleware enabled
- Check that the function is deployed correctly
- Try refreshing the page

### Issue: Module not found errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm -rf .vite
pnpm install
```

## 📞 Need Help?

If you encounter issues:

1. Check the main [README.md](./README.md)
2. Check Supabase documentation: https://supabase.com/docs
3. Check browser console for error messages
4. Verify all environment variables are set correctly

## 🎉 Success!

If you can see activities loading from your Supabase database, you're all set!

Next steps:
- Explore the codebase in `/src`
- Read the [README.md](./README.md) for project structure
- Start building new features
