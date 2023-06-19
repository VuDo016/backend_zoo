const express = require('express');
const router = express.Router();
const { getAllEvents, getEventsByDate, addNewEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { verifyToken } = require('../controllers/accountController');

// Lấy tất cả thông tin về sự kiện
router.get('/', verifyToken, getAllEvents);

router.get('/getByDate/:date', verifyToken, getEventsByDate);

router.post('/', verifyToken, addNewEvent)
router.put('/', verifyToken, updateEvent)
router.delete('/:id', verifyToken, deleteEvent)

module.exports = router;