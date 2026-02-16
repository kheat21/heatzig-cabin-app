# Heatzig Cabin App

A family cabin management application built with Next.js, Supabase, and TypeScript. Features include trip scheduling, message board, weather forecasts, and an AI-powered concierge.

## Features

- 📅 **Calendar**: Schedule and manage cabin trips with family member tracking
- 💬 **Message Board**: Post updates, requests, and comments
- 🌤️ **Weather**: 7-day weather forecast for Park City, Utah
- 🤖 **AI Concierge**: Get local recommendations and information about Promontory Club

## Setup

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- OpenAI API key (for Concierge feature)
- OpenWeather API key (for Weather feature)

### Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NEXT_PUBLIC_OPENWEATHER_API_KEY`: Your OpenWeather API key

### Supabase Database Setup

Create the following tables in your Supabase project:

#### Posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
CREATE POLICY "Enable all access for posts" ON posts
  FOR ALL USING (true);
```

#### Trips Table
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_name TEXT NOT NULL,
  family_members TEXT[] NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guest_count INTEGER DEFAULT 1,
  created_by TEXT NOT NULL,
  notes TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your needs)
CREATE POLICY "Enable all access for trips" ON trips
  FOR ALL USING (true);
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the environment variables in Vercel project settings:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`

4. Deploy!

## Troubleshooting

### "Failed to execute 'set' on 'Headers': Invalid value" Error

This error occurs when environment variables are not properly set. To fix:

1. **Local Development**: Ensure `.env.local` exists and contains valid values
2. **Vercel Deployment**: 
   - Go to your Vercel project → Settings → Environment Variables
   - Verify all required variables are set (especially `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Redeploy after adding/updating variables

3. **Supabase Connection**: 
   - Verify your Supabase project is active
   - Check that RLS policies are properly configured
   - Ensure API keys haven't expired

### Weather Not Loading

If weather data isn't loading:
- Verify `NEXT_PUBLIC_OPENWEATHER_API_KEY` is set correctly
- Check that your OpenWeather API key is active
- The app will use mock data if the API key is missing or invalid

### Concierge Not Working

If the AI concierge isn't responding:
- Verify `OPENAI_API_KEY` is set correctly
- Ensure your OpenAI account has available credits
- The app will show a fallback message if the API fails

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4
- **Weather**: OpenWeather API
- **Icons**: Lucide React
- **Date Utilities**: date-fns
