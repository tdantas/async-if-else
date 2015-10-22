var test = require('tape');
var async = require('async');
require('./').extend(async);

function containsNameSync(payload, validated) {
  validated(payload.name === 'thiago');
}

function containsName(payload, validated) {
  setImmediate(validated, payload.name === 'thiago');
}

function createAccount(payload, callback) {
  setTimeout(fn,10);
  function fn() {
    payload.id = Date.now();
    callback(null, payload);
  }
}

test('valid predicate and sync statement', function(t) {
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(containsNameSync, createAccount),
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.ok(result.id, 'create account modified the payload');
    t.end();
  }
});

test('valid predicate and async statement', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(containsName, createAccount),
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.ok(result.id, 'create account modified the payload');
    t.end();
  }
});

function notifyAdminSync(payload, callback){
  payload.notifyTo = 'admin@email.com';
  callback(null, payload);
}

function notifyAdminASync(payload, callback){
  payload.notifyTo = 'admin@email.com';
  setImmediate(callback, null, payload);
}

function notContainsName(payload, validated) {
  validated(payload.name === undefined);
}

test('invalid predicate should call else sync statement', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(notContainsName, createAccount).else(notifyAdminSync),
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.equal(result.notifyTo, 'admin@email.com', 'else statement changed the payload');
    t.notOk(result.id, 'create account should not be called');
    t.end();
  }
});

test('invalid predicate should call else sync statement', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(notContainsName, createAccount).else(notifyAdminSync),
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.equal(result.notifyTo, 'admin@email.com', 'else statement changed the payload');
    t.notOk(result.id, 'create account should not be called');
    t.end();
  }
});

function validateAddressAndName(payload, country, validated) {
  validated(payload.name === 'thiago' && country.city === 'lisbon');
}

function createAccountWithAddress(payload, country, callback) {
  payload.city = country.city;
  setImmediate(callback, null, payload);
}

test('different arities on if statement function', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    function(payload, callback) { callback(null, payload, { city: 'lisbon'}); },
    async.if(validateAddressAndName, createAccountWithAddress)
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.equal(result.city, 'lisbon', 'payload city must exist');
    t.end();
  }
});

function forceFail(payload, country, validated) {
  validated(false);
}

function notifyAdminWithCity(payload, country, callback) {
  payload.notifyTo = 'admin-city@email.com';
  setImmediate(callback, null, payload);
}

test('different arities on else statement function', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    function(payload, callback) { callback(null, payload, { city: 'lisbon'}); },
    async.if(forceFail, createAccountWithAddress).else(notifyAdminWithCity)
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.equal(result.notifyTo, 'admin-city@email.com', 'else statement changed the payload');
    t.notOk(result.city, 'payload city must not exist');
    t.end();
  }
});

function truthyValidation(payload, validated) {
  setImmediate(validated, true);
}

function byPassOnly(payload, callback) {
  payload.id = Date.now();
  setImmediate(callback, null, payload);
}

test('must pass the result to next in chain after if statement', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(truthyValidation, byPassOnly),
    function(payload, callback) { 
      payload.byPassed = true;
      callback(null, payload);
    },
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.ok(result.id, 'id must exist');
    t.ok(result.byPassed, 'byPassed flag must exist'); 
    t.end();
  }
});

function nop(){}

function falsyValidation(payload, validated) {
  validated(false);
}

test('invalid predicate and sync statement', function(t) {
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(falsyValidation, createAccount),
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.notOk(result.id);
    t.end();
  }
});

test('must pass the result to next in chain after else statement', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(falsyValidation, nop).else(byPassOnly),
    function(payload, callback) { 
      payload.byPassed = true;
      callback(null, payload);
    },
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.ok(result.id, 'id must exist');
    t.ok(result.byPassed, 'byPassed flag must exist'); 
    t.end();
  }
});

function blowUp(payload, callback) {
  var error = new Error('bum');
  setImmediate(callback, error, payload);
}

test('errors must be passed to async properly on if statements', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(truthyValidation, blowUp)
  ], verify);

  function verify(err, result) {
    t.ok(err, 'error must exist');
    t.end();
  }
});

test('errors must be passed to async properly on else statements', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(falsyValidation, nop).else(blowUp)
  ], verify);

  function verify(err, result) {
    t.ok(err, 'error must exist');
    t.end();
  }
});

function changeValidation(payload, validated) {
  validated(true, { name: payload.name, age: 30 });
}

test('predicate function could change the value passed to if statement', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(changeValidation, createAccount),
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.equal(result.name, 'thiago', 'payload name is the same as initial');
    t.ok(result.id, 'id must exist');
    t.equal(result.age, 30, 'validate added new field'); 
    t.end();
  }
});

function changeFalseValidation(payload, validated) {
  validated(false, { valid: false }); 
}

test('predicate function could change the value passed to else statement', function(t){
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(changeFalseValidation, nop).else(notifyAdminASync),
  ], verify);

  function verify(err, result) {
    t.notOk(err, 'there is no error');
    t.notOk(result.name, 'must not exist');
    t.notOk(result.valid, 'must be false');
    t.end();
  }
});
