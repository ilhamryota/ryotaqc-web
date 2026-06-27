# RyotaQCV1 Web - Quality Control System

> Sistem Quality Control Laptop & MacBook berbasis web dengan AI Assistant

## 🌐 Live URLs

- **Production:** https://ryotaqc.com
- **Vercel:** https://ryotaqc-web.vercel.app
- **GitHub:** https://github.com/ilhamryota/ryotaqc-web

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Deploy to Vercel
vercel --prod
```

## ✨ Features

- ✅ 20-step Quality Control Procedures
- ✅ 11 SOP Categories (Battery, LCD, Keyboard, etc.)
- ✅ 4-level Knowledge Base
- ✅ Quiz System (40+ questions)
- ✅ AI Assistant powered by RyotaCode
- ✅ Admin CMS with role-based access
- ✅ Media Library for uploads
- ✅ Dark mode & responsive design

## 🛠️ Tech Stack

- **Framework:** TanStack Start (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL)
- **AI:** 9router RyotaCode
- **Deployment:** Vercel
- **Package Manager:** Bun

## 📦 Project Structure

```
├── src/
│   ├── routes/           # App routes
│   ├── components/       # React components
│   ├── lib/              # Utilities & functions
│   └── integrations/     # Supabase integration
├── supabase/
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## 🔧 Development Workflow

1. Make changes locally
2. Test with `bun run dev`
3. Commit changes: `git commit -m "message"`
4. Push to GitHub: `git push origin master`
5. Vercel auto-deploys (if connected)
6. Both ryotaqc.com & vercel.app update automatically

## 📝 Documentation

- **Deployment Guide:** `DEPLOYMENT_SUCCESS.md`
- **Testing Checklist:** `TESTING_CHECKLIST.md`
- **Agent Instructions:** `AGENTS.md`

## 🔒 Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=

# AI Integration
VITE_AI_API_URL=
VITE_AI_API_KEY=
VITE_AI_MODEL=

# Site Configuration
VITE_SITE_URL=
```

## 🎯 Deployment Status

- ✅ Database: Migrated (13 migrations)
- ✅ Production: Live on Vercel
- ✅ Custom Domain: ryotaqc.com
- ✅ SSL: Active (Let's Encrypt)
- ✅ GitHub: Connected
- ⏳ Auto-deployment: Configure in Vercel dashboard

## 📊 Database Schema

### Tables:
- `profiles` - User profiles
- `user_roles` - Role-based access control
- `articles` - Content articles
- `sop_items` - Standard Operating Procedures
- `knowledge_materials` - Knowledge base content
- `quiz_questions` - Quiz questions & answers
- `media_library` - File uploads
- `site_settings` - App configuration

## 🚦 Testing

```bash
# Run tests (if configured)
bun test

# Lint code
bun run lint

# Type check
tsc --noEmit
```

## 🤝 Contributing

This project uses a structured Git workflow:
1. Create feature branch
2. Make changes
3. Submit pull request
4. Review & merge to master
5. Auto-deploy to production

## 📞 Support

- **Issues:** https://github.com/ilhamryota/ryotaqc-web/issues
- **Email:** admin@ryotaqc.com

## 📄 License

All rights reserved © 2026 RyotaQC

---

**Built with ❤️ for Quality Control Excellence**
