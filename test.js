var test = require('tape');
var async = require('async');
require('./').extend(async);

function containsNameSync(payload, validated) {
  validated(null, payload.name === 'thiago');
}

function containsName(payload, validated) {
  setImmediate(validated, null, payload.name === 'thiago');
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

function notContainsName(payload, validated) {
  validated(null, payload.name === undefined);
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
  validated(null, payload.name === 'thiago' && country.city === 'lisbon');
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
  validated(null, false);
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
  setImmediate(validated, null, true);
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
  validated(null, false);
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

function validationThrowError(payload, validated) {
  var error = new Error('validate-error');
  validated(error);
}

test('predicated returns an error the async callback must be called with error', function(t) {
  async.waterfall([
    async.constant({name: 'thiago'}),
    async.if(validationThrowError, createAccount),
    function willNotBeCalled(payload, callback) {
      payload.next = true;
      callback(null, payload);
    }
  ], verify);

  function verify(err, result) {
    t.ok(err, 'error must be here');
    t.notOk(result, 'must not exist');
    t.end();
  }
});

test('ifNot is the same as unless', function(t) {
  t.equal(async.ifNot, async.unless);
  t.end();
});

['ifNot', 'unless'].forEach(function(method) {

  function girls(payload, validated) {
    validated(null, payload.gender === 'female');
  }

  function notAllowed(payload, callback) {
    payload.allowed = false;
    callback(null, payload);
  }

  function allowed(payload, callback) {
    payload.allowed = true;
    callback(null, payload);
  }

  test(method + ' works as expected', function(t) {
    async.waterfall([
      async.constant({name: 'thiago', gender: 'male'}),
      async[method](girls, notAllowed).else(allowed)
    ], verify);

    function verify(err, result) {
      t.notOk(err, 'there is no error');
      t.equal(result.allowed, false,  'must be equals');
      t.end();
    }
  });

  function men(payload, validated) {
    validated(null, payload.gender === 'male');
  }

  test(method + ' works as expected', function(t) {
    async.waterfall([
      async.constant({name: 'thiago', gender: 'male'}),
      async[method](men, notAllowed).else(allowed)
    ], verify);

    function verify(err, result) {
      t.notOk(err, 'there is no error');
      t.equal(result.allowed, true,  'must be equals');
      t.end();
    }
  });

});
