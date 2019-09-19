const express = require('express');
const path = require('path');
const ColorService = require('./color-service');
const { requireAuth } = require('../middleware/jwt-auth');

const colorRouter = express.Router();
const jsonBodyParser = express.json();

const { getAll, serialize } = ColorService;

colorRouter
  .route('/')
  .all(requireAuth, jsonBodyParser)
  .get((req, res, next) => {
    getAll(req.app.get('db'))
      .then(colors => res.json(colors.map(serialize)))
      .catch(next);
  });

module.exports = colorRouter;
