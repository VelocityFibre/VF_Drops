# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

VF_Drops is a Next.js application for managing Velocity Fibre home installation capture checklists. It's a data grid-based system for tracking contractor installations, progress, and quality assurance processes.

**Key Technologies:**
- Next.js 15 with App Router and TypeScript
- React 19 with client-side components
- AG Grid (Community Edition) for data tables
- Neon PostgreSQL database with serverless driver
- Tailwind CSS for styling
- Turbopack for fast development builds

## Development Commands

**Start Development Server:**
```bash
npm run dev
```
The app runs on `http://localhost:3000` with Turbopack enabled for fast rebuilds.

**Build Application:**
```bash
npm run build
```
Uses Turbopack for optimized production builds.

**Start Production Server:**
```bash
npm run start
```

**Linting:**
```bash
npm run lint
```
Uses ESLint with Next.js TypeScript configuration.

## Architecture Overview

### Database Layer
- **Database:** Neon PostgreSQL (serverless)
- **Connection:** `src/lib/db.ts` exports configured `sql` client using `@neondatabase/serverless`
- **Tables:** Core tables include `installations`, `checklist_steps`, and `installation_checklist_items`

### API Layer
- **Pattern:** Next.js App Router API routes in `src/app/api/`
- **Installations API:** `src/app/api/installations/route.ts` handles CRUD operations
- **Database Test:** `src/app/api/test-db/route.ts` for connection verification

### Frontend Architecture
- **Layout:** Root layout in `src/app/layout.tsx` with Geist font configuration
- **Home Page:** `src/app/page.tsx` renders the main installations grid
- **Data Grid:** `src/components/InstallationsGrid.tsx` uses AG Grid for tabular data display
- **Type Safety:** Core types defined in `src/types/installation.ts`

### Data Model
The application revolves around fiber optic installations with structured checklist workflows:

**Core Types:**
- `Installation`: Main entity with contractor, customer, and completion tracking
- `ChecklistStep`: 5-phase installation steps (A-E) with photo/scan requirements
- Phases include: Pre-Install Context, Installation Execution, Assets & IDs, Verification, Customer Acceptance

**Key Features:**
- Progress tracking with completion percentages
- Status management (submitted, under_review, complete, incomplete, unpaid)
- Barcode scanning for ONT and UPS serial numbers
- Power meter readings with acceptable ranges
- Photo documentation requirements per step

## Configuration Notes

**TypeScript Configuration:**
- Path aliases: `@/*` maps to `./src/*`
- Strict mode enabled with Next.js plugin integration

**Environment Variables:**
- `DATABASE_URL`: Required for Neon PostgreSQL connection
- Stored in `.env.local` (not committed)

**Next.js Configuration:**
- Turbopack enabled for faster builds
- App Router architecture with TypeScript

## Component Patterns

**AG Grid Integration:**
- Register `AllCommunityModule` for community features
- Use `themeAlpine` for consistent styling
- Custom cell renderers for status badges and progress bars
- Action buttons use global window functions for navigation

**API Patterns:**
- Standard REST endpoints with proper error handling
- Next.js `NextResponse` for consistent API responses
- Database queries use template literals with the Neon SQL client

**State Management:**
- React hooks for local component state
- Fetch data in `useEffect` with loading states
- No global state management library (simple application scope)
