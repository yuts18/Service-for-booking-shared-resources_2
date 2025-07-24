const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM resources');
  res.json(rows);
});


router.post('/', async (req, res) => {
  const { name, description, manager_user_id } = req.body;
  await db.query('INSERT INTO resources (name, description, manager_user_id) VALUES (?, ?, ?)', [name, description, manager_user_id]);
  res.status(201).json({ message: 'Resource created' });
});


router.put('/:id', async (req, res) => {
  const { name, description, manager_user_id } = req.body;
  await db.query('UPDATE resources SET name = ?, description = ?, manager_user_id = ? WHERE id = ?', [name, description, manager_user_id, req.params.id]);
  res.json({ message: 'Resource updated' });
});


router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM resources WHERE id = ?', [req.params.id]);
  res.json({ message: 'Resource deleted' });
});

module.exports = router;
