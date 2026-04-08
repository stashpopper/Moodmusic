const express = require('express');
const router = express.Router();
const { getLyrics } = require('../controllers/lyricsController');

router.get('/lyrics', getLyrics);

module.exports = router;
