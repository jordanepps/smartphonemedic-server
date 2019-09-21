const express = require('express');
const path = require('path');
const CarrierService = require('./carrier-service');
const { requireAuth } = require('../middleware/jwt-auth');

const carrierRouter = express.Router();
const jsonBodyParser = express.json();

const {
  getAll,
  getById,
  hasCarrier,
  update,
  deleteCarrier,
  insert,
  serialize
} = CarrierService;

function checkIfCarrierExists(req, res, next) {
  getById(req.app.get('db'), req.params.carrier_id).then(carrier => {
    if (!carrier)
      return res.status(404).json({ error: 'Carrier does not exist' });
    res.carrier = carrier;

    next();
  });
}

carrierRouter
  .route('/')
  .all(requireAuth, jsonBodyParser)
  .get((req, res, next) => {
    getAll(req.app.get('db'))
      .then(carriers => res.json(carriers.map(serialize)))
      .catch(next);
  })
  .post((req, res, next) => {
    const { carrier_name } = req.body;

    if (!carrier_name)
      return res
        .status(400)
        .json({ error: `Missing 'carrier_name' in request body` });

    hasCarrier(req.app.get('db'), carrier_name)
      .then(dbCarrier => {
        if (dbCarrier)
          return res
            .status(400)
            .json({ error: `'${carrier_name}' already exists` });

        insert(req.app.get('db'), { carrier_name }).then(carrier =>
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${carrier.id}`))
            .json(serialize(carrier))
        );
      })
      .catch(next);
  });

carrierRouter
  .route('/:carrier_id')
  .all(requireAuth, checkIfCarrierExists, jsonBodyParser)
  .get((req, res, next) => res.json(serialize(res.carrier)))
  .patch((req, res, next) => {
    const { carrier_name } = req.body;

    if (!carrier_name)
      return res
        .status(400)
        .json({ error: `Missing 'carrier_name' in request body` });

    hasCarrier(req.app.get('db'), carrier_name).then(dbCarrier => {
      if (dbCarrier)
        return res
          .status(400)
          .json({ error: `'${carrier_name}' already taken` });
    });

    update(req.app.get('db'), req.params.carrier_id, { carrier_name })
      .then(numRowsAffected => res.status(204).end())
      .catch(next);
  })
  .delete((req, res, next) => {
    deleteCarrier(req.app.get('db'), req.params.carrier_id)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = carrierRouter;
