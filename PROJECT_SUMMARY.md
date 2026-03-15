# Project Summary: Simalem Resort Booking Application

## 📊 Overview

**Application Name:** Simalem Resort Activity Booking System  
**Purpose:** Enable guests to book resort activities while tracking community and environmental impact  
**Tech Stack:** React, TypeScript, Tailwind CSS, Supabase  
**Target Environment:** Modern web browsers (desktop & mobile)

## 🎯 Core Features

### 1. **Activity Booking (Guest View)**
- Browse activities by category (Cultural, Environmental, Adventure)
- View detailed activity information with impact indicators
- Select date and time for each activity
- Add multiple activities to booking cart
- Review and confirm bookings at checkout

### 2. **Impact Tracking**
Each activity displays:
- **Community Impact**: 
  - Direct Local Partner (DLP)
  - Internal Community Support (ICS)
  - No Direct Community Link (NDL)
- **Environmental Impact**: Low, Medium, High

### 3. **Community Hub**
- **Shared Itineraries**: Browse curated activity combinations from other guests
- **Activity Reviews**: Read and filter reviews by activity
- View engagement metrics (likes, comments, helpful votes)

### 4. **Admin Portal (Supervisor View)**
- View all guest bookings across the resort
- Track Purpose Engagement Ratio (PER) metrics
- Monitor community and environmental impact statistics
- Filter and analyze guest booking patterns

### 5. **Dual User Roles**
- **Guest**: Access booking system and community features
- **Supervisor**: Access admin portal for oversight

## 🏗 Architecture

### Frontend Architecture

```
Browser
  ↓
React Application (SPA)
  ├─ React Router (navigation)
  ├─ Context API (state management)
  │   ├─ AuthContext (user authentication)
  │   └─ BookingContext (shopping cart)
  ├─ Components (UI)
  └─ Services (data layer)
      └─ API Service
```

### Backend Architecture

```
Frontend
  ↓ (HTTPS)
Supabase Edge Functions (Deno runtime)
  ↓
PostgreSQL Database
  ├─ activities table
  ├─ activity_reviews table
  ├─ shared_itineraries table
  └─ shared_itinerary_items table
```

### Data Flow

```
User Action
  → Component
  → Service Layer (src/services/api.ts)
  → Edge Function (supabase/functions/server/)
  → Database Query
  → Data Transformation
  → Component Update
  → UI Render
```

## 📂 Directory Structure

```
simalem-resort-booking/
├── src/
│   ├── main.tsx                    # App entry point
│   ├── types/                      # TypeScript definitions
│   ├── services/                   # Data fetching & API
│   ├── utils/                      # Helper functions
│   ├── app/
│   │   ├── App.tsx                 # Root component
│   │   ├── routes.tsx              # Route definitions
│   │   ├── context/                # React Context providers
│   │   ├── pages/                  # Page components
│   │   ├── components/             # Reusable components
│   │   └── data/                   # Mock data (legacy)
│   └── styles/                     # CSS files
├── supabase/
│   └── functions/server/           # Edge function
├── index.html                      # HTML entry
├── package.json                    # Dependencies
├── vite.config.ts                  # Build config
└── .env                            # Environment variables
```

## 🗃 Database Schema

### Tables

1. **activities** (9 columns)
   - Core activity data
   - Pricing, duration, impact metrics
   - Category and active status

2. **activity_reviews** (8 columns)
   - User reviews for activities
   - Rating, comment, helpful count
   - Links to activities table

3. **shared_itineraries** (9 columns)
   - User-created itinerary collections
   - Title, description, engagement metrics
   - Tags for categorization

4. **shared_itinerary_items** (7 columns)
   - Junction table for itinerary activities
   - Links itineraries to activities
   - Maintains sort order

### Relationships

```
activities (1) ←→ (many) activity_reviews
activities (1) ←→ (many) shared_itinerary_items
shared_itineraries (1) ←→ (many) shared_itinerary_items
```

## 🔌 API Endpoints

All endpoints accessible via Edge Function:

### Base URL
```
https://[project-id].supabase.co/functions/v1/make-server-01df2f8f
```

### Endpoints

| Method | Path | Description | Returns |
|--------|------|-------------|---------|
| GET | `/activities` | Fetch active activities | `{ activities: Activity[] }` |
| GET | `/activity-reviews` | Fetch all reviews | `{ reviews: ActivityReview[] }` |
| GET | `/shared-itineraries` | Fetch shared itineraries | `{ itineraries: SharedItinerary[] }` |
| GET | `/health` | Health check | `{ status: "ok" }` |

## 🔐 Security

### Authentication
- Simple role-based auth (guest/supervisor)
- Role stored in localStorage
- No password protection (demo/prototype)

### Data Access
- Supabase RLS (Row Level Security) not currently configured
- All data publicly readable via anon key
- **Production TODO**: Implement proper authentication and RLS

### Environment Variables
- Sensitive credentials in `.env` (gitignored)
- Never committed to version control
- Template provided in `.env.example`

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Emerald green (primary), Teal, Gray scale
- **Typography**: System fonts, responsive sizing
- **Components**: Radix UI primitives with custom styling
- **Layout**: Responsive grid, mobile-first approach

