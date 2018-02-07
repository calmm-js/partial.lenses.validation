'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var I = require('infestines');
var L = require('partial.lenses');

var length = function length(x) {
  return x.length;
};

var lte = /*#__PURE__*/I.curry(function (l, r) {
  return l <= r;
});

var isInstanceOf = /*#__PURE__*/I.curry(function (Class, x) {
  return x instanceof Class;
});
var isInstanceOfObject = /*#__PURE__*/isInstanceOf(Object);

var o = /*#__PURE__*/I.curry(function (f, g) {
  return function (x) {
    return f(g(x));
  };
});

var both = /*#__PURE__*/I.curry(function (p1, p2) {
  return function (x) {
    return p1(x) && p2(x);
  };
});

var ignore = function ignore(_) {};

//

var Sync = /*#__PURE__*/L.transform(function (_x, _i, M, _xi2yM) {
  return M;
}, 0);

//

var throwAsync = function throwAsync(x) {
  return Promise.reject(x);
};
var returnAsync = function returnAsync(x) {
  return Promise.resolve(x);
};

var isThenable = function isThenable(x) {
  return null != x && typeof x.then === 'function';
};

var Async = {
  map: function map(xyP, xP) {
    return isThenable(xP) ? xP.then(xyP) : xyP(xP);
  },
  ap: function ap(xyP, xP) {
    return isThenable(xP) || isThenable(xyP) ? Promise.all([xyP, xP]).then(function (xy_x) {
      return xy_x[0](xy_x[1]);
    }) : xyP(xP);
  },
  of: function of(x) {
    return x;
  },
  chain: function chain(xyP, xP) {
    return isThenable(xP) ? xP.then(xyP) : xyP(xP);
  }

  //

};var unique = {};

var uniqueToUndefined = function uniqueToUndefined(x) {
  return x === unique ? undefined : x;
};
var undefinedToUnique = function undefinedToUnique(y) {
  return undefined === y ? unique : y;
};

var fromUniques = /*#__PURE__*/L.rewrite(function (xs) {
  var r = isRejected(xs);
  if (r) xs = value(xs);
  xs = xs.map(uniqueToUndefined);
  return r ? rejected(xs) : xs;
});

var toUnique = function toUnique(x, i, M, xi2yM) {
  return M.map(undefinedToUnique, xi2yM(x, i));
};

//

function Rejected(value) {
  this.value = undefined !== value ? value : null;
}

var isRejected = /*#__PURE__*/isInstanceOf(Rejected);

var rejected = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? I.id : o(I.freeze))(function (value) {
  return new Rejected(value);
});

var value = function value(x) {
  return x.value;
};

var fromRejected = function fromRejected(x) {
  return isRejected(x) ? value(x) : undefined;
};
var fromRejectedOrNull = function fromRejectedOrNull(x) {
  return isRejected(x) ? value(x) : null;
};

//

var trickle = function trickle(optic, from) {
  return function (r) {
    return L.any(isRejected, optic, r) ? rejected(L.modify(optic, from, r)) : r;
  };
};

var arrayIxTrickle = /*#__PURE__*/L.rewrite( /*#__PURE__*/trickle(L.elems, fromRejectedOrNull));
var arrayIdTrickle = /*#__PURE__*/L.rewrite( /*#__PURE__*/trickle(L.elems, fromRejected));
var propsTrickle = /*#__PURE__*/L.rewrite( /*#__PURE__*/trickle(L.values, fromRejected));

//

function toError(errors) {
  var error = Error(JSON.stringify(errors, null, 2));
  error.errors = errors;
  return error;
}

function raise(errors) {
  throw toError(errors);
}

var raiseRejected = function raiseRejected(r) {
  return isRejected(r) ? raise(toError(value(r))) : r;
};

//

var getEither = function getEither(k, r, x) {
  return r = L.get(k, r), void 0 === r ? L.get(k, x) : r;
};

var sumRight = function sumRight(zero, one, plus) {
  return function () {
    var n = arguments.length;
    var r = zero;
    if (n) {
      r = one(arguments[--n], r);
      while (n) {
        r = plus(arguments[--n], r);
      }
    }
    return r;
  };
};

//

var toRule = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? I.id : function (fn) {
  return function (rule) {
    if (I.isFunction(rule) && (length(rule) < 3 || length(rule) === 4) || I.isArray(rule) && length(rule) === 2) {
      return fn(rule);
    } else {
      throw Error('Invalid rule: ' + rule);
    }
  };
})(function (rule) {
  if (I.isFunction(rule)) {
    return length(rule) < 3 ? where(rule) : rule;
  } else {
    var error = rule[1];
    return I.isFunction(error) ? modifyError(error, rule[0]) : setError(error, rule[0]);
  }
});

