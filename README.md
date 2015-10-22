# async-if-else

This module adds if else conditional capabilities to [async](https://www.npmjs.com/package/async) module.

Ever came across code like this on your `async.waterfall` flow?

```javascript
var async = require('async');

async.waterfall([
  async.constant({email: 'thiago@email.com', dogs: 2, money: 0, fun: 100 }),
  updateUserEmailOrGetLegacy,
  sendEmail
], handler);

function updateUserEmailOrGetLegacy(user, cb) {
  emailExists(user.email, function (err, value) {
    if (err)
      callback(err)
    else {
      if (user.email)
        updateAccount(user, cb);
      else
        importFromLegacyByEmail(user, cb)
    }
  })
}
```

Using `async-if-else` you can have a conditional waterfall without the need of a wrapper function.  
And the code is so much more readable, don't you agree?

```javascript
var async = require('async-if-else')(require('async'));

function emailExists(user, callback) {
  user.find(user.email, function(err, dbUser){
    if (err)
      return callback(error);
      
     if(!dbUser)
       return callback(null, false); // does not exist, predicate will be false
       
     callback(null, true);  
  });
}

function updateAccount(user, callback) { 
  user.update( ..., callback);
}

function importFromLegacyByEmail(user, callback) { 
  remoteClient.get(user, callback);
}

async.waterfall([
  async.constant({email: 'thiago@email.com', dogs: 2, money: 0, fun: 100 }),
  async.if(emailExists, updateAccount).else(importFromLegacyByEmail),
  sendEmail
], handler);
```

You can also omit the `else` and the function is only executed if the predicate is true.

```javascript
var async = require('async-if-else')(require('async'));

async.waterfall([
  async.constant({email: 'thiago@email.com', dogs: 2, money: 0, fun: 100 }),
  async.if(emailExists, auditLogging),
  publishToQueue
], handler);
```

if you don't want to change the async object, you can always do something like that

```javascript
var async = require('async');
var conditional = require('async-if-else')({});

async.waterfall([
  async.constant({email: 'thiago@email.com', dogs: 2, money: 0, fun: 100 }),
  conditional.if(emailExists, auditLogging),
  publishToQueue
], handler);

```

## API 

* [`initializer`](#initializer) 
* [`if`](#if)
* [`else`](#else) 
* [`ifNot`](#ifNot)
* [`unless`](#unless)


```javascript
async.if()
async.if().else()
async.ifNot()
async.ifNot().else()
async.unless() 
async.unless().else()
```

<a name="initializer" />
### initializer
To get start with async-if-else you need to provide an object. 

```javascript
 var conditionals = require('async-if-else')({});
```

```javascript
 var async = require('async-if-else')(require('async'));
```

<a name="if" />
### if
**if** function receives the predicate and the expression.

	async.if(predicateFn, expressionFn)

* predicateFn must validate the argument received from waterfall chain  

```javascript
  function predicateFn(arg1 [, arg2 ...], callback) {}
```

callback signature is callback(error, truthyValue|falsyValue);   
if you pass an error on first parameter the async.waterfall will skip below steps and goes directly to async.waterfall's callback function.

* expressionFn will execute when predicate is thruthy.  

```javascript
  function expressionFn(arg1 [,arg2...], asyncWaterfallCallback)
```

<a name="else" />
### else
**else** receives only an elseExpressionFn

	async.if(predicateFn, expressionFn).else(elseExpressionFn);

* elseExpressionFn is executed when the if predicate is falsy or ifNot predicate is truthy.

```javascript
	function elseExpressionFn(arg1 [,arg2...], asyncWaterfallCallback)
```

<a name="ifNot" />
### ifNot

**ifNot** works as the opposite of **If** 
receives exactly the same arguments

	async.ifNot(predicateFn, expressionFn)

you could use with else as well
	
	async.ifNot(predicateFn, expressionFn).else(elseExpressionFn)

<a name="unless" />
### unless
 just an alias to [`ifNot`](#ifNot).


#### Hey, did you found an issue?

The best way to get in touch is using the [GitHub issues section](https://github.com/tdantas/async-if-else/issues).  
If you can't find someone with the problem you are facing open a [new issue](https://github.com/tdantas/async-if-else/issues/new) and let me know.  
If you manage to find a solution for your problem, you can submit a new [PR](https://github.com/tdantas/async-if-else/pulls) :)

Let's make the world a better place by helping others.

# License
[MIT](https://github.com/tdantas/async-if-else/blob/master/LICENSE)
