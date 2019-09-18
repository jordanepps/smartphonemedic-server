const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('device endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const testMakes = helpers.makeDeviceMakeArray();
  const testMake = testMakes[0];

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

  describe('POST /api/device/...', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert makes', () => helpers.seedMakes(db, testMakes));
    context('make', () => {
      it(`responds 401 when unauthorized user posts 'make_name'`, () => {
        return supertest(app)
          .post('/api/device/make')
          .send(testMake)
          .expect(401);
      });

      it(`responds 400 when required error when 'make_name' is missing`, () => {
        return supertest(app)
          .post('/api/device/make')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: `Missing 'make_name' in request body` });
      });

      it(`'responds 400 when 'make_name' already exists`, () => {
        return supertest(app)
          .post('/api/device/make')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(testMake)
          .expect(400, { error: `'${testMake.make_name}' already exists` });
      });
    });
  });
});
