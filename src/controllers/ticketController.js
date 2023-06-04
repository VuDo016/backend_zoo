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

const getTicketHistoryDataByIdUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = req.limit;

    let bills = []
    if (limit === 1) {
      // Lấy thông tin tất cả các bill
      const billQuery = `
              SELECT *
              FROM ticket_history
              WHERE user_id = ?
              ORDER BY created_at DESC
            `;
      const [billResult] = await req.pool.query(billQuery, userId);
      bills = billResult;
    }
    else {
      // Lấy thông tin tất cả các bill
      const billQuery = `
            SELECT *
            FROM ticket_history
            ORDER BY created_at DESC
            LIMIT 10
            `;
      const [billResult] = await req.pool.query(billQuery);
      bills = billResult;
    }

    if (!bills || bills.length === 0) {
      return res.status(404).json({ error: 'No bills found' });
    }

    // Lấy thông tin vé từ bảng ticket cho từng bill
    const ticketsQuery = `
      SELECT t.quantity, sc.ticket_type
      FROM ticket t
      INNER JOIN ticket_category sc ON t.ticket_category_id = sc.id
      WHERE t.ticket_history_id = ?
    `;

    // Lấy thông tin dịch vụ từ bảng service cho từng bill
    const servicesQuery = `
      SELECT s.quantity, sc.name
      FROM service s
      INNER JOIN service_category sc ON s.service_category_id = sc.id
      WHERE s.ticket_history_id = ?
    `;

    // Lấy thông tin dịch vụ từ bảng service cho từng bill
    const employerQuery = `
      SELECT avatar_url, first_name, name
      FROM employer
      WHERE id = ?
    `;

    const billData = await Promise.all(
      bills.map(async (bill) => {
        const [ticketResult] = await req.pool.query(ticketsQuery, [bill.id]);
        const tickets = ticketResult;

        const [serviceResult] = await req.pool.query(servicesQuery, [bill.id]);
        const services = serviceResult;

        let employer = []

        if (limit === 10) {
          const [employerResult] = await req.pool.query(employerQuery, [bill.user_id]);
          employer = employerResult;
        }

        return {
          bill,
          tickets,
          services,
          employer
        };
      })
    );

    res.json({ success: true, bills: billData });
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

