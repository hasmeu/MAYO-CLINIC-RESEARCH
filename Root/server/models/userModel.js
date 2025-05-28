// server/models/userModel.js

const db = require('../../db/connection');

const User = {
  /**
   * Create a new user in the database.
   * @param {Object} userData - The user data to create a new user.
   * @param {Function} callback - Callback to execute after user is created.
   */
  create: (userData, callback) => {
    const { username, email, password } = userData;
    const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
    db.run(sql, [username, email, password], function(err) {
      if (err) {
        return callback(err);
      }
      // The "this" context gives us the lastID from the insert
      callback(null, { id: this.lastID, username, email });
    });
  },

  /**
   * Find a user by their ID.
   * @param {number} id - The user ID.
   * @param {Function} callback - Callback to execute with the found user.
   */
  findById: (id, callback) => {
    const sql = `SELECT * FROM users WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, row);
    });
  },
};

module.exports = User;

  