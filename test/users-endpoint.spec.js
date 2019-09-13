const knex = require('knex');
// const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const allowedUsers = helpers.makeAllowedUsersArray();
  //   const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/users', () => {
    context('User validation', () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
      beforeEach('insert allowed', () => helpers.seedAllowed(db, allowedUsers));

      const requiredFields = ['email', 'password'];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          email: 'test@email.com',
          password: 'test password'
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });

      it(`responds 400 'Password be longer than 8 characters' when empty password`, () => {
        const userShortPassword = {
          email: 'test@email.com',
          password: '1234567'
        };
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, { error: `Password be longer than 8 characters` });
      });

      it(`responds 400 'Password be less than 72 characters' when long password`, () => {
        const userLongPassword = {
          email: 'test@email.com',
          password: '*'.repeat(73)
        };

        return supertest(app)
          .post('/api/users')
          .send(userLongPassword)
          .expect(400, { error: `Password be less than 72 characters` });
      });

      it(`responds 400 error when password starts with spaces`, () => {
        const userPasswordStartsSpaces = {
          email: 'test@email.com',
          password: ' 1Aa!2Bb@'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsSpaces)
          .expect(400, {
            error: `Password must not start or end with empty spaces`
          });
      });

      it(`responds 400 error when password ends with spaces`, () => {
        const userPasswordEndsSpaces = {
          email: 'test@email.com',
          password: '1Aa!2Bb@ '
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpaces)
          .expect(400, {
            error: `Password must not start or end with empty spaces`
          });
      });

      it(`responds 400 error when password isn't complex enough`, () => {
        const userPasswordNotComplex = {
          email: 'test@email.com',
          password: '11AAaabb'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordNotComplex)
          .expect(400, {
            error: `Password must contain 1 upper case, lower case, number and special character`
          });
      });

      it(`responds 400 error when user email isn't allowed to register`, () => {
        const notAllowedUser = {
          email: 'notAllowed@email.com',
          //   email: 'allowed@email.com',
          password: '1Aa!2Bb@'
        };
        return supertest(app)
          .post('/api/users')
          .send(notAllowedUser)
          .expect(400, { error: `Email provided is not allowed to register` });
      });
    });
  });
});
