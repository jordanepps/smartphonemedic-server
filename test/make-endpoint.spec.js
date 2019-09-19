const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('device make endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const testMakes = helpers.makeDeviceMakeArray();
  const testMake = testMakes[0];
  const makeUrl = '/api/device-make';

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

  describe('/api/device-make', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert makes', () => helpers.seedMakes(db, testMakes));

    context('GET', () => {
      it('responds 401 when unauthorized user makes get request', () => {
        return supertest(app)
          .get(makeUrl)
          .expect(401);
      });
      it('responds with 200 and all makes', () => {
        return supertest(app)
          .get(makeUrl)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testMakes);
      });
    });

    context('POST', () => {
      it(`responds 401 when unauthorized user posts 'make_name'`, () => {
        return supertest(app)
          .post(makeUrl)
          .send(testMake)
          .expect(401);
      });

      it(`responds 400 when 'make_name' is missing`, () => {
        return supertest(app)
          .post(makeUrl)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: `Missing 'make_name' in request body` });
      });

      it(`responds 400 when 'make_name' already exists`, () => {
        return supertest(app)
          .post(makeUrl)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(testMake)
          .expect(400, { error: `'${testMake.make_name}' already exists` });
      });

      it(`responds 201 when 'make_name' is added`, () => {
        const validMake = { id: 4, make_name: 'htc' };

        return supertest(app)
          .post(makeUrl)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(validMake)
          .expect(201, validMake);
      });
    });
  });

  describe('/api/device-make/:make_id', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert makes', () => helpers.seedMakes(db, testMakes));

    context('GET', () => {
      it('responds 401 when unauthorized user makes get request', () => {
        return supertest(app)
          .get(`${makeUrl}/${testMake.id}`)
          .expect(401);
      });

      it(`respond with 404 when no 'make_id' in database`, () => {
        return supertest(app)
          .get(`${makeUrl}/${99999}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: 'Make does not exist' });
      });

      it(`responds with 200 and make with valid request`, () => {
        return supertest(app)
          .get(`${makeUrl}/${testMake.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testMake);
      });
    });

    context('PATCH', () => {
      it('responds 401 when unauthorized user makes patch request', () => {
        const patchTest = { make_name: 'htc' };
        return supertest(app)
          .patch(`${makeUrl}/${testMake.id}`)
          .send(patchTest)
          .expect(401);
      });

      it(`responds 400 when 'make_name' is missing`, () => {
        return supertest(app)
          .patch(`${makeUrl}/${testMake.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: `Missing 'make_name' in request body` });
      });

      it(`responds with 400 when 'make_name' is already taken`, () => {
        const patchTest = { make_name: 'apple' };
        return supertest(app)
          .patch(`${makeUrl}/${testMake.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(patchTest)
          .expect(400, { error: `'${patchTest.make_name}' already taken` });
      });

      it(`responds with 204 when 'make_name' is updated`, () => {
        const patchTest = { make_name: 'htc' };
        return supertest(app)
          .patch(`${makeUrl}/${testMake.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(patchTest)
          .expect(204);
      });
    });

    context('DELETE', () => {
      it('responds 401 when unauthorized user makes delete request', () => {
        return supertest(app)
          .delete(`${makeUrl}/${testMake.id}`)
          .expect(401);
      });

      it(`responds 404 when no make exists to delete`, () => {
        return supertest(app)
          .delete(`${makeUrl}/99999`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: 'Make does not exist' });
      });

      it('responds with 204 and removes make', () => {
        return supertest(app)
          .delete(`${makeUrl}/${testMake.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204);
      });
    });
  });
});
