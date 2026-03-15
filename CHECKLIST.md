# Local Development Checklist

Use this checklist to ensure your local development environment is properly configured.

## ✅ Pre-Setup

- [ ] Node.js 18+ installed (`node --version`)
- [ ] pnpm installed (`pnpm --version`)
- [ ] VS Code installed
- [ ] Git installed (optional, but recommended)

## ✅ Supabase Setup

- [ ] Supabase account created
- [ ] New Supabase project created
- [ ] Database password saved securely
- [ ] Project ID noted (found in Settings → General)
- [ ] `activities` table created
- [ ] `activity_reviews` table created
- [ ] `shared_itineraries` table created
- [ ] `shared_itinerary_items` table created
- [ ] Sample data inserted (optional)
- [ ] Supabase CLI installed (`supabase --version`)
- [ ] Logged into Supabase CLI (`supabase login`)
- [ ] Project linked (`supabase link`)
- [ ] Edge function deployed (`supabase functions deploy server`)

## ✅ Project Configuration

- [ ] Project copied to local directory
- [ ] `.env` file created from `.env.example`
- [ ] `VITE_SUPABASE_URL` set in `.env`
- [ ] `VITE_SUPABASE_ANON_KEY` set in `.env`
- [ ] Dependencies installed (`pnpm install`)
- [ ] No installation errors in terminal

## ✅ Files to Remove (from Figma Make)

- [ ] Deleted `/utils/supabase/info.tsx` (if exists)
- [ ] Removed any Figma Make-specific imports

## ✅ Verification

- [ ] Dev server starts (`pnpm dev`)
- [ ] Browser opens to `http://localhost:5173`
- [ ] No errors in terminal
- [ ] No errors in browser console (F12)
- [ ] Login page displays
- [ ] Can click "Access Guest Booking"
- [ ] Activities page loads
- [ ] Activities display (not empty)
- [ ] Can filter activities by category
- [ ] Can click "Book Activity"
- [ ] Booking modal opens
- [ ] Community page loads
- [ ] Reviews display
- [ ] Shared itineraries display
- [ ] Can access Admin portal
- [ ] Admin page shows statistics

## ✅ Optional Enhancements

- [ ] VS Code extensions installed (see `.vscode/extensions.json`)
- [ ] `.vscode/settings.json` created with recommended settings
- [ ] ESLint configured
- [ ] Prettier configured
- [ ] Git repository initialized (`git init`)
- [ ] `.gitignore` verified
- [ ] Initial commit made

## 🚨 Troubleshooting Checklist

If something doesn't work, check:

- [ ] `.env` file is in the project root (not in `/src`)
- [ ] `.env` variables start with `VITE_`
- [ ] Dev server was restarted after editing `.env`
- [ ] No typos in Supabase credentials
- [ ] Edge function shows as deployed (`supabase functions list`)
- [ ] Tables exist in Supabase dashboard
- [ ] Tables have data (at least 1 activity)
- [ ] Browser cache cleared
- [ ] No ad blockers interfering
- [ ] Correct Node.js version (18+)
- [ ] `node_modules` fully installed
- [ ] Port 5173 is available (not in use)

## 📋 Daily Development Checklist

Before starting work:
- [ ] Pull latest changes (if using Git)
- [ ] `pnpm install` (if package.json changed)
- [ ] Check Supabase dashboard is accessible
- [ ] Start dev server (`pnpm dev`)

Before committing:
- [ ] No console errors
- [ ] App works in browser
- [ ] TypeScript errors resolved (`pnpm build`)
- [ ] `.env` NOT committed (in .gitignore)
- [ ] Changes tested locally

## 🎯 Success Criteria

You're ready to develop when:

✅ Dev server runs without errors  
✅ Activities load from Supabase database  
✅ Community page shows reviews and itineraries  
✅ Booking flow works (add to cart, checkout)  
✅ Admin portal displays statistics  
✅ No console errors in browser  
✅ Hot reload works (changes appear automatically)  

## 📖 Next Steps

Once setup is complete:

1. Read [README.md](./README.md) for project overview
2. Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture
3. Read [MIGRATION.md](./MIGRATION.md) to understand changes
4. Explore the codebase:
   - Start with `/src/main.tsx`
   - Then `/src/app/App.tsx`
   - Then `/src/app/routes.tsx`
   - Then page components in `/src/app/pages/`
5. Make a small change to test hot reload
6. Start building features!

---

**Need Help?**

- Setup issues → [SETUP.md](./SETUP.md)
- Migration questions → [MIGRATION.md](./MIGRATION.md)
- Project structure → [README.md](./README.md)
- Architecture → [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
