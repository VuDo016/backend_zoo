const express = require('express');
const qrcode = require('qrcode');
const router = express.Router();

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

module.exports = router;

// ... Cấu hình và khởi động máy chủ Express
