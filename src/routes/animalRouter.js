const express = require('express');
const router = express.Router();
const { getAllAnimal, getAnimalBySpecies } = require('../controllers/animalController');
const { verifyToken } = require('../controllers/accountController');


// Lấy tất cả thông tin về dịch vụ
router.get('/', verifyToken, getAllAnimal);
router.get('/getBySpecies/:species', verifyToken, getAnimalBySpecies);

module.exports = router;