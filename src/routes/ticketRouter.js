const express = require('express');
const qrcode = require('qrcode');
const router = express.Router();
const { addService, addTicketHistory, addTicket, getTicketHistoryData } = require('../controllers/ticketController');

router.post('/generate-qr-code', (req, res) => {
  const paymentData = req.body.paymentData; // Lấy thông tin thanh toán từ yêu cầu của khách hàng

  // Tạo mã QR code từ thông tin thanh toán
  qrcode.toDataURL(paymentData, { errorCorrectionLevel: 'M' }, (err, url) => {
    if (err) {
      // Xử lý lỗi nếu có
      res.status(500).json({ error: 'Failed to generate QR code' });
    } else {
      // Trả về mã QR code dưới dạng URL cho khách hàng
      res.json({ qrCode: url });
    }
  });
});

//Lay created_date theo mui gio VN
// SELECT id, CONVERT_TZ(created_at, '+00:00', '+07:00') AS created_at_hanoi
// FROM ticket_history;


router.post('/bill', addTicketHistory);
router.get('/bill', getTicketHistoryData);

router.post('/service', addService);

router.post('/ticket', addTicket);



module.exports = router;

// ... Cấu hình và khởi động máy chủ Express
