/**
 * Setup script - První spuštění systému
 * Vytvoří databázi a prvního uživatele
 */

const readline = require('readline');
const { initDatabase } = require('./db');
const { createUser } = require('./authMiddleware');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('===========================================');
  console.log('   Bot Manager - Prvotní Setup');
  console.log('===========================================\n');

  try {
    // Inicializovat databázi
    console.log('📦 Inicializuji databázi...');
    await initDatabase();

    // Vytvořit prvního uživatele
    console.log('\n👤 Vytvoření prvního uživatele:');
    const username = await question('Username: ');
    const password = await question('Password: ');

    if (!username || !password) {
      console.log('❌ Username a password jsou povinné');
      process.exit(1);
    }

    await createUser(username, password);

    console.log('\n✅ Setup dokončen!');
    console.log('\nSpusť server příkazem:');
    console.log('  npm start\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Chyba při setupu:', error);
    process.exit(1);
  }
}

setup();
