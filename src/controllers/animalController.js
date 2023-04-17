const getAllAnimal = async (req, res) => {
  try {
    const sql = `
      SELECT animal.*, CONCAT('[', GROUP_CONCAT(CAST(CONCAT('"' , list_image.url, '"') AS CHAR)), ']') AS images
      FROM animal
      LEFT JOIN list_image ON animal.id = list_image.animal_id
      GROUP BY animal.id
    `;
    const [rows] = await req.pool.query(sql);
    rows.forEach(row => {
      row.images = JSON.parse(row.images);
    });
    const result = { animal: rows }
    res.json(result);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

module.exports = { getAllAnimal };