const getRevenueStatistics = async (req, res) => {
  try {
    // Lấy số lượng khách hàng đăng ký trong tháng này
    const currentMonthCustomersQuery = `
        SELECT COUNT(*) AS customerCount
        FROM employer
        WHERE role = 'USER'
          AND YEAR(created_at) = YEAR(CURRENT_DATE())
          AND MONTH(created_at) = MONTH(CURRENT_DATE())
      `;
    const [currentMonthCustomersResult] = await req.pool.query(currentMonthCustomersQuery);
    const currentMonthCustomerCount = currentMonthCustomersResult[0].customerCount;

    // Lấy số lượng khách hàng đăng ký trong tháng trước
    const previousMonthCustomersQuery = `
        SELECT COUNT(*) AS customerCount
        FROM employer
        WHERE role = 'USER'
          AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
          AND MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      `;
    const [previousMonthCustomersResult] = await req.pool.query(previousMonthCustomersQuery);
    const previousMonthCustomerCount = previousMonthCustomersResult[0].customerCount;

    // Tính phần trăm tăng/giảm khách hàng so với tháng trước
    const customerVolatility = Math.round(((currentMonthCustomerCount - previousMonthCustomerCount) / previousMonthCustomerCount) * 100);

    // Lấy tổng doanh thu trong tháng này
    const currentMonthRevenueQuery = `
        SELECT SUM(total_price) AS totalRevenue
        FROM ticket_history
        WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
          AND MONTH(created_at) = MONTH(CURRENT_DATE())
      `;
    const [currentMonthRevenueResult] = await req.pool.query(currentMonthRevenueQuery);
    const currentMonthTotalRevenue = currentMonthRevenueResult[0].totalRevenue;

    // Lấy tổng doanh thu trong tháng trước
    const previousMonthRevenueQuery = `
        SELECT SUM(total_price) AS totalRevenue
        FROM ticket_history
        WHERE YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
          AND MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      `;
    const [previousMonthRevenueResult] = await req.pool.query(previousMonthRevenueQuery);
    const previousMonthTotalRevenue = previousMonthRevenueResult[0].totalRevenue;

    // Tính phần trăm tăng/giảm doanh thu so với tháng trước
    const revenueVolatility = Math.round(((currentMonthTotalRevenue - previousMonthTotalRevenue) / previousMonthTotalRevenue) * 100);

    // Lấy số lượng hóa đơn trong tháng này
    const currentMonthBillCountQuery = `
        SELECT COUNT(*) AS billCount
        FROM ticket_history
        WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
          AND MONTH(created_at) = MONTH(CURRENT_DATE())
      `;
    const [currentMonthBillCountResult] = await req.pool.query(currentMonthBillCountQuery);
    const currentMonthBillCount = currentMonthBillCountResult[0].billCount;

    // Lấy số lượng hóa đơn trong tháng trước
    const previousMonthBillCountQuery = `
        SELECT COUNT(*) AS billCount
        FROM ticket_history
        WHERE YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
          AND MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
      `;
    const [previousMonthBillCountResult] = await req.pool.query(previousMonthBillCountQuery);
    const previousMonthBillCount = previousMonthBillCountResult[0].billCount;

    // Tính phần trăm tăng/giảm hóa đơn so với tháng trước
    const billVolatility = Math.round(((currentMonthBillCount - previousMonthBillCount) / previousMonthBillCount) * 100);

    // Lấy số lượng vé trong tháng này
    const currentMonthTicketCountQuery = `
        SELECT SUM(quantity) AS ticketCount
        FROM ticket
        WHERE ticket_history_id IN (
          SELECT id
          FROM ticket_history
          WHERE YEAR(created_at) = YEAR(CURRENT_DATE())
            AND MONTH(created_at) = MONTH(CURRENT_DATE())
        )
      `;
    const [currentMonthTicketCountResult] = await req.pool.query(currentMonthTicketCountQuery);
    const currentMonthTicketCount = currentMonthTicketCountResult[0].ticketCount;

    // Lấy số lượng vé trong tháng trước
    const previousMonthTicketCountQuery = `
        SELECT SUM(quantity) AS ticketCount
        FROM ticket
        WHERE ticket_history_id IN (
          SELECT id
          FROM ticket_history
          WHERE YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
            AND MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
        )
      `;
    const [previousMonthTicketCountResult] = await req.pool.query(previousMonthTicketCountQuery);
    const previousMonthTicketCount = previousMonthTicketCountResult[0].ticketCount;

    // Tính phần trăm tăng/giảm vé so với tháng trước
    const ticketVolatility = Math.round(((currentMonthTicketCount - previousMonthTicketCount) / previousMonthTicketCount) * 100);

    // Gửi kết quả về client
    res.json({
      customerCount: currentMonthCustomerCount,
      customerVolatility,
      totalRevenue: currentMonthTotalRevenue,
      revenueVolatility,
      billCount: currentMonthBillCount,
      billVolatility,
      ticketCount: currentMonthTicketCount,
      ticketVolatility,
    });
  } catch (error) {
    console.error('Error retrieving statistics:', error);
    res.status(500).json({ error: 'An error occurred while retrieving statistics' });
  }
};

