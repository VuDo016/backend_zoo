const express = require('express');
const router = express.Router();
const { getZooInfo, createZooInfo, updateZooInfo } = require('../controllers/zooInfoController');

// Lấy tất cả thông tin về sở thú
router.get('/', getZooInfo);

// Tạo thông tin về sở thú mới
router.post('/', createZooInfo);

// Cập nhật thông tin về sở thú
router.put('/:id', updateZooInfo);

module.exports = router;