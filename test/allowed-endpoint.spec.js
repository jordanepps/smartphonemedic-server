const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('allowed users endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const testAllowedUsers = helpers.makeAllowedUsersArray();
  const testAllowed = testAllowedUsers[4];

  const url = '/api/allowed';

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

  describe('/api/allowed', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert allowed', () =>
      helpers.seedAllowed(db, testAllowedUsers)
    );

    context('GET', () => {
      it(`responds 401 when unauthorized user makes get request`, () => {
        return supertest(app)
          .get(url)
          .expect(401);
      });

      it('responds with 200 and allowed users', () => {
        return supertest(app)
          .get(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testAllowedUsers);
      });
    });
  });
});
