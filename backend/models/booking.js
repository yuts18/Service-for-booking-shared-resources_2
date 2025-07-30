//models//booking.js
const pool = require('../db');

async function deleteBooking(id, userId, role) {
  const [rows] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id]);
  const booking = rows[0];
  if (!booking) return false;
  if (role !== 'admin' && booking.user_id !== userId) return false;
  console.log('SQL:', sql);
  console.log('Params:', params);
  await pool.execute('DELETE FROM bookings WHERE id = ?', [id]);
  return true;
  
}async function updateBooking(bookingId, data, user_id, role) {
  // Пример простого запроса:
  const sql = `
    UPDATE bookings SET
      start_datetime = ?,
      end_datetime = ?
    WHERE id = ?;
  `;
  const params = [data.start_datetime, data.end_datetime, bookingId];

  const [result] = await pool.execute(sql, params);
  return result.affectedRows > 0;

}



module.exports = {
  deleteBooking,
  updateBooking,
};