var toRules = /*#__PURE__*/L.modify(L.elems, toRule);

//

var andCompose = function andCompose(p, o$$1) {
  return L.ifElse(p, compose(o$$1), reject);
};

var compose = /*#__PURE__*/o(L.toFunction, toRules);

//

var tupleOr = function tupleOr(_ref) {
  var less = _ref.less,
      rest = _ref.rest;
  return rest = toRule(rest), function () {
    var rules = [];
    var n = arguments.length;
    for (var i = 0; i < n; ++i) {
      rules.push(toRule(arguments[i]));
    }return andCompose(less ? I.isArray : both(I.isArray, o(lte(n), length)), [fromUniques, arrayIxTrickle, less ? function (xs, i, M, xi2yM) {
      var m = length(xs);
      if (m < n) {
        xs = xs.slice();
        xs.length = n;
        return M.map(function (ys) {
          return L.any(isRejected, L.elems, ys) ? ys : ys.slice(0, m);
        }, L.elems(xs, i, M, xi2yM));
      } else {
        return L.elems(xs, i, M, xi2yM);
      }
    } : L.elems, toUnique, L.choose(function (_, i) {
      return rules[i] || rest;
    })]);
  };
};

// General

var run = /*#__PURE__*/I.curryN(3, function (_ref2) {
  var Monad = _ref2.Monad,
      onAccept = _ref2.onAccept,
      onReject = _ref2.onReject;

  Monad = Monad || Sync;
  onAccept = onAccept || I.id;
  onReject = onReject || raise;
  var handler = function handler(r) {
    return isRejected(r) ? onReject(value(r)) : onAccept(r);
  };
  return function (rule) {
    return rule = toRule(rule), function (data) {
      return Monad.chain(handler, L.traverse(Monad, I.id, rule, data));
    };
  };
});

// Synchronous

var accepts = /*#__PURE__*/run({
  onAccept: /*#__PURE__*/I.always(true),
  onReject: /*#__PURE__*/I.always(false)
});

var errors = /*#__PURE__*/run({ onAccept: ignore, onReject: I.id });

var validate = /*#__PURE__*/run(I.object0);

// Asynchronous

var acceptsAsync = /*#__PURE__*/run({
  Monad: Async,
  onAccept: /*#__PURE__*/I.always( /*#__PURE__*/returnAsync(true)),
  onReject: /*#__PURE__*/I.always( /*#__PURE__*/returnAsync(false))
});

var errorsAsync = /*#__PURE__*/run({
  Monad: Async,
  onAccept: /*#__PURE__*/I.always( /*#__PURE__*/returnAsync()),
  onReject: returnAsync
});

var tryValidateAsyncNow = /*#__PURE__*/run({
  Monad: Async,
  onReject: /*#__PURE__*/o(raise, toError)
});

var validateAsync = /*#__PURE__*/run({
  Monad: Async,
  onAccept: returnAsync,
  onReject: /*#__PURE__*/o(throwAsync, toError)
});

// Primitive

var accept = L.zero;

var acceptAs = function acceptAs(value) {
  return function (x, i, M, xi2yM) {
    return xi2yM(value, i);
  };
};

var acceptWith = function acceptWith(fn) {
  return function (x, i, M, xi2yM) {
    return M.chain(function (x) {
      return xi2yM(x, i);
    }, fn(x, i));
  };
};

var rejectWith = function rejectWith(fn) {
  return function (x, i, M, _xi2yM) {
    return M.map(rejected, fn(x, i));
  };
};

var rejectAs = /*#__PURE__*/o(L.setOp, rejected);

var reject = /*#__PURE__*/L.modifyOp(rejected);

var remove = /*#__PURE__*/acceptAs(undefined);

// Predicates

var where = function where(predicate) {
  return function (x, i, M, _xi2yM) {
    return M.chain(function (b) {
      return b ? x : rejected(x);
    }, predicate(x, i));
  };
};

// Elaboration

var modifyError = /*#__PURE__*/I.curry(function (fn, rule) {
  return rule = toRule(rule), function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? M.map(rejected, fn(x, value(r), i)) : r;
    }, rule(x, i, M, xi2yM));
  };
});

var setError = /*#__PURE__*/I.curry(function (error, rule) {
  return compose([L.rewrite(function (r) {
    return isRejected(r) ? rejected(error) : r;
  }), rule]);
});

// Logical

var and = /*#__PURE__*/sumRight(accept, toRule, function (rule, rest) {
  return rule = toRule(rule), function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? M.of(r) : rest(r, i, M, xi2yM);
    }, rule(x, i, M, xi2yM));
  };
});

