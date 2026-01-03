const express = require('express');
const cors = require('cors');
const { connectDB } = require('./core/database/mongo');
const routes = require('./routes');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "https://coofix-admin.vercel.app/", "http://localhost:3001", "https://coofix-admin-dashboard.netlify.app/", "https://coofix-admin-dashboard.netlify.app", "http://localhost:5173", "http://localhost:8080"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(cookieParser());
app.use(express.json());

connectDB();

app.use('/api', routes);

module.exports = app;
