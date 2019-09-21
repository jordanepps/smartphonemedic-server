const xss = require('xss');

const CarrierService = {
  getAll(db) {
    return db('carrier').select('*');
  },
  getById(db, id) {
    return db('carrier')
      .where({ id })
      .first();
  },
  hasCarrier(db, carrier_name) {
    return db('carrier')
      .where({ carrier_name })
      .first();
  },
  update(db, id, carrier_name) {
    return db('carrier')
      .where({ id })
      .update(carrier_name);
  },
  deleteCarrier(db, id) {
    return db('carrier')
      .where({ id })
      .delete();
  },
  insert(db, carrier_name) {
    return db('carrier')
      .insert(carrier_name)
      .returning('*')
      .then(([carrier]) => carrier);
  },
  serialize(carrier) {
    return { id: carrier.id, carrier_name: xss(carrier.carrier_name) };
  }
};

module.exports = CarrierService;
