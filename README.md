# 🤖 Discord Bot Manager

> **Modern web-based management system for Discord bots (Node.js & Python)**

[![GitHub](https://img.shields.io/badge/GitHub-discord--bot--manager-blue?logo=github)](https://github.com/Jackal1337/discord-bot-manager)
[![Live Demo](https://img.shields.io/badge/Demo-Try%20it%20now-success)](https://bots.notjackal.eu/demo)
[![Production](https://img.shields.io/badge/Production-Live-green)](https://bots.notjackal.eu)

[**🇨🇿 Česká verze**](#česká-verze) | [**🇬🇧 English**](#english-version)

---

## 🇨🇿 Česká verze

### 🚀 Demo

**Live demo:** [https://bots.notjackal.eu/demo](https://bots.notjackal.eu/demo)

**Produkční verze:** [https://bots.notjackal.eu](https://bots.notjackal.eu)

### ✨ Features

- 🎯 **Centrální správa** - Všechny Discord boty na jednom místě
- 🌐 **Real-time updates** - WebSocket live status každých 3s
- 📊 **Grafy a metriky** - CPU a Memory grafy s historií
- 🔄 **Auto-restart** - PM2 automaticky restartuje boty při pádu
- 🎨 **Moderní UI** - React + shadcn/ui + Tailwind CSS + Dark theme
- 🔐 **Zabezpečené** - JWT autentifikace
- 📱 **CLI tool** - Správa botů z terminálu
- 🐍 **Multi-platform** - Podpora Node.js i Python botů
- 📝 **Live logy** - Real-time zobrazení stdout/stderr
- 🔧 **ENV management** - Automatické načítání .env souborů

### 🎬 Screenshoty

> **TODO:** Přidat screenshoty Dashboard, Bot Detail, Graphs

### 🛠️ Technologie

#### Backend
- **Node.js** + Express.js
- **SQLite** (Sequelize ORM)
- **Socket.IO** (WebSocket real-time updates)
- **PM2 API** (process management)
- **JWT** (authentication)
- **bcrypt** (password hashing)

#### Frontend
- **React 18** + Vite
- **shadcn/ui** (komponenty)
- **Tailwind CSS** (styling)
- **Recharts** (grafy)
- **Framer Motion** (animace)
- **Socket.IO Client** (WebSocket)
- **React Router** (routing)
- **Axios** (HTTP client)

#### CLI Tool
- **Commander.js** (CLI framework)
- **Chalk** (barevný output)
- **Ora** (loadery)
- **cli-table3** (tabulky)

### 📦 Instalace

#### Požadavky
- Node.js 18+
- PM2 (globálně nainstalované: `npm install -g pm2`)
- SQLite3

#### 1. Klonování
```bash
git clone https://github.com/tvoje-username/bot-manager.git
cd bot-manager
```

#### 2. Backend setup
```bash
cd backend
npm install

# Vytvořit .env soubor
cat > .env << EOF
PORT=3000
DB_PATH=../bot-manager.db
NODE_ENV=development
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Vytvořit prvního uživatele
node setup.js
```

#### 3. Frontend setup
```bash
cd ../frontend
npm install

# Vytvořit .env soubor
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
EOF
```

#### 4. CLI tool setup (volitelné)
```bash
cd ../cli
npm install
npm link  # Vytvoří globální příkaz 'bots'
```

### 🚀 Spuštění (development)

```bash
# Backend (port 3000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

Otevři prohlížeč na: `http://localhost:5173`

### 📦 Build pro produkci

```bash
# Frontend build
cd frontend
npm run build
# Build je v ./dist/

# Backend se nasazuje přímo (Node.js)
```

### 🐳 Deployment

Podrobný deployment guide najdeš v [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

Základní kroky:
1. Build frontend: `npm run build`
2. Deploy na server (Apache/Nginx)
3. Nastavit systemd service pro backend
4. Nastavit PM2 pro boty

### 📖 CLI Usage

```bash
# Přihlášení
bots login

# Seznam botů
bots list

# Přidat bota
bots add

# Spustit/Zastavit/Restartovat
bots start <name|id>
bots stop <name|id>
bots restart <name|id>

# Zobrazit logy
bots logs <name|id>

# Odstranit bota
bots remove <name|id>
```

### 🔌 API Dokumentace

Kompletní API dokumentace: [docs/API.md](./docs/API.md)

#### Auth
- `POST /api/auth/login` - Přihlášení

#### Bots Management
- `GET /api/bots` - Seznam botů (včetně statusu)
- `POST /api/bots` - Přidat bota
- `GET /api/bots/:id` - Detail bota
- `PUT /api/bots/:id` - Upravit bota
- `DELETE /api/bots/:id` - Smazat bota

#### Process Control
- `POST /api/bots/:id/start` - Spustit
- `POST /api/bots/:id/stop` - Zastavit
- `POST /api/bots/:id/restart` - Restartovat

#### Monitoring
- `GET /api/bots/:id/logs?lines=100` - Logy
- `GET /api/bots/:id/history` - Historie akcí
- `GET /api/bots/:id/metrics?hours=1` - CPU/Memory metriky
- `GET /api/stats` - Celkové statistiky

#### ENV Management
- `POST /api/parse-env` - Načíst .env soubor

#### WebSocket Events
- `bots:update` - Real-time status všech botů (každých 3s)

### 🤝 Contributing

Příspěvky jsou vítány! Prosím přečti si [CONTRIBUTING.md](./CONTRIBUTING.md)

1. Fork projektu
2. Vytvoř feature branch (`git checkout -b feature/amazing-feature`)
3. Commit změny (`git commit -m '✨ feat: Add amazing feature'`)
4. Push do branch (`git push origin feature/amazing-feature`)
5. Otevři Pull Request

### 📝 Changelog

Viz [CHANGELOG.md](./CHANGELOG.md)

### 📄 License

MIT License - viz [LICENSE](./LICENSE)

### 👨‍💻 Autor

Created by **Jackal** with Claude Code

### 🙏 Poděkování

- [shadcn/ui](https://ui.shadcn.com/) - UI komponenty
- [PM2](https://pm2.keymetrics.io/) - Process manager
- [Socket.IO](https://socket.io/) - WebSocket
- [Recharts](https://recharts.org/) - Grafy

---

## 🇬🇧 English Version

### 🚀 Demo

**Live demo:** [https://bots.notjackal.eu/demo](https://bots.notjackal.eu/demo)

**Production:** [https://bots.notjackal.eu](https://bots.notjackal.eu)

### ✨ Features

- 🎯 **Centralized Management** - All Discord bots in one place
- 🌐 **Real-time Updates** - WebSocket live status every 3s
- 📊 **Metrics & Graphs** - CPU and Memory graphs with history
- 🔄 **Auto-restart** - PM2 automatically restarts crashed bots
- 🎨 **Modern UI** - React + shadcn/ui + Tailwind CSS + Dark theme
- 🔐 **Secure** - JWT authentication
- 📱 **CLI Tool** - Manage bots from terminal
- 🐍 **Multi-platform** - Supports Node.js and Python bots
- 📝 **Live Logs** - Real-time stdout/stderr display
- 🔧 **ENV Management** - Automatic .env file loading

### 🎬 Screenshots

> **TODO:** Add screenshots Dashboard, Bot Detail, Graphs

### 🛠️ Tech Stack

#### Backend
- **Node.js** + Express.js
- **SQLite** (Sequelize ORM)
- **Socket.IO** (WebSocket real-time)
- **PM2 API** (process management)
- **JWT** (authentication)
- **bcrypt** (password hashing)

#### Frontend
- **React 18** + Vite
- **shadcn/ui** (components)
- **Tailwind CSS** (styling)
- **Recharts** (charts)
- **Framer Motion** (animations)
- **Socket.IO Client** (WebSocket)
- **React Router** (routing)
- **Axios** (HTTP client)

#### CLI Tool
- **Commander.js** (CLI framework)
- **Chalk** (colored output)
- **Ora** (spinners)
- **cli-table3** (tables)

### 📦 Installation

#### Prerequisites
- Node.js 18+
- PM2 (globally installed: `npm install -g pm2`)
- SQLite3

#### 1. Clone
```bash
git clone https://github.com/your-username/bot-manager.git
cd bot-manager
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=3000
DB_PATH=../bot-manager.db
NODE_ENV=development
JWT_SECRET=$(openssl rand -base64 32)
EOF

# Create first user
node setup.js
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
EOF
```

#### 4. CLI Tool Setup (optional)
```bash
cd ../cli
npm install
npm link  # Creates global 'bots' command
```

### 🚀 Running (development)

```bash
# Backend (port 3000)
cd backend
npm run dev

# Frontend (port 5173)
cd frontend
npm run dev
```

Open browser at: `http://localhost:5173`

### 📦 Production Build

```bash
# Frontend build
cd frontend
npm run build
# Build output in ./dist/

# Backend deploys as-is (Node.js)
```

### 🐳 Deployment

Detailed deployment guide: [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

Basic steps:
1. Build frontend: `npm run build`
2. Deploy to server (Apache/Nginx)
3. Setup systemd service for backend
4. Setup PM2 for bots

### 📖 CLI Usage

```bash
# Login
bots login

# List bots
bots list

# Add bot
bots add

# Start/Stop/Restart
bots start <name|id>
bots stop <name|id>
bots restart <name|id>

# View logs
bots logs <name|id>

# Remove bot
bots remove <name|id>
```

### 🔌 API Documentation

Full API docs: [docs/API.md](./docs/API.md)

#### Auth
- `POST /api/auth/login` - Login

#### Bots Management
- `GET /api/bots` - List bots (with status)
- `POST /api/bots` - Add bot
- `GET /api/bots/:id` - Bot detail
- `PUT /api/bots/:id` - Update bot
- `DELETE /api/bots/:id` - Delete bot

#### Process Control
- `POST /api/bots/:id/start` - Start
- `POST /api/bots/:id/stop` - Stop
- `POST /api/bots/:id/restart` - Restart

#### Monitoring
- `GET /api/bots/:id/logs?lines=100` - Logs
- `GET /api/bots/:id/history` - Action history
- `GET /api/bots/:id/metrics?hours=1` - CPU/Memory metrics
- `GET /api/stats` - Overall stats

#### ENV Management
- `POST /api/parse-env` - Load .env file

#### WebSocket Events
- `bots:update` - Real-time status of all bots (every 3s)

### 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md)

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m '✨ feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md)

### 📄 License

MIT License - see [LICENSE](./LICENSE)

### 👨‍💻 Author

Created by **Jackal** with Claude Code

### 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [PM2](https://pm2.keymetrics.io/) - Process manager
- [Socket.IO](https://socket.io/) - WebSocket
- [Recharts](https://recharts.org/) - Charts

---

**⭐ If you find this project useful, please give it a star!**
