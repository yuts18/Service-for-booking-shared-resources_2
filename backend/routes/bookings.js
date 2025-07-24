const express = require('express');
const router = express.Router();
const pool = require('../db');
const transporter = require('../mailer');


function toMySQLDatetime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}


router.post('/', async (req, res) => {
  const { user_id, resource_id, start_datetime, end_datetime } = req.body;

  if (!user_id || !resource_id || !start_datetime || !end_datetime) {
    return res.status(400).json({ message: 'Не все поля заполнены' });
  }
  if (new Date(start_datetime) >= new Date(end_datetime)) {
    return res.status(400).json({ message: 'Время начала должно быть раньше окончания' });
  }

  try {
   
    const [conflict] = await pool.execute(
      `SELECT COUNT(*) AS count FROM bookings
       WHERE resource_id = ?
       AND (
         (start_datetime < ? AND end_datetime > ?)
         OR
         (start_datetime >= ? AND start_datetime < ?)
       )`,
      [resource_id, end_datetime, start_datetime, start_datetime, end_datetime]
    );

    if (conflict[0].count > 0) {
      return res.status(409).json({ message: 'Время уже занято для этого ресурса' });
    }

   
    const [userRows] = await pool.execute(
      `SELECT email, name FROM users WHERE id = ?`, [user_id]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    const user = userRows[0];

  
    const [resourceRows] = await pool.execute(
      `SELECT name FROM resources WHERE id = ?`, [resource_id]
    );
    const resourceName = resourceRows.length > 0 ? resourceRows[0].name : 'Ресурс';

    
    const start_mysql = toMySQLDatetime(new Date(start_datetime));
    const end_mysql = toMySQLDatetime(new Date(end_datetime));

   
    await pool.execute(
      `INSERT INTO bookings (user_id, resource_id, start_datetime, end_datetime)
       VALUES (?, ?, ?, ?)`,
      [user_id, resource_id, start_mysql, end_mysql]
    );

   
    const mailOptions = {
      from: `"Booking Service" <${process.env.MAIL_USER}>`,
      to: user.email,
      subject: 'Подтверждение бронирования',
      text: `Здравствуйте, ${user.name}!\n\nВы успешно забронировали ресурс "${resourceName}" с ${start_mysql} по ${end_mysql}.\n\nСпасибо!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Ошибка отправки email:', error);
      } else {
        console.log('Email отправлен:', info.response);
      }
    });

    res.status(201).json({ message: 'Бронирование успешно создано, уведомление отправлено' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
