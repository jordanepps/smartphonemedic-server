const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('device color endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const testColors = helpers.makeDeviceColorArray();
  const testColor = testColors[0];

  const url = '/api/device-color';

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
    beforeEach('insert colors', () => helpers.seedColors(db, testColors));

    context('GET', () => {
      it(`responds 401 when unauthorized user makes get request`, () => {
        return supertest(app)
          .get(url)
          .expect(401);
      });

      it('responds with 200 and colors', () => {
        return supertest(app)
          .get(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testColors);
      });
    });

    context('POST', () => {
      it('responds 401 when unauthorized post attempt is made', () => {
        return supertest(app)
          .post(url)
          .send(testColor)
          .expect(401);
      });

      it(`responds 400 when 'color_name' is missing`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: `Missing 'color_name' in request body` });
      });

      it(`responds 400 when 'color_name' already exists`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(testColor)
          .expect(400, { error: `'${testColor.color_name}' already exists` });
      });

      it(`responds 201 when 'color_name' is added`, () => {
        const validColor = { id: 4, color_name: 'red' };

        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(validColor)
          .expect(201, validColor);
      });
    });
  });

  describe('/api/device-color/:color_id', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert colors', () => helpers.seedColors(db, testColors));

    context.only('GET', () => {
      it('responds 401 when unauthorized user makes get request', () => {
        return supertest(app)
          .get(`${url}/${testColor.id}`)
          .expect(401);
      });

      it(`respond with 404 when no 'make_id' in database`, () => {
        return supertest(app)
          .get(`${url}/${99999}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: 'Color does not exist' });
      });

      it(`responds with 200 and make with valid request`, () => {
        return supertest(app)
          .get(`${url}/${testColor.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testColor);
      });
    });
  });
});
