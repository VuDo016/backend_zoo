const express = require('express');
const router = express.Router();
const { getAllEvents } = require('../controllers/eventController');

// Lấy tất cả thông tin về sự kiện
router.get('/', getAllEvents);

module.exports = router;