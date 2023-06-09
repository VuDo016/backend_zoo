const express = require('express');
const router = express.Router();
const { getAllAnimal, getAnimalBySpecies, addNewAnimal, updateAnimal, deleteAnimal } = require('../controllers/animalController');
const { verifyToken } = require('../controllers/accountController');


// Lấy tất cả thông tin về dịch vụ
router.get('/', verifyToken, getAllAnimal);
router.get('/getBySpecies/:species', verifyToken, getAnimalBySpecies);
router.post('/', verifyToken, addNewAnimal)
router.put('/', verifyToken, updateAnimal)
router.delete('/:id', verifyToken, deleteAnimal)

module.exports = router;