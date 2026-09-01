# JC Application Form Portal

Application form portal built with SvelteKit 5, Tailwind CSS, shadcn-svelte, and Azure SQL.

## Setup

Install dependencies:
```bash
npm install
```

Copy `.env.example` to `.env` and configure `DATABASE_URL`.

For local development with Docker:
```bash
npm run docker:db
```

## Development

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run check        # Type check
npm run db:generate  # Generate migrations
npm run db:push      # Push schema to database
npm run docker:all   # Run SWA emulator + database
```

## Deployment

Deploy this app as a Node 24 LTS Azure App Service app.

Required Azure configuration:
- Runtime stack: `Node 24 LTS`
- Startup command: `npm start`
- Set `DATABASE_URL` in App Service configuration
- Enable App Service built-in authentication (Microsoft Entra ID) and set the app to require authentication for admin routes if needed
- Set `PUBLIC_ENABLE_AUTH=true` when the built-in auth is enabled

Example App Service startup command:
```bash
npm start
```
