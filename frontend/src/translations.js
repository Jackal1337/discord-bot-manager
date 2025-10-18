// Slovník překladů pro CZ/EN
export const translations = {
  cs: {
    // Navigation & Header
    welcome: 'Vítej',
    dashboard: 'Dashboard',
    bots: 'Moji boti',
    addBot: 'Přidat bota',
    logout: 'Odhlásit',

    // Stats
    totalBots: 'Celkem botů',
    onlineBots: 'Online',
    offlineBots: 'Offline',
    totalCPU: 'CPU',
    totalMemory: 'RAM',
    errorLoadingStats: 'Chyba při načítání statistik',

    // Bot List
    noBots: 'Žádní boti',
    noBotDescription: 'Zatím jsi nepřidal žádného bota. Začni přidáním nového!',
    createFirstBot: 'Vytvořit prvního bota',

    // Bot Card
    status: 'Status',
    online: 'Online',
    offline: 'Offline',
    uptime: 'Uptime',
    restarts: 'Restarty',
    start: 'Start',
    stop: 'Stop',
    restart: 'Restart',
    delete: 'Smazat',
    viewLogs: 'Zobrazit logy',
    viewMetrics: 'Zobrazit metriky',
    autoRestart: 'Auto-restart',

    // Add Bot Dialog
    addBotTitle: 'Přidat nového bota',
    addBotDescription: 'Vyplň informace o novém botovi',
    botName: 'Název bota',
    botNamePlaceholder: 'např. Music Bot',
    botType: 'Typ bota',
    scriptPath: 'Cesta ke skriptu',
    scriptPathPlaceholder: 'např. /home/user/bot/index.js',
    envVars: 'Proměnné prostředí (JSON)',
    envVarsPlaceholder: '{"TOKEN": "your_token_here"}',
    autoRestartTitle: 'Automatický restart při pádu',
    autoRestartDescription: 'PM2 automaticky restartuje bota při chybě (max 10×)',
    cancel: 'Zrušit',
    create: 'Vytvořit',

    // Login
    loginTitle: 'Přihlášení',
    loginSubtitle: 'Přihlas se do Bot Manageru',
    username: 'Uživatelské jméno',
    password: 'Heslo',
    login: 'Přihlásit',

    // Demo Banner
    demoMode: 'Demo režim',
    demoDescription: 'Data se po restartu serveru vymažou. Můžeš vše vyzkoušet!',
    viewGithub: 'GitHub',
    productionVersion: 'Produkční verze',

    // Errors
    error: 'Chyba',
    success: 'Úspěch',
    confirmDelete: 'Opravdu chceš smazat tohoto bota?',

    // Metrics
    cpuUsage: 'Využití CPU',
    memoryUsage: 'Využití paměti',
    last24Hours: 'Posledních 24 hodin',

    // General
    close: 'Zavřít',
    loading: 'Načítání...',
  },

  en: {
    // Navigation & Header
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    bots: 'My Bots',
    addBot: 'Add Bot',
    logout: 'Logout',

    // Stats
    totalBots: 'Total Bots',
    onlineBots: 'Online',
    offlineBots: 'Offline',
    totalCPU: 'CPU',
    totalMemory: 'RAM',
    errorLoadingStats: 'Error loading statistics',

    // Bot List
    noBots: 'No Bots',
    noBotDescription: "You haven't added any bots yet. Start by adding a new one!",
    createFirstBot: 'Create First Bot',

    // Bot Card
    status: 'Status',
    online: 'Online',
    offline: 'Offline',
    uptime: 'Uptime',
    restarts: 'Restarts',
    start: 'Start',
    stop: 'Stop',
    restart: 'Restart',
    delete: 'Delete',
    viewLogs: 'View Logs',
    viewMetrics: 'View Metrics',
    autoRestart: 'Auto-restart',

    // Add Bot Dialog
    addBotTitle: 'Add New Bot',
    addBotDescription: 'Fill in the information about your new bot',
    botName: 'Bot Name',
    botNamePlaceholder: 'e.g. Music Bot',
    botType: 'Bot Type',
    scriptPath: 'Script Path',
    scriptPathPlaceholder: 'e.g. /home/user/bot/index.js',
    envVars: 'Environment Variables (JSON)',
    envVarsPlaceholder: '{"TOKEN": "your_token_here"}',
    autoRestartTitle: 'Automatic restart on crash',
    autoRestartDescription: 'PM2 automatically restarts the bot on error (max 10×)',
    cancel: 'Cancel',
    create: 'Create',

    // Login
    loginTitle: 'Login',
    loginSubtitle: 'Sign in to Bot Manager',
    username: 'Username',
    password: 'Password',
    login: 'Sign In',

    // Demo Banner
    demoMode: 'Demo Mode',
    demoDescription: 'Data will be cleared on server restart. Feel free to try everything!',
    viewGithub: 'GitHub',
    productionVersion: 'Production Version',

    // Errors
    error: 'Error',
    success: 'Success',
    confirmDelete: 'Are you sure you want to delete this bot?',

    // Metrics
    cpuUsage: 'CPU Usage',
    memoryUsage: 'Memory Usage',
    last24Hours: 'Last 24 Hours',

    // General
    close: 'Close',
    loading: 'Loading...',
  }
};
