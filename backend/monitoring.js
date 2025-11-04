const promClient = require('prom-client');

// Vytvoření registru pro metriky
const register = new promClient.Registry();

// Defaultní metriky (CPU, paměť, event loop atd.)
promClient.collectDefaultMetrics({ register });

// Custom metriky

// HTTP request duration histogram
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

// HTTP request counter
const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Active WebSocket connections gauge
const wsConnectionsGauge = new promClient.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections'
});

// Bot status gauge
const botStatusGauge = new promClient.Gauge({
  name: 'bot_status',
  help: 'Status of bots (1=online, 0=offline)',
  labelNames: ['bot_name', 'bot_id']
});

// Bot metrics gauges
const botCpuGauge = new promClient.Gauge({
  name: 'bot_cpu_usage_percent',
  help: 'CPU usage of bot in percent',
  labelNames: ['bot_name', 'bot_id']
});

const botMemoryGauge = new promClient.Gauge({
  name: 'bot_memory_usage_bytes',
  help: 'Memory usage of bot in bytes',
  labelNames: ['bot_name', 'bot_id']
});

const botRestartsCounter = new promClient.Counter({
  name: 'bot_restarts_total',
  help: 'Total number of bot restarts',
  labelNames: ['bot_name', 'bot_id']
});

// Zaregistrovat všechny metriky
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(wsConnectionsGauge);
register.registerMetric(botStatusGauge);
register.registerMetric(botCpuGauge);
register.registerMetric(botMemoryGauge);
register.registerMetric(botRestartsCounter);

// Middleware pro měření HTTP metrik
const metricsMiddleware = (req, res, next) => {
  // Skip /metrics endpoint samotný
  if (req.path === '/metrics') {
    return next();
  }

  const start = Date.now();

  // Zachytit původní res.end
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;

    // Record metriky
    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode
      },
      duration
    );

    httpRequestTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });

    // Zavolat původní end
    originalEnd.apply(res, args);
  };

  next();
};

// Update bot metrik
const updateBotMetrics = (bots) => {
  bots.forEach(bot => {
    const labels = {
      bot_name: bot.name,
      bot_id: bot.id.toString()
    };

    // Status (1 = online, 0 = offline)
    botStatusGauge.set(labels, bot.status === 'online' ? 1 : 0);

    // CPU a Memory jen pro online boty
    if (bot.status === 'online') {
      botCpuGauge.set(labels, bot.cpu || 0);
      botMemoryGauge.set(labels, bot.memory || 0);
    }
  });
};

// Increment restart counter
const incrementBotRestart = (botName, botId) => {
  botRestartsCounter.inc({
    bot_name: botName,
    bot_id: botId.toString()
  });
};

// WebSocket connection tracking
const setWebSocketConnections = (count) => {
  wsConnectionsGauge.set(count);
};

module.exports = {
  register,
  metricsMiddleware,
  updateBotMetrics,
  incrementBotRestart,
  setWebSocketConnections
};
