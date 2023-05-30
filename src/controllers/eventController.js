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

const getEventsByDate = async (req, res) => {
  try {
    const date = req.params.date; // Lấy tham số date từ yêu cầu (vd: /events?date=2023-05-26)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sql = `
        SELECT *
        FROM event_zoo
        WHERE start_time <= ? AND end_time >= ?
      `;
    const [rows] = await req.pool.query(sql, [endOfDay, startOfDay]);
    const result = { events: rows }
    res.json(result);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

module.exports = { getAllEvents, getEventsByDate };
