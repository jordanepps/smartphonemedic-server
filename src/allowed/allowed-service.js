const xss = require('xss');

const AllowedService = {
  getAll(db) {
    return db('allowed').select('*');
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
  serialize(allowed) {
    return { id: allowed.id, email: allowed.email };
  }
};

module.exports = AllowedService;
