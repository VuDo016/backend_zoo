const addTicketHistory = async (req, res) => {
  try {
    const { totalQuantity, totalPrice, visitDate, userId } = req.body;

    const sql = `
        INSERT INTO ticket_history (total_quantity, total_price, visit_date, user_id)
        VALUES (?, ?, ?, ?)
      `;

    const values = [totalQuantity, totalPrice, visitDate, userId];

    const [result] = await req.pool.query(sql, values);

    const ticketHistoryId = result.insertId;

    res.json({ success: true, ticketHistoryId });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const updateQRCode = async (req, res) => {
  try {
    const qrCode = req.qrcode;
    const userId = req.body.userId;

    const sql = `
      UPDATE ticket_history
      SET qr_code = ?
      WHERE user_id = ?
    `;

    const values = [qrCode, userId];

    await req.pool.query(sql, values);

    res.json({ success: true });
  } catch (error) {
    throw error;
  }
};

const addService = async (req, res) => {
  try {
    const { ticketHistoryId, serviceCategoryId, quantity } = req.body;

    const sql = `
        INSERT INTO service (ticket_history_id, service_category_id, quantity)
        VALUES (?, ?, ?)
      `;

    const values = [ticketHistoryId, serviceCategoryId, quantity];

    const [result] = await req.pool.query(sql, values);

    const serviceId = result.insertId;

    res.json({ success: true, serviceId });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const addTicket = async (req, res) => {
  try {
    const { quantity, ticketCategoryId, ticketHistoryId } = req.body;

    const sql = `
        INSERT INTO ticket (quantity, ticket_category_id, ticket_history_id)
        VALUES (?, ?, ?)
      `;

    const values = [quantity, ticketCategoryId, ticketHistoryId];

    const [result] = await req.pool.query(sql, values);

    const ticketId = result.insertId;

    res.json({ success: true, ticketId });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

/////////////////////////

const getTicketHistoryData = async (req, res) => {
  try {
    // Lấy thông tin của bill mới nhất
    const latestBillQuery = `
      SELECT *
      FROM ticket_history
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const [latestBillResult] = await req.pool.query(latestBillQuery);
    const latestBill = latestBillResult[0];

    if (!latestBill) {
      return res.status(404).json({ error: 'No bill found' });
    }

    // Lấy thông tin vé từ bảng ticket
    const ticketQuery = `
      SELECT t.quantity, sc.ticket_type
      FROM ticket t
      INNER JOIN ticket_category sc ON t.ticket_category_id = sc.id
      WHERE t.ticket_history_id = ?
    `;
    const [ticketResult] = await req.pool.query(ticketQuery, [latestBill.id]);
    const tickets = ticketResult;

    // Lấy thông tin dịch vụ từ bảng service
    const serviceQuery = `
      SELECT s.quantity, sc.name
      FROM service s
      INNER JOIN service_category sc ON s.service_category_id = sc.id
      WHERE s.ticket_history_id = ?
    `;
    const [serviceResult] = await req.pool.query(serviceQuery, [latestBill.id]);
    const services = serviceResult;

    res.json({ success: true, latestBill, tickets, services });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

////////////////////////

const getAllTicketCategories = async (req, res) => {
  try {
    const sql = 'SELECT * FROM ticket_category';
    const [rows] = await req.pool.query(sql);
    const result = { ticketCategories: rows };
    res.json(result);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const getAllServiceCategories = async (req, res) => {
  try {
    const [vehicleRows] = await req.pool.query('SELECT * FROM service_category WHERE type = 1');
    const [boatingRows] = await req.pool.query('SELECT * FROM service_category WHERE type = 2');
    const [tentRows] = await req.pool.query('SELECT * FROM service_category WHERE type = 3');
    const result = { vehicleTickets: vehicleRows, boatingTickets: boatingRows, tentRentals: tentRows };
    res.json(result);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

module.exports = {
  addTicket, addService, addTicketHistory,
  getTicketHistoryData, getAllTicketCategories,
  getAllServiceCategories, updateQRCode
};
