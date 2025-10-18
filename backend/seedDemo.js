// Seed script pro demo verzi - vytvoří demo uživatele a ukázkové boty

const bcrypt = require('bcrypt');
const { initDatabase, User, Bot, DeployHistory, BotMetrics } = require('./db');

async function seedDemo() {
  try {
    console.log('🌱 Seed demo dat...\n');

    await initDatabase();

    // 1. Vytvořit demo uživatele
    console.log('👤 Vytváření demo uživatele...');

    const existingUser = await User.findOne({ where: { username: 'demo' } });

    if (existingUser) {
      console.log('⚠️  Demo uživatel již existuje, přeskakuji...');
    } else {
      const passwordHash = await bcrypt.hash('demo', 10);
      await User.create({
        username: 'demo',
        password_hash: passwordHash
      });
      console.log('✅ Demo uživatel vytvořen (username: demo, password: demo)');
    }

    // 2. Vytvořit ukázkové boty
    console.log('\n🤖 Vytváření ukázkových botů...');

    const demoBots = [
      {
        name: 'Music Bot',
        type: 'nodejs',
        script_path: '/demo/bots/music-bot/index.js',
        pm2_name: 'demo-music-bot',
        env_vars: JSON.stringify({
          TOKEN: 'demo_token_music_bot',
          PREFIX: '!',
          YOUTUBE_API_KEY: 'demo_youtube_key'
        }),
        auto_restart: true
      },
      {
        name: 'Moderation Bot',
        type: 'nodejs',
        script_path: '/demo/bots/mod-bot/index.js',
        pm2_name: 'demo-mod-bot',
        env_vars: JSON.stringify({
          TOKEN: 'demo_token_mod_bot',
          PREFIX: '.',
          LOG_CHANNEL: '123456789'
        }),
        auto_restart: true
      },
      {
        name: 'AI Chatbot',
        type: 'python',
        script_path: '/demo/bots/ai-bot/main.py',
        pm2_name: 'demo-ai-bot',
        env_vars: JSON.stringify({
          DISCORD_TOKEN: 'demo_token_ai_bot',
          OPENAI_API_KEY: 'demo_openai_key'
        }),
        auto_restart: false
      },
      {
        name: 'Stats Tracker',
        type: 'nodejs',
        script_path: '/demo/bots/stats-bot/index.js',
        pm2_name: 'demo-stats-bot',
        env_vars: JSON.stringify({
          TOKEN: 'demo_token_stats',
          DATABASE_URL: 'postgresql://demo'
        }),
        auto_restart: true
      }
    ];

    for (const botData of demoBots) {
      const existing = await Bot.findOne({ where: { pm2_name: botData.pm2_name } });

      if (existing) {
        console.log(`⚠️  Bot "${botData.name}" již existuje, přeskakuji...`);
      } else {
        await Bot.create(botData);
        console.log(`✅ Bot "${botData.name}" vytvořen`);
      }
    }

    // 3. Vytvořit ukázkovou historii akcí
    console.log('\n📜 Vytváření historie akcí...');

    const bots = await Bot.findAll();

    for (const bot of bots) {
      const historyCount = await DeployHistory.count({ where: { bot_id: bot.id } });

      if (historyCount === 0) {
        // Přidat několik ukázkových akcí
        const actions = [
          { action: 'created', error_message: null, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          { action: 'start', error_message: null, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
          { action: 'restart', error_message: null, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
          { action: 'stop', error_message: null, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
          { action: 'start', error_message: null, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) }
        ];

        for (const action of actions) {
          await DeployHistory.create({
            bot_id: bot.id,
            ...action
          });
        }

        console.log(`✅ Historie pro "${bot.name}" vytvořena`);
      }
    }

    // 4. Vytvořit ukázková CPU/Memory data
    console.log('\n📊 Vytváření ukázkových metrik...');

    for (const bot of bots.slice(0, 2)) { // Jen pro první 2 boty
      const metricsCount = await BotMetrics.count({ where: { bot_id: bot.id } });

      if (metricsCount === 0) {
        // Generovat data za poslední hodinu
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;

        for (let time = oneHourAgo; time <= now; time += 3 * 60 * 1000) { // Každé 3 minuty
          const cpu = 5 + Math.random() * 15; // 5-20% CPU
          const memory = 50 * 1024 * 1024 + Math.random() * 100 * 1024 * 1024; // 50-150 MB

          await BotMetrics.create({
            bot_id: bot.id,
            cpu,
            memory,
            timestamp: new Date(time)
          });
        }

        console.log(`✅ Metriky pro "${bot.name}" vytvořeny`);
      }
    }

    console.log('\n✅ Demo seed dokončen!\n');
    console.log('📝 Demo přihlašovací údaje:');
    console.log('   Username: demo');
    console.log('   Password: demo\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Chyba při seedování:', error);
    process.exit(1);
  }
}

seedDemo();
