const express = require('express');
const path = require('path');
const ColorService = require('./color-service');
const { requireAuth } = require('../middleware/jwt-auth');

const colorRouter = express.Router();
const jsonBodyParser = express.json();

const {
  getAll,
  hasColor,
  insert,
  getById,
  update,
  deleteColor,
  serialize
} = ColorService;

function checkIfColorExists(req, res, next) {
  getById(req.app.get('db'), req.params.color_id).then(color => {
    if (!color) return res.status(404).json({ error: 'Color does not exist' });
    res.color = color;

    next();
  });
}

colorRouter
  .route('/')
  .all(requireAuth, jsonBodyParser)
  .get((req, res, next) => {
    getAll(req.app.get('db'))
      .then(colors => res.json(colors.map(serialize)))
      .catch(next);
  })
  .post((req, res, next) => {
    const { color_name } = req.body;

    if (!color_name)
      return res
        .status(400)
        .json({ error: `Missing 'color_name' in request body` });

    hasColor(req.app.get('db'), color_name).then(dbColor => {
      if (dbColor)
        return res
          .status(400)
          .json({ error: `'${color_name}' already exists` });

      insert(req.app.get('db'), { color_name })
        .then(color =>
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${color.id}`))
            .json(serialize(color))
        )
        .catch(next);
    });
  });

colorRouter
  .route('/:color_id')
  .all(requireAuth, checkIfColorExists, jsonBodyParser)
  .get((req, res, next) => res.json(serialize(res.color)))
  .patch((req, res, next) => {
    const { color_name } = req.body;

    if (!color_name)
      return res
        .status(400)
        .json({ error: `Missing 'color_name' in request body` });

    hasColor(req.app.get('db'), color_name).then(dbColor => {
      if (dbColor)
        return res.status(400).json({ error: `'${color_name}' already taken` });
    });

    update(req.app.get('db'), req.params.color_id, { color_name })
      .then(numRowsAffected => res.status(204).end())
      .catch(next);
  })
  .delete((req, res, next) => {
    deleteColor(req.app.get('db'), req.params.color_id)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = colorRouter;
