const xss = require('xss');

const AllowedService = {
  getAll(db) {
    return db('allowed').select('*');
  },
  getById(db, id) {
    return db('allowed')
      .where({ id })
      .first();
  },
  hasAllowed(db, email) {
    return db('allowed')
      .where({ email })
      .first();
  },
  insert(db, email) {
    return db('allowed')
      .insert(email)
      .returning('*')
      .then(([email]) => email);
  },
  update(db, id, email) {
    return db('allowed')
      .where({ id })
      .update(email);
  },
  deleteAllowed(db, id) {
    return db('allowed')
      .where({ id })
      .delete();
  },
  serialize(allowed) {
    return { id: allowed.id, email: allowed.email };
  }
};

module.exports = AllowedService;
