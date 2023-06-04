const express = require('express');
const router = express.Router();
const { getAllEvents, getEventsByDate } = require('../controllers/eventController');
const { verifyToken } = require('../controllers/accountController');

// Lấy tất cả thông tin về sự kiện
router.get('/', verifyToken, getAllEvents);

router.get('/getByDate/:date', verifyToken, getEventsByDate);

module.exports = router;