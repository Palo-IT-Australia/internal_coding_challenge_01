const uuid = require('uuid/v1');
let generateId = () => uuid();

module.exports = { generateId };
