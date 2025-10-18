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
    demoDescription: 'Data se resetují při restartu serveru - vyzkoušej všechny funkce!',
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

    // Bot Detail Page
    backToDashboard: 'Zpět na dashboard',
    stopping: 'Zastavuji',
    errored: 'Chyba',
    errorLoadingBot: 'Chyba při načítání bota',
    errorLoadingLogs: 'Chyba při načítání logů',
    errorLoadingMetrics: 'Chyba při načítání metrik',
    botStarted: 'Bot spuštěn',
    botStopped: 'Bot zastaven',
    botRestarted: 'Bot restartován',
    botDeleted: 'Bot smazán',
    errorStarting: 'Chyba při spuštění',
    errorStopping: 'Chyba při zastavení',
    errorRestarting: 'Chyba při restartu',
    errorDeleting: 'Chyba při mazání',
    confirmDeleteBot: 'Opravdu smazat bota',
    lastHour: 'Poslední hodina',
    logs: 'Logy',
    logsDescription: 'Poslední výstupy z konzole',
    noLogsYet: 'Zatím žádné logy...',

    // Add Bot Dialog
    addNewBot: 'Přidat nového bota',
    botNameLabel: 'Název bota',
    botNamePlaceholder2: 'např. Music Bot',
    type: 'Typ',
    scriptPathLabel: 'Cesta ke scriptu',
    scriptPathPlaceholder2: '/home/user/bots/music-bot/index.js',
    scriptPathHint: 'Absolutní cesta k hlavnímu souboru bota',
    loadEnv: 'Načíst .env',
    loadingEnv: 'Načítám...',
    envVarsLabel: 'ENV Variables (volitelné)',
    envVarsPlaceholder2: '{"TOKEN": "xxx", "PREFIX": "!"}',
    jsonFormat: 'JSON formát',
    autoRestartLabel: 'Automatický restart',
    autoRestartTitle2: 'Automatický restart při pádu',
    autoRestartDescription2: 'PM2 automaticky restartuje bota při chybě (max 10×)',
    cancelButton: 'Zrušit',
    addBotButton: 'Přidat bota',
    addingBot: 'Přidávám...',
    botAdded: 'Bot přidán',
    errorAddingBot: 'Chyba při přidávání bota',
    enterScriptPathFirst: 'Nejdřív zadej cestu ke scriptu',
    envFileNotFound: '.env soubor nenalezen nebo je prázdný',
    errorLoadingEnv: 'Chyba při načítání .env',
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
    demoDescription: 'Data resets on server restart - try all features!',
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

    // Bot Detail Page
    backToDashboard: 'Back to dashboard',
    stopping: 'Stopping',
    errored: 'Error',
    errorLoadingBot: 'Error loading bot',
    errorLoadingLogs: 'Error loading logs',
    errorLoadingMetrics: 'Error loading metrics',
    botStarted: 'Bot started',
    botStopped: 'Bot stopped',
    botRestarted: 'Bot restarted',
    botDeleted: 'Bot deleted',
    errorStarting: 'Error starting',
    errorStopping: 'Error stopping',
    errorRestarting: 'Error restarting',
    errorDeleting: 'Error deleting',
    confirmDeleteBot: 'Are you sure you want to delete bot',
    lastHour: 'Last hour',
    logs: 'Logs',
    logsDescription: 'Recent console output',
    noLogsYet: 'No logs yet...',

    // Add Bot Dialog
    addNewBot: 'Add New Bot',
    botNameLabel: 'Bot Name',
    botNamePlaceholder2: 'e.g. Music Bot',
    type: 'Type',
    scriptPathLabel: 'Script Path',
    scriptPathPlaceholder2: '/home/user/bots/music-bot/index.js',
    scriptPathHint: 'Absolute path to bot main file',
    loadEnv: 'Load .env',
    loadingEnv: 'Loading...',
    envVarsLabel: 'ENV Variables (optional)',
    envVarsPlaceholder2: '{"TOKEN": "xxx", "PREFIX": "!"}',
    jsonFormat: 'JSON format',
    autoRestartLabel: 'Automatic restart',
    autoRestartTitle2: 'Automatic restart on crash',
    autoRestartDescription2: 'PM2 automatically restarts the bot on error (max 10×)',
    cancelButton: 'Cancel',
    addBotButton: 'Add Bot',
    addingBot: 'Adding...',
    botAdded: 'Bot added',
    errorAddingBot: 'Error adding bot',
    enterScriptPathFirst: 'Enter script path first',
    envFileNotFound: '.env file not found or empty',
    errorLoadingEnv: 'Error loading .env',
  }
};
