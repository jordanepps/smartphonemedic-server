const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Users Endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

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
    });
  });
});
