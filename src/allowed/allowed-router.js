const express = require('express');
const path = require('path');
const AllowedService = require('./allowed-service');
const { requireAuth } = require('../middleware/jwt-auth');

const allowedRouter = express.Router();
const jsonBodyParser = express.json();

const { getAll, hasAllowed, insert, serialize } = AllowedService;

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

module.exports = allowedRouter;
