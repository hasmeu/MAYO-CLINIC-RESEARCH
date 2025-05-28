// db/connection.js
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

// Build the full path to the database file
const dbPath = path.join(__dirname, 'database.sqlite');

// Create (or open) the database — only one db declaration here
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);

    // Enforce foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Create tables if they don't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id        INTEGER PRIMARY KEY AUTOINCREMENT,
        username       TEXT    NOT NULL,
        email          TEXT    NOT NULL UNIQUE,
        apple_id       TEXT,
        phone_number   TEXT,
        password_hash  TEXT    NOT NULL,
        created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS health_metrics (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id      INTEGER NOT NULL,
        weight       TEXT,
        bmi          TEXT,
        exercise     TEXT,
        calories     TEXT,
        updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        title TEXT,
        message TEXT,
        timestamp DATETIME,
        likes INTEGER DEFAULT 0
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        comment TEXT,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS CaloriesBurnedAPI (
        calories    REAL,
        date        TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS CustomActivities (
        customName    TEXT,
        activityName  TEXT
      )
    `);
    
    
  }
});

module.exports = db;
