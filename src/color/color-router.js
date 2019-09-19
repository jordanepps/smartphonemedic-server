const express = require('express');
const path = require('path');
const ColorService = require('./color-service');
const { requireAuth } = require('../middleware/jwt-auth');

const colorRouter = express.Router();
const jsonBodyParser = express.json();

colorRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {});

module.exports = colorRouter;
