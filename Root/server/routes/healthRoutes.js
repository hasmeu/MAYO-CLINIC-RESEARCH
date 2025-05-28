// server/routes/healthRoutes.js
const express = require('express');
const router  = express.Router();
const { getHealthData, updateHealthData } = require('../controllers/healthController');

// **Do not** require db in this file—only import the controller methods:
router.get('/',    getHealthData);
router.put('/',    updateHealthData);

module.exports = router;
