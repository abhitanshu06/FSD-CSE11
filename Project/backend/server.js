const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api', studentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Student Management API is running.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
