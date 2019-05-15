/**
 * DO NOT MODIFY !!
 * Module mocking uuid generator
 */

const uuid = require('uuid/v1');

const generateId = () => uuid();

module.exports = { generateId };
