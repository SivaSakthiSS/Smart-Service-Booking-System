# Smart Service Hub — On-Demand Trade & Home Services Marketplace

A modern, production-grade MERN application built with **React 19**, **Vite**, **Tailwind CSS v4**, **Node.js (ES Modules)**, **Express 4**, and **MongoDB / Mongoose 8**.

---

## 🏗️ Architectural Overview

Smart Service Hub is organized as a clean **npm workspaces monorepo** with strict decoupling between the client UI and the server REST API.

```
service_hub/
├── package.json              # Root monorepo configuration (npm workspaces)
├── .gitignore                # Production ignore rules (node_modules, .env, build artifacts)
├── .env.example              # Monorepo environment reference
├── README.md                 # Complete system documentation
│
├── client/                   # Frontend SPA (React 19 + Vite + Tailwind CSS v4)
│   ├── .env.example          # Client environment template (VITE_API_BASE_URL)
│   ├── index.html            # App shell with Plus Jakarta Sans typography
│   ├── package.json          # Client dependencies & scripts
│   ├── vite.config.js        # Vite + Tailwind v4 integration
│   └── src/
│       ├── main.jsx          # React DOM entrypoint
│       ├── App.jsx           # Root layout with dynamic view routing & health polling
│       ├── index.css         # Tailwind v4 import & custom font layer
│       ├── context/
│       │   └── AuthContext.jsx # Shared auth state & session restoration via /me
│       ├── services/
│       │   └── api.js        # Normalized fetch client with cookies & CSRF header
│       ├── components/
│       │   ├── auth/
│       │   │   └── ProtectedRoute.jsx # Role-based route guard & accessible fallbacks
│       │   ├── services/
│       │   │   ├── ServiceCard.jsx    # Visual presentation card with price/duration/rating
│       │   │   └── ServiceDetailModal.jsx # Full details, reviews & booking form
│       │   ├── reviews/
│       │   │   └── ReviewModal.jsx    # Interactive 5-star rating & comment dialog
│       │   ├── common/       # StatusBadge & shared UI atoms
│       │   ├── layout/       # Navbar, Footer
│       │   ├── health/       # BackendHealthCard (live diagnostics)
│       │   └── architecture/ # ArchitectureViewer (roles, models, roadmap)
│       └── pages/
│           ├── LandingPage.jsx   # Commercial landing, live featured services & diagnostics
│           ├── ServicesPage.jsx  # Full marketplace catalog with filters, search, and booking
│           ├── LoginPage.jsx     # Sign In with demo quick-fills (Admin, Provider, Customer)
│           ├── RegisterPage.jsx  # Customer sign-up (enforcing CUSTOMER role)
│           └── DashboardPage.jsx # Multi-role portal (Customer, Provider, Admin, RBAC Tester)
│
└── server/                   # Backend REST API (Node.js ES Modules + Express + Mongoose)
    ├── .env.example          # Server environment template
    ├── package.json          # Server dependencies & scripts
    ├── scripts/
    │   ├── provisionAdmin.js # Safe local administrator seeding script
    │   └── seedData.js       # Database seeder with realistic providers, services, bookings & reviews
    ├── tests/
    │   ├── runner.js         # Sequential test suite runner
    │   ├── auth.test.js      # 11-step auth & RBAC test suite
    │   ├── services.test.js  # 9-step services catalog & provider CRUD test suite
    │   ├── bookings.test.js  # 11-step booking lifecycle & state machine test suite
    │   └── reviews.test.js   # 7-step reviews & rating aggregation test suite
    └── src/
        ├── app.js            # Express application setup, Helmet, CORS, session & CSRF
        ├── server.js         # HTTP server entrypoint & graceful shutdown
        ├── config/
        │   ├── db.js         # Mongoose connection manager & health status
        │   └── environment.js # Centralized environment validation & URI sanitizer
        ├── controllers/
        │   ├── authController.js     # Register, Login, Logout, Me, CSRF logic
        │   ├── serviceController.js  # Catalog, Category aggregations, Provider CRUD
        │   ├── bookingController.js  # Booking creation, dispatch queue, state machine
        │   ├── reviewController.js   # Review validation & rating auto-recalculation
        │   ├── providerController.js # Provider onboarding, public profiles & settings
        │   └── healthController.js   # System health & telemetry logic
        ├── middleware/
        │   ├── auth.js            # requireAuth, requireRole, checkOwnership
        │   ├── csrf.js            # Origin verification & custom CSRF token validation
        │   ├── rateLimiter.js     # Brute-force rate limiter on auth routes
        │   ├── session.js         # connect-mongo MongoDB session store
        │   ├── errorHandler.js    # Centralized error handler & code mapping
        │   ├── notFoundHandler.js # Standardized 404 response
        │   └── logger.js          # Morgan HTTP request logger
        ├── models/
        │   ├── User.js       # Customer, Provider, and Admin schemas + bcrypt hooks
        │   ├── Service.js    # Service catalog schema & taxonomy
        │   ├── Booking.js    # Booking transaction state machine schema
        │   ├── Review.js     # Post-service verified feedback schema
        │   └── index.js      # Barrel export
        └── routes/
            ├── authRoutes.js     # /api/v1/auth/* endpoints
            ├── serviceRoutes.js  # /api/v1/services/* endpoints
            ├── bookingRoutes.js  # /api/v1/bookings/* endpoints
            ├── reviewRoutes.js   # /api/v1/reviews/* endpoints
            ├── providerRoutes.js # /api/v1/providers/* endpoints
            ├── adminRoutes.js    # /api/v1/admin/* role-protected endpoints
            ├── healthRoutes.js   # /api/health endpoint
            └── index.js          # Modular /api router aggregator
```

