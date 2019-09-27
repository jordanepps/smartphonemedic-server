const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('device model endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const testMakes = helpers.makeDeviceMakeArray();

  const url = '/api/device-model';

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

  describe('/api/device-model', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert makes', () => helpers.seedMakes(db, testMakes));
    // beforeEach('insert models' ()=> helpers)

    context.only('POST', () => {
      it(`responds 201 when 'model_name' is added`, () => {
        const validModel = { id: 4, model_name: 'iphone 7' };

        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(validModel)
          .expect(201, validModel);
      });
    });
  });
});
