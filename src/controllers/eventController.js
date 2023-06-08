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

const addNewEvent = async (req, res) => {
  try {
    const { name, description_short, description, image_url, location, price, start_time, end_time, longTime } = req.body;

    const insertSql = `
      INSERT INTO event_zoo (name, description_short, description, image_url, location, price, start_time, end_time, longTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [name, description_short, description, image_url, location, price, start_time, end_time, longTime];

    const [result] = await req.pool.query(insertSql, values);

    const newEventId = result.insertId;

    res.json({ id: newEventId });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id, name, description_short, description, image_url, location, price, start_time, end_time, longTime } = req.body;

    const updateSql = `
      UPDATE event_zoo
      SET name = ?, description_short = ?, description = ?, image_url = ?, location = ?, price = ?, start_time = ?, end_time = ?, longTime = ?
      WHERE id = ?
    `;
    const values = [name, description_short, description, image_url, location, price, start_time, end_time, longTime, id];

    await req.pool.query(updateSql, values);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};


module.exports = { getAllEvents, getEventsByDate, addNewEvent, updateEvent };
