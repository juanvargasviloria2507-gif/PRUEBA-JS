# CinemaApp

## Description
A Single Page Application (SPA) for managing cinema showings and ticket reservations. Built with Vanilla JavaScript, Vite, and TailwindCSS. Includes role-based access control, session persistence, and full CRUD operations via a simulated REST API (json-server).

## Technologies Used
- **Vite** — build tool and dev server
- **Vanilla JavaScript (ES Modules)** — no frameworks
- **TailwindCSS (CDN)** — styling
- **json-server** — simulated REST API
- **localStorage** — session persistence
- **Fetch API** — HTTP requests

## Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd cinema-app

# Install dependencies
npm install
```

## Running the Project

You need two terminals running at the same time:

**Terminal 1 — json-server (API):**
```bash
npm run api
```
Runs at: `http://localhost:3001`

**Terminal 2 — Vite (frontend):**
```bash
npm run dev
```
Runs at: `http://localhost:5173`

## Running json-server
```bash
npm run api
# or directly:
npx json-server --watch db.json --port 3001
```

## Test Users

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@cinema.com   | admin123 |
| User  | juan@user.com      | user123  |
| User  | maria@user.com     | user123  |

## Project Structure

```
cinema-app/
├── index.html                    # Single HTML file (SPA entry)
├── package.json
├── vite.config.js
├── db.json                       # json-server database
├── README.md
└── src/
    ├── main.js                   # App entry point
    ├── router.js                 # Hash-based SPA router
    ├── auth/
    │   ├── auth.js               # Login, session, logout logic
    │   └── loginView.js          # Login page render
    ├── functions/
    │   ├── functionsAPI.js       # CRUD requests for showings
    │   └── functionsView.js      # Billboard (user) + Admin CRUD views
    ├── reservations/
    │   ├── reservationsAPI.js    # CRUD requests for reservations
    │   └── reservationsView.js   # Reserve, my reservations, admin view
    └── utils/
        ├── guards.js             # Route protection (requireAuth, requireAdmin)
        └── navbar.js             # Dynamic navbar rendering
```

## Role Permissions

| Feature                     | Admin | User |
|-----------------------------|-------|------|
| View billboard              | ✅    | ✅   |
| Make a reservation          | ❌    | ✅   |
| View own reservations       | ❌    | ✅   |
| Edit own reservations       | ❌    | ✅   |
| Cancel own reservations     | ❌    | ✅   |
| View all reservations       | ✅    | ❌   |
| Confirm/cancel any reserve  | ✅    | ❌   |
| Create showings             | ✅    | ❌   |
| Edit showings               | ✅    | ❌   |
| Delete showings             | ✅    | ❌   |

## Technical Decisions

- **Hash-based routing** (`#/route`) was chosen over History API to avoid server-side redirect configuration, making it work out of the box with Vite.
- **localStorage** stores the session so it persists across page refreshes. The password is stripped before saving for security.
- **Modular architecture**: each feature (auth, functions, reservations) has its own API module (handles fetch calls) and view module (handles DOM rendering), following separation of concerns.
- **Guards** (`requireAuth`, `requireAdmin`) are called at the start of each protected route handler, redirecting immediately if the user lacks permission.
- **Available seats** are updated automatically on the function record whenever a reservation is created, edited, or cancelled.
- **TailwindCSS via CDN** was used to keep the setup simple without a PostCSS build step.
