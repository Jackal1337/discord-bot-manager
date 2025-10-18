[🇨🇿 Čeština](README.cs.md) | [🇬🇧 English](README.md)

---

# 🤖 Discord Bot Manager

> **Modern web-based management system for Discord bots (Node.js & Python)**

[![GitHub](https://img.shields.io/badge/GitHub-discord--bot--manager-blue?logo=github)](https://github.com/Jackal1337/discord-bot-manager)
[![Live Demo](https://img.shields.io/badge/Demo-Try%20it%20now-success)](https://bots.notjackal.eu/demo)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🚀 Demo

**Live demo:** [https://bots.notjackal.eu/demo](https://bots.notjackal.eu/demo)
*Try all features with in-memory data (resets on page refresh)*

---

## ✨ Features

- 🎯 **Centralized Management** - All Discord bots in one place
- 🌐 **Real-time Updates** - WebSocket live status every 3s
- 📊 **Graphs & Metrics** - CPU and Memory graphs with history
- 🔄 **Auto-restart** - PM2 automatically restarts bots on crash
- 🎨 **Modern UI** - React + shadcn/ui + Tailwind CSS + Dark theme
- 🔐 **Secure** - JWT authentication
- 📱 **CLI Tool** - Manage bots from terminal
- 🐍 **Multi-platform** - Supports Node.js and Python bots
- 📝 **Live Logs** - Real-time stdout/stderr display
- 🔧 **ENV Management** - Automatic .env file loading
- 🌍 **Bilingual** - CZ/EN language switcher

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + Express.js
- **SQLite** (Sequelize ORM)
- **Socket.IO** (WebSocket real-time updates)
- **PM2 API** (process management)
- **JWT** (authentication)
- **bcrypt** (password hashing)

### Frontend
- **React 18** + Vite
- **shadcn/ui** (components)
- **Tailwind CSS** (styling)
- **Recharts** (graphs)
- **Framer Motion** (animations)
- **Socket.IO Client** (WebSocket)
- **React Router** (routing)
- **Axios** (HTTP client)

### CLI Tool
- **Commander.js** (CLI framework)
- **Chalk** (colored output)
- **Ora** (spinners)
- **cli-table3** (tables)

---

## 📦 Installation

### Requirements
- Node.js 18+
- PM2 (globally installed: `npm install -g pm2`)
- SQLite3

### 1. Clone the repository
```bash
git clone https://github.com/Jackal1337/discord-bot-manager.git
cd discord-bot-manager
```

### 2. Backend setup
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

### 3. Frontend setup
```bash
cd ../frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3000/api
EOF

# Build frontend
npm run build
```

### 4. Start backend
```bash
cd ../backend
pm2 start server.js --name bot-manager-backend
```

### 5. Serve frontend
```bash
# Option 1: Using a simple HTTP server
npx serve ../frontend/dist -p 5173

# Option 2: Using Nginx/Apache (recommended for production)
# Configure reverse proxy to backend on /api
```

---

## 🎮 Usage

### Web Interface
1. Open `http://localhost:5173` in your browser
2. Log in with credentials created during setup
3. Add your first bot using the "+ Add Bot" button
4. Start/stop bots, view logs, and monitor metrics

### CLI Tool
```bash
cd cli
npm link  # Make CLI available globally

# Commands
bots list                    # List all bots
bots add                     # Add a new bot (interactive)
bots start <bot-id>         # Start a bot
bots stop <bot-id>          # Stop a bot
bots restart <bot-id>       # Restart a bot
bots delete <bot-id>        # Delete a bot
bots logs <bot-id>          # View bot logs
```

---

## 🗂️ Project Structure

```
discord-bot-manager/
├── backend/                 # Node.js backend
│   ├── server.js           # Express server with Socket.IO
│   ├── db.js               # Sequelize models
│   ├── authMiddleware.js   # JWT authentication
│   ├── demoMiddleware.js   # Demo mode handler
│   ├── pm2Handler.js       # PM2 integration
│   └── setup.js            # Initial setup script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Language, Auth)
│   │   ├── hooks/          # Custom hooks (useSocket, useDemo)
│   │   ├── lib/            # Utilities (API, auth, utils)
│   │   ├── pages/          # Page components
│   │   └── translations.js # CZ/EN translations
│   └── dist/               # Built files
├── cli/                    # CLI tool
│   └── bots                # CLI executable
├── README.md               # English documentation
├── README.cs.md            # Czech documentation
└── LICENSE                 # MIT License
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username & password

### Bots Management
- `GET /api/bots` - List all bots
- `POST /api/bots` - Create a new bot
- `GET /api/bots/:id` - Get bot details
- `PUT /api/bots/:id` - Update bot configuration
- `DELETE /api/bots/:id` - Delete a bot
- `POST /api/bots/:id/start` - Start a bot
- `POST /api/bots/:id/stop` - Stop a bot
- `POST /api/bots/:id/restart` - Restart a bot
- `GET /api/bots/:id/logs` - Get bot logs
- `GET /api/bots/:id/history` - Get bot action history
- `GET /api/bots/:id/metrics` - Get bot CPU/Memory metrics

### Statistics
- `GET /api/stats` - Get overall statistics
- `GET /api/demo-status` - Check if demo mode is active

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/), [Express.js](https://expressjs.com/), and [PM2](https://pm2.keymetrics.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Made with ❤️ by [Jackal1337](https://github.com/Jackal1337)**
