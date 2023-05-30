const express = require('express');
const qrcode = require('qrcode');
const router = express.Router();
const { addService, addTicketHistory, addTicket, getTicketListByDate,
  getTicketHistoryData, getAllTicketCategories, getRevenueByMonth, getTicketListByDate2,
  getAllServiceCategories, updateQRCode, getTicketHistoryDataByIdUser, getRevenueStatistics } = require('../controllers/ticketController');

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


router.post('/bill', addTicketHistory);
router.get('/bill', getTicketHistoryData);
router.get('/billByID/:id', (req, res, next) => { req.limit = 1; next();}, getTicketHistoryDataByIdUser);

router.post('/service', addService);
router.get('/service', getAllServiceCategories);

router.post('/ticket', addTicket);
router.get('/ticket', getAllTicketCategories);

router.get('/statistical', getRevenueStatistics);
router.get('/chart', getRevenueByMonth);
router.get('/billTenLast', (req, res, next) => { req.limit = 10; next();}, getTicketHistoryDataByIdUser);

router.get('/pageTicket/:page', getTicketListByDate);
router.get('/pageTicketExpired/:page', getTicketListByDate2);

module.exports = router;

// ... Cấu hình và khởi động máy chủ Express
