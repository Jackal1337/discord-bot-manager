const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const { initDatabase, Bot, DeployHistory, BotMetrics, User } = require('./db');
const { authenticateToken, loginHandler } = require('./authMiddleware');
const { demoMiddleware, isDemoMode } = require('./demoMiddleware');
const pm2Handler = require('./pm2Handler');
const bcrypt = require('bcrypt');
const logger = require('./logger');
const {
  globalLimiter,
  loginLimiter,
  botOperationsLimiter,
  helmetConfig,
  getCorsOptions,
  validateBotCreate,
  validateBotUpdate,
  validateBotId,
  validateLogsQuery,
  validateMetricsQuery,
  validateParseEnv
} = require('./securityMiddleware');
const {
  register: metricsRegister,
  metricsMiddleware,
  updateBotMetrics,
  incrementBotRestart,
  setWebSocketConnections
} = require('./monitoring');

const app = express();
const server = http.createServer(app);

// CORS konfigurace pro Socket.IO - použít stejnou whitelist
const socketCorsOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: socketCorsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmetConfig);
app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '1mb' })); // Limit request body size
app.use(globalLimiter);
app.use(metricsMiddleware);

// Demo middleware (blokuje write operace v demo režimu)
app.use(demoMiddleware);

// Logování requestů pomocí Winston
app.use((req, res, next) => {
  logger.info('HTTP Request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    user: req.user?.username
  });
  next();
});

// ============================================
// PUBLIC ROUTES (bez autentifikace)
// ============================================

app.post('/api/auth/login', loginLimiter, loginHandler);

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
  } catch (error) {
    logger.error('Error generating metrics', { error: error.message });
    res.status(500).end();
  }
});

// Health check s database ping
app.get('/api/health', async (req, res) => {
  try {
    // Ping databáze
    await Bot.findOne();

    res.json({
      status: 'ok',
      message: 'Bot Manager API běží',
      database: 'connected',
      demo: isDemoMode(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'error',
      message: 'Health check selhal',
      database: 'disconnected'
    });
  }
});

// Demo status check
app.get('/api/demo-status', (req, res) => {
  res.json({
    demo: isDemoMode(),
    message: isDemoMode() ? 'Demo režim aktivní - read-only' : 'Produkční režim'
  });
});

// ============================================
// PROTECTED ROUTES (s autentifikací)
// ============================================

// Použít authenticateToken middleware na všechny /api/bots/* routes
app.use('/api/bots', authenticateToken);

// --- Bots Management ---

// GET /api/bots - Získat seznam všech botů
app.get('/api/bots', async (req, res) => {
  try {
    const bots = await Bot.findAll({
      order: [['created_at', 'DESC']]
    });

    // Získat status z PM2 pro každého bota
    const botsWithStatus = await Promise.all(
      bots.map(async (bot) => {
        const status = await pm2Handler.getBotStatus(bot.pm2_name);
        return {
          ...bot.toJSON(),
          ...status
        };
      })
    );

    res.json({ success: true, bots: botsWithStatus });
  } catch (error) {
    logger.error('Error fetching bots', { error: error.message });
    res.status(500).json({ success: false, message: 'Chyba při načítání botů' });
  }
});

// GET /api/bots/:id - Detail jednoho bota
app.get('/api/bots/:id', async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    const status = await pm2Handler.getBotStatus(bot.pm2_name);

    res.json({
      success: true,
      bot: {
        ...bot.toJSON(),
        ...status
      }
    });
  } catch (error) {
    logger.error('Error fetching bot', { error: error.message });
    res.status(500).json({ success: false, message: 'Chyba při načítání bota' });
  }
});

