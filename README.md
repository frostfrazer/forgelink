# 🔥 ForgeLink - The MCP Server Marketplace

**Tagline:** Discover, Share, and Connect AI Agents to Any Tool

ForgeLink is the premier marketplace for Model Context Protocol (MCP) servers, making it easy for developers to find, share, and integrate production-ready connectors that let AI agents interact with databases, APIs, and services.

## 🚀 Quick Start (Windows 11)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- A Supabase account (free tier works perfectly)

### Installation

1. **Clone or download this repository**
```bash
cd C:\Users\YourUsername\Projects
# If you have the files, skip to step 2
```

2. **Install dependencies**
```bash
cd forgelink
npm install
```

3. **Set up Supabase Database**

   a. Go to [supabase.com](https://supabase.com) and create a free account
   
   b. Create a new project (takes ~2 minutes to spin up)
   
   c. Once ready, go to **Project Settings** → **API**
      - Copy the `Project URL`
      - Copy the `anon public` key
   
   d. Go to **SQL Editor** in the sidebar
      - Click "New Query"
      - Copy the entire contents of `supabase-schema.sql`
      - Paste and click "Run"
      - You should see "Success. No rows returned"

4. **Configure Environment Variables**
```bash
# Copy the example file
copy .env.example .env.local

# Open .env.local in Notepad and fill in your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - You should see the ForgeLink landing page! 🎉

## 📁 Project Structure

```
forgelink/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── lib/
│   └── supabase/          # Supabase client utilities
│       ├── client.ts      # Browser client
│       └── server.ts      # Server client
├── supabase-schema.sql    # Database schema
├── package.json           # Dependencies
└── README.md             # This file
```

## 🎯 What We've Built (Phase 1)

- ✅ **Landing Page** with hero, features, and server previews
- ✅ **Database Schema** with tables for servers, reviews, categories
- ✅ **Project Structure** ready for rapid development
- ✅ **Tailwind CSS** configured with custom ForgeLink theme
- ✅ **Supabase Integration** with RLS policies

## 🔜 Next Steps (Phase 2)

We'll build these in order:

1. **Browse Page** - Full server directory with search and filters
2. **Server Detail Page** - Individual server pages with install instructions
3. **Submit Page** - Form for developers to add their MCP servers
4. **Authentication** - User accounts via Supabase Auth
5. **User Dashboard** - Manage submitted servers and reviews

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (Postgres)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Deployment:** Vercel (we'll set this up later)

## 💡 Development Tips

### Viewing Database Tables
1. Go to Supabase Dashboard → Table Editor
2. You'll see all tables created by the schema
3. You can manually insert test data to preview functionality

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Port Issues?
If port 3000 is already in use:
```bash
npm run dev -- -p 3001  # Use port 3001 instead
```

## 🐛 Troubleshooting

**Problem:** `npm install` fails
- **Solution:** Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem:** Supabase connection errors
- **Solution:** Double-check your `.env.local` file has the correct URL and key

**Problem:** Tailwind styles not loading
- **Solution:** Stop the dev server (Ctrl+C) and restart with `npm run dev`

## 📈 The Roadmap

**Phase 1** ✅ - Foundation (COMPLETE)
**Phase 2** 🚧 - Core Features (Browse, Submit, Detail pages)
**Phase 3** 📋 - Authentication & User Features
**Phase 4** 💰 - Monetization (Featured listings, Premium features)
**Phase 5** 🚀 - Growth (SEO, Marketing, Community)

---

**Built with ambition. Powered by MCP. 🔗**

Need help? Open an issue or reach out!
