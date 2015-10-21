# async-if-else
node famous async conditional capabilities

easy way to create conditions on your async waterfall flow

```
var async = require('async');
var require('async-if-else').extend(async);

async.waterfall([
  async.constant({email: 'thiago@email.com', dogs: 2, money: 0, fun: 100 }),
  async.if(emailExists, updateAccount).else(importFromLegacyByEmail),
  sendEmail
], handler);

```


#### Hey I found a BUG !
Amazing ! PR are always welcome 

Let's make the world a better place helping others :)
