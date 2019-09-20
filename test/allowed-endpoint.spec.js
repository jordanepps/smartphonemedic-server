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

    context('POST', () => {
      it('responds 401 when unauthorized post attempt is made', () => {
        return supertest(app)
          .post(url)
          .send(testAllowed)
          .expect(401);
      });

      it(`responds 400 when 'email' is missing`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: `Missing 'email' in request body` });
      });

      it(`responds 400 when 'email' already exists`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(testAllowed)
          .expect(400, { error: `'${testAllowed.email}' already added` });
      });

      it(`responds 201 when 'email' is added`, () => {
        const validEmail = { id: 6, email: 'test@test.com' };

        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(validEmail)
          .expect(201, validEmail);
      });
    });
  });

  describe('/api/allowed/:allowed_id', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert allowed', () =>
      helpers.seedAllowed(db, testAllowedUsers)
    );

    context('PATCH', () => {
      it('responds 401 when unauthorized user makes patch request', () => {
        const patchTest = { email: 'test@test.com' };
        return supertest(app)
          .patch(`${url}/${testAllowed.id}`)
          .send(patchTest)
          .expect(401);
      });

      it(`responds 400 when 'email' is missing`, () => {
        return supertest(app)
          .patch(`${url}/${testAllowed.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: `Missing 'email' in request body` });
      });

      it(`responds with 400 when 'email' is already added`, () => {
        const patchTest = { email: 'one@email.com' };
        return supertest(app)
          .patch(`${url}/${testAllowed.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(patchTest)
          .expect(400, { error: `'${patchTest.email}' already added` });
      });

      it(`responds with 204 when 'email' is updated`, () => {
        const patchTest = { email: 'red@email.com' };
        return supertest(app)
          .patch(`${url}/${testAllowed.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(patchTest)
          .expect(204);
      });
    });

    context('DELETE', () => {
      it('responds 401 when unauthorized user makes delete request', () => {
        return supertest(app)
          .delete(`${url}/${testAllowed.id}`)
          .expect(401);
      });

      it(`responds 404 when no allowed email exists to delete`, () => {
        return supertest(app)
          .delete(`${url}/99999`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: 'Email does not exist' });
      });

      it('responds with 204 and removes allowed email', () => {
        return supertest(app)
          .delete(`${url}/${testAllowed.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204);
      });
    });
  });
});
