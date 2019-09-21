require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const authRouter = require('./auth/auth-router');
const userRouter = require('./users/users-router');
const makeRouter = require('./make/make-router');
const colorRouter = require('./color/color-router');
const allowedRouter = require('./allowed/allowed-router');
const carrierRouter = require('./carrier/carrier-router');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/carrier', carrierRouter);
app.use('/api/allowed', allowedRouter);
app.use('/api/device-make', makeRouter);
app.use('/api/device-color', colorRouter);

app.get('/api', (req, res) => {
  res.send('SPM API');
});

app.use(function errorHandler(error, req, res, next) {
  console.log('!!!!!', error);
  res.status(500).json({ message: error.message, error });
});

module.exports = app;