### Key Pages

1. **Login** (`/login`)
   - Role selection (Guest/Supervisor)
   - Simple button-based auth

2. **Activities** (`/activities`)
   - Grid layout of activity cards
   - Category filters
   - Booking modal

3. **Community** (`/community`)
   - Tabbed interface (Itineraries/Reviews)
   - Filter by activity
   - Engagement actions

4. **Checkout** (`/checkout`)
   - Booking cart review
   - Impact summary
   - PER calculation

5. **Summary** (`/summary`)
   - Booking confirmation
   - Total impact metrics

6. **Admin** (`/admin`)
   - Guest bookings table
   - Statistical dashboard
   - PER metrics

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 📊 Key Metrics & Calculations

### Purpose Engagement Ratio (PER)

**Formula:**
```
PER = (Community Ratio + Environmental Ratio) / 2

Where:
- Community Ratio = Direct Local Partner activities / Total activities
- Environmental Ratio = Low impact activities / Total activities
```

**Example:**
```
Guest has 3 activities:
- 2 with "Direct Local Partner" (community)
- 3 with "Low" environmental impact

Community Ratio = 2/3 = 0.67
Environmental Ratio = 3/3 = 1.00
PER = (0.67 + 1.00) / 2 = 0.835 or 83.5%
```

## 🚀 Deployment

### Build Process
```bash
pnpm build
```
- Output: `/dist` directory
- Static files ready for hosting

### Hosting Options
1. **Vercel** (recommended)
2. **Netlify**
3. **Supabase Storage** (static hosting)
4. **Any static host** (S3, GitHub Pages, etc.)

### Environment Setup
1. Production `.env` must have:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Edge function must be deployed
3. Database must be populated

## 🔧 Development Workflow

### Daily Development
```bash
# Start dev server
pnpm dev

# Make changes → Auto-reload

# Build for testing
pnpm build
pnpm preview
```

### Adding Features
1. Define types in `/src/types/index.ts`
2. Create service function in `/src/services/api.ts`
3. Build component in `/src/app/components/` or `/src/app/pages/`
4. Add route in `/src/app/routes.tsx` (if needed)
5. Update documentation

### Database Changes
1. Update table schema in Supabase dashboard
2. Update type definitions in `/src/types/index.ts`
3. Update edge function data transformation
4. Test with real data

## 📈 Future Enhancements

### Short Term
- [ ] Implement real authentication (Supabase Auth)
- [ ] Add guest booking persistence to database
- [ ] Migrate admin portal to real data
- [ ] Add form validation
- [ ] Improve error handling

### Medium Term
- [ ] User profile system
- [ ] Email confirmations
- [ ] Payment integration
- [ ] Calendar view for bookings
- [ ] Mobile app (React Native)

### Long Term
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with resort PMS
- [ ] Guest feedback system
- [ ] Loyalty/rewards program

## 🐛 Known Issues

1. **Admin Portal Uses Mock Data**
   - Location: `/src/app/data/mockGuestBookings.ts`
   - Impact: Admin stats are not real-time
   - Fix: Create guest_bookings table

2. **No Real Authentication**
   - Current: localStorage-based role switching
   - Impact: No security, anyone can access admin
   - Fix: Implement Supabase Auth

3. **Image Fallbacks**
   - `figma:asset` scheme is Figma Make-specific
   - Works in Figma Make, needs fallback locally
   - Fix: Migrate to direct URLs

## 📚 Dependencies

### Core Dependencies (19 key packages)
- `react` - UI framework
- `react-router` - Routing
- `@supabase/supabase-js` - Database client
- `tailwindcss` - CSS framework
- `lucide-react` - Icons
- `sonner` - Toasts
- `date-fns` - Date utilities

### UI Components (40+ Radix packages)
- Complete Radix UI component library
- Accessible, customizable primitives

### Dev Dependencies
- `vite` - Build tool
- `@vitejs/plugin-react` - React support
- `@tailwindcss/vite` - Tailwind integration
- `typescript` - Type checking

### Total Install Size
- ~200 MB node_modules
- ~500 KB production bundle (minified)

## 🎓 Learning Resources

### For This Project
- [README.md](./README.md) - Complete documentation
- [SETUP.md](./SETUP.md) - Setup instructions
- [MIGRATION.md](./MIGRATION.md) - Migration from Figma Make

### External Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)

## 💡 Tips for Developers

1. **Start with types** - Define in `/src/types/index.ts` first
2. **Use service layer** - Never fetch directly in components
3. **Leverage utilities** - Don't duplicate formatting logic
4. **Check console** - React errors are helpful
5. **Use TypeScript** - Let types guide you
6. **Read existing code** - Patterns are consistent
7. **Test locally** - Use Supabase local development
8. **Document changes** - Update README when adding features

## 📞 Support & Contact

- **Technical Issues**: Check browser console, Supabase logs
- **Setup Questions**: See [SETUP.md](./SETUP.md)
- **Migration Help**: See [MIGRATION.md](./MIGRATION.md)
- **Feature Requests**: Create GitHub issue (if using Git)

---

**Last Updated**: March 15, 2026  
**Version**: 1.0.0  
**Status**: Production-ready for local development
