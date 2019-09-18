const express = require('express');
const DeviceService = require('./device-service');
const { requireAuth } = require('../middleware/jwt-auth');

const deviceRouter = express.Router();
const jsonBodyParser = express.json();

deviceRouter
  .route('/make')
  .all(requireAuth)
  .post(jsonBodyParser, (req, res, next) => {
    const { make_name } = req.body;

    if (!make_name)
      return res
        .status(400)
        .json({ error: `Missing 'make_name' in request body` });

    DeviceService.getMakeThatExists(req.app.get('db'), make_name).then(
      dbMake => {
        if (dbMake)
          return res
            .status(400)
            .json({ error: `'${make_name}' already exists` });
      }
    );
  });

module.exports = deviceRouter;
