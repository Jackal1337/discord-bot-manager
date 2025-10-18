// Demo režim middleware - všechny operace povoleny, ale data jsou in-memory

const DEMO_MODE = process.env.DEMO_MODE === 'true';

function demoMiddleware(req, res, next) {
  // Pokud není demo režim, pokračuj normálně
  if (!DEMO_MODE) {
    return next();
  }

  // V demo režimu jsou všechny operace povolené
  // Data jsou v :memory: databázi, takže po restartu zmizí
  next();
}

// Funkce pro kontrolu jestli běží demo režim
function isDemoMode() {
  return DEMO_MODE;
}

module.exports = {
  demoMiddleware,
  isDemoMode
};
