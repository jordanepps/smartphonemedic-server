const express = require('express');
const path = require('path');
const StorageService = require('./storage-service');
const { requireAuth } = require('../middleware/jwt-auth');

const storageRouter = express.Router();
const jsonBodyParser = express.json();

const {
  getAll,
  hasStorage,
  insert,
  getById,
  update,
  deleteStorage,
  serialize
} = StorageService;

function checkIfStorageExists(req, res, next) {
  getById(req.app.get('db'), req.params.storage_id).then(storage => {
    if (!storage)
      return res.status(404).json({ error: 'Storage size does not exist' });
    res.storage = storage;
    next();
  });
}

storageRouter
  .route('/')
  .all(requireAuth, jsonBodyParser)
  .get((req, res, next) => {
    getAll(req.app.get('db'))
      .then(size => res.json(size.map(serialize)))
      .catch(next);
  })
  .post((req, res, next) => {
    const { storage_size } = req.body;

    if (!storage_size)
      return res
        .status(400)
        .json({ error: `Missing 'storage_size' in request body` });

    if (isNaN(storage_size))
      return res
        .status(400)
        .json({ error: `'${storage_size}' is not a number` });

    hasStorage(req.app.get('db'), storage_size).then(dbStorage => {
      if (dbStorage)
        return res
          .status(400)
          .json({ error: `'${storage_size}' already exists` });

      insert(req.app.get('db'), { storage_size })
        .then(size =>
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${size.id}`))
            .json(serialize(size))
        )
        .catch(next);
    });
  });

storageRouter
  .route('/:storage_id')
  .all(requireAuth, checkIfStorageExists, jsonBodyParser)
  .get((req, res, next) => res.json(serialize(res.storage)))
  .patch((req, res, next) => {
    const { storage_size } = req.body;

    if (!storage_size)
      return res
        .status(400)
        .json({ error: `Missing 'storage_size' in request body` });

    if (isNaN(storage_size))
      return res
        .status(400)
        .json({ error: `'${storage_size}' is not a number` });

    hasStorage(req.app.get('db'), storage_size).then(dbStorage => {
      if (dbStorage)
        return res
          .status(400)
          .json({ error: `'${storage_size}' already taken` });
    });

    update(req.app.get('db'), req.params.storage_id, { storage_size })
      .then(numRowsAffected => res.status(204).end())
      .catch(next);
  })
  .delete((req, res, next) => {
    deleteStorage(req.app.get('db'), req.params.storage_id)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = storageRouter;
