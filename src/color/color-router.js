const express = require('express');
const path = require('path');
const ColorService = require('./color-service');
const { requireAuth } = require('../middleware/jwt-auth');

const colorRouter = express.Router();
const jsonBodyParser = express.json();

const { getAll, hasColor, insert, serialize } = ColorService;

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

module.exports = colorRouter;
