
const express = require('express');
const router = express.Router();
const pool = require('../db'); 
router.get('/', async (req, res) => {
  const { resource_id, date } = req.query;

  if (!resource_id || !date) {
    return res.status(400).json({ message: 'resource_id и date обязательны' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT start_datetime, end_datetime FROM bookings
       WHERE resource_id = ? AND DATE(start_datetime) = ?`,
      [resource_id, date]
    );

    res.json(rows);
  } catch (err) {
    console.error('Ошибка при получении расписания:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
