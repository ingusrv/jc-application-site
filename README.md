# JC Application Form Portal

A modern web application built with **SvelteKit 2 (Svelte 5)**, **Tailwind CSS v4**, **shadcn-svelte**, **MSSQL / Azure SQL Database**, and **Azure Static Web Apps (SWA)**.

Zero local installation of Azure Static Web Apps CLI is required — SWA emulation and optional SQL Server are containerized via Docker.

---

## Tech Stack

- **Frontend & Server**: [SvelteKit 2](https://kit.svelte.dev/) with [Svelte 5](https://svelte.dev/) runes and `svelte-adapter-azure-swa`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with shadcn design system tokens
- **Components**: [shadcn-svelte](https://shadcn-svelte.com/) UI components (Button, Input, Card, Label, Badge, Textarea)
- **Database**: [Microsoft SQL Server / Azure SQL Database](https://azure.microsoft.com/en-us/products/azure-sql/database) using `mssql` / `tedious` driver
- **Hosting**: [Azure Static Web Apps](https://azure.microsoft.com/en-us/products/app-service/static/)
- **Local Emulation**: Dockerized Azure SWA CLI (`@azure/static-web-apps-cli`) and optional local MSSQL Server container

---

## Project Structure

```text
├── src/
│   ├── app.html
│   ├── app.d.ts                 # svelte-adapter-azure-swa type reference
│   ├── app.css                  # Tailwind v4 theme + shadcn design tokens
│   ├── lib/
│   │   ├── utils.ts             # Tailwind cn() merger
│   │   ├── components/
│   │   │   └── ui/              # shadcn-svelte UI components
│   │   │       ├── button/
│   │   │       ├── card/
│   │   │       ├── input/
│   │   │       ├── label/
│   │   │       ├── badge/
│   │   │       └── textarea/
│   │   └── server/
│   │       └── db/              # MSSQL / Azure SQL schema & connection pool
│   │           ├── schema.ts
│   │           └── index.ts
│   └── routes/
│       ├── +layout.svelte       # Header & navigation
│       ├── +page.svelte         # Job / Candidate Application Form
│       ├── +page.server.ts      # SvelteKit Form Actions saving to Azure SQL
│       └── health/
│           └── +server.ts       # Health check GET /health
│
├── scripts/
│   ├── migrate.js               # SQL Table initialization script
│   └── patch-adapter.js         # ESM patch for SWA adapter
├── staticwebapp.config.json     # Azure SWA navigation & security configuration
├── swa-cli.config.json          # SWA CLI emulator settings
├── docker-compose.yml           # SWA emulator & MSSQL containers
├── Dockerfile.swa               # Azure SWA CLI container image
├── .env.example                 # Environment variables template
└── svelte.config.js             # SvelteKit Azure SWA configuration
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your `DATABASE_URL` for Azure SQL Database:
```ini
# Azure SQL Database
DATABASE_URL=Server=tcp:your-server.database.windows.net,1433;Initial Catalog=your-db;Persist Security Info=False;User ID=your-user;Password=your-password;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

Or run a local SQL Server in Docker for offline development:
```bash
npm run docker:db
```

### 3. Initialize Database Tables
```bash
npm run db:init
```

### 4. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## Running Azure SWA Emulator in Docker

To run the Azure Static Web Apps emulator locally without installing the Azure SWA CLI on your machine:

1. In one terminal, start the SvelteKit dev server:
   ```bash
   npm run dev
   ```

2. In another terminal, start the SWA emulator container:
   ```bash
   npm run docker:swa
   ```

3. Open **`http://localhost:4280`** to access the application through the Azure SWA emulator.

---

## Production Build & Azure Deployment

### Build for Azure Static Web Apps
```bash
npm run build
```
This produces:
- `build/static/`: Static client assets
- `build/server/`: Azure Functions v4 serverless function (`sk_render`)
- `build/staticwebapp.config.json`: Azure SWA routing and configuration

### Deploy via GitHub Actions / Azure Pipelines
When setting up the Azure Static Web Apps GitHub Action workflow, configure the build properties:
```yaml
app_location: "/"
api_location: "build/server"
output_location: "build/static"
```
Ensure you add the `DATABASE_URL` application setting in the Azure Portal under your Static Web App configuration.
