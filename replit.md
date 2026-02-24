# Casca - Barber & Salon Booking App

## Overview

Casca is a full-stack barber and salon booking mobile application built with Expo (React Native) on the frontend and Express.js on the backend. It allows users to browse salons, view services and specialists, book appointments, manage bookmarks, chat with salons, and manage their profiles. The app follows a dark-themed design inspired by a Figma UI kit, using the Urbanist font family throughout.

The project runs as two concurrent processes: an Expo development server for the React Native app (targeting web, iOS, and Android) and an Express API server on port 5000 that handles authentication, data access, and session management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React 19.1, using the new architecture (`newArchEnabled: true`)
- **Routing**: `expo-router` v6 with file-based routing. The `app/` directory defines all screens and layouts using stack and tab navigators.
- **Navigation structure**:
  - Root stack: onboarding → welcome → signin/signup → (tabs) and detail screens
  - Tab layout: Home, Bookings, Explore, Inbox, Profile (in `app/(tabs)/`)
  - Detail screens: `salon/[id]`, `booking/[id]`, search, settings, etc.
- **State management**: React Context (`AppContext`) for global auth state, bookmarks, bookings, and notifications. TanStack React Query for server data fetching and caching.
- **Styling**: React Native `StyleSheet` with a custom theme system (`constants/colors.ts` and `constants/theme.ts`) supporting light/dark modes via `useColorScheme()`.
- **Fonts**: Urbanist font family (Regular, Medium, SemiBold, Bold) loaded via `@expo-google-fonts/urbanist`.
- **Platform handling**: Platform-specific components exist (e.g., `SalonMap.tsx` for native with `react-native-maps`, `SalonMap.web.tsx` for web with a list fallback). Web-specific inset adjustments are handled inline.
- **Key libraries**: expo-image, expo-haptics, expo-linear-gradient, expo-blur, expo-auth-session, react-native-gesture-handler, react-native-keyboard-controller.

### Backend (Express.js)

- **Runtime**: Node.js with TypeScript, compiled via `tsx` in development and `esbuild` for production builds.
- **Server location**: `server/` directory with `index.ts` (entry), `routes.ts` (API routes), `storage.ts` (data access layer), `db.ts` (database connection), and `seed.ts` (seed data).
- **API pattern**: RESTful JSON API under `/api/` prefix. Routes include auth (signup, login, logout, profile), salons, services, packages, specialists, reviews, bookings, bookmarks, messages, and notifications.
- **Authentication**: Session-based auth using `express-session` with `connect-pg-simple` for PostgreSQL session storage. Sessions use secure cookies with `sameSite: 'none'`.
- **Password hashing**: bcryptjs for hashing and verifying passwords.
- **CORS**: Dynamic origin allowlist based on Replit environment variables, plus localhost origins for local development.
- **Middleware**: `requireAuth` middleware function checks `req.session.userId` for protected routes.

### Database

- **Database**: PostgreSQL via Neon serverless driver (`@neondatabase/serverless`) with WebSocket support.
- **ORM**: Drizzle ORM with `drizzle-orm/neon-serverless` adapter.
- **Schema**: Defined in `shared/schema.ts` using Drizzle's `pgTable` helpers. Tables include:
  - `users` - User accounts with auth credentials and profile fields
  - `salons` - Salon listings with location, ratings, gallery
  - `services` - Individual services linked to salons
  - `packages` - Service bundles with discounted pricing
  - `specialists` - Staff members linked to salons
  - `reviews` - User reviews for salons
  - `bookings` - Appointment bookings with status tracking
  - `bookmarkTable` - User bookmark relationships
  - `messages` - Chat messages between users and salons
  - `notifications` - User notification items
- **Validation**: `drizzle-zod` for generating Zod schemas from Drizzle table definitions.
- **Migrations**: Managed via `drizzle-kit push` (push-based, no migration files needed for development). Config in `drizzle.config.ts`.
- **Seeding**: `server/seed.ts` populates the database with sample salon data, services, specialists, and reviews on startup.

### Shared Code

- The `shared/` directory contains `schema.ts` which is imported by both the server and the Drizzle config. Path aliases (`@shared/*`) are configured in `tsconfig.json`.

### Build & Deployment

- **Development**: Two processes run concurrently — Expo dev server and Express server (`server:dev` script with `tsx`).
- **Production build**: Expo static build via `scripts/build.js`, Express server bundled with esbuild to `server_dist/`.
- **Environment**: Relies on Replit environment variables (`REPLIT_DEV_DOMAIN`, `DATABASE_URL`, `SESSION_SECRET`).
- **Patches**: Uses `patch-package` (runs on `postinstall`).

## External Dependencies

### Database
- **PostgreSQL** (Neon Serverless) — Primary data store, connected via `DATABASE_URL` environment variable. Uses WebSocket connections through `@neondatabase/serverless`.

### Authentication Providers (OAuth - Optional)
- **Google OAuth** — Via `expo-auth-session`, requires `EXPO_PUBLIC_GOOGLE_CLIENT_ID` environment variable.
- **Facebook OAuth** — Via `expo-auth-session`, requires `EXPO_PUBLIC_FACEBOOK_APP_ID` environment variable.
- **Apple Sign-In** — Placeholder integration via `expo-auth-session`.

### Key Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Express session secret (defaults to fallback if not set)
- `EXPO_PUBLIC_DOMAIN` — Domain for API requests from the client
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth client ID (optional)
- `EXPO_PUBLIC_FACEBOOK_APP_ID` — Facebook app ID (optional)

### External Image Assets
- Salon images, specialist photos, and gallery images are sourced from **Unsplash** URLs (hardcoded in seed data).

### NPM Packages of Note
- `drizzle-orm` + `drizzle-kit` — Database ORM and migration tooling
- `@neondatabase/serverless` — Neon PostgreSQL driver
- `express` v5 + `express-session` — HTTP server and session management
- `connect-pg-simple` — PostgreSQL session store
- `bcryptjs` — Password hashing
- `@tanstack/react-query` — Client-side data fetching
- `expo-router` — File-based navigation
- `react-native-maps` — Native map component (with web fallback)