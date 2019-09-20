const express = require('express');
const path = require('path');
const AllowedService = require('./allowed-service');
const { requireAuth } = require('../middleware/jwt-auth');

const allowedRouter = express.Router();
const jsonBodyParser = express.json();

const {
  getAll,
  getById,
  hasAllowed,
  insert,
  update,
  deleteAllowed,
  serialize
} = AllowedService;

function checkIfAllowedExists(req, res, next) {
  getById(req.app.get('db'), req.params.allowed_id).then(email => {
    if (!email) return res.status(404).json({ error: 'Email does not exist' });
    res.email = email;

    next();
  });
}

allowedRouter
  .route('/')
  .all(requireAuth, jsonBodyParser)
  .get((req, res, next) => {
    getAll(req.app.get('db')).then(allowed => res.json(allowed.map(serialize)));
  })
  .post((req, res, next) => {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: `Missing 'email' in request body` });

    hasAllowed(req.app.get('db'), email).then(dbEmail => {
      if (dbEmail)
        return res.status(400).json({ error: `'${email}' already added` });

      insert(req.app.get('db'), { email }).then(email =>
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${email.id}`))
          .json(serialize(email))
      );
    });
  });

allowedRouter
  .route('/:allowed_id')
  .all(requireAuth, checkIfAllowedExists, jsonBodyParser)
  .patch((req, res, next) => {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: `Missing 'email' in request body` });

    hasAllowed(req.app.get('db'), email).then(dbEmail => {
      if (dbEmail)
        return res.status(400).json({ error: `'${email}' already added` });
    });

    update(req.app.get('db'), req.params.allowed_id, { email })
      .then(numRowsAffected => res.status(204).end())
      .catch(next);
  })
  .delete((req, res, next) => {
    deleteAllowed(req.app.get('db'), req.params.allowed_id)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = allowedRouter;
