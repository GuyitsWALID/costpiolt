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
2. Run the database migration:
   ```bash
   # Option 1: Using psql (if you have direct database access)
   psql $DATABASE_URL -f migrations/20250921_create_projects.sql
   
   # Option 2: Using Supabase CLI (recommended)
   supabase db push
   
   # Option 3: Copy and paste the SQL from migrations/20250921_create_projects.sql
   # into the Supabase SQL editor at https://app.supabase.com/project/YOUR_PROJECT/sql
   ```
3. Configure authentication providers in Supabase dashboard
4. Enable Row Level Security (RLS) - this is handled by the migration

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
│   │   ├── dashboard/       # Dashboard page (Module 1)
│   │   └── api/projects/    # Project CRUD API
│   ├── components/          # React components
│   │   ├── Sidebar.tsx      # Dashboard sidebar
│   │   ├── ProjectList.tsx  # Project listing
│   │   └── ProjectCreateForm.tsx # Project creation form
│   └── lib/                 # Utilities and Supabase client
├── migrations/              # Database migrations
│   └── 20250921_create_projects.sql
├── supabase/
│   ├── functions/           # Edge Functions (AI processing)
│   └── migrations/          # Database schema
└── public/                  # Static assets
```

## Module 1: Dashboard & Project Management

### Features
- **Authentication**: Supabase Auth integration with session management
- **Dashboard**: Main workspace with sidebar navigation
- **Project Management**: Full CRUD operations for AI projects
- **Real-time Updates**: Projects list updates after creation
- **Responsive Design**: Mobile-friendly sidebar that collapses

### API Endpoints

#### POST /api/projects
Create a new project.

**Request:**
```json
{
  "name": "string (required, max 120)",
  "description": "string (optional)",
  "projectType": "prototype|fine_tune|production",
  "modelApproach": "api_only|fine_tune|from_scratch",
  "dataset_gb": "number (>=0)",
  "label_count": "integer (>=0)",
  "monthly_tokens": "integer (>=0)"
}
```

**Response (201):**
```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "...",
    "description": "...",
    "project_type": "...",
    "model_approach": "...",
    "dataset_gb": 20,
    "label_count": 1000,
    "monthly_tokens": 200000,
    "created_at": "ISO timestamp"
  }
}
```

#### GET /api/projects
List user projects.

**Response:**
```json
{
  "success": true,
  "projects": [ { /* project rows for current user */ } ]
}
```

### Testing with cURL

Create a project:
```bash
curl -X POST http://localhost:3000/api/projects \
 -H "Authorization: Bearer <ACCESS_TOKEN>" \
 -H "Content-Type: application/json" \
 -d '{"name":"My AI Bot","projectType":"fine_tune","modelApproach":"fine_tune","dataset_gb":10,"label_count":1000,"monthly_tokens":200000}'
```

List projects:
```bash
curl -X GET http://localhost:3000/api/projects \
 -H "Authorization: Bearer <ACCESS_TOKEN>"
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
