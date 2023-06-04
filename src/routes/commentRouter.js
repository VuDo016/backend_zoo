const express = require('express');
const router = express.Router();
const { createFeedback, getFeedbackById } = require('../controllers/commentController');
const { verifyToken } = require('../controllers/accountController');

// Tạo mới feedback
router.post('/', verifyToken, createFeedback);

// Lấy thông tin feedback theo idAnimal
router.get('/animal/:idAnimal', verifyToken, getFeedbackById);

// Lấy thông tin feedback theo idEvent
router.get('/event/:idEvent', verifyToken, getFeedbackById);

// Lấy thông tin feedback theo idActivity
router.get('/activity/:idActivity', verifyToken, getFeedbackById);

// Lấy thông tin feedback theo idUser
router.get('/user/:idUser', verifyToken, getFeedbackById);

module.exports = router;
