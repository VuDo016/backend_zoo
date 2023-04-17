const express = require('express');
const router = express.Router();
const { getAllAnimal } = require('../controllers/animalController');

// Lấy tất cả thông tin về dịch vụ
router.get('/', getAllAnimal);

module.exports = router;