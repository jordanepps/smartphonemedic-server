const xss = require('xss');

const ColorService = {
  getAll(db) {
    return db('color').select('*');
  },
  hasColor(db, color_name) {
    return db('color')
      .where({ color_name })
      .first();
  },
  insert(db, color_name) {
    return db('color')
      .insert(color_name)
      .returning('*')
      .then(([color]) => color);
  },
  serialize(color) {
    return { id: color.id, color_name: xss(color.color_name) };
  }
};

module.exports = ColorService;