// POST /api/bots - Přidat nového bota
app.post('/api/bots', botOperationsLimiter, validateBotCreate, async (req, res) => {
  try {
    const { name, type, script_path, env_vars, auto_restart } = req.body;

    // V demo režimu jen vrátit success - nic se reálně neděje
    if (isDemoMode()) {
      return res.json({
        success: true,
        message: 'Bot přidán (demo - po refreshi zmizí)'
      });
    }

    // Vytvořit PM2 název (unique)
    const pm2_name = `bot-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Uložit do databáze
    const bot = await Bot.create({
      name,
      type,
      script_path,
      pm2_name,
      env_vars: env_vars || '{}',
      auto_restart: auto_restart !== undefined ? auto_restart : true
    });

    res.json({
      success: true,
      message: 'Bot přidán',
      bot: bot.toJSON()
    });
  } catch (error) {
    logger.error('Error creating bot', { error: error.message });
    res.status(500).json({ success: false, message: 'Chyba při vytváření bota' });
  }
});

// PUT /api/bots/:id - Upravit konfiguraci bota
app.put('/api/bots/:id', botOperationsLimiter, validateBotUpdate, async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    // V demo režimu jen vrátit success - nic se reálně neděje
    if (isDemoMode()) {
      return res.json({ success: true, message: 'Bot upraven (demo - po refreshi zmizí)' });
    }

    const { name, script_path, env_vars, auto_restart } = req.body;

    // Update jen pokud jsou hodnoty poskytnuté
    if (name) bot.name = name;
    if (script_path) bot.script_path = script_path;
    if (env_vars) bot.env_vars = env_vars;
    if (auto_restart !== undefined) bot.auto_restart = auto_restart;

    await bot.save();

    res.json({
      success: true,
      message: 'Bot upraven',
      bot: bot.toJSON()
    });
  } catch (error) {
    logger.error('Error updating bot', { error: error.message });
    res.status(500).json({ success: false, message: 'Chyba při úpravě bota' });
  }
});

// DELETE /api/bots/:id - Smazat bota
app.delete('/api/bots/:id', botOperationsLimiter, validateBotId, async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    // V demo režimu jen vrátit success - nic se reálně neděje
    if (isDemoMode()) {
      return res.json({ success: true, message: `Bot "${bot.name}" smazán (demo)` });
    }

    // Zastavit a smazat z PM2 (pokud běží)
    try {
      await pm2Handler.deleteBot(bot.pm2_name);
    } catch (pm2Error) {
      logger.warn('PM2 delete failed (bot may not have been running)', { error: pm2Error.message });
    }

    // Smazat deploy history (pro kompatibilitu se starými záznamy bez CASCADE)
    await DeployHistory.destroy({
      where: { bot_id: bot.id }
    });

    // Smazat z databáze
    await bot.destroy();

    res.json({ success: true, message: 'Bot smazán' });
  } catch (error) {
    logger.error('Error deleting bot', { error: error.message });
    res.status(500).json({ success: false, message: 'Chyba při mazání bota' });
  }
});

// --- Process Control ---

// POST /api/bots/:id/start - Spustit bota
app.post('/api/bots/:id/start', botOperationsLimiter, validateBotId, async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    // V demo režimu jen vrátit success - nic se reálně neděje
    if (isDemoMode()) {
      return res.json({ success: true, message: `Bot "${bot.name}" spuštěn (demo)` });
    }

    await pm2Handler.startBot(bot.toJSON());

    // Zalogovat akci
    await DeployHistory.create({
      bot_id: bot.id,
      action: 'start'
    });

    res.json({ success: true, message: `Bot "${bot.name}" nastartován` });
  } catch (error) {
    logger.error('Error starting bot', { error: error.message });

    // Zalogovat selhání
    if (req.params.id && !isDemoMode()) {
      await DeployHistory.create({
        bot_id: req.params.id,
        action: 'start_failed',
        error_message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Chyba při startu bota',
      error: error.message
    });
  }
});

// POST /api/bots/:id/stop - Zastavit bota
app.post('/api/bots/:id/stop', botOperationsLimiter, validateBotId, async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    // V demo režimu jen vrátit success - nic se reálně neděje
    if (isDemoMode()) {
      return res.json({ success: true, message: `Bot "${bot.name}" zastaven (demo)` });
    }

    await pm2Handler.stopBot(bot.pm2_name);

    // Zalogovat akci
    await DeployHistory.create({
      bot_id: bot.id,
      action: 'stop'
    });

    res.json({ success: true, message: `Bot "${bot.name}" zastaven` });
  } catch (error) {
    logger.error('Error stopping bot', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Chyba při zastavení bota',
      error: error.message
    });
  }
});

// POST /api/bots/:id/restart - Restartovat bota
app.post('/api/bots/:id/restart', botOperationsLimiter, validateBotId, async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    // V demo režimu jen vrátit success - nic se reálně neděje
    if (isDemoMode()) {
      return res.json({ success: true, message: `Bot "${bot.name}" restartován (demo)` });
    }

    await pm2Handler.restartBot(bot.pm2_name);

    // Zalogovat akci
    await DeployHistory.create({
      bot_id: bot.id,
      action: 'restart'
    });

    // Update Prometheus restart counter
    incrementBotRestart(bot.name, bot.id);

    res.json({ success: true, message: `Bot "${bot.name}" restartován` });
  } catch (error) {
    logger.error('Error restarting bot', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Chyba při restartu bota',
      error: error.message
    });
  }
});

// --- Monitoring ---

// GET /api/bots/:id/logs - Získat logy
app.get('/api/bots/:id/logs', validateLogsQuery, async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    const lines = parseInt(req.query.lines) || 100;
    const logs = await pm2Handler.getBotLogs(bot.pm2_name, lines);

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    logger.error('Error fetching logs', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Chyba při načítání logů',
      error: error.message
    });
  }
});

// GET /api/bots/:id/history - Historie akcí
app.get('/api/bots/:id/history', async (req, res) => {
  try {
    const history = await DeployHistory.findAll({
      where: { bot_id: req.params.id },
      order: [['timestamp', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      history
    });
  } catch (error) {
    logger.error('Error fetching history', { error: error.message });
    res.status(500).json({ success: false, message: 'Chyba při načítání historie' });
  }
});

// GET /api/bots/:id/metrics - Metriky CPU/Memory
app.get('/api/bots/:id/metrics', validateMetricsQuery, async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    const Op = Sequelize.Op;

    const hours = parseInt(req.query.hours) || 1; // Poslední hodina jako default
    const limit = parseInt(req.query.limit) || 1000; // Max 1000 záznamů

    const metrics = await BotMetrics.findAll({
      where: {
        bot_id: req.params.id,
        timestamp: {
          [Op.gte]: new Date(Date.now() - hours * 60 * 60 * 1000)
        }
      },
      order: [['timestamp', 'ASC']],
      limit: limit
    });

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    logger.error('Error fetching metrics', { error: error.message });
    res.status(500).json({ success: false, message: 'Chyba při načítání metrik' });
  }
});

// GET /api/stats - Celkové statistiky
app.get('/api/stats', async (req, res) => {
  try {
    const bots = await Bot.findAll();

    // V demo režimu použít fake metriky
    if (isDemoMode()) {
      const botsWithStatus = await Promise.all(
        bots.map(async (bot) => {
          const status = await pm2Handler.getBotStatus(bot.pm2_name);
          return { ...bot.toJSON(), ...status };
        })
      );

      const onlineBots = botsWithStatus.filter(b => b.status === 'online');

      const stats = {
        total_bots: bots.length,
        online: onlineBots.length,
        offline: bots.length - onlineBots.length,
        total_cpu: onlineBots.reduce((sum, b) => sum + (b.cpu || 0), 0),
        total_memory: onlineBots.reduce((sum, b) => sum + (b.memory || 0), 0)
      };

      return res.json({ success: true, stats });
    }

    // Produkční režim - reálná PM2 data
    const processes = await pm2Handler.listProcesses();

    // Spočítat online/offline
    const botPM2Names = bots.map(b => b.pm2_name);
    const onlineProcesses = processes.filter(p =>
      botPM2Names.includes(p.name) && p.pm2_env.status === 'online'
    );

    const stats = {
      total_bots: bots.length,
      online: onlineProcesses.length,
      offline: bots.length - onlineProcesses.length,
      total_cpu: onlineProcesses.reduce((sum, p) => sum + (p.monit.cpu || 0), 0),
      total_memory: onlineProcesses.reduce((sum, p) => sum + (p.monit.memory || 0), 0)
    };

    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Error fetching stats', { error: error.message });
    res.status(500).json({ success: false, message: 'Chyba při načítání statistik' });
  }
});

// POST /api/parse-env - Načíst .env soubor z dané cesty
app.post('/api/parse-env', authenticateToken, validateParseEnv, async (req, res) => {
  try {
    const { script_path } = req.body;

    const fs = require('fs');
    const path = require('path');

    // Získat složku ze script_path a normalizovat cestu
    const normalizedPath = path.normalize(script_path);
    const scriptDir = path.dirname(normalizedPath);
    const envPath = path.join(scriptDir, '.env');

    // Další bezpečnostní kontrola - zajistit že cesta neobsahuje zakázané vzory
    const resolvedEnvPath = path.resolve(envPath);
    if (resolvedEnvPath.includes('..') ||
        resolvedEnvPath.startsWith('/etc') ||
        resolvedEnvPath.startsWith('/root') ||
        resolvedEnvPath.startsWith('/sys') ||
        resolvedEnvPath.startsWith('/proc')) {
      logger.warn('Path traversal attempt detected', {
        ip: req.ip,
        user: req.user?.username,
        attempted_path: script_path
      });
      return res.status(403).json({
        success: false,
        message: 'Přístup k této cestě je zakázán'
      });
    }

    // Zkontrolovat jestli .env existuje
    if (!fs.existsSync(envPath)) {
      return res.json({
        success: true,
        env_vars: {},
        message: '.env soubor nenalezen'
      });
    }

    // Přečíst .env soubor
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars = {};

    // Parsovat .env řádek po řádku
    envContent.split('\n').forEach(line => {
      line = line.trim();

      // Ignorovat prázdné řádky a komentáře
      if (!line || line.startsWith('#')) return;

      // Parsovat KEY=VALUE
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Odstranit uvozovky pokud jsou
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        envVars[key] = value;
      }
    });

    res.json({
      success: true,
      env_vars: envVars,
      message: `Načteno ${Object.keys(envVars).length} proměnných z .env`
    });
  } catch (error) {
    logger.error('Error reading .env file', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Chyba při čtení .env souboru',
      error: error.message
    });
  }
});

// ============================================
// SERVER START
// ============================================

// WebSocket handling
io.on('connection', (socket) => {
  logger.info('WebSocket client connected', { socketId: socket.id });
  setWebSocketConnections(io.engine.clientsCount);

  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected', { socketId: socket.id });
    setWebSocketConnections(io.engine.clientsCount);
  });
});

// Broadcast bot status každých 3 sekundy
async function broadcastBotStatus() {
  try {
    const bots = await Bot.findAll();
    const botsWithStatus = await Promise.all(
      bots.map(async (bot) => {
        const status = await pm2Handler.getBotStatus(bot.pm2_name);

        // Uložit metriky pro online boty
        if (status.status === 'online') {
          await BotMetrics.create({
            bot_id: bot.id,
            cpu: status.cpu || 0,
            memory: status.memory || 0,
            timestamp: new Date()
          });
        }

        return {
          ...bot.toJSON(),
          ...status
        };
      })
    );

    // Update Prometheus metriky
    updateBotMetrics(botsWithStatus);

    io.emit('bots:update', botsWithStatus);
    logger.debug('Bot status broadcast', {
      total: botsWithStatus.length,
      online: botsWithStatus.filter(b => b.status === 'online').length
    });
  } catch (error) {
    logger.error('Error broadcasting bot status', { error: error.message });
  }
}

// Seed demo data pro in-memory databázi
async function seedDemoData() {
  logger.info('Seeding demo data...');

  // Zkontrolovat, jestli už data neexistují
  const existingUser = await User.findOne({ where: { username: 'demo' } });
  if (existingUser) {
    logger.info('Demo data already exists, skipping seeding');
    return;
  }

  // Demo user
  const passwordHash = await bcrypt.hash('demo', 10);
  await User.create({ username: 'demo', password_hash: passwordHash });

  // Demo boty
  const demoBots = [
    {
      name: 'Music Bot',
      type: 'nodejs',
      script_path: '/demo/bots/music-bot/index.js',
      pm2_name: 'demo-music-bot',
      env_vars: JSON.stringify({ TOKEN: 'demo_token_music', PREFIX: '!' }),
      auto_restart: true
    },
    {
      name: 'Moderation Bot',
      type: 'nodejs',
      script_path: '/demo/bots/mod-bot/index.js',
      pm2_name: 'demo-mod-bot',
      env_vars: JSON.stringify({ TOKEN: 'demo_token_mod', PREFIX: '.' }),
      auto_restart: true
    },
    {
      name: 'AI Chatbot',
      type: 'python',
      script_path: '/demo/bots/ai-bot/main.py',
      pm2_name: 'demo-ai-bot',
      env_vars: JSON.stringify({ DISCORD_TOKEN: 'demo_token_ai' }),
      auto_restart: false
    },
    {
      name: 'Stats Tracker',
      type: 'nodejs',
      script_path: '/demo/bots/stats-bot/index.js',
      pm2_name: 'demo-stats-bot',
      env_vars: JSON.stringify({ TOKEN: 'demo_token_stats' }),
      auto_restart: true
    }
  ];

  for (const botData of demoBots) {
    const bot = await Bot.create(botData);

    // Historie akcí
    await DeployHistory.create({
      bot_id: bot.id,
      action: 'created',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });
    await DeployHistory.create({
      bot_id: bot.id,
      action: 'start',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
    });
  }

  // Metriky pro první 2 boty
  const bots = await Bot.findAll({ limit: 2 });
  for (const bot of bots) {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    for (let time = oneHourAgo; time <= now; time += 3 * 60 * 1000) {
      await BotMetrics.create({
        bot_id: bot.id,
        cpu: 5 + Math.random() * 15,
        memory: 50 * 1024 * 1024 + Math.random() * 100 * 1024 * 1024,
        timestamp: new Date(time)
      });
    }
  }

  logger.info('Demo data seeded successfully (login: demo/demo)');
}

async function startServer() {
  try {
    // Připojit k databázi
    await initDatabase();
    logger.info('Database initialized');

    // Pokud je demo režim, seed data
    if (isDemoMode()) {
      await seedDemoData();
      logger.info('Demo mode active');
    }

    // Připojit k PM2
    await pm2Handler.connectPM2();
    logger.info('PM2 connected');

    // Spustit Express server
    server.listen(PORT, () => {
      logger.info(`Bot Manager API running on http://localhost:${PORT}`);
      logger.info('WebSocket server active');
      logger.info('Available endpoints:', {
        auth: 'POST /api/auth/login',
        metrics: 'GET /metrics',
        health: 'GET /api/health',
        bots: [
          'GET /api/bots',
          'POST /api/bots',
          'GET /api/bots/:id',
          'PUT /api/bots/:id',
          'DELETE /api/bots/:id',
          'POST /api/bots/:id/start',
          'POST /api/bots/:id/stop',
          'POST /api/bots/:id/restart',
          'GET /api/bots/:id/logs',
          'GET /api/bots/:id/history',
          'GET /api/bots/:id/metrics'
        ],
        stats: 'GET /api/stats'
      });
    });

    // Spustit broadcast statusu každých 3 sekundy
    setInterval(broadcastBotStatus, 3000);
    logger.info('Real-time updates active (every 3s)');
  } catch (error) {
    logger.error('Server startup failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  logger.warn('Server shutdown initiated');
  pm2Handler.disconnectPM2();
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});

startServer();
