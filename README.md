# Hostel Hub

Just a Hostel management system for DBMS course project, nothing special...


## Tech Stack

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

### 4. Install Docker Engine CLI
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

### 5. Run Development Environment
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