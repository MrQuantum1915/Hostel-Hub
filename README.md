# Hostel Hub

Just a Hostel management system for DBMS course project, nothing special...


## Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white" alt="Fastify" />
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220" alt="PNPM" />
</p>


**Frontend** (`apps/web`)
- Framwork: [React](https://react.dev/)
- Language: [TypeScript](https://www.typescriptlang.org/)
- Build Tool: [Vite](https://vitejs.dev/)
- CSS: [Tailwind CSS v4](https://tailwindcss.com/)

**Backend** (`apps/server`)
- Web Framework: [Fastify](https://fastify.dev/docs/latest/) (not express)
- JS Runtime Env: [Node.js](https://nodejs.org/)
- Language: [TypeScript](https://www.typescriptlang.org/)

**Database**
- PostgreSQL 18+
- Host: Docker Container

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

For damn Windows : Visit official page >> [Installation](https://pnpm.io/installation)


### 3. Install Node.js (if not installed)
```bash
pnpm env use --global lts
```

### 4. Install Dependencies
```bash
pnpm install
```

### 5. Install Docker Engine CLI
For **Arch Linux**:
```bash
# install only DE not the docker app - heavy
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker.service
sudo usermod -aG docker $USER
# logout and login again
# verify installation
docker run hello-world
```

**For Window**: [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)

**For MacOS**: [Docker Desktop for MacOS](https://docs.docker.com/desktop/setup/install/mac-install/)

### 6. Configuration & Database

1. **Environment Setup**: Create `.env` in `apps/server`.
   - Generate Secret Key:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - Copy above key and add it to `.env` as `JWT_SECRET_KEY=that_key`.

2. **Database Initialization**:
   ```bash
   cd apps/server
   pnpm db:manage setup
   ```
   > **Note:** You can also use `pnpm db:manage reset` to clear the database or `query` to run a query standalone or add custom script in `manageDB.ts` to manage other thing!.

### 7. Run Development Environment
This command runs both the frontend, server and database container in parallel. I used `concurrently` to run all three command in same terminal to receive logs in same terminal:
```bash
pnpm dev
```
e.g.
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Docker DB: `port: 5432` 

## Available Scripts

- `pnpm dev` - Start both web, server and database container in development mode.
- `pnpm db:manage [command]` - (In `apps/server`) Manage database: `setup`, `reset`, `query` or `--help`.
- `pnpm dev:web` - Start only the frontend.
- `pnpm dev:server` - Start only the backend.
- `pnpm lint` - Run ESLint across all apps.
- `pnpm build` - Build all apps for production.

## Troubleshooting

- **Database Connection Failed**: Ensure the Docker container is running.
  ```bash
  docker ps
  ```
- **Port Already in Use**: Check if ports `3000` (Server), `5173` (Web), or `5432` (Postgres) are occupied by another process.

## Contributing

Contributions are welcome! Please fork the repository and open a Pull Request.

## Docs
- [Architecture](docs/architecture.md)
- [Database](docs/database.md)

## License

Distributed under the GNU General Public License v3. See [`LICENSE`](LICENSE) for more information.