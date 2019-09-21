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

carrierRouter.route('/').all(requireAuth, jsonBodyParser);

carrierRouter
  .route('/:carrier_id')
  .all(requireAuth, checkIfCarrierExists, jsonBodyParser);

module.exports = carrierRouter;
