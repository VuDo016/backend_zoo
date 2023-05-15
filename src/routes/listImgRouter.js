const admin = require("firebase-admin");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const serviceAccount = require("../config/serviceAccountKey.json");
const { upImagetoDB, deleteImage, extractFileNameFromUrl } = require('../controllers/listImgController');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://zooticket-87316.appspot.com/"
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});


// Khởi tạo Multer middleware để xử lý các file được gửi lên
const upload = multer({ storage: storage });

// Route để nhận danh sách ảnh
router.post("/:id", upload.array("images"), async (req, res) => {
    try {
        const animalId = req.params.id;

        const files = req.files;
        const storage = admin.storage();
        const bucket = storage.bucket();

        const urls = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const response = await bucket.upload(file.path, {
                contentType: file.mimetype
            });
            const url = await response[0].getSignedUrl({
                action: "read",
                expires: "03-17-2025"
            });
            urls.push(url);
        }

        // Xóa các file trong thư mục "uploads"
        const fs = require("fs");
        const uploadDir = "uploads/";

        fs.readdir(uploadDir, (err, files) => {
            if (err) {
                console.error("Error reading upload directory:", err);
                return res.status(500).json({ error: "Something went wrong" });
            }

            // Lặp qua từng tệp tin
            const deletePromises = files.map((file) => {
                return new Promise((resolve, reject) => {
                    fs.unlink(uploadDir + file, (err) => {
                        if (err) {
                            console.error("Error deleting file:", err);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });

            // Đợi tất cả các promise xóa tệp tin hoàn thành
            Promise.all(deletePromises)
                .then(() => {
                    upImagetoDB(urls, animalId, req, res);
                })
                .catch((error) => {
                    console.error("Error deleting files:", error);
                    res.status(500).json({ error: "Something went wrong" });
                });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;