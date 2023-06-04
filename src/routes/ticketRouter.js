const express = require('express');
const qrcode = require('qrcode');
const router = express.Router();
const { addService, addTicketHistory, addTicket, getTicketListByDate,
  getTicketHistoryData, getAllTicketCategories, getRevenueByMonth, getTicketListByDate2,
  getAllServiceCategories, updateQRCode, getTicketHistoryDataByIdUser, getRevenueStatistics } = require('../controllers/ticketController');
const { verifyToken } = require('../controllers/accountController');

router.post('/generate-qr-code', (req, res, next) => {
  const paymentData = req.body.paymentData;
  const paymentDataString = JSON.stringify(paymentData);

  // Tạo Promise
  const generateQRCode = () => {
    return new Promise((resolve, reject) => {
      qrcode.toDataURL(paymentDataString, { errorCorrectionLevel: 'M' }, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  };

  generateQRCode()
    .then(url => {
      req.qrcode = url;
      next();
    })
    .catch(error => {
      res.status(500).json({ error: 'Failed to generate QR code' });
    });
}, updateQRCode);

//Lay created_date theo mui gio VN
// SELECT id, CONVERT_TZ(created_at, '+00:00', '+07:00') AS created_at_hanoi
// FROM ticket_history;


router.post('/bill', verifyToken, addTicketHistory);
router.get('/bill', verifyToken, getTicketHistoryData);
router.get('/billByID/:id', verifyToken, (req, res, next) => { req.limit = 1; next(); }, getTicketHistoryDataByIdUser);

router.post('/service', verifyToken, addService);
router.get('/service', verifyToken, getAllServiceCategories);

router.post('/ticket', verifyToken, addTicket);
router.get('/ticket', verifyToken, getAllTicketCategories);

router.get('/statistical', verifyToken, getRevenueStatistics);
router.get('/chart', verifyToken, getRevenueByMonth);
router.get('/billTenLast', verifyToken, (req, res, next) => { req.limit = 10; next(); }, getTicketHistoryDataByIdUser);

router.get('/pageTicket/:page', verifyToken, getTicketListByDate);
router.get('/pageTicketExpired/:page', verifyToken, getTicketListByDate2);

module.exports = router;

// ... Cấu hình và khởi động máy chủ Express
