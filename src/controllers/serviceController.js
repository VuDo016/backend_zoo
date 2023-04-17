const getAllTickets = async (req, res) => {
    try {
        const [vehicleRows] = await req.pool.query('SELECT * FROM vehicle_ticket');
        const [boatingRows] = await req.pool.query('SELECT * FROM boating_ticket');
        const [tentRows] = await req.pool.query('SELECT * FROM tent_rental_ticket');
        const result = { vehicleTickets: vehicleRows, boatingTickets: boatingRows, tentRentals: tentRows };
        res.json(result);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

module.exports = { getAllTickets };