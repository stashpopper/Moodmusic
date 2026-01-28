const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { saveToHistory, getHistory, deleteHistory } = require('../controllers/historyController');

// All history routes are protected
router.post('/', verifyToken, saveToHistory);
router.get('/', verifyToken, getHistory);
router.delete('/:id', verifyToken, deleteHistory);

module.exports = router;
