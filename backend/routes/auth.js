const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const { google } = require('googleapis');
const { oAuth2Client, getAuthUrl } = require('../googleAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';


router.post(
  '/register',
  body('name').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email уже зарегистрирован' });
      }

      const userId = await userModel.createUser({ name, email, password });
      res.status(201).json({ message: 'Пользователь создан', userId });
    } catch (err) {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
);


router.post(
  '/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await userModel.validatePassword(email, password);
      if (!user) return res.status(401).json({ message: 'Неверные email или пароль' });

      
      const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
      res.json({ token });
    } catch (err) {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
);
router.get('/google', (req, res) => {
  const url = getAuthUrl();
  res.redirect(url);
});
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

 
  req.session.tokens = tokens;

  res.send('Авторизация Google прошла успешно!');
});
module.exports = router;
