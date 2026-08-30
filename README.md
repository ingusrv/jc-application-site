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

Deploy to Azure Static Web Apps via GitHub Actions. Configure:
- `app_location: "/"`
- `api_location: "build/server"`
- `output_location: "build/static"`
- Set `DATABASE_URL` in Azure Portal application settings
