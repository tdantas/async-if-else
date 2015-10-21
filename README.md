# async-if-else
node famous async conditional capabilities

easy way to create conditions on your async waterfall flow

```
var async = require('async');
var require('async-if-else').extend(async);

async.waterfall([
  async.constant({email: 'thiago@email.com', password: 'secret'}),
  async.if(existOnDatabase, updateAccount).else(tryToImportFromLegacy)
], handler);

```
