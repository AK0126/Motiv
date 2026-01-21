# Supabase Setup Guide for Motiv

This guide will walk you through setting up the Supabase backend for the Motiv time-tracking app.

## Prerequisites

- A GitHub or Google account (for Supabase login)
- Web browser

---

## Step 1: Create Supabase Account & Project

1. **Go to Supabase**
   - Visit: https://supabase.com
   - Click "Start your project" or "Sign In"

2. **Sign in or Create Account**
   - Use GitHub or Google to sign in
   - Accept the terms of service

3. **Create a New Project**
   - Click "New Project" (or the "+" button)
   - **Organization**: Select your organization (or create a new one)
   - **Project Name**: `motiv-production` (or your preferred name)
   - **Database Password**: Click "Generate a password" (IMPORTANT: Save this somewhere safe!)
   - **Region**: Choose the region closest to you (e.g., "US West (Oregon)" or "Europe (Frankfurt)")
   - **Pricing Plan**: Free tier is sufficient for development
   - Click "Create new project"

4. **Wait for Project Creation**
   - This takes about 2 minutes
   - You'll see "Setting up project..." with a progress indicator
   - Once complete, you'll be taken to the project dashboard

---

## Step 2: Get Your API Credentials

1. **Navigate to Project Settings**
   - In the left sidebar, click the **gear icon** (⚙️) at the bottom
   - This opens "Project Settings"

2. **Go to API Settings**
   - Click on "API" in the left menu under "Project Settings"

3. **Copy Your Credentials**
   - You'll see two important values:

   **Project URL**:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Copy this entire URL.

   **Publishable key** (under "Project API keys"):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```
   Copy this entire key (it's very long).

---

## Step 3: Update Your .env.local File

1. **Open your `.env.local` file** in the Motiv project directory

2. **Replace the placeholder values** with your actual credentials:

   ```env
   # Supabase Configuration
   # Replace these values with your actual Supabase project credentials
   # Get these from: https://supabase.com → Your Project → Settings → API

   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
   ```

3. **Save the file**

---

## Step 4: Run the Database Schema

1. **Navigate to SQL Editor**
   - In your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar (icon looks like `</>`)

2. **Create a New Query**
   - Click "+ New query" button

3. **Copy the Schema SQL**
   - Open the file `supabase-schema.sql` in your Motiv project
   - Copy the ENTIRE contents of the file

4. **Paste and Run**
   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - Wait for execution (should take 2-5 seconds)

5. **Verify Success**
   - You should see "Success. No rows returned" at the bottom
   - The last query in the script will show a table with 4 rows:
     ```
     table_name        | column_count
     ------------------|-------------
     activities        | 10
     categories        | 7
     daily_ratings     | 6
     user_settings     | 6
     ```

---

## Step 5: Verify Tables Were Created

1. **Go to Table Editor**
   - Click "Table Editor" in the left sidebar (icon looks like a table grid)

2. **Check for Tables**
   - You should see 4 tables listed:
     - `activities`
     - `categories`
     - `daily_ratings`
     - `user_settings`

3. **Click on Each Table**
   - Click on "categories" - you should see column headers (id, user_id, name, color, etc.)
   - Click on "activities" - you should see column headers
   - Click on "daily_ratings" - you should see column headers
   - Click on "user_settings" - you should see column headers
   - All tables should be empty (0 rows) at this point

---

## Step 6: Configure Authentication Settings

1. **Navigate to Authentication**
   - Click "Authentication" in the left sidebar (icon looks like a user)

2. **Check Email Provider is Enabled**
   - Click "Providers" in the sub-menu
   - Find "Email" in the list
   - It should show a green "Enabled" badge
   - If not enabled, click on it and toggle "Enable Email provider" to ON

3. **Configure Email Templates (Optional)**
   - Click "Email Templates" in the sub-menu
   - You can customize the signup confirmation email and password reset email
   - For now, the defaults are fine

4. **Configure Site URL (Important for Production)**
   - Go to "Authentication" → "URL Configuration"
   - **Site URL**: Set this to your production URL (for now, use `http://localhost:5173`)
   - **Redirect URLs**: Add `http://localhost:5173/**` for development

---

## Step 7: Verify Row Level Security (RLS)

1. **Go to Authentication Policies**
   - Click on "Authentication" in the left sidebar
   - Click on "Policies" in the sub-menu

