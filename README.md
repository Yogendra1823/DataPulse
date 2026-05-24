# DataPulse — AI-Powered Revenue Intelligence Platform

DataPulse is a modern SaaS revenue analytics platform designed for data-driven business leaders and analysts. By ingestion of raw transaction or sales records via drag-and-drop CSV/Excel files, DataPulse delivers instant KPI dashboards, trend analysis, predictive forecasting, and AI-generated executive reports. Built with Next.js 15, TypeScript, Supabase, Recharts, and Claude/Gemini AI, the platform enables seamless data exploration through interactive charts and natural language queries.

---

## 🌐 Live Demo

**Working URL**: [https://datapulse-intern.vercel.app/](https://datapulse-intern.vercel.app/)

---

## 🚀 Key Features

*   **KPI Dashboard**: Real-time generation of critical metrics including **Total Revenue**, **Total Sales Volume**, **Orders**, **Profit Margins**, **Unique Customers**, and **Average Order Value**.
*   **Intelligent Column Mapping**: Auto-detects custom uploaded columns (mapping variants of Revenue, Sales, Quantity, Profit, Regions, and customer Segment parameters) with statistical parsing for seamless data ingestion.
*   **Deep Financial Analytics**: Interactive visual representations of Revenue vs. Profit, Sales Volume vs. Order trends, Customer growth patterns, and Product revenue distributions using responsive Recharts visualizations.
*   **Gemini AI Insights Engine**: High-fidelity analytical reports categorizing Executive Summaries, Trend Acceleration, Anomaly Flagging, Predictive Forecast models, and Product Mix Optimization recommendations.
*   **Interactive Data Chat**: Chat naturally with your business datasets using natural language queries to extract ad-hoc analytics instantly.
*   **Security & User Credentials**: Built-in authentication (email/password & OAuth) with secure password resets, email updates via Supabase, and strict Row Level Security (RLS) data isolation.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 15 (App Router, Node.js Runtime)
*   **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
*   **Data Visualization**: Recharts
*   **Authentication & Database**: Supabase (PostgreSQL with RLS & OAuth layers)
*   **AI Engine**: Google Gemini API (`gemini-2.0-flash`) with fallback configurations
*   **File Processing**: PapaParse (CSV Parsing), SheetJS/XLSX (Excel Workbook Processing)

---

## 📁 Clean Directory Architecture

The repository adheres to a modular, production-ready directory structure containing only active codebases:

```
datapulse/                  
├── public/                             # Public static assets
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx            # Secure Login route
│   │   │   └── signup/
│   │   │       └── page.tsx            # User Registration route
│   │   ├── api/
│   │   │   └── ai/
│   │   │       ├── chat/
│   │   │       │   └── route.ts        # Chat session API endpoint
│   │   │       └── insights/
│   │   │           └── route.ts        # AI Insights API endpoint
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts            # OAuth Redirect handler
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx            # Multi-dimensional analytics charts
│   │   │   ├── chat/
│   │   │   │   └── page.tsx            # Natural Language chatbot portal
│   │   │   ├── insights/
│   │   │   │   └── page.tsx            # AI Insights generator interface
│   │   │   ├── settings/
│   │   │   │   └── page.tsx            # Security & Profile credentials panel
│   │   │   ├── upload/
│   │   │   │   └── page.tsx            # Data Import Engine
│   │   │   ├── layout.tsx              # Dashboard layout (fixed Sidebar navigation)
│   │   │   └── page.tsx                # Overview dashboard (KPI grid)
│   │   ├── globals.css                 # Styling system, tokens & classes
│   │   ├── layout.tsx                  # Root layout (Fonts, Styling, Toaster)
│   │   └── page.tsx                    # Landing page
│   ├── hooks/
│   │   └── use-sales-data.ts           # Client-side state manager (uploaded dataset)
│   ├── lib/
│   │   ├── ai/
│   │   │   └── client.ts               # Gemini API core logic abstraction
│   │   ├── supabase/
│   │   │   ├── client.ts               # Supabase Browser client
│   │   │   └── server.ts               # Supabase Server client (cookie storage setup)
│   │   └── utils.ts                    # Math & aggregators utility library
│   ├── types/
│   │   └── index.ts                    # TypeScript types and declarations
│   └── middleware.ts                   # Protected routes middleware
├── supabase/
│   └── schema.sql                      # Database tables schema, triggers, and RLS rules
├── .env.example                        # Template for required environment variables
├── .env.local                          # Local environment variables configuration (gitignored)
├── .gitignore                          # Git ignore configurations
├── components.json                     # shadcn/ui components configuration
├── next-env.d.ts                       # Next.js TypeScript declarations
├── next.config.ts                      # Next.js 15 dev variables and configuration
├── package-lock.json                   # Lockfile for project dependencies
├── package.json                        # Dependency specifications
├── postcss.config.js                   # PostCSS configuration for styling
├── tailwind.config.ts                  # Tailwind theme and custom color palettes
└── tsconfig.json                       # TypeScript compiler configuration
```

---

## 🏁 Quick Start & Local Setup

Follow these steps to run a local development environment.

### 1. Repository Installation
```bash
git clone <repository-url>
cd datapulse
npm install
```

### 2. Configure Local Environment
Create your `.env.local` configuration file from the template:
```bash
cp .env.example .env.local
```

Open `.env.local` and supply the required parameters:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google Gemini Configuration
GOOGLE_AI_API_KEY=your_google_gemini_api_key_here
AI_PROVIDER=gemini
AI_MODEL=gemini-2.0-flash

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize the Database
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** on your Supabase dashboard.
3. Paste the contents of `supabase/schema.sql` and run the script. This initializes the required tables, profile-creation triggers, and secure RLS policies.

### 4. Boot Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view your local platform instance.

---

## 🔒 Security & Database RLS Policies

DataPulse enforces strict data isolation. The tables defined in `supabase/schema.sql` include:

*   `profiles`: Custom metadata extending `auth.users` via database triggers.
*   `uploads`: Tracks uploaded datasets with file metadata.
*   `sales_records`: Normalized sales transaction rows.
*   `reports`: Stores historically saved AI analysis output.
*   `ai_insights`: Internal audit logging of AI queries.
*   `dashboard_settings`: User dashboard preferences.

Every table enforces Row Level Security (RLS) policies ensuring **users can only select, insert, update, or delete their own data**.

---

## 📈 AI Provider Configurations
To toggle your AI integration, adjust the `AI_PROVIDER` flag inside your `.env.local` configuration:

```env
# Google Gemini (Default/Recommended)
AI_PROVIDER=gemini
AI_MODEL=gemini-2.0-flash
GOOGLE_AI_API_KEY=your_google_gemini_api_key_here

# Anthropic Claude (Alternative)
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-sonnet-20241022
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenAI (Alternative)
AI_PROVIDER=openai
AI_MODEL=gpt-4o
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 💻 CLI Command Index

*   `npm run dev` — Starts the Next.js development server with hot-reloading.
*   `npm run build` — Compiles the production build.
*   `npm run start` — Boots the compiled production server.
*   `npm run lint` — Runs static code ESLint checks.
*   `npm run type-check` — Validates all TypeScript types (`tsc --noEmit`).
