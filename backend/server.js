const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');

connectDB();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Serve static files for uploaded PDFs
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', employeeRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
