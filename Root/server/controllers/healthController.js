// server/controllers/healthController.js
const db = require('../../db/connection');       // ← only one db require here

function getHealthData(req, res) {
  const sql = `
    SELECT weight, bmi, exercise, calories
    FROM health_metrics
    WHERE user_id = ?
    ORDER BY updated_at DESC
    LIMIT 1
  `;
  const userId = 1;
  db.get(sql, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'No health data found' });
    res.json(row);
  });
}

function updateHealthData(req, res) {
  const { weight, bmi, exercise, calories } = req.body;
  const sql = `
    UPDATE health_metrics
    SET weight = ?, bmi = ?, exercise = ?, calories = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `;
  const userId = 1;
  db.run(sql, [weight, bmi, exercise, calories, userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Health data updated', changes: this.changes });
  });
}

module.exports = { getHealthData, updateHealthData };
