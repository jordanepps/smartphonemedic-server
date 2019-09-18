const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');

const deviceRouter = express.Router();
const jsonBodyParser = express.json();

deviceRouter
  .route('/make')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    const { make } = req.body;

    if (!make)
      return res.status(400).json({ error: `Missing 'make' in request body` });
  });

module.exports = deviceRouter;
