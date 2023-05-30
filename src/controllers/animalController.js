const getAllAnimal = async (req, res) => {
  try {
    const setSql = 'SET SESSION group_concat_max_len = 10000;';
    await req.pool.query(setSql);

    const selectSql = `
      SELECT animal.*, iucn_status.sign, iucn_status.title, iucn_status.detail, CONCAT('[', GROUP_CONCAT(CAST(CONCAT('"' , list_image.url, '"') AS CHAR)), ']') AS images
      FROM animal
      LEFT JOIN list_image ON animal.id = list_image.animal_id
      LEFT JOIN iucn_status ON animal.iucn_status_id = iucn_status.id
      GROUP BY animal.id
    `;

    const [rows] = await req.pool.query(selectSql);
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

const getAnimalBySpecies = async (req, res) => {
  try {
    const species = req.params.species;
    const sql = `
      SELECT animal.*, iucn_status.sign, iucn_status.title, iucn_status.detail, CONCAT('[', GROUP_CONCAT(CAST(CONCAT('"' , list_image.url, '"') AS CHAR)), ']') AS images
      FROM animal
      LEFT JOIN list_image ON animal.id = list_image.animal_id
      LEFT JOIN iucn_status ON animal.iucn_status_id = iucn_status.id
      WHERE animal.species = ?
      GROUP BY animal.id
    `;
    const [rows] = await req.pool.query(sql, [species]);
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

module.exports = { getAllAnimal, getAnimalBySpecies };