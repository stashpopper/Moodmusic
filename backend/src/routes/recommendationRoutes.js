const express = require('express');
const router = express.Router();
const { getRecommendations, communitySongs } = require('../controllers/recommendationsController');

router.post('/recommendations', getRecommendations);
router.get('/community', communitySongs);

module.exports = router;
