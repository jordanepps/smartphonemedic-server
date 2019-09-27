const express = require('express');
const path = require('path');
const ModelService = require('./model-service');
const { requireAuth } = require('../middleware/jwt-auth');

const modelRouter = express.Router();
const jsonBodyParser = express.json();

modelRouter
  .route('/')
  .all(requireAuth, jsonBodyParser)
  .get()
  .post((req, res, next) => {
    const { model_name } = req.body;
  });

module.exports = modelRouter;
