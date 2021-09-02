const {assert} = require('chai');

const {lookupUserByEmail} = require('../helper_functions');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('lookupUserByEmail', function() {

  it('should return a user with valid email', function() {
    const result = lookupUserByEmail("user@example.com", testUsers)
    const expectedOutput = {      
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(result, expectedOutput);    
  });

  it('should return a user with valid email', function() {
    const result = lookupUserByEmail("some@example.com", testUsers)
    const expectedOutput = false;
    assert.isFalse(result);    
  });

});
