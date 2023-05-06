const upImagetoDB = async (urls, animalId, req, res) => {
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

const deleteImage = async (animalId, req, res) => {
    const query = "SELECT url FROM list_image WHERE animal_id = ?";
    const [rows] = await req.pool.query(query, [animalId]);
    const urls = rows.map(row => row.url);
    // Xóa tất cả dữ liệu liên quan đến animal_id trong bảng list_image
    const query1 = "DELETE FROM list_image WHERE animal_id = ?";
    await req.pool.query(query1, [animalId]);

    return urls
};

const extractFileNameFromUrl = (url) => {
    // Hàm trích xuất tên file từ URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];
    const result = fileName.replace(/%/g, " ");

    return result
}

module.exports = { upImagetoDB, deleteImage, extractFileNameFromUrl };