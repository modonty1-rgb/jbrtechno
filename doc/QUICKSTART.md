# Quick Start Guide

## Installation

### 1. Install pnpm (if not already installed)

\`\`\`bash
npm install -g pnpm
\`\`\`

Or using other methods:
- **Windows**: `iwr https://get.pnpm.io/install.ps1 -useb | iex`
- **macOS/Linux**: `curl -fsSL https://get.pnpm.io/install.sh | sh -`

### 2. Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### 3. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

The site will be available at [http://localhost:3000](http://localhost:3000)

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## First Time Setup

The website will:
- Default to **Arabic** language
- Show the homepage with business plan overview
- Provide navigation to three main sections:
  1. General Plan
  2. Hiring Plan  
  3. Timeline

## Features to Test

- [ ] Language toggle (Arabic ↔ English)
- [ ] Dark/Light mode toggle
- [ ] Navigation between pages
- [ ] Print functionality (Ctrl/Cmd + P)
- [ ] Mobile responsive design
- [ ] RTL (right-to-left) for Arabic

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:

\`\`\`bash
pnpm add -g vercel
vercel
\`\`\`

## Troubleshooting

### Port Already in Use

If port 3000 is busy:

\`\`\`bash
pnpm dev -- -p 3001
\`\`\`

### Clear Cache

If you encounter issues:

\`\`\`bash
rm -rf .next
pnpm install
pnpm dev
\`\`\`

### Dependencies Issues

\`\`\`bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
\`\`\`

## Project Structure

\`\`\`
jbrtechno.com/
├── app/                  # Next.js app directory
│   └── [locale]/        # Localized routes (ar/en)
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── helpers/            # Utility functions
├── doc/               # Business plan documents
│   ├── general.md
│   ├── hiring-plan-detailed.md
│   └── 4-month-launch-timeline.md
└── messages/          # Translations
    ├── ar.json
    └── en.json
\`\`\`

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- Ensure Node.js version is 18+ (`node --version`)

