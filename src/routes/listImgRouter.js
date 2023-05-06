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

        upImagetoDB(urls, animalId, req, res)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const animalId = req.params.id;

        // Xóa tất cả các ảnh có url tương ứng trên Storage Firebase
        const urls = await deleteImage(animalId, req, res)
        const bucket = admin.storage().bucket();
        await Promise.all(urls.map(url => bucket.file(extractFileNameFromUrl(url)).delete()));

        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;