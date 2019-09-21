const xss = require('xss');

const LocationService = {
  getAll(db) {
    return db('location').select('*');
  },
  getById(db, id) {
    return db('location')
      .where({ id })
      .first();
  },
  hasLocation(db, location_name) {
    return db('location')
      .where({ location_name })
      .first();
  },
  update(db, id, location_name) {
    return db('location')
      .where({ id })
      .update(location_name);
  },
  deleteLocation(db, id) {
    return db('location')
      .where({ id })
      .delete();
  },
  insert(db, location_name) {
    return db('location')
      .insert(location_name)
      .returning('*')
      .then(([location]) => location);
  },
  serialize(location) {
    return { id: location.id, location_name: xss(location.location_name) };
  }
};

module.exports = LocationService;
