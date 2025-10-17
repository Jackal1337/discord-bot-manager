const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initDatabase, Bot, DeployHistory } = require('./db');
const { authenticateToken, loginHandler } = require('./authMiddleware');
const pm2Handler = require('./pm2Handler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logování requestů
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// PUBLIC ROUTES (bez autentifikace)
// ============================================

app.post('/api/auth/login', loginHandler);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bot Manager API běží' });
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
    console.error('❌ Chyba při získávání botů:', error);
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
    console.error('❌ Chyba při získávání bota:', error);
    res.status(500).json({ success: false, message: 'Chyba při načítání bota' });
  }
});

// POST /api/bots - Přidat nového bota
app.post('/api/bots', async (req, res) => {
  try {
    const { name, type, script_path, env_vars } = req.body;

    // Validace
    if (!name || !type || !script_path) {
      return res.status(400).json({
        success: false,
        message: 'Název, typ a cesta ke scriptu jsou povinné'
      });
    }

    if (!['nodejs', 'python'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Typ musí být "nodejs" nebo "python"'
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
      env_vars: env_vars || '{}'
    });

    res.json({
      success: true,
      message: 'Bot přidán',
      bot: bot.toJSON()
    });
  } catch (error) {
    console.error('❌ Chyba při vytváření bota:', error);
    res.status(500).json({ success: false, message: 'Chyba při vytváření bota' });
  }
});

// PUT /api/bots/:id - Upravit konfiguraci bota
app.put('/api/bots/:id', async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    const { name, script_path, env_vars } = req.body;

    // Update jen pokud jsou hodnoty poskytnuté
    if (name) bot.name = name;
    if (script_path) bot.script_path = script_path;
    if (env_vars) bot.env_vars = env_vars;

    await bot.save();

    res.json({
      success: true,
      message: 'Bot upraven',
      bot: bot.toJSON()
    });
  } catch (error) {
    console.error('❌ Chyba při úpravě bota:', error);
    res.status(500).json({ success: false, message: 'Chyba při úpravě bota' });
  }
});

// DELETE /api/bots/:id - Smazat bota
app.delete('/api/bots/:id', async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    // Zastavit a smazat z PM2 (pokud běží)
    try {
      await pm2Handler.deleteBot(bot.pm2_name);
    } catch (pm2Error) {
      console.warn('⚠️ PM2 delete selhal (bot možná neběžel):', pm2Error.message);
    }

    // Smazat z databáze
    await bot.destroy();

    res.json({ success: true, message: 'Bot smazán' });
  } catch (error) {
    console.error('❌ Chyba při mazání bota:', error);
    res.status(500).json({ success: false, message: 'Chyba při mazání bota' });
  }
});

// --- Process Control ---

// POST /api/bots/:id/start - Spustit bota
app.post('/api/bots/:id/start', async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    await pm2Handler.startBot(bot.toJSON());

    // Zalogovat akci
    await DeployHistory.create({
      bot_id: bot.id,
      action: 'start'
    });

    res.json({ success: true, message: `Bot "${bot.name}" nastartován` });
  } catch (error) {
    console.error('❌ Chyba při startu bota:', error);

    // Zalogovat selhání
    if (req.params.id) {
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
app.post('/api/bots/:id/stop', async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    await pm2Handler.stopBot(bot.pm2_name);

    // Zalogovat akci
    await DeployHistory.create({
      bot_id: bot.id,
      action: 'stop'
    });

    res.json({ success: true, message: `Bot "${bot.name}" zastaven` });
  } catch (error) {
    console.error('❌ Chyba při zastavení bota:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při zastavení bota',
      error: error.message
    });
  }
});

// POST /api/bots/:id/restart - Restartovat bota
app.post('/api/bots/:id/restart', async (req, res) => {
  try {
    const bot = await Bot.findByPk(req.params.id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot nenalezen' });
    }

    await pm2Handler.restartBot(bot.pm2_name);

    // Zalogovat akci
    await DeployHistory.create({
      bot_id: bot.id,
      action: 'restart'
    });

    res.json({ success: true, message: `Bot "${bot.name}" restartován` });
  } catch (error) {
    console.error('❌ Chyba při restartu bota:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při restartu bota',
      error: error.message
    });
  }
});

// --- Monitoring ---

// GET /api/bots/:id/logs - Získat logy
app.get('/api/bots/:id/logs', async (req, res) => {
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
    console.error('❌ Chyba při načítání logů:', error);
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
    console.error('❌ Chyba při načítání historie:', error);
    res.status(500).json({ success: false, message: 'Chyba při načítání historie' });
  }
});

// GET /api/stats - Celkové statistiky
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const bots = await Bot.findAll();
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
    console.error('❌ Chyba při načítání statistik:', error);
    res.status(500).json({ success: false, message: 'Chyba při načítání statistik' });
  }
});

// POST /api/parse-env - Načíst .env soubor z dané cesty
app.post('/api/parse-env', authenticateToken, async (req, res) => {
  try {
    const { script_path } = req.body;

    if (!script_path) {
      return res.status(400).json({ success: false, message: 'script_path je povinný' });
    }

    const fs = require('fs');
    const path = require('path');

    // Získat složku ze script_path
    const scriptDir = path.dirname(script_path);
    const envPath = path.join(scriptDir, '.env');

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
    console.error('❌ Chyba při čtení .env:', error);
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

async function startServer() {
  try {
    // Připojit k databázi
    await initDatabase();

    // Připojit k PM2
    await pm2Handler.connectPM2();

    // Spustit Express server
    app.listen(PORT, () => {
      console.log(`🚀 Bot Manager API běží na http://localhost:${PORT}`);
      console.log(`📝 Endpoints:`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   GET    /api/bots`);
      console.log(`   POST   /api/bots`);
      console.log(`   GET    /api/bots/:id`);
      console.log(`   PUT    /api/bots/:id`);
      console.log(`   DELETE /api/bots/:id`);
      console.log(`   POST   /api/bots/:id/start`);
      console.log(`   POST   /api/bots/:id/stop`);
      console.log(`   POST   /api/bots/:id/restart`);
      console.log(`   GET    /api/bots/:id/logs`);
      console.log(`   GET    /api/bots/:id/history`);
      console.log(`   GET    /api/stats`);
    });
  } catch (error) {
    console.error('❌ Chyba při startu serveru:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️ Zastavuji server...');
  pm2Handler.disconnectPM2();
  process.exit(0);
});

startServer();
