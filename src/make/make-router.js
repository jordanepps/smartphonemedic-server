const express = require('express');
const path = require('path');
const DeviceService = require('./make-service');
const { requireAuth } = require('../middleware/jwt-auth');

const makeRouter = express.Router();
const jsonBodyParser = express.json();

const {
  getAll,
  getById,
  insert,
  update,
  hasMake,
  deleteMake,
  serialize
} = DeviceService.make;

function checkIfMakeExists(req, res, next) {
  const { getById } = DeviceService.make;

  getById(req.app.get('db'), req.params.make_id).then(make => {
    if (!make) return res.status(404).json({ error: 'Make does not exist' });
    res.make = make;

    next();
  });
}

makeRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    // const { getAll, serialize } = DeviceService.make;

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

makeRouter
  .route('/:make_id')
  .all(requireAuth)
  .all(checkIfMakeExists)
  .get((req, res, next) => {
    const { serialize } = DeviceService.make;
    res.json(serialize(res.make));
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { make_name } = req.body;
    if (!make_name)
      return res
        .status(400)
        .json({ error: `Missing 'make_name' in request body` });

    const { hasMake, update } = DeviceService.make;

    hasMake(req.app.get('db'), make_name).then(dbMake => {
      if (dbMake)
        return res.status(400).json({ error: `'${make_name}' already taken` });

      update(req.app.get('db'), req.params.make_id, { make_name })
        .then(numRowsAffected => res.status(204).end())
        .catch(next);
    });
  })
  .delete((req, res, next) => {
    deleteMake(req.app.get('db'), req.params.make_id)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = makeRouter;
