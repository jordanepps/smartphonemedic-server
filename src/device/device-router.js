const express = require('express');
const path = require('path');
const DeviceService = require('./device-service');
const { requireAuth } = require('../middleware/jwt-auth');

const deviceRouter = express.Router();
const jsonBodyParser = express.json();

deviceRouter
  .route('/make')
  .all(requireAuth)
  .get((req, res, next) => {
    const { getAll, serialize } = DeviceService.make;

    getAll(req.app.get('db'))
      .then(makes => res.json(makes.map(serialize)))
      .catch(next);
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { make_name } = req.body;

    if (!make_name)
      return res
        .status(400)
        .json({ error: `Missing 'make_name' in request body` });

    const { insert, hasMake, serialize } = DeviceService.make;

    hasMake(req.app.get('db'), make_name).then(dbMake => {
      if (dbMake)
        return res.status(400).json({ error: `'${make_name}' already exists` });

      return insert(req.app.get('db'), { make_name })
        .then(make =>
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${make.id}`))
            .json(serialize(make))
        )
        .catch(next);
    });
  });

module.exports = deviceRouter;
