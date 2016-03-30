
module.exports = extend;
module.exports.extend = extend;

function extend(async) {
  async.if = builder(ifCheck);
  async.ifNot = async.unless = builder(ifNotCheck);
  return async;
}

function builder(predicateChecker) {
  return function ifFn(predicate, ifStatement) {
    var elseStatement = nopStatement;

    function wrapper() {
      var args = Array.prototype.slice.call(arguments);
      var asyncCallback = args[args.length - 1 ];
      var predicateArgs = args.slice(0, -1).concat(predicateCb);

      if (isBoolean(predicate)) {
        const predicateValue = predicate;

        predicate = function booleanValue() {
         const args = Array.prototype.slice.call(arguments);
         const cb = args.pop();
         cb(null, predicateValue);
        }
      }

      predicate.apply(null, predicateArgs);

      function predicateCb(error, valid) {
        if (error)
          return asyncCallback(error);

        if (predicateChecker(valid))
          ifStatement.apply(null, args);
        else
          elseStatement.apply(null, args);
      }
    }
 
    wrapper.else = function(statement) {
      elseStatement = statement;
      return wrapper;
    };

    return wrapper;
  };
}

function ifCheck(value) {
  return value;
}

function ifNotCheck(value) {
  return !value;
}

function nopStatement() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  callback.apply(null, [null].concat(args));
}


function isBoolean(value) {
  return value === true || value === false || Object.toString.call(value) === '[object Boolean]';
}

