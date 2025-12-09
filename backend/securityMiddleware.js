const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, param, query, validationResult } = require('express-validator');
const path = require('path');
const logger = require('./logger');

// Rate limiting pro různé endpointy
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        user: req.user?.username
      });
      res.status(429).json({
        success: false,
        message
      });
    }
  });
};

// Globální rate limit - 100 requestů za 15 minut
const globalLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Příliš mnoho requestů, zkuste to za chvíli'
);

// Přísný limit pro login - 5 pokusů za 15 minut
const loginLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Příliš mnoho pokusů o přihlášení, zkuste to za 15 minut'
);

// Limit pro bot operace - 30 za minutu
const botOperationsLimiter = createRateLimiter(
  60 * 1000,
  30,
  'Příliš mnoho operací s boty, zkuste to za chvíli'
);

// Helmet konfigurace pro bezpečnostní hlavičky
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'ws:', 'wss:'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS whitelist - pouze povolené domény
const getCorsOptions = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

  return {
    origin: (origin, callback) => {
      // Povolit requesty bez origin (např. Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked request from origin', { origin });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
};

// Middleware pro validaci chybějících polí
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation failed', {
      path: req.path,
      errors: errors.array()
    });
    return res.status(400).json({
      success: false,
      message: 'Validace selhala',
      errors: errors.array()
    });
  }
  next();
};

// Validace pro vytvoření bota
const validateBotCreate = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Název musí mít 1-100 znaků')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Název může obsahovat pouze písmena, čísla, mezery, pomlčky a podtržítka'),
  body('type')
    .isIn(['nodejs', 'python'])
    .withMessage('Typ musí být "nodejs" nebo "python"'),
  body('script_path')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Cesta ke scriptu je povinná')
    .custom((value) => {
      // Prevence path traversal
      const normalized = path.normalize(value);
      if (normalized.includes('..')) {
        throw new Error('Neplatná cesta - detekován path traversal pokus');
      }
      return true;
    }),
  body('env_vars')
    .optional()
    .isJSON()
    .withMessage('ENV variables musí být validní JSON'),
  body('auto_restart')
    .optional()
    .isBoolean()
    .withMessage('auto_restart musí být boolean'),
  handleValidationErrors
];

// Validace pro update bota
const validateBotUpdate = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID musí být kladné číslo'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Název musí mít 1-100 znaků')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Název může obsahovat pouze písmena, čísla, mezery, pomlčky a podtržítka'),
  body('script_path')
    .optional()
    .trim()
    .custom((value) => {
      const normalized = path.normalize(value);
      if (normalized.includes('..')) {
        throw new Error('Neplatná cesta - detekován path traversal pokus');
      }
      return true;
    }),
  body('env_vars')
    .optional()
    .isJSON()
    .withMessage('ENV variables musí být validní JSON'),
  body('auto_restart')
    .optional()
    .isBoolean()
    .withMessage('auto_restart musí být boolean'),
  handleValidationErrors
];

// Validace pro bot ID v params
const validateBotId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID musí být kladné číslo'),
  handleValidationErrors
];

// Validace pro logs endpoint
const validateLogsQuery = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID musí být kladné číslo'),
  query('lines')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('lines musí být číslo mezi 1 a 1000'),
  handleValidationErrors
];

// Validace pro metrics endpoint
const validateMetricsQuery = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID musí být kladné číslo'),
  query('hours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('hours musí být číslo mezi 1 a 168 (7 dní)'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('limit musí být číslo mezi 1 a 10000'),
  handleValidationErrors
];

// Validace pro parse-env endpoint
const validateParseEnv = [
  body('script_path')
    .trim()
    .isLength({ min: 1 })
    .withMessage('script_path je povinný')
    .custom((value) => {
      const normalized = path.normalize(value);
      // Striktní kontrola path traversal
      if (normalized.includes('..') || normalized.startsWith('/etc') || normalized.startsWith('/root')) {
        throw new Error('Neplatná nebo zakázaná cesta');
      }
      return true;
    }),
  handleValidationErrors
];

module.exports = {
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
};
