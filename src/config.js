module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'deployment',
  DB_URL:
    process.env.DATABASE_URL ||
    'postgresql://jordanepps@localhost/smartphonemedic',
  JWT_SECRET:
    process.env.JWT_SECRET ||
    'F42623B55ACEDEA18D61C898DAAD7135917F6854DF869305458F6D9D17BCBADA',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h'
};
