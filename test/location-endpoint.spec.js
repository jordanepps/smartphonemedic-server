const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('location endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const testLocations = helpers.makeLocationArray();
  const testLocation = testLocations[0];

  const url = '/api/location';

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

  describe('/api/location', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert locations', () =>
      helpers.seedLocations(db, testLocations)
    );

    context('GET', () => {
      it(`responds 401 when unauthorized user makes get request`, () => {
        return supertest(app)
          .get(url)
          .expect(401);
      });

      it('responds with 200 and locations', () => {
        return supertest(app)
          .get(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testLocations);
      });
    });

    context.only('POST', () => {
      it('responds 401 when unauthorized post attempt is made', () => {
        return supertest(app)
          .post(url)
          .send(testLocation)
          .expect(401);
      });

      it(`responds 400 when 'location_name' is missing`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: `Missing 'location_name' in request body` });
      });

      it(`responds 400 when 'location_name' already exists`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(testLocation)
          .expect(400, {
            error: `'${testLocation.location_name}' already exists`
          });
      });

      it(`responds 201 when 'location_name' is added`, () => {
        const validLocation = { id: 4, location_name: 'red bank' };

        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(validLocation)
          .expect(201, validLocation);
      });
    });
  });

  describe('/api/location/:location_id', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert locations', () =>
      helpers.seedLocations(db, testLocations)
    );

    context.only('GET', () => {
      it('responds 401 when unauthorized user makes get request', () => {
        return supertest(app)
          .get(`${url}/${testLocation.id}`)
          .expect(401);
      });

      it(`respond with 404 when no 'location_id' in database`, () => {
        return supertest(app)
          .get(`${url}/${99999}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: 'Location does not exist' });
      });

      it(`responds with 200 and make with valid request`, () => {
        return supertest(app)
          .get(`${url}/${testLocation.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testLocation);
      });
    });
  });
});
