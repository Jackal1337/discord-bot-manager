const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

// SQLite databáze
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.resolve(__dirname, process.env.DB_PATH || '../bot-manager.db'),
  logging: false // Vypnout SQL logy (pro production)
});

// Model: User (pro autentifikaci)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Model: Bot
const Bot = sequelize.define('Bot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, // 'nodejs' nebo 'python'
    allowNull: false
  },
  script_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pm2_name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  env_vars: {
    type: DataTypes.TEXT, // JSON string
    defaultValue: '{}'
  }
}, {
  tableName: 'bots',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Model: Deploy History (logování akcí)
const DeployHistory = sequelize.define('DeployHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bot_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'bots',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  action: {
    type: DataTypes.STRING, // 'start', 'stop', 'restart', 'start_failed', atd.
    allowNull: false
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'deploy_history',
  timestamps: false
});

// Relace
Bot.hasMany(DeployHistory, { foreignKey: 'bot_id', as: 'history', onDelete: 'CASCADE' });
DeployHistory.belongsTo(Bot, { foreignKey: 'bot_id' });

// Sync databáze
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Připojení k SQLite databázi úspěšné');

    await sequelize.sync();
    console.log('✅ Databázové modely synchronizovány');
  } catch (error) {
    console.error('❌ Chyba při připojení k databázi:', error);
    process.exit(1);
  }
}

module.exports = {
  sequelize,
  User,
  Bot,
  DeployHistory,
  initDatabase
};
