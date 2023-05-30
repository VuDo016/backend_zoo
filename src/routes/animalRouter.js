const express = require('express');
const router = express.Router();
const { getAllAnimal, getAnimalBySpecies } = require('../controllers/animalController');

// Lấy tất cả thông tin về dịch vụ
router.get('/', getAllAnimal);
router.get('/getBySpecies/:species', getAnimalBySpecies);

module.exports = router;