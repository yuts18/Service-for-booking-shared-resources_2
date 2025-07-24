const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const pool = require('../db'); 

const SALT_ROUNDS = 10;

async function createUser({ name, email, password, role = 'user' }) {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, password_hash, role]
  );
  return result.insertId;
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
}

async function validatePassword(email, password) {
  const user = await findUserByEmail(email);
  if (!user) return false;
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return false;
  return user;
}

module.exports = {
  createUser,
  findUserByEmail,
  validatePassword,
};
