const express = require('express');
const router = express.Router();
const { getAllEvents, getEventsByDate } = require('../controllers/eventController');

// Lấy tất cả thông tin về sự kiện
router.get('/', getAllEvents);

router.get('/getByDate/:date', getEventsByDate);

module.exports = router;