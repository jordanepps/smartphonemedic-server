const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('device storage endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const testSizes = helpers.makeStorageArray();
  const testSize = testSizes[0];

  const url = '/api/device-storage';

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

  describe('/api/device-storage', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert sizes', () => helpers.seedStorage(db, testSizes));

    context('GET', () => {
      it(`responds 401 when unauthorized user makes get request`, () => {
        return supertest(app)
          .get(url)
          .expect(401);
      });

      it('responds with 200 and sizes', () => {
        return supertest(app)
          .get(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testSizes);
      });
    });

    context.only('POST', () => {
      it('responds 401 when unauthorized post attempt is made', () => {
        return supertest(app)
          .post(url)
          .send(testSize)
          .expect(401);
      });

      it(`responds 400 when 'storage_size' is missing`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: `Missing 'storage_size' in request body` });
      });

      it(`responds 400 when 'storage_size' already exists`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(testSize)
          .expect(400, { error: `'${testSize.storage_size}' already exists` });
      });

      it(`responds 201 when 'storage_size' is added`, () => {
        const validSize = { id: 4, storage_size: '128' };

        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(validSize)
          .expect(201, validSize);
      });
    });
  });
});
