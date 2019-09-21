const express = require('express');
const path = require('path');
const LocationService = require('./location-service');
const { requireAuth } = require('../middleware/jwt-auth');

const locationRouter = express.Router();
const jsonBodyParser = express.json();

const {
  getAll,
  hasLocation,
  insert,
  getById,
  update,
  deleteLocation,
  serialize
} = LocationService;

function checkIfLocationExists(req, res, next) {
  getById(req.app.get('db'), req.params.location_id).then(location => {
    if (!location)
      return res.status(404).json({ error: 'Color does not exist' });
    res.location = location;

    next();
  });
}

locationRouter
  .route('/')
  .all(requireAuth, jsonBodyParser)
  .get((req, res, next) =>
    getAll(req.app.get('db'))
      .then(locations => res.json(locations.map(serialize)))
      .catch(next)
  )
  .post();

locationRouter
  .route('/:location_id')
  .all(requireAuth, checkIfLocationExists, jsonBodyParser)
  .get()
  .patch()
  .delete();

module.exports = locationRouter;
