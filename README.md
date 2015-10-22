# async-if-else

This module adds if else conditional capabilities to [async](https://www.npmjs.com/package/async) module.

Ever came across code like this on your `async.waterfall` flow?

```javascript
var async = require('async');

async.waterfall([
  async.constant({email: 'thiago@email.com', dogs: 2, money: 0, fun: 100 }),
  updateUserEmailOrGetLegacy
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
var async = require('async');
require('async-if-else').extend(async);

async.waterfall([
  async.constant({email: 'thiago@email.com', dogs: 2, money: 0, fun: 100 }),
  async.if(emailExists, updateAccount).else(importFromLegacyByEmail),
  sendEmail
], handler);
```

You can also omit the `else` and the function is only executed if the predicate is true.

```javascript
var async = require('async');
var require('async-if-else').extend(async);

async.waterfall([
  async.constant({email: 'thiago@email.com', dogs: 2, money: 0, fun: 100 }),
  async.if(emailExists, auditLogging),
  publishToQueue
], handler);
```

#### Hey, did you found an issue?

The best way to get in touch is using the [GitHub](https://github.com/tdantas/async-if-else/issues).  
If you can't find someone with the problem you are facing open a [new issue](https://github.com/tdantas/async-if-else/issues/new) and let me know.  
If you manage to find a solution for your problem, you can submit a new [PR](https://github.com/tdantas/async-if-else/pulls) :)

Let's make the world a better place by helping others.

# License
[MIT](https://github.com/tdantas/async-if-else/blob/master/LICENSE)
