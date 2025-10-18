// Demo režim middleware - blokuje modifikační operace

const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Povolené read-only endpointy v demo režimu
const ALLOWED_METHODS = ['GET'];

// Výjimky - endpointy které jsou povolené i v demo režimu
const ALLOWED_ENDPOINTS = [
  '/api/auth/login',     // Login musí fungovat
  '/api/parse-env'       // Read-only operace
];

function demoMiddleware(req, res, next) {
  // Pokud není demo režim, pokračuj normálně
  if (!DEMO_MODE) {
    return next();
  }

  const method = req.method;
  const path = req.path;

  // Povol GET requesty
  if (ALLOWED_METHODS.includes(method)) {
    return next();
  }

  // Povol specifické endpointy
  if (ALLOWED_ENDPOINTS.includes(path)) {
    return next();
  }

  // Blokuj všechny ostatní modifikační operace
  return res.status(403).json({
    success: false,
    message: 'Demo režim: Modifikační operace nejsou povoleny. This is read-only demo.',
    demo: true
  });
}

// Funkce pro kontrolu jestli běží demo režim
function isDemoMode() {
  return DEMO_MODE;
}

module.exports = {
  demoMiddleware,
  isDemoMode
};
