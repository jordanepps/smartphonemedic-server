const DeviceService = {
  getMakeThatExists(db, make_name) {
    return db('make')
      .where({ make_name })
      .first();
  }
};

module.exports = DeviceService;
