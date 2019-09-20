const express = require('express');
const path = require('path');
const AllowedService = require('./allowed-service');
const { requireAuth } = require('../middleware/jwt-auth');

const allowedRouter = express.Router();
const jsonBodyParser = express.json();

const { getAll, serialize } = AllowedService;

allowedRouter
  .route('/')
  .all(requireAuth, jsonBodyParser)
  .get((req, res, next) => {
    getAll(req.app.get('db')).then(allowed => res.json(allowed.map(serialize)));
  });

module.exports = allowedRouter;
