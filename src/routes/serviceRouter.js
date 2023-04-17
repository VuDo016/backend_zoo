const express = require('express');
const router = express.Router();
const { getAllTickets } = require('../controllers/serviceController');

// Lấy tất cả thông tin về dịch vụ
router.get('/', getAllTickets);

module.exports = router;