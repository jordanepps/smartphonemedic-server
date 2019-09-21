const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('device color endpoint', () => {
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];
  const testCarriers = helpers.makeCarrierArray();
  const testCarrier = testCarriers[0];

  const url = '/api/carrier';

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

  describe('/api/carrier', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert carriers', () => helpers.seedCarriers(db, testCarriers));

    context('GET', () => {
      it(`responds 401 when unauthorized user makes get request`, () => {
        return supertest(app)
          .get(url)
          .expect(401);
      });

      it('responds with 200 and carriers', () => {
        return supertest(app)
          .get(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testCarriers);
      });
    });

    context('POST', () => {
      it('responds 401 when unauthorized post attempt is made', () => {
        return supertest(app)
          .post(url)
          .send(testCarrier)
          .expect(401);
      });

      it(`responds 400 when 'carrier_name' is missing`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(400, { error: `Missing 'carrier_name' in request body` });
      });

      it(`responds 400 when 'carrier_name' already exists`, () => {
        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(testCarrier)
          .expect(400, {
            error: `'${testCarrier.carrier_name}' already exists`
          });
      });

      it(`responds 201 when 'carrier_name' is added`, () => {
        const validCarrier = { id: 4, carrier_name: 'cricket' };

        return supertest(app)
          .post(url)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(validCarrier)
          .expect(201, validCarrier);
      });
    });
  });

  describe('/api/carrier/:carrier_id', () => {
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
    beforeEach('insert carriers', () => helpers.seedCarriers(db, testCarriers));

    context.only('GET', () => {
      it('responds 401 when unauthorized user makes get request', () => {
        return supertest(app)
          .get(`${url}/${testCarrier.id}`)
          .expect(401);
      });

      it(`respond with 404 when no 'carrier_id' in database`, () => {
        return supertest(app)
          .get(`${url}/${99999}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404, { error: 'Carrier does not exist' });
      });

      it(`responds with 200 and make with valid request`, () => {
        return supertest(app)
          .get(`${url}/${testCarrier.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testCarrier);
      });
    });
  });
});
