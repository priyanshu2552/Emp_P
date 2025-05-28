const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // ✅ Load env FIRST

const connectDB = require('./config/db');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');


connectDB(); // ✅ Now MONGO_URI is defined

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("helo world");
})
// Auth routes (login for all roles)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', employeeRoutes);

const mongoose = require('mongoose');
const Policy = require('./models/Policy'); // Update path if necessary





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
