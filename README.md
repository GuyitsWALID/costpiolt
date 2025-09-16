# CostPilot - AI-Powered Budget Estimation for AI Projects

CostPilot is an intelligent budget estimation tool that helps you plan and track costs for AI/ML projects. It uses Google Gemini AI to provide accurate cost estimates and optimization recommendations.

## Features

🚀 **Quick AI Estimates**: Get instant budget breakdowns using Google Gemini AI
📊 **Interactive Budget Editor**: Detailed cost tracking with explanations
🤖 **AI-Powered Insights**: Cost optimization tips and explanations
📈 **Forecast & Tracking**: ML-based forecasting and actual cost tracking
🔒 **Secure & Private**: Built on Supabase with Row Level Security

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase Edge Functions, PostgreSQL
- **AI**: Google Gemini 1.5 Flash
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with RLS policies

## Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd costpiolt
npm install
```

### 2. Set up Environment Variables
Copy `.env.local.example` to `.env.local` and configure:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini Configuration
GOOGLE_API_KEY=your-google-gemini-api-key
```

### 3. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration: `supabase db push`
3. Deploy Edge Functions: `supabase functions deploy`

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using CostPilot!

## API Setup

### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env.local` as `GOOGLE_API_KEY`

### Supabase Setup
1. Create project at [supabase.com](https://supabase.com)
2. Get your URL and anon key from Settings → API
3. Set up the database schema using the migration file
4. Deploy the Edge Functions for AI processing

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   └── lib/                 # Utilities and Supabase client
├── supabase/
│   ├── functions/           # Edge Functions (AI processing)
│   └── migrations/          # Database schema
└── public/                  # Static assets
```

## Key Features Explained

### Quick Estimate Workflow
1. **Input Project Details**: Type, approach, dataset size, team
2. **AI Processing**: Gemini analyzes and generates cost breakdown
3. **Deterministic Fallback**: Rule-based calculations as backup
4. **Database Storage**: Persists estimates for tracking
5. **Import to Budget**: Seamlessly move estimates to budget editor

### AI-Powered Explanations
- Click any budget line item to get AI explanations
- Optimization tips and alternative approaches
- Cost breakdown and reasoning

### Forecasting & Tracking
- ML-based cost predictions with confidence intervals
- Actual vs. estimated cost tracking
- Historical trend analysis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
