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

const getTicketHistoryData = async (req, res) => {
    try {
      const sql = `
        SELECT 
          th.id AS ticket_history_id,
          th.total_price,
          th.total_quantity,
          th.visit_date,
          th.created_at AS create_date,
          e.name AS customer_name,
          tc.ticket_type,
          tc.price AS ticket_price,
          t.quantity AS ticket_quantity,
          sc.name AS service_name,
          sc.price AS service_price,
          sc.number_seats,
          s.quantity AS service_quantity
        FROM ticket_history th
        INNER JOIN employer e ON th.user_id = e.id
        LEFT JOIN ticket t ON th.id = t.ticket_history_id
        LEFT JOIN ticket_category tc ON t.ticket_category_id = tc.id
        LEFT JOIN service s ON th.id = s.ticket_history_id
        LEFT JOIN service_category sc ON s.service_category_id = sc.id
        WHERE th.id = 2
      `;
      const [rows] = await req.pool.query(sql);
      console.log(rows);
  
      // Extract ticket information
      const tickets = [];
      rows.forEach((row) => {
        const ticket = {
          ticket_type: row.ticket_type,
          ticket_price: row.ticket_price,
          ticket_quantity: row.ticket_quantity,
        };
        tickets.push(ticket);
      });
  
      // Extract service information
      const services = [];
      rows.forEach((row) => {
        const service = {
          service_name: row.service_name,
          service_price: row.service_price,
          number_seats: row.number_seats,
          service_quantity: row.service_quantity,
        };
        services.push(service);
      });
  
      // Construct the final data object
      const data = {
        ticket_history_id: rows[0].ticket_history_id,
        total_price: rows[0].total_price,
        total_quantity: rows[0].total_quantity,
        visit_date: rows[0].visit_date,
        create_date: rows[0].create_date,
        customer_name: rows[0].customer_name,
        tickets: tickets,
        service: services,
      };
  
      res.json({ data });
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

module.exports = { addTicket, addService, addTicketHistory, 
  getTicketHistoryData, getAllTicketCategories, getAllServiceCategories };
