# Hostel Hub

Just a Hostel management system for DBMS project, nothing special...


## Tech Stack

**Frontend** (`apps/web`)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)

**Backend** (`apps/server`)
- [Fastify](https://fastify.dev/docs/latest/)
- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)

**Monorepo Tools**
- [pnpm](https://pnpm.io/) (Workspaces)

## Project Structure

This is a monorepo containing:

- `apps/web`: The Frontend application.
- `apps/server`: The Backend API server.

## Setup

### 1. Fork and Clone the repo

1. **Fork** the repository on GitHub.
2. **Clone** your forked repository:
```bash
git clone https://github.com/<YOUR_USERNAME>/Hostel-Hub
cd Hostel-Hub
```
3. Set up **upstream** (to keep your fork up-to-date):
```bash
git remote add upstream https://github.com/MrQuantum1915/Hostel-Hub
```

### 2. Install pnpm (package manager) :)

On Posix systems (Linux/MacOS)
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

For damn Windows : Visit official page --> [Installation](https://pnpm.io/installation)


### 3. Install Node.js (if not installed)
```bash
pnpm env use --global lts
```

### 4. Install Dependencies
```bash
pnpm install
```


### 5. Run Development Environment
This command runs both the frontend and backend in parallel:
```bash
pnpm dev
```
e.g.
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Available Scripts

- `pnpm dev` - Start both web and server in development mode.
- `pnpm dev:web` - Start only the frontend.
- `pnpm dev:server` - Start only the backend.
- `pnpm lint` - Run ESLint across all apps.
- `pnpm build` - Build all apps for production.