var not = function not(rule) {
  return compose([L.setter(function (r, x) {
    return isRejected(r) ? x : rejected(x);
  }), rule]);
};

var or = /*#__PURE__*/sumRight(reject, toRule, function (rule, rest) {
  return rule = toRule(rule), function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? rest(x, i, M, xi2yM) : M.of(r);
    }, rule(x, i, M, xi2yM));
  };
});

// Uniform

var arrayId = function arrayId(rule) {
  return andCompose(I.isArray, [arrayIdTrickle, L.elems, rule]);
};

var arrayIx = function arrayIx(rule) {
  return andCompose(I.isArray, [arrayIxTrickle, L.elems, rule]);
};

// Varying

var args = /*#__PURE__*/tupleOr({ less: true, rest: accept });

var tuple = /*#__PURE__*/tupleOr({ less: false, rest: reject });

// Functions

var dependentFn = /*#__PURE__*/I.curry(function (argsRule, toResRule) {
  return argsRule = toRule(argsRule), function (fn, i, M, _xi2yM) {
    return M.of(I.isFunction(fn) ? function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return M.chain(function (args) {
        return isRejected(args) ? raise(toError(value(args))) : M.chain(function (res) {
          return M.map(raiseRejected, L.traverse(M, I.id, toRule(toResRule.apply(null, args)), res));
        }, fn.apply(null, args));
      }, L.traverse(M, I.id, argsRule, args));
    } : rejected(fn));
  };
});

var freeFn = /*#__PURE__*/I.curry(function (argsRule, resRule) {
  return dependentFn(argsRule, I.always(resRule));
});

// Objects

var keep = /*#__PURE__*/I.curry(function (key, rule) {
  return andCompose(isInstanceOfObject, [L.setter(function (r, x) {
    return isRejected(r) ? rejected(L.set(key, getEither(key, value(r), x), value(r))) : r;
  }), rule]);
});

var optional = function optional(rule) {
  return compose([L.optional, rule]);
};

var propsOr = /*#__PURE__*/I.curry(function (onOthers, template) {
  return andCompose(isInstanceOfObject, [propsTrickle, L.branchOr(toRule(onOthers), L.modify(L.values, toRule, template))]);
});

var props = /*#__PURE__*/propsOr(reject);

// Conditional

var cases = /*#__PURE__*/sumRight(reject, /*#__PURE__*/(process.env.NODE_ENV === 'production' ? I.id : validate(freeFn(tuple(or(tuple(accept), tuple(I.isFunction, accept)), accept), accept)))(function (alt, rest) {
  return length(alt) === 1 ? alt[0] : ifElse(alt[0], alt[1], rest);
}), /*#__PURE__*/(process.env.NODE_ENV === 'production' ? I.id : validate(freeFn(tuple(tuple(I.isFunction, accept), accept), accept)))(function (alt, rest) {
  return ifElse(alt[0], alt[1], rest);
}));

var ifElse = /*#__PURE__*/I.curry(function (p, c, a) {
  return c = toRule(c), a = toRule(a), function (x, i, M, xi2yM) {
    return M.chain(function (b) {
      return b ? c(x, i, M, xi2yM) : a(x, i, M, xi2yM);
    }, p(x, i));
  };
});

// Dependent

var choose = function choose(xi2r) {
  return function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return toRule(r)(x, i, M, xi2yM);
    }, xi2r(x, i));
  };
};

// Recursive

var lazy = /*#__PURE__*/o(L.lazy, /*#__PURE__*/o(toRule));

exports.run = run;
exports.accepts = accepts;
exports.errors = errors;
exports.validate = validate;
exports.acceptsAsync = acceptsAsync;
exports.errorsAsync = errorsAsync;
exports.tryValidateAsyncNow = tryValidateAsyncNow;
exports.validateAsync = validateAsync;
exports.accept = accept;
exports.acceptAs = acceptAs;
exports.acceptWith = acceptWith;
exports.rejectWith = rejectWith;
exports.rejectAs = rejectAs;
exports.reject = reject;
exports.remove = remove;
exports.where = where;
exports.modifyError = modifyError;
exports.setError = setError;
exports.and = and;
exports.not = not;
exports.or = or;
exports.arrayId = arrayId;
exports.arrayIx = arrayIx;
exports.args = args;
exports.tuple = tuple;
exports.dependentFn = dependentFn;
exports.freeFn = freeFn;
exports.keep = keep;
exports.optional = optional;
exports.propsOr = propsOr;
exports.props = props;
exports.cases = cases;
exports.ifElse = ifElse;
exports.choose = choose;
exports.lazy = lazy;
