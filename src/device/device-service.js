const xss = require('xss');

const DeviceService = {
  make: {
    insert(db, make_name) {
      return db
        .insert(make_name)
        .into('make')
        .returning('*')
        .then(([make]) => make);
    },
    hasMake(db, make_name) {
      return db('make')
        .where({ make_name })
        .first();
    },
    serialize(make) {
      return { id: make.id, make_name: xss(make.make_name) };
    }
  }
};

module.exports = DeviceService;