---

## 👥 Three Core User Roles & RBAC Rules

| Role | Enum Identifier | Public Registration? | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| **Customer** | `'CUSTOMER'` | **Yes** (Default) | Browse services, create appointments, cancel pending bookings, submit post-service reviews. |
| **Service Provider** | `'PROVIDER'` | **Yes** (Via Onboarding) | Manage service listings, define rates, accept/reject dispatches, execute job lifecycle. |
| **Administrator** | `'ADMIN'` | **Never** (CLI Provisioned) | Verify providers, moderate accounts, audit platform metrics & global bookings ledger. |

> **Security Rule:** Any request sent to `POST /api/v1/auth/register` specifying a `role` of `ADMIN` or `PROVIDER` is strictly sanitized to `CUSTOMER` to prevent privilege escalation. Customers can legitimately become Providers by submitting the Provider Onboarding flow (`POST /api/v1/providers/onboard`).

---

## 🔐 Authentication & Session Security Architecture

1. **Zero Tokens in LocalStorage:**
   - Web storage (`localStorage` / `sessionStorage`) is completely bypassed to mitigate XSS-based credential extraction.
2. **Maintained Server-Side Sessions:**
   - Managed via `express-session` with sessions persisted directly in MongoDB using `connect-mongo`.
   - Cookie name: `ssh_session`
   - Attributes: `httpOnly: true`, `secure: production`, `sameSite: 'lax'`, `maxAge: 7 days`.
3. **Session Invalidation on Logout:**
   - Calling `POST /api/v1/auth/logout` explicitly executes `req.session.destroy()` in MongoDB and wipes client cookies.
4. **Anti-CSRF & Origin Verification:**
   - State-mutating requests (`POST`, `PUT`, `DELETE`, `PATCH`) must originate from allowed origins (`CLIENT_URL`) and include the `X-Requested-With: XMLHttpRequest` header or matching `X-CSRF-Token`.
5. **Brute-Force Rate Limiting:**
   - Express endpoints are shielded via `express-rate-limit` (20 attempts per 15-minute window per IP on login and register, bypassed during test runner).
6. **Generic Error Responses:**
   - Login attempts with non-existent emails or incorrect passwords return a generic `401 Unauthorized` message: `"Invalid email or password."` to thwart account enumeration.

---

## 📦 Full REST API Surface

### 1. Authentication & Session (`/api/v1/auth`)
- `POST /api/v1/auth/register` — Public customer registration
- `POST /api/v1/auth/login` — Session establishment
- `POST /api/v1/auth/logout` — Server-side session destruction & cookie clearance
- `GET /api/v1/auth/me` — Session restoration & identity check
- `GET /api/v1/auth/csrf-token` — CSRF cookie & token provisioning

### 2. Services Catalog & Management (`/api/v1/services`)
- `GET /api/v1/services` — Public catalog with category filter, search, price sorting
- `GET /api/v1/services/categories` — Category breakdown with active service counts
- `GET /api/v1/services/my-services` — Provider: list owned services
- `GET /api/v1/services/:id` — Public: service details with contractor info
- `POST /api/v1/services` — Provider/Admin: publish new service listing
- `PUT /api/v1/services/:id` — Provider/Admin: update service details
- `DELETE /api/v1/services/:id` — Provider/Admin: remove service listing

### 3. Bookings Engine & State Machine (`/api/v1/bookings`)
- `POST /api/v1/bookings` — Customer: create appointment with date, time window, and location
- `GET /api/v1/bookings/my-bookings` — Customer sees appointments; Provider sees dispatches
- `GET /api/v1/bookings/:id` — Inspection with role permission enforcement
- `PATCH /api/v1/bookings/:id/status` — State transitions:
  - Customer: `pending` | `confirmed` ➔ `cancelled`
  - Provider: `pending` ➔ `confirmed` | `rejected`
  - Provider: `confirmed` ➔ `in_progress`
  - Provider: `in_progress` ➔ `completed` (auto-stamps completion timestamp & payment status)

### 4. Reviews & Ratings (`/api/v1/reviews`)
- `POST /api/v1/reviews` — Customer: submit 1-5 star review for completed booking
- `GET /api/v1/reviews/service/:serviceId` — Public: list reviews for a service
- `GET /api/v1/reviews/provider/:providerId` — Public: list reviews for a contractor
- *Auto-Aggregation:* Automatically recalculates and synchronizes `ratingAverage` and `ratingCount` on both `Service` and `User.providerProfile`.

