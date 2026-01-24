# Motiv

An online activity logger to keep track of how you're spending your time everyday. Personal project to learn how to use Claude Code.

Check out the live project! <https://motiv-blond.vercel.app/>

## Features

There's so much that data can teach us, but we barely collect any data about our daily life. Motiv is an app built to collect data about how your spend your time everyday, so that you can make data-driven reflections about your life.

**Log your daily activity:** Google calendar-like timeline to log your daily activity, and to look back on how you've spent each day.

![Motiv Day View](/docs/images/Motiv%20Day%20View.png)

**Keep track of your daily mood:** Calendar view to remind you of your great days, OK days, and tough days. 

> If you are doing something difficult, if you are chasing a dream... you are going to be happy about a third of the time. And another third of the time, you are going to be like "eh, you know, life is kinda alright." And the final third of the time, you're gonna feel terrible, Mel.
>
> –Emma Grede on The Mel Robbins Podcast

![Motiv Month View](/docs/images/Motiv%20Month%20View.png)

**Analyze your time use:** Analytics to see how you've spent your time in the past week, month, and 3 months.

![Motiv Analytics](/docs/images/Motiv%20Analytics.png)

**Flexible categories:** Choose your own categories to track how you're spending your day, so that it's relevant to your personal experiences and goals.

![Motiv Categories](/docs/images/Motiv%20Categories.png)

## Tech Stack
**Frontend:**
- React
- Vite 
- Tailwind CSS
- React Query (@tanstack/react-query)
- Recharts (for charts)
- date-fns (date utilities)

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth (JWT authentification)

**Deployment:**
- Vercel (frontend hosting)
- Supabase Cloud (backend)

## Local Development

I imagine that different users will have different features that they want for Motiv: maybe a text input to keep track of your diary entry, keeping track of your sleep, and other specific data points that you can use to track your life. Feel free to clone this repo and modify this code however you'd like to fit your needs. This is now especially accessible to everyone thanks to the advent of LLMs that can code for you (like Claude Code).

### Prerequisites

What you need before starting:
- Node.js 18+ and npm
- Git
- A Supabase account (for backend)
- A Vercel account (for deployment - optional)

### Quick Start

**Step 1: Clone the repository**
```bash
git clone https://github.com/AK0126/motiv.git
cd motiv
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Set up environment variables**

Create a `.env.local` file (copy from `.env.example`):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

**Step 4: Set up Supabase backend**

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions on:
- Creating a Supabase project
- Running the database schema
- Configuring authentication

**Step 5: Start development server**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Project Structure
Brief overview of key directories:
```
motiv/
├── src/
│   ├── components/      # React components
│   │   ├── MonthCalendar.jsx
│   │   ├── DayView.jsx
│   │   ├── AnalyticsView.jsx
│   │   ├── CategoryManager.jsx
│   │   └── ...
│   ├── pages/          # Auth pages (Login, SignUp, etc.)
│   ├── hooks/
│   │   └── api/        # React Query hooks for API
│   ├── services/
│   │   └── api/        # Supabase API service layer
│   ├── contexts/       # React Context (AuthContext)
│   ├── utils/          # Helper functions
│   └── lib/            # Supabase client setup
├── public/             # Static assets
├── SUPABASE_SETUP.md   # Backend setup guide
├── VERCEL_DEPLOYMENT.md # Deployment guide
└── TESTING.md          # Testing guide
```

## Next Steps
Currently, I'm experimenting with different UIs so I can use the app more comfortably.

Once I have enough data in the app (when I log enough days), I'd potentially like to pair this with an LLM API (like in my [DSPy project](https://github.com/AK0126/HINTy)) to generate intelligent feedback/advice/goals based on your daily life.
