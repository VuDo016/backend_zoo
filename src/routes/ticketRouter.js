const express = require('express');
const qrcode = require('qrcode');
const router = express.Router();
const { addService, addTicketHistory, addTicket,
  getTicketHistoryData, getAllTicketCategories,
  getAllServiceCategories, updateQRCode } = require('../controllers/ticketController');

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

router.post('/service', addService);
router.get('/service', getAllServiceCategories);

router.post('/ticket', addTicket);
router.get('/ticket', getAllTicketCategories);



module.exports = router;

// ... Cấu hình và khởi động máy chủ Express
