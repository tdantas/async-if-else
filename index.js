
module.exports = extend;
module.exports.extend = extend;

function extend(async) {
  async.if = ifFn;
  return async;
}

function ifFn(predicate, ifStatement) {
  var elseStatement = nopStatement;

  function wrapper() {
    var args = Array.prototype.slice.call(arguments);
    var asyncCallback = args[args.length - 1 ];
    var predicateArgs = args.slice(0, -1).concat(predicateCb);

    predicate.apply(null, predicateArgs);

    function predicateCb(valid, value) {
      var applyArguments = args;

      if (value)
        applyArguments = [ value, asyncCallback ];

      if (valid)
        ifStatement.apply(null, applyArguments);
      else
        elseStatement.apply(null, applyArguments);
    }
  }
  
  wrapper.else = function(statement) {
    elseStatement = statement;
    return wrapper;
  };

  return wrapper;
}

function nopStatement() {
  var args = Array.prototype.slice.call(arguments);
  var callback = args.pop();
  callback.apply(null, args);
}
