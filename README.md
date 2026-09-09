# JC Application Form Portal

Application form portal built with SvelteKit 5, Tailwind CSS, shadcn-svelte, and Azure SQL.

## Setup

Install dependencies:
```bash
npm install
```
For local development with Docker:
Configure `LOCAL_DB_SA_PASSWORD` in `.env` and then you can run
```bash
npm run docker:db
```
To connect to the database, configure `DATABASE_URL` in `.env`
To enable email sending from the applications page, also configure `ACS_CONNECTION_STRING` and `ACS_SENDER_ADDRESS` with a verified Azure Communication Services Email sender.

## Development

```bash
npm run db:generate  # Generate migrations
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run check        # Type check
```

## Deployment

Deploy this app as a Node 24 LTS Azure App Service app.

Required Azure configuration:
- Runtime stack: `Node 24 LTS`
- Startup command: `npm start`
- Set `DATABASE_URL` in App Service configuration
- Set `ACS_CONNECTION_STRING` and `ACS_SENDER_ADDRESS` in App Service configuration for application emails
- Enable App Service built-in authentication (Microsoft Entra ID) and set the app to require authentication for admin routes if needed
- Set `PUBLIC_ENABLE_AUTH=true` when the built-in auth is enabled

Example App Service startup command:
```bash
npm start
```
