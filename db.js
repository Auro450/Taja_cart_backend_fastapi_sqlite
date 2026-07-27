const mysql = require('mysql2');
require('dotenv').config();

// Hostinger Placeholder Credentials (defaults to XAMPP local server)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taja_cart',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
};

let pool;

const initDb = (callback) => {
  // Create a temporary pool to run CREATE DATABASE if it doesn't exist (for local testing via XAMPP)
  const initPool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  initPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``, (err) => {
    if (err) {
      console.error("Failed to create database:", err);
      if (callback) callback(err);
      return;
    }
    
    // Now create the actual pool connected to the database
    pool = mysql.createPool(dbConfig);
    console.log(`Connected to MySQL database: ${dbConfig.database}`);
    if (callback) callback(null);
  });
};

const dbWrapper = {
  init: initDb,
  run: function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    
    // SQLite to MySQL Schema Translations
    if (sql.includes('CREATE TABLE')) {
      sql = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/g, 'INT AUTO_INCREMENT PRIMARY KEY');
      sql = sql.replace(/TEXT PRIMARY KEY/g, 'VARCHAR(255) PRIMARY KEY');
      sql = sql.replace(/TEXT UNIQUE/g, 'VARCHAR(255) UNIQUE');
      sql = sql.replace(/key VARCHAR\(255\) PRIMARY KEY/g, '\`key\` VARCHAR(255) PRIMARY KEY');
      sql = sql.replace(/key TEXT PRIMARY KEY/g, '\`key\` VARCHAR(255) PRIMARY KEY');
      sql = sql.replace(/userEmail TEXT/g, 'userEmail VARCHAR(255)');
    }
    
    // SQLite INSERT OR IGNORE -> MySQL INSERT IGNORE
    if (sql.includes('INSERT OR IGNORE')) {
      sql = sql.replace(/INSERT OR IGNORE/g, 'INSERT IGNORE');
    }

    // Fix MySQL reserved keyword 'key' in settings inserts
    if (sql.includes('INTO settings')) {
      sql = sql.replace(/\(key, value\)/g, '(\`key\`, \`value\`)');
    }

    // SQLite ON CONFLICT DO UPDATE SET -> MySQL ON DUPLICATE KEY UPDATE
    if (sql.includes('ON CONFLICT')) {
      sql = sql.replace(/ON CONFLICT\s*\([^)]+\)\s*DO UPDATE SET/g, 'ON DUPLICATE KEY UPDATE');
      sql = sql.replace(/excluded\.(\w+)/g, 'VALUES($1)');
    }

    pool.query(sql, params, (err, results) => {
      if (callback) {
        const context = {
          lastID: results ? results.insertId : null,
          changes: results ? results.affectedRows : 0
        };
        callback.call(context, err);
      }
    });
  },
  all: function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(sql, params, (err, results) => {
      callback(err, results);
    });
  },
  get: function(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(sql, params, (err, results) => {
      callback(err, results && results.length > 0 ? results[0] : null);
    });
  },
  serialize: function(callback) {
    callback();
  },
  prepare: function(sql) {
    return {
      run: function(...args) {
        let callback = null;
        let params = args;
        if (args.length > 0 && typeof args[args.length - 1] === 'function') {
          callback = params.pop();
        }
        pool.query(sql, params, (err, results) => {
          if (callback) {
            const context = {
              lastID: results ? results.insertId : null,
              changes: results ? results.affectedRows : 0
            };
            callback.call(context, err);
          }
        });
      },
      finalize: function() {}
    };
  }
};

module.exports = dbWrapper;
