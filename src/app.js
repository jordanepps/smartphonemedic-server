require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const authRouter = require('./auth/auth-router');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

app.use('/api/auth', authRouter);

app.get('/api', (req, res) => {
  res.send('SPM API');
});

app.use(function errorHandler(error, req, res, next) {
  res.status(500).json({ message: error.message, error });
});

module.exports = app;
