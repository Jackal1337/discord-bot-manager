const pm2 = require('pm2');
const fs = require('fs');
const path = require('path');
const { isDemoMode } = require('./demoMiddleware');

// Fake metriky pro demo režim - simuluje "hustý" provoz
function generateDemoMetrics(pm2Name) {
  // Různé boty mají různé charakteristiky podle jména
  const baseValues = {
    'demo-music-bot': { cpu: 15, memory: 120, variance: 0.3 },
    'demo-mod-bot': { cpu: 8, memory: 85, variance: 0.2 },
    'demo-ai-bot': { cpu: 35, memory: 250, variance: 0.5 },
    'demo-stats-bot': { cpu: 12, memory: 95, variance: 0.25 }
  };

  // Použít specifické hodnoty pro daný bot, nebo defaulty
  const base = baseValues[pm2Name] || { cpu: 10, memory: 100, variance: 0.3 };

  // Přidat náhodnou variaci pro realističnost
  const cpuVariation = (Math.random() - 0.5) * 2 * base.variance;
  const memoryVariation = (Math.random() - 0.5) * 2 * base.variance;

  return {
    status: Math.random() > 0.05 ? 'online' : 'online', // 95% online
    uptime: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000), // Random uptime 0-7 dní
    cpu: Math.max(0, base.cpu * (1 + cpuVariation)),
    memory: Math.max(0, base.memory * 1024 * 1024 * (1 + memoryVariation)), // V bajtech
    restarts: Math.floor(Math.random() * 5) // 0-4 restarty
  };
}

// Připojení k PM2 daemon
function connectPM2() {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        console.error('❌ PM2 připojení selhalo:', err);
        reject(err);
      } else {
        console.log('✅ PM2 připojeno');
        resolve();
      }
    });
  });
}

// Odpojení od PM2
function disconnectPM2() {
  pm2.disconnect();
}

// Získat seznam všech PM2 procesů
function listProcesses() {
  return new Promise((resolve, reject) => {
    pm2.list((err, processes) => {
      if (err) reject(err);
      else resolve(processes);
    });
  });
}

// Najít proces podle PM2 jména
async function findProcess(pm2Name) {
  const processes = await listProcesses();
  return processes.find(proc => proc.name === pm2Name);
}

// Nastartovat bota
function startBot(botConfig) {
  return new Promise((resolve, reject) => {
    // Ověřit že script existuje
    if (!fs.existsSync(botConfig.script_path)) {
      return reject(new Error(`Script nenalezen: ${botConfig.script_path}`));
    }

    // Parse ENV variables z JSON
    let env = {};
    try {
      env = JSON.parse(botConfig.env_vars || '{}');
    } catch (e) {
      console.warn('⚠️ Neplatné ENV variables, používám prázdné:', e.message);
    }

    const pm2Config = {
      name: botConfig.pm2_name,
      script: botConfig.script_path,
      interpreter: botConfig.type === 'python' ? 'python3' : 'node',
      cwd: path.dirname(botConfig.script_path),
      env: env,
      autorestart: botConfig.auto_restart !== false, // Default true, pokud není explicitně false
      max_restarts: botConfig.auto_restart !== false ? 10 : 0,
      min_uptime: botConfig.auto_restart !== false ? '10s' : undefined,
      restart_delay: botConfig.auto_restart !== false ? 4000 : undefined
    };

    pm2.start(pm2Config, (err, proc) => {
      if (err) {
        console.error(`❌ Start bota "${botConfig.name}" selhal:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Bot "${botConfig.name}" nastartován (PM2: ${botConfig.pm2_name})`);
        resolve(proc);
      }
    });
  });
}

// Zastavit bota
function stopBot(pm2Name) {
  return new Promise((resolve, reject) => {
    pm2.stop(pm2Name, (err) => {
      if (err) {
        console.error(`❌ Stop bota "${pm2Name}" selhal:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Bot "${pm2Name}" zastaven`);
        resolve();
      }
    });
  });
}

// Restartovat bota
function restartBot(pm2Name) {
  return new Promise((resolve, reject) => {
    pm2.restart(pm2Name, (err) => {
      if (err) {
        console.error(`❌ Restart bota "${pm2Name}" selhal:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Bot "${pm2Name}" restartován`);
        resolve();
      }
    });
  });
}

// Smazat proces z PM2
function deleteBot(pm2Name) {
  return new Promise((resolve, reject) => {
    pm2.delete(pm2Name, (err) => {
      if (err) {
        console.error(`❌ Delete bota "${pm2Name}" z PM2 selhal:`, err.message);
        reject(err);
      } else {
        console.log(`✅ Bot "${pm2Name}" smazán z PM2`);
        resolve();
      }
    });
  });
}

// Získat logy bota (poslední N řádků)
function getBotLogs(pm2Name, lines = 100) {
  return new Promise((resolve, reject) => {
    pm2.describe(pm2Name, (err, processDescription) => {
      if (err || !processDescription || processDescription.length === 0) {
        return reject(new Error('Bot nenalezen'));
      }

      const proc = processDescription[0];
      const logFiles = {
        out: proc.pm2_env.pm_out_log_path,
        err: proc.pm2_env.pm_err_log_path
      };

      // Přečíst poslední N řádků z obou logů
      try {
        let outLog = '';
        let errLog = '';

        if (fs.existsSync(logFiles.out)) {
          const content = fs.readFileSync(logFiles.out, 'utf-8');
          outLog = content.split('\n').slice(-lines).join('\n');
        }

        if (fs.existsSync(logFiles.err)) {
          const content = fs.readFileSync(logFiles.err, 'utf-8');
          errLog = content.split('\n').slice(-lines).join('\n');
        }

        resolve({
          stdout: outLog,
          stderr: errLog
        });
      } catch (readError) {
        reject(readError);
      }
    });
  });
}

// Získat status a statistiky bota
async function getBotStatus(pm2Name) {
  // V demo režimu vrátit fake metriky
  if (isDemoMode()) {
    return generateDemoMetrics(pm2Name);
  }

  // Produkční režim - reálné PM2 metriky
  const proc = await findProcess(pm2Name);

  if (!proc) {
    return {
      status: 'offline',
      uptime: 0,
      cpu: 0,
      memory: 0,
      restarts: 0
    };
  }

  return {
    status: proc.pm2_env.status, // 'online', 'stopping', 'stopped', 'errored'
    uptime: proc.pm2_env.pm_uptime,
    cpu: proc.monit.cpu,
    memory: proc.monit.memory,
    restarts: proc.pm2_env.restart_time || 0
  };
}

module.exports = {
  connectPM2,
  disconnectPM2,
  listProcesses,
  findProcess,
  startBot,
  stopBot,
  restartBot,
  deleteBot,
  getBotLogs,
  getBotStatus
};
