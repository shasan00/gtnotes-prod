
# GT Notes Project Context

This document provides essential context for AI agents working on the GT Notes project.

## Project Overview

GT Notes is a web application designed for Georgia Tech students to share and upload class notes.

## Tech Stack

### Frontend

*   **Framework:** React.js with Vite
*   **Language:** TypeScript
*   **UI Components:** shadcn/ui
*   **Styling:** Tailwind CSS
*   **Routing:** React Router
*   **State Management:** React Query

### Backend

*   **Framework:** Express.js
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **Authentication:** Passport.js with Google OAuth 2.0

## Project Structure

*   `gtnotes/`: The root directory of the project.
    *   `backend/`: Contains the backend server code.
        *   `src/`: Backend source code.
            *   `controllers/`: Request handlers.
            *   `db/`: Database connection and queries.
            *   `middleware/`: Express middleware.
            *   `routes/`: API routes.
            *   `services/`: Business logic (e.g., authentication).
            *   `types/`: TypeScript type definitions.
            *   `index.ts`: The main entry point for the backend server.
    *   `src/`: Contains the frontend application code.
        *   `components/`: Reusable UI components.
        *   `pages/`: Top-level page components.
        *   `hooks/`: Custom React hooks.
        *   `lib/`: Utility functions.
        *   `App.tsx`: The main application component.
        *   `main.tsx`: The entry point for the React application.

## Key Scripts

### Frontend (from the root directory)

*   `pnpm dev`: Starts the Vite development server for the frontend.
*   `pnpm build`: Builds the frontend application for production.
*   `pnpm lint`: Lints the frontend code.

### Backend (from the `backend` directory)

*   `pnpm dev`: Starts the backend server in development mode with auto-reloading.
*   `pnpm build`: Compiles the backend TypeScript code to JavaScript.
*   `pnpm start`: Starts the backend server from the compiled code.

## Backend API

*   **API Prefix:** `/api`
*   **Authentication:** The backend uses Passport.js with a Google OAuth 2.0 strategy. Authentication is handled through the `/api/auth` routes.
*   **Database:** The backend connects to a PostgreSQL database. The connection pool is initialized in `backend/src/db/pool.ts`.
*   **Vite Proxy:** The Vite development server is configured to proxy requests from `/api` to the backend server running on `http://localhost:4000`.

## Note Management (Planned)

*   **File Storage:** Uploaded PDF notes will be stored in AWS S3.
*   **Metadata:** Note metadata (e.g., professor, semester) will be stored in the PostgreSQL database.
*   **Database ORM:** Drizzle ORM will be used for database queries.
*   **Approval Workflow:** A manual approval process by an admin user will be implemented to approve or reject newly uploaded notes.

