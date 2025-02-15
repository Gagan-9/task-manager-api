const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const multer = require('multer');
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

router.post('/', authenticate, upload.single('file'), async (req, res) => {
  const { title, description, deadline } = req.body;
  const filePath = req.file ? req.file.path : null;

  try {
    const newTask = await pool.query(
      'INSERT INTO tasks (user_id, title, description, deadline, attachment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, title, description, deadline, filePath]
    );
    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, async (req, res) => {
  const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [req.userId]);
  res.json(tasks.rows);
});

router.put('/:id', authenticate, async (req, res) => {
  const { status } = req.body;
  await pool.query('UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3', [status, req.params.id, req.userId]);
  res.json({ message: 'Task updated' });
});

router.delete('/:id', authenticate, async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.json({ message: 'Task deleted' });
});

module.exports = router;