2. **Check Each Table Has Policies**
   - Select "categories" from the dropdown
     - You should see 4 policies (view, insert, update, delete)
   - Select "activities"
     - You should see 4 policies
   - Select "daily_ratings"
     - You should see 4 policies
   - Select "user_settings"
     - You should see 4 policies

3. **Verify RLS is Enabled**
   - All tables should show "RLS enabled" badge
   - This ensures users can only access their own data

---

## Step 8: Test the Connection

1. **Start Your Development Server**
   ```bash
   cd /Users/akarbowski/Documents/projects/motiv/motiv
   npm run dev
   ```

2. **Open Your Browser**
   - Go to http://localhost:5173

3. **You Should See**
   - The Login page (NOT an error about missing Supabase credentials)
   - If you see errors in the browser console about Supabase, double-check your `.env.local` file

---

## Step 9: Create Your First Test User

1. **On the Login Page**
   - Click "Sign up" link at the bottom

2. **Fill in the Signup Form**
   - Email: Use a real email you can access
   - Password: At least 8 characters
   - Confirm Password: Same as password
   - Click "Create Account"

3. **Check Email Confirmation (if enabled)**
   - If email confirmation is enabled, check your inbox
   - Click the confirmation link in the email from Supabase
   - If disabled, you'll be signed in immediately

4. **Verify Default Data Was Created**
   - Go back to Supabase dashboard
   - Click "Table Editor" → "categories"
   - You should see 6 default categories created for your user:
     - Work (blue)
     - Personal (purple)
     - Exercise (green)
     - Learning (orange)
     - Social (pink)
     - Rest (indigo)

5. **Check User Settings**
   - Click "Table Editor" → "user_settings"
   - You should see 1 row with your user's default settings

---

## Troubleshooting

### Issue: "Missing Supabase environment variables" in browser console

**Solution:**
- Verify `.env.local` exists in your project root
- Verify the environment variables are named exactly:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- Restart your development server (`npm run dev`)

### Issue: SQL script fails with "relation already exists"

**Solution:**
- The tables were already created
- You can drop them and re-run:
  ```sql
  DROP TABLE IF EXISTS activities CASCADE;
  DROP TABLE IF EXISTS daily_ratings CASCADE;
  DROP TABLE IF EXISTS user_settings CASCADE;
  DROP TABLE IF EXISTS categories CASCADE;
  DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
  ```
  Then run the schema script again.

### Issue: "Invalid API key" error

**Solution:**
- Double-check you copied the **Publishable** key, not the service_role key
- Make sure there are no extra spaces or line breaks in `.env.local`
- Restart your development server

### Issue: User can't sign up or login

**Solution:**
- Check Authentication → Providers → Email is enabled
- Check for errors in the Supabase "Logs" section (left sidebar → "Logs")
- Verify RLS policies are created correctly

### Issue: No default categories created after signup

**Solution:**
- Check if the trigger was created:
  ```sql
  SELECT trigger_name FROM information_schema.triggers
  WHERE event_object_table = 'users' AND trigger_name = 'on_auth_user_created';
  ```
- If missing, re-run the trigger creation part of the schema

### Issue: "Database error saving new user" during signup

**Solution:**
- This happens when the trigger function can't bypass RLS policies
- Run the fix SQL script: `supabase-fix-trigger.sql`
- This recreates the trigger with proper `SECURITY DEFINER` and `SET search_path` settings
- After running the fix, try signing up again

---

## Next Steps

Once Supabase is set up and verified:

1. ✅ You can now sign up and login to the app
2. ✅ User data will be stored in Supabase (not localStorage)
3. ✅ Each user will have isolated data (RLS enforced)
4. ⏭️ Continue with Phase 5: Update components for async operations
5. ⏭️ Test all features with the new backend

---

## Useful Supabase Dashboard Sections

- **Table Editor**: View and manually edit data
- **SQL Editor**: Run custom SQL queries
- **Authentication**: Manage users and auth settings
- **Logs**: View real-time logs for debugging
- **Database**: View database statistics and performance
- **API Docs**: Auto-generated API documentation

---

## Security Best Practices

✅ **DO:**
- Keep your database password safe
- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Use strong passwords for user accounts
- Regularly review user access logs

❌ **DON'T:**
- Share your `service_role` key (not used in this app, but keep it secret)
- Disable Row Level Security (RLS)
- Use the same password for multiple accounts

---

## Support

If you encounter issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Check the Supabase Discord: https://discord.supabase.com
3. Review error messages in the browser console and Supabase logs
