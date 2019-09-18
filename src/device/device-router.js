const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');

const deviceRouter = express.Router();
const jsonBodyParser = express.json();

deviceRouter
  .route('/make')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {});

module.exports = deviceRouter;
