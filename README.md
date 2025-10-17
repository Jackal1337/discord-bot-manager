# Bot Manager

Discord Bot Management System - Jednoduché web UI pro správu Discord botů (Node.js a Python).

## 🚀 Živá verze

**URL:** https://bots.notjackal.eu

**Přihlášení:**
- Username: `Jackal`
- Password: `03012005Sam`

## 🎯 Co to umí

- ✅ **Centrální správa** - Všechny boty na jednom místě
- ✅ **Web UI** - Krásné rozhraní postavené na React + shadcn/ui
- ✅ **Start/Stop/Restart** - Ovládání botů jedním kliknutím
- ✅ **Real-time logy** - Živé zobrazení logů z konzole
- ✅ **Statistiky** - CPU, RAM, uptime pro každého bota
- ✅ **JWT autentifikace** - Zabezpečený přístup
- ✅ **Support pro Node.js + Python** - Oba typy botů

## 📦 Struktura

```
bot-manager/
├── backend/              # Express API server
│   ├── server.js        # Hlavní API server
│   ├── db.js            # Sequelize modely (SQLite)
│   ├── authMiddleware.js # JWT autentifikace
│   ├── pm2Handler.js    # PM2 komunikace
│   └── package.json
├── frontend/            # React aplikace
│   ├── src/
│   │   ├── pages/       # Login, Dashboard, BotDetail
│   │   ├── components/  # shadcn/ui komponenty
│   │   └── lib/         # utils, API, auth context
│   └── package.json
└── README.md
```

## 🛠️ Technologie

**Backend:**
- Node.js + Express
- SQLite (Sequelize ORM)
- JWT (jsonwebtoken + bcrypt)
- PM2 API

**Frontend:**
- React 18
- Vite
- shadcn/ui
- Tailwind CSS
- Framer Motion
- React Router
- Axios

**Infrastructure:**
- Apache (reverse proxy)
- Let's Encrypt (SSL)
- Systemd (backend service)

## 🚀 Lokální setup

### Backend

```bash
cd backend
npm install

# Vytvořit prvního uživatele
node setup.js

# Spustit server
npm run dev
```

Server běží na `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install

# Spustit dev server
npm run dev
```

Frontend běží na `http://localhost:5173`

### Build pro produkci

```bash
# Frontend
cd frontend
npm run build

# Backend se deployuje jako je (Node.js)
```

## 📝 API Endpointy

### Auth
- `POST /api/auth/login` - Přihlášení (vrací JWT token)

### Bots
- `GET /api/bots` - Seznam všech botů
- `POST /api/bots` - Přidat nového bota
- `GET /api/bots/:id` - Detail bota
- `PUT /api/bots/:id` - Upravit bota
- `DELETE /api/bots/:id` - Smazat bota

### Process control
- `POST /api/bots/:id/start` - Spustit bota
- `POST /api/bots/:id/stop` - Zastavit bota
- `POST /api/bots/:id/restart` - Restartovat bota

### Monitoring
- `GET /api/bots/:id/logs` - Získat logy
- `GET /api/stats` - Celkové statistiky

## 🐳 Produkční deployment

Na produkci běží:
- **Backend:** Systemd service (`/etc/systemd/system/bot-manager-api.service`)
- **Frontend:** Statické soubory servírované Apache
- **Proxy:** Apache proxy `/api` → `localhost:3000`

Deployment:
```bash
# Build frontend
npm run build --prefix frontend

# Copy na server
sudo cp -r frontend/dist/* /var/www/bot-manager/frontend/
sudo cp -r backend /var/www/bot-manager/

# Restart backend
sudo systemctl restart bot-manager-api
```

## 🔐 ENV Variables

Backend `.env`:
```
PORT=3000
DB_PATH=/var/www/bot-manager/bot-manager.db
NODE_ENV=production
JWT_SECRET=your-secret-key
```

## 🎨 Screenshots

### Dashboard
- Seznam botů s live statistikami
- Start/Stop/Restart tlačítka
- Status badges (Online/Offline)

### Bot Detail
- Real-time logy (stdout + stderr)
- CPU, RAM, Uptime statistiky
- Historie akcí

### Add Bot Dialog
- Název, typ (Node.js/Python)
- Cesta ke scriptu
- ENV variables (JSON)

## 🤝 Contributing

Projekt vytvořen pro osobní použití. Feel free to fork!

---

**Created with:** Claude Code
**License:** MIT
