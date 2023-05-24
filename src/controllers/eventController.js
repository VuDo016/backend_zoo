const getAllEvents = async (req, res) => {
    try {
      const sql = `
        SELECT *
        FROM event_zoo
      `;
      const [rows] = await req.pool.query(sql);
      const result = { events: rows }
      res.json(result);
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  };
  
  module.exports = { getAllEvents };  