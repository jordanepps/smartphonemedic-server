const app = require('../src/app');

describe('App', () => {
  it('GET /api responds with 200 containing "SPM API"', () => {
    return supertest(app)
      .get('/api')
      .expect(200, 'SPM API');
  });
});
