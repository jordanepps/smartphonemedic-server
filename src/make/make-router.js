const express = require('express');
const path = require('path');
const MakeService = require('./make-service');
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
} = MakeService;

function checkIfMakeExists(req, res, next) {
  getById(req.app.get('db'), req.params.make_id).then(make => {
    if (!make) return res.status(404).json({ error: 'Make does not exist' });
    res.make = make;

    next();
  });
}

makeRouter
  .route('/')
  .all(requireAuth, jsonBodyParser)
  .get((req, res, next) =>
    getAll(req.app.get('db'))
      .then(makes => res.json(makes.map(serialize)))
      .catch(next)
  )
  .post((req, res, next) => {
    const { make_name } = req.body;

    if (!make_name)
      return res
        .status(400)
        .json({ error: `Missing 'make_name' in request body` });

    hasMake(req.app.get('db'), make_name).then(dbMake => {
      if (dbMake)
        return res.status(400).json({ error: `'${make_name}' already exists` });

      insert(req.app.get('db'), { make_name })
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
  .all(requireAuth, checkIfMakeExists, jsonBodyParser)
  .get((req, res, next) => res.json(serialize(res.make)))
  .patch((req, res, next) => {
    const { make_name } = req.body;
    if (!make_name)
      return res
        .status(400)
        .json({ error: `Missing 'make_name' in request body` });

    hasMake(req.app.get('db'), make_name).then(dbMake => {
      if (dbMake)
        return res.status(400).json({ error: `'${make_name}' already taken` });

      update(req.app.get('db'), req.params.make_id, { make_name })
        .then(numRowsAffected => res.status(204).end())
        .catch(next);
    });
  })
  .delete((req, res, next) =>
    deleteMake(req.app.get('db'), req.params.make_id)
      .then(() => res.status(204).end())
      .catch(next)
  );

module.exports = makeRouter;
