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

function makeDeviceMakeArray() {
  return [
    { id: 1, make_name: 'apple' },
    { id: 2, make_name: 'samsung' },
    { id: 3, make_name: 'lg' }
  ];
}

function makeDeviceColorArray() {
  return [
    {
      id: 1,
      color_name: 'space gray'
    },
    {
      id: 2,
      color_name: 'silver'
    },
    {
      id: 3,
      color_name: 'gold'
    }
  ];
}

function makeCarrierArray() {
  return [
    { id: 1, carrier_name: 'verizon' },
    { id: 2, carrier_name: 't-mobile' },
    { id: 3, carrier_name: 'at&t' }
  ];
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      users, allowed, make, color, carrier
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

function seedMakes(db, makes) {
  const preppedMakes = makes.map(make => ({ ...make }));

  return db
    .into('make')
    .insert(preppedMakes)
    .then(() =>
      db.raw(`SELECT setval('make_id_seq', ?)`, [makes[makes.length - 1].id])
    );
}

function seedColors(db, colors) {
  const preppedColors = colors.map(color => ({ ...color }));

  return db
    .into('color')
    .insert(preppedColors)
    .then(() =>
      db.raw(`SELECT setval('color_id_seq', ?)`, [colors[colors.length - 1].id])
    );
}

function seedCarriers(db, carriers) {
  const preppedCarriers = carriers.map(carrier => ({ ...carrier }));

  return db
    .into('carrier')
    .insert(preppedCarriers)
    .then(() =>
      db.raw(`SELECT setval('carrier_id_seq', ?)`, [
        carriers[carriers.length - 1].id
      ])
    );
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: 'HS256'
  });

  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeAllowedUsersArray,
  makeDeviceMakeArray,
  makeDeviceColorArray,
  makeCarrierArray,
  cleanTables,
  seedUsers,
  makeAuthHeader,
  seedAllowed,
  seedMakes,
  seedColors,
  seedCarriers
};
