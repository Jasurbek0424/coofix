const express = require('express');
const cors = require('cors');
const { connectDB } = require('./core/database/mongo');
const routes = require('./routes');

const app = express();

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,PATCH,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));
app.use(express.json());

connectDB();

app.use('/api', routes);

module.exports = app;
