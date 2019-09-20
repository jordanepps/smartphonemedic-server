const xss = require('xss');

const AllowedService = {
  getAll(db) {
    return db('allowed').select('*');
  },
  serialize(allowed) {
    return { id: allowed.id, email: allowed.email };
  }
};

module.exports = AllowedService;
