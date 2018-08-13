
/**
 * Returns a promise that resolves to an object of the form:
 * {
 *    CharacterID: 1111,
 *    CharacterName: 'ASDF',
 *    ExpiresOn: '2014-12-15T12:00:00.1212121Z'
 *    Scopes: '',
 *    TokenType: 'Character',
 *    CharacterOwnerHash: 'asdasdasdasd',
 * }
 */
module.exports = require('./ccp-auth.js');