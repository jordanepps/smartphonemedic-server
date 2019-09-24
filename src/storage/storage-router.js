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
  .post();

storageRouter
  .route('/:storage_id')
  .all(requireAuth, checkIfStorageExists, jsonBodyParser)
  .get()
  .patch()
  .delete();

module.exports = storageRouter;
