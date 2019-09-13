const express = require('express');
const path = require('path');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter.post('/', jsonBodyParser, (req, res, next) => {
  const { email, password } = req.body;
  const newUserData = { email, password };

  for (const [key, value] of Object.entries(newUserData))
    if (value == null)
      return res
        .status(400)
        .json({ error: `Missing '${key}' in request body` });
});

module.exports = usersRouter;
