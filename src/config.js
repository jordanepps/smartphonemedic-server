module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'deployment',
  DB_URL:
    process.env.DATABASE_URL ||
    'postgresql://jordanepps@localhost/smartphonemedic',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'F13D989A14ADFBB8AC926A8C70796090940EF28280A20FECE0D10C354D0F9E29',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h'
};
