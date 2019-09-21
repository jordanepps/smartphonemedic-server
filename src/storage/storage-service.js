const xss = require('xss');

const StorageService = {
  getAll(db) {
    return db('storage').select('*');
  },
  getById(db, id) {
    return db('storage')
      .where({ id })
      .first();
  },
  hasStorage(db, storage_size) {
    return db('storage')
      .where({ storage_size })
      .first();
  },
  update(db, id, storage_size) {
    return db('storage')
      .where({ id })
      .update(storage_size);
  },
  deleteStorage(db, id) {
    return db('storage')
      .where({ id })
      .delete();
  },
  insert(db, storage_size) {
    return db('storage')
      .insert(storage_size)
      .returning('*')
      .then(([storage]) => storage);
  },
  serialize(storage) {
    return { id: storage.id, storage_size: xss(storage.storage_size) };
  }
};

module.exports = StorageService;