### 5. Provider Onboarding & Public Showcase (`/api/v1/providers`)
- `POST /api/v1/providers/onboard` — Customer upgrades to contractor
- `GET /api/v1/providers` — Public contractor directory
- `GET /api/v1/providers/:id` — Public contractor profile with active services & reviews
- `PATCH /api/v1/providers/profile` — Self-service contractor profile updates

### 6. Administration & Governance (`/api/v1/admin`)
- `GET /api/v1/admin/dashboard-stats` — High-level telemetry, revenue, transaction ledger
- `GET /api/v1/admin/users` — User audit directory with role and status filters
- `PATCH /api/v1/admin/users/:id/role` — Update account role (`CUSTOMER`, `PROVIDER`, `ADMIN`)
- `PATCH /api/v1/admin/users/:id/status` — Toggle account status (`ACTIVE`, `SUSPENDED`)
- `GET /api/v1/admin/providers/pending` — Queue of unverified contractors
- `PATCH /api/v1/admin/providers/:id/approve` — Approve contractor
- `PATCH /api/v1/admin/providers/:id/reject` — Revoke contractor approval
- `GET /api/v1/admin/bookings` — Platform-wide booking ledger

---

## 🧪 Comprehensive Automated Testing Suite

The backend includes a fully automated 38-step integration test suite running across 4 specialized test suites:

```bash
# Run test suite from workspace root:
npm run test
```

### Verified Test Suites (38 Passing Tests):
1. **Auth & RBAC Security Suite (11 Tests):** Input validation, customer registration, duplicate email rejection, role escalation prevention, constant-time/generic errors, session cookie creation, session invalidation on logout, RBAC rejection (403), RBAC grant (200).
2. **Services Catalog & Provider API Suite (9 Tests):** Public listing, category breakdown, customer restriction (403), provider service creation (201), single service retrieval, provider catalog retrieval, service updates (200), unauthorized deletion rejection (403), owner deletion (200).
3. **Bookings Lifecycle & State Machine Suite (11 Tests):** Anonymous booking rejection (401), self-booking prevention (400), customer booking creation (201), customer queue verification, provider dispatch verification, third-party snooping prevention (403), provider accept (`confirmed`), provider start (`in_progress`), provider complete (`completed`), terminal state immutability (400), customer cancellation.
4. **Reviews & Rating Aggregations Suite (7 Tests):** Anonymous review rejection (401), premature review rejection on non-completed booking (400), rating bounds validation (422), completed review submission (201), real-time rating average calculation on Service & Provider, duplicate review prevention (409), public review retrieval.

---

## 🛠️ Demo Accounts & Database Seeding

Populate the database with realistic providers, services, bookings, and reviews:

```bash
npm run seed
```

### Pre-configured Demo Accounts:
| Role | Email | Password | Pre-populated Data |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Admin1234!` | Full system telemetry, user management, approval queue. |
| **Provider** | `priya.cleaning@example.com` | `Provider1234!` | Deep cleaning business, active services, pending dispatches. |
| **Customer** | `customer@example.com` | `Customer1234!` | Active bookings, completed appointment with verified review. |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** >= 20.x
- **MongoDB** running locally on port `27017` or MongoDB Atlas URI

### 2. Environment Setup
```bash
# Copy environment files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Installation
```bash
npm install
```

### 4. Database Seeding
```bash
npm run seed
```

### 5. Running the Application
```bash
# Run both Express backend (:5000) and React Vite frontend (:5173) concurrently:
npm run dev
```

### 6. Running Integration Tests
```bash
npm run test
```

### 7. Production Client Build
```bash
npm run build
```

---

## 🗺️ Completed Roadmap & Milestones

- [x] **Phase 1: Foundation & Architecture** — Monorepo setup, Express REST server, Mongoose core models, Vite + Tailwind CSS v4 frontend.
- [x] **Phase 2: Authentication & RBAC Security** — Bcrypt hashing, server-side sessions, HTTP-only cookies, anti-CSRF protection, rate limiting, ProtectedRoute guards, AuthContext, interactive RBAC diagnostic tester.
- [x] **Phase 3: Service Catalog & Provider Management** — Category taxonomy, service CRUD, search & filtering, provider onboarding flow, public contractor profiles.
- [x] **Phase 4: Booking Engine & State Machine** — Real-time booking appointments, automated booking reference generation, state machine lifecycle (`pending` ➔ `confirmed` ➔ `in_progress` ➔ `completed` / `cancelled`), provider dispatch queue.
- [x] **Phase 5: Reviews, Ratings & Administrative Governance** — Verified post-service feedback, automatic rating aggregations, admin metrics dashboard, contractor verification queue, user role & status moderation.
- [x] **Phase 6: Production Hardening & Full Integration Testing** — 38 end-to-end integration tests, seed CLI tooling, build optimization with zero warnings.
