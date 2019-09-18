const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      email: 'one@email.com',
      password: 'Password1!'
    },
    {
      id: 2,
      email: 'two@email.com',
      password: 'Password1!'
    },
    {
      id: 3,
      email: 'three@email.com',
      password: 'Password1!'
    },
    {
      id: 4,
      email: 'four@email.com',
      password: 'Password1!'
    }
  ];
}

function makeAllowedUsersArray() {
  return [
    {
      id: 1,
      email: 'one@email.com'
    },
    {
      id: 2,
      email: 'two@email.com'
    },
    {
      id: 3,
      email: 'three@email.com'
    },
    {
      id: 4,
      email: 'four@email.com'
    },
    {
      id: 5,
      email: 'allowed@email.com'
    }
  ];
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      users, allowed
      RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db
    .into('users')
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function seedAllowed(db, allowed) {
  const preppedUsers = allowed.map(user => ({
    ...user
  }));
  return db
    .into('allowed')
    .insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(`SELECT setval('allowed_id_seq', ?)`, [
        allowed[allowed.length - 1].id
      ])
    );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256'
  });
  // console.log(token);
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeAllowedUsersArray,
  cleanTables,
  seedUsers,
  makeAuthHeader,
  seedAllowed
};