const getRevenueByMonth = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const query = `
      SELECT MONTH(created_at) AS month, SUM(total_price) AS revenue
      FROM ticket_history
      WHERE YEAR(created_at) = ?
      GROUP BY MONTH(created_at)
      ORDER BY MONTH(created_at)
    `;
    const [results] = await req.pool.query(query, [currentYear]);

    const revenueByMonth = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      revenue: 0
    }));

    results.forEach((row) => {
      const monthIndex = row.month - 1;
      revenueByMonth[monthIndex].revenue = row.revenue;
    });

    const revenueData = revenueByMonth.map((item) => item.revenue);

    res.json(revenueData);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const getTicketListByDate = async (req, res) => {
  try {
    const page = req.params.page;
    const itemsPerPage = 1; // Số hoá đơn trên mỗi trang

    // Lấy ngày hiện tại
    const currentDate = new Date().toISOString().split('T')[0];

    // Lấy danh sách các ngày tham quan từ ngày hiện tại trở đi
    const distinctDatesQuery = `
      SELECT DISTINCT DATE(visit_date) AS visit_date_group
      FROM ticket_history
      WHERE DATE(visit_date) >= ?
      ORDER BY visit_date_group ASC
    `;
    const [distinctDatesResult] = await req.pool.query(distinctDatesQuery, [currentDate]);
    const distinctDates = distinctDatesResult.map((row) => row.visit_date_group);

    // Tính toán vị trí bắt đầu lấy hoá đơn trên trang hiện tại
    const offset = (page - 1) * itemsPerPage;
    const currentPageDate = distinctDates[offset];

    // Chuyển đổi ngày thành đúng định dạng
    const formattedDate = new Date(currentPageDate).toISOString().split('T')[0];

    // Lấy danh sách hoá đơn cho ngày hiện tại
    const historyQuery = `
      SELECT *
      FROM ticket_history
      WHERE DATE(visit_date) = ?
      ORDER BY visit_date ASC
    `;
    const [historyResult] = await req.pool.query(historyQuery, [currentPageDate]);
    const ticketHistories = historyResult;

    // Lấy thông tin vé từ bảng ticket cho từng bill
    const ticketsQuery = `
      SELECT t.quantity, sc.ticket_type
      FROM ticket t
      INNER JOIN ticket_category sc ON t.ticket_category_id = sc.id
      WHERE t.ticket_history_id = ?
    `;

    // Lấy thông tin dịch vụ từ bảng service cho từng bill
    const servicesQuery = `
      SELECT s.quantity, sc.name
      FROM service s
      INNER JOIN service_category sc ON s.service_category_id = sc.id
      WHERE s.ticket_history_id = ?
    `;

    // Lấy thông tin dịch vụ từ bảng service cho từng bill
    const employerQuery = `
      SELECT avatar_url, first_name, name
      FROM employer
      WHERE id = ?
    `;

    const billData = await Promise.all(
      ticketHistories.map(async (bill) => {
        const [ticketResult] = await req.pool.query(ticketsQuery, [bill.id]);
        const tickets = ticketResult;

        const [serviceResult] = await req.pool.query(servicesQuery, [bill.id]);
        const services = serviceResult;

        const [employerResult] = await req.pool.query(employerQuery, [bill.user_id]);
        const employer = employerResult;

        return {
          bill,
          tickets,
          services,
          employer
        };
      })
    );

    res.json({
      success: true,
      billData,
      visitDate: formattedDate, // Ngày tham quan trang hiện tại
      totalPages: distinctDates.length // Số lượng trang có dữ liệu
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const getTicketListByDate2 = async (req, res) => {
  try {
    const page = req.params.page;
    const itemsPerPage = 10; // Số hoá đơn trên mỗi trang

    // Lấy ngày hiện tại
    const currentDate = new Date().toISOString().split('T')[0];

    // Lấy danh sách các ngày tham quan trước ngày hiện tại
    const distinctDatesQuery = `
      SELECT DISTINCT DATE(visit_date) AS visit_date_group
      FROM ticket_history
      WHERE DATE(visit_date) < ?
      ORDER BY visit_date_group DESC
    `;
    const [distinctDatesResult] = await req.pool.query(distinctDatesQuery, [currentDate]);
    const distinctDates = distinctDatesResult.map((row) => row.visit_date_group);

    // Tính toán vị trí bắt đầu lấy hoá đơn trên trang hiện tại
    const offset = (page - 1) * itemsPerPage;
    const currentPageDate = distinctDates[offset];

    // Chuyển đổi ngày thành đúng định dạng
    const formattedDate = new Date(currentPageDate).toISOString().split('T')[0];

    // Lấy danh sách hoá đơn đã qua ngày tham quan
    const historyQuery = `
      SELECT *
      FROM ticket_history
      WHERE DATE(visit_date) <= ?
      ORDER BY visit_date ASC
      LIMIT ?
    `;
    const [historyResult] = await req.pool.query(historyQuery, [currentPageDate, itemsPerPage]);
    const ticketHistories = historyResult;

    // Lấy thông tin vé từ bảng ticket cho từng bill
    const ticketsQuery = `
      SELECT t.quantity, sc.ticket_type
      FROM ticket t
      INNER JOIN ticket_category sc ON t.ticket_category_id = sc.id
      WHERE t.ticket_history_id = ?
    `;

    // Lấy thông tin dịch vụ từ bảng service cho từng bill
    const servicesQuery = `
      SELECT s.quantity, sc.name
      FROM service s
      INNER JOIN service_category sc ON s.service_category_id = sc.id
      WHERE s.ticket_history_id = ?
    `;

    // Lấy thông tin dịch vụ từ bảng service cho từng bill
    const employerQuery = `
      SELECT avatar_url, first_name, name
      FROM employer
      WHERE id = ?
    `;

    const billData = await Promise.all(
      ticketHistories.map(async (bill) => {
        const [ticketResult] = await req.pool.query(ticketsQuery, [bill.id]);
        const tickets = ticketResult;

        const [serviceResult] = await req.pool.query(servicesQuery, [bill.id]);
        const services = serviceResult;

        const [employerResult] = await req.pool.query(employerQuery, [bill.user_id]);
        const employer = employerResult;

        return {
          bill,
          tickets,
          services,
          employer
        };
      })
    );

    res.json({
      success: true,
      billData,
      visitDate: formattedDate, // Ngày tham quan trang hiện tại
      totalPages: Math.ceil(distinctDates.length / itemsPerPage) // Số lượng trang có dữ liệu
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

module.exports = {
  addTicket, addService, addTicketHistory,
  getTicketHistoryData, getAllTicketCategories,
  getAllServiceCategories, updateQRCode, getTicketHistoryDataByIdUser,
  getRevenueStatistics, getRevenueByMonth, getTicketListByDate, getTicketListByDate2
};
