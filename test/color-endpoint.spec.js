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
    //TODO:Figure out why this does not work
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

    context.only('POST', () => {
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
});
