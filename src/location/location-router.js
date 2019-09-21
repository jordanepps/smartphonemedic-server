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
      return res.status(404).json({ error: 'Location does not exist' });
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
  .post((req, res, next) => {
    const { location_name } = req.body;

    if (!location_name)
      return res
        .status(400)
        .json({ error: `Missing 'location_name' in request body` });

    hasLocation(req.app.get('db'), location_name).then(dbLocation => {
      if (dbLocation)
        return res
          .status(400)
          .json({ error: `'${location_name}' already exists` });

      insert(req.app.get('db'), { location_name })
        .then(location =>
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${location.id}`))
            .json(serialize(location))
        )
        .catch(next);
    });
  });

locationRouter
  .route('/:location_id')
  .all(requireAuth, checkIfLocationExists, jsonBodyParser)
  .get((req, res, next) => res.json(serialize(res.location)))
  .patch((req, res, next) => {
    const { location_name } = req.body;

    if (!location_name)
      return res
        .status(400)
        .json({ error: `Missing 'location_name' in request body` });

    hasLocation(req.app.get('db'), location_name).then(dbLocation => {
      if (dbLocation)
        return res
          .status(400)
          .json({ error: `'${location_name}' already taken` });

      update(req.app.get('db'), req.params.location_id, { location_name })
        .then(numRowsAffected => res.status(204).end())
        .catch(next);
    });
  })
  .delete((req, res, next) =>
    deleteLocation(req.app.get('db'), req.params.location_id)
      .then(() => res.status(204).end())
      .catch(next)
  );

module.exports = locationRouter;
