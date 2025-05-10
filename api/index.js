// api/index.js (na raiz do projeto)
const serverless = require('serverless-http');
const { handler } = require('../dist/index.js');

module.exports.handler = serverless(handler);