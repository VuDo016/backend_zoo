const admin = require("firebase-admin");
const express = require("express");
const router = express.Router();
const multer = require("multer");

const serviceAccount = require("../config/serviceAccountKey.json");
const { upImagetoDBAnimal, deleteImageAnimal, upImagetoDBFeedback, 
    deleteImageFeedback, extractFileNameFromUrl, updateEventImageURL, updateUserImageURL } = require('../controllers/listImgController');
const { verifyToken } = require('../controllers/accountController');

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
// Hàm xử lý tải lên tệp tin
router.post("/:type/:id", verifyToken, upload.array("images"), async (req, res) => {
    try {
        const type = req.params.type;
        const id = req.params.id;

        const files = req.files;
        const storage = admin.storage();
        const bucket = storage.bucket();

        const urls = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            let folderName;

            if (type === "animal") {
                folderName = "animal";
            } else if (type === "feedback") {
                folderName = "feedback";
            } else if (type === "user") {
                folderName = "user";
            } else if (type === "event") {
                folderName = "event";
            } else {
                return res.sendStatus(400); // Bad request
            }

            const fileName = file.originalname.replace(/\s+/g, "_"); // Thay thế khoảng trắng bằng "_"
            const encodedFileName = encodeURIComponent(fileName); // Mã hóa các ký tự không hợp lệ
            const filePath = `${folderName}/${id}/${encodedFileName}`; // Đường dẫn tới thư mục con tương ứng và tên tệp tin

            const response = await bucket.upload(file.path, {
                destination: filePath,
                contentType: file.mimetype,
            });

            const url = await response[0].getSignedUrl({
                action: "read",
                expires: "03-17-2025",
            });
            urls.push(url);
        }

        // Xóa các file trong thư mục "uploads"
        const fs = require("fs");
        const uploadDir = "uploads/";

        let upImagetoDBFunction;
        if (type === "animal") {
            upImagetoDBFunction = upImagetoDBAnimal;
        } else if (type === "feedback") {
            upImagetoDBFunction = upImagetoDBFeedback;
        } else if (type === "user") {
            upImagetoDBFunction = updateUserImageURL;
        } else if (type === "event") {
            upImagetoDBFunction = updateEventImageURL;
        } else {
            return res.sendStatus(400); // Bad request
        }

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
                    upImagetoDBFunction(urls, id, req, res);
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

router.delete('/:type/:id', verifyToken, async (req, res) => {
    try {
        const type = req.params.type;
        const id = req.params.id;

        let deleteImageFunction;
        let folderName;

        if (type === "animal") {
            deleteImageFunction = deleteImageAnimal;
            folderName = "animal";
        } else if (type === "feedback") {
            deleteImageFunction = deleteImageFeedback;
            folderName = "feedback";
        } else {
            return res.sendStatus(400); // Bad request
        }

        // Xóa tất cả các ảnh có url tương ứng trên Storage Firebase
        const urls = await deleteImageFunction(id, req, res)
        const bucket = admin.storage().bucket();

        // Tạo danh sách các đường dẫn đến tệp tin cần xóa
        const filePaths = urls.map(url => {
            const fileName = extractFileNameFromUrl(url);
            return `${folderName}/${id}/${fileName}`;
        });

        // Xóa các tệp tin từ danh sách đường dẫn
        await Promise.all(filePaths.map(filePath => bucket.file(filePath).delete()));

        res.sendStatus(204);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

router.post('/delImgByURL', verifyToken, async (req, res) => {
    try {
        const { type, url, id } = req.body;
        let folderName;

        if (type === "user") {
            folderName = "user";
        } else if (type === "event") {
            folderName = "event";
        } else {
            return res.sendStatus(400); // Bad request
        }

        // Xóa tất cả các ảnh có url tương ứng trên Storage Firebase
        const bucket = admin.storage().bucket();

        // Tạo danh sách các đường dẫn đến tệp tin cần xóa
        const fileName = extractFileNameFromUrl(url);
        const filePath = `${folderName}/${id}/${fileName}`;

        // Xóa các tệp tin từ danh sách đường dẫn
        await bucket.file(filePath).delete();

        res.status(204).json({ message: "Delete img in firebase success!!" });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = router;