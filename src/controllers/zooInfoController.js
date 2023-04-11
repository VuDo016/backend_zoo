const getZooInfo = async (req, res) => {
    try {
        const [rows] = await req.pool.query('SELECT * FROM zoo_info');
        res.json(rows);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const createZooInfo = async (req, res) => {
    const { opening_hours, contact_info } = req.body;
    console.log(opening_hours);
    if (!opening_hours || !contact_info) {
        res.status(400).json({ error: 'opening_hours and contact_info are required' });
    } else {
        try {
            const [result] = await req.pool.query('INSERT INTO zoo_info (opening_hours, contact_info) VALUES (?, ?)', [opening_hours, contact_info]);
            res.json({ id: result.insertId, opening_hours, contact_info });
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
};

const updateZooInfo = async (req, res) => {
    const id = req.params.id;
    const { opening_hours, contact_info } = req.body;
    if (!opening_hours || !contact_info) {
        res.status(400).json({ error: 'opening_hours and contact_info are required' });
    } else {
        try {
            const [result] = await req.pool.query('UPDATE zoo_info SET opening_hours = ?, contact_info = ? WHERE id = ?', [opening_hours, contact_info, id]);
            if (result.affectedRows === 0) {
                res.sendStatus(404);
            } else {
                res.json({ id, opening_hours, contact_info });
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
};

module.exports = {getZooInfo, createZooInfo, updateZooInfo}
