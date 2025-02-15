require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// ✅ Apply Middleware First
app.use(cors()); // Enable CORS (optional)
app.use(express.json()); // Middleware to parse JSON data

// ✅ Load Routes After Middleware
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes);

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('Task Manager API is running...');
});

// ✅ Use a Default Port if Undefined
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
