///////Animal
const upImagetoDBAnimal = async (urls, animalId, req, res) => {
    try {
        const values = urls.map((url) => [url, animalId]);

        const query = "INSERT INTO list_image (url, animal_id) VALUES ?";

        const [rows] = await req.pool.query(query, [values]);
        if (rows.affectedRows === 0) {
            res.status(500).json({ error: "Something went wrong" });
        }
        else {
            // Trả về các URL đã tải lên thành công
            res.status(200).json({ urls });
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const deleteImageAnimal = async (animalId, req, res) => {
    const query = "SELECT url FROM list_image WHERE animal_id = ?";
    const [rows] = await req.pool.query(query, [animalId]);
    const urls = rows.map(row => row.url);
    // Xóa tất cả dữ liệu liên quan đến animal_id trong bảng list_image
    const query1 = "DELETE FROM list_image WHERE animal_id = ?";
    await req.pool.query(query1, [animalId]);

    return urls
};

///////////Comment
const upImagetoDBFeedback = async (urls, feedbackId, req, res) => {
    try {
        const values = urls.map((url) => [url, feedbackId]);

        const query = "INSERT INTO list_imageRating (url, feedback_id) VALUES ?";

        const [rows] = await req.pool.query(query, [values]);
        if (rows.affectedRows === 0) {
            res.status(500).json({ error: "Something went wrong" });
        }
        else {
            // Trả về các URL đã tải lên thành công
            res.status(200).json({ urls });
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const deleteImageFeedback = async (feedbackId, req, res) => {
    const query = "SELECT url FROM list_imageRating WHERE feedback_id = ?";
    const [rows] = await req.pool.query(query, [feedbackId]);
    const urls = rows.map(row => row.url);
    // Xóa tất cả dữ liệu liên quan đến feedback_id trong bảng list_image
    const query1 = "DELETE FROM list_imageRating WHERE feedback_id = ?";
    await req.pool.query(query1, [feedbackId]);

    return urls;
};

/////////////Info User
const updateUserImageURL = async (urls, userId, req, res) => {
    try {
        const sql = `
        UPDATE employer
        SET avatar_url = ?
        WHERE id = ?
      `;
        const [result] = await req.pool.query(sql, [urls[0], userId]);

        if (result.affectedRows === 0) {
            // Không có user nào được cập nhật
            return res.status(404).json({ error: "user not found" });
        }

        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

/////////////Event
const updateEventImageURL = async (urls, eventId, req, res) => {
    try {
        const sql = `
        UPDATE event_zoo
        SET image_url = ?
        WHERE id = ?
      `;
        const [result] = await req.pool.query(sql, [urls[0], eventId]);

        if (result.affectedRows === 0) {
            // Không có sự kiện nào được cập nhật
            return res.status(404).json({ error: "Event not found" });
        }

        res.json({ success: true });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const extractFileNameFromUrl = (url) => {
    const urlParts = url.split("/");
    const fileNameWithParams = urlParts[urlParts.length - 1];
    const fileName = fileNameWithParams.split("?")[0];
    const decodedFileName = decodeURIComponent(fileName);
    return decodedFileName;
};

module.exports = { upImagetoDBAnimal, deleteImageAnimal, upImagetoDBFeedback, deleteImageFeedback, extractFileNameFromUrl, updateUserImageURL, updateEventImageURL };