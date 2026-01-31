# Tech Stack

## Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand (cart state), TanStack Query (server state)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS v4 with custom animations
- **Build Tool**: Vite 7

## Backend
- **Runtime**: Node.js with Express 5
- **Database**: SQLite with Drizzle ORM (better-sqlite3)
- **Validation**: Zod schemas
- **Session**: Not used (stateless API)

## Development Tools
- **TypeScript**: v5.6.3 (strict mode enabled)
- **Package Manager**: npm
- **Database Migrations**: drizzle-kit

## Common Commands

```bash
# Development
npm run dev              # Start dev server (port 5000)

# Build & Production
npm run build            # Build for production
npm start                # Run production server

# Type Checking
npm run check            # Run TypeScript compiler check

# Database
npm run db:push          # Push schema changes to database
```

## Environment Variables
- `DATABASE_PATH`: SQLite database file path (default: ./data/parrot_shop.db)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `TELEGRAM_BOT_TOKEN`: Telegram bot token for order notifications (optional)

## Path Aliases
- `@/*`: Maps to `client/src/*`
- `@shared/*`: Maps to `shared/*`
- `@assets/*`: Maps to `attached_assets/*`
