const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('device color endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  const colorUrl = '/api/device-color';

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

  describe('/api/device-color', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    // beforeEach('insert makes', () => helpers.seedMakes(db, testMakes));

    context('GET', () => {
      it(`responds 401 when unauthorized user makes get request`, () => {
        return supertest(app)
          .get(colorUrl)
          .expect(401);
      });

      it('responds with 200 and colors', () => {
        return supertest(app)
          .get(colorUrl)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200);
      });
    });
  });
});
