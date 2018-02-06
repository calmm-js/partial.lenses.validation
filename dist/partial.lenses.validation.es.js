import { id, freeze, isFunction, isArray, curryN, always, object0, curry } from 'infestines';
import { transform, rewrite, any, modify, elems, values, get, ifElse, toFunction, traverse, zero, setOp, modifyOp, setter, choose, set, branchOr, optional, lazy } from 'partial.lenses';

var length = function length(x) {
  return x.length;
};

var sameLength = function sameLength(x) {
  return x = length(x), function (y) {
    return x === length(y);
  };
};

var isInstanceOf = /*#__PURE__*/curry(function (Class, x) {
  return x instanceof Class;
});
var isInstanceOfObject = /*#__PURE__*/isInstanceOf(Object);

var o = /*#__PURE__*/curry(function (f, g) {
  return function (x) {
    return f(g(x));
  };
});

var both = /*#__PURE__*/curry(function (p1, p2) {
  return function (x) {
    return p1(x) && p2(x);
  };
});

var ignore = function ignore(_) {};

//

var Sync = /*#__PURE__*/transform(function (_x, _i, M, _xi2yM) {
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

var fromUniques = /*#__PURE__*/rewrite(function (xs) {
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

var rejected = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : o(freeze))(function (value) {
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
    return any(isRejected, optic, r) ? rejected(modify(optic, from, r)) : r;
  };
};

var arrayIxTrickle = /*#__PURE__*/rewrite( /*#__PURE__*/trickle(elems, fromRejectedOrNull));
var arrayIdTrickle = /*#__PURE__*/rewrite( /*#__PURE__*/trickle(elems, fromRejected));
var propsTrickle = /*#__PURE__*/rewrite( /*#__PURE__*/trickle(values, fromRejected));

//

function toError(errors) {
  var error = Error(JSON.stringify(errors, null, 2));
  error.errors = errors;
  return error;
}

function raise(errors) {
  throw toError(errors);
}

//

var getEither = function getEither(k, r, x) {
  return r = get(k, r), void 0 === r ? get(k, x) : r;
};

var sumRight = function sumRight(zero$$1, one, plus) {
  return function () {
    var n = arguments.length;
    var r = zero$$1;
    if (n) {
      r = one(arguments[--n], r);
      while (n) {
        r = plus(arguments[--n], r);
      }
    }
    return r;
  };
};

var andCompose = function andCompose(p, o$$1) {
  return ifElse(p, compose(o$$1), reject);
};

// Internals

var toRule = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : function (fn) {
  return function (rule) {
    if (isFunction(rule) && (length(rule) < 3 || length(rule) === 4) || isArray(rule) && length(rule) === 2) {
      return fn(rule);
    } else {
      throw Error('Invalid rule: ' + rule);
    }
  };
})(function (rule) {
  if (isFunction(rule)) {
    return length(rule) < 3 ? where(rule) : rule;
  } else {
    var error = rule[1];
    return isFunction(error) ? modifyError(error, rule[0]) : setError(error, rule[0]);
  }
});

var toRules = /*#__PURE__*/modify(elems, toRule);

var compose = /*#__PURE__*/o(toFunction, toRules);

var raiseRejected = function raiseRejected(r) {
  return isRejected(r) ? raise(toError(value(r))) : r;
};

// Elimination

var run = /*#__PURE__*/curryN(3, function (_ref) {
  var Monad = _ref.Monad,
      onAccept = _ref.onAccept,
      onReject = _ref.onReject;

  Monad = Monad || Sync;
  onAccept = onAccept || id;
  onReject = onReject || raise;
  var handler = function handler(r) {
    return isRejected(r) ? onReject(value(r)) : onAccept(r);
  };
  return function (rule) {
    return rule = toRule(rule), function (data) {
      return Monad.chain(handler, traverse(Monad, id, rule, data));
    };
  };
});

var accepts = /*#__PURE__*/run({
  onAccept: /*#__PURE__*/always(true),
  onReject: /*#__PURE__*/always(false)
});

var acceptsAsync = /*#__PURE__*/run({
  Monad: Async,
  onAccept: /*#__PURE__*/always( /*#__PURE__*/returnAsync(true)),
  onReject: /*#__PURE__*/always( /*#__PURE__*/returnAsync(false))
});

var errors = /*#__PURE__*/run({ onAccept: ignore, onReject: id });

var errorsAsync = /*#__PURE__*/run({
  Monad: Async,
  onAccept: /*#__PURE__*/always( /*#__PURE__*/returnAsync()),
  onReject: returnAsync
});

var validate = /*#__PURE__*/run(object0);

var validateAsync = /*#__PURE__*/run({
  Monad: Async,
  onAccept: returnAsync,
  onReject: /*#__PURE__*/o(throwAsync, toError)
});

var tryValidateAsyncNow = /*#__PURE__*/run({
  Monad: Async,
  onReject: /*#__PURE__*/o(raise, toError)
});

// Primitive

var accept = zero;

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

var rejectAs = /*#__PURE__*/o(setOp, rejected);

var reject = /*#__PURE__*/modifyOp(rejected);

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

var modifyError = /*#__PURE__*/curry(function (fn, rule) {
  return rule = toRule(rule), function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? M.map(rejected, fn(x, value(r), i)) : r;
    }, rule(x, i, M, xi2yM));
  };
});

var setError = /*#__PURE__*/curry(function (error, rule) {
  return compose([rewrite(function (r) {
    return isRejected(r) ? rejected(error) : r;
  }), rule]);
});

// Logical

var not = function not(rule) {
  return compose([setter(function (r, x) {
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

var and = /*#__PURE__*/sumRight(accept, toRule, function (rule, rest) {
  return rule = toRule(rule), function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? M.of(r) : rest(r, i, M, xi2yM);
    }, rule(x, i, M, xi2yM));
  };
});

// Arrays

var arrayIx = function arrayIx(rule) {
  return andCompose(isArray, [arrayIxTrickle, elems, rule]);
};

var arrayId = function arrayId(rule) {
  return andCompose(isArray, [arrayIdTrickle, elems, rule]);
};

function tuple() {
  var rules = [];
  var n = arguments.length;
  for (var i = 0; i < n; ++i) {
    rules.push(toRule(arguments[i]));
  }return andCompose(both(isArray, sameLength(rules)), [fromUniques, arrayIxTrickle, elems, toUnique, choose(function (_, i) {
    return rules[i];
  })]);
}

// Functions

var dependentFn = /*#__PURE__*/curry(function (argsRule, toResRule) {
  return argsRule = toRule(argsRule), function (fn, i, M, _xi2yM) {
    return M.of(isFunction(fn) ? function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return M.chain(function (args) {
        return isRejected(args) ? raise(toError(value(args))) : M.chain(function (res) {
          return M.map(raiseRejected, traverse(M, id, toRule(toResRule.apply(null, args)), res));
        }, fn.apply(null, args));
      }, traverse(M, id, argsRule, args));
    } : rejected(fn));
  };
});

var freeFn = /*#__PURE__*/curry(function (argsRule, resRule) {
  return dependentFn(argsRule, always(resRule));
});

// Objects

var keep = /*#__PURE__*/curry(function (key, rule) {
  return andCompose(isInstanceOfObject, [setter(function (r, x) {
    return isRejected(r) ? rejected(set(key, getEither(key, value(r), x), value(r))) : r;
  }), rule]);
});

var propsOr = /*#__PURE__*/curry(function (onOthers, template) {
  return andCompose(isInstanceOfObject, [propsTrickle, branchOr(toRule(onOthers), modify(values, toRule, template))]);
});

var props = /*#__PURE__*/propsOr(reject);

var optional$1 = function optional$$1(rule) {
  return compose([optional, rule]);
};

// Conditional

var cases = /*#__PURE__*/sumRight(reject, /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : validate(freeFn(tuple(or(tuple(accept), tuple(isFunction, accept)), accept), accept)))(function (alt, rest) {
  return length(alt) === 1 ? alt[0] : ifElse$1(alt[0], alt[1], rest);
}), /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : validate(freeFn(tuple(tuple(isFunction, accept), accept), accept)))(function (alt, rest) {
  return ifElse$1(alt[0], alt[1], rest);
}));

var ifElse$1 = /*#__PURE__*/curry(function (p, c, a) {
  return c = toRule(c), a = toRule(a), function (x, i, M, xi2yM) {
    return M.chain(function (b) {
      return b ? c(x, i, M, xi2yM) : a(x, i, M, xi2yM);
    }, p(x, i));
  };
});

// Dependent

var choose$1 = function choose$$1(xi2r) {
  return function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return toRule(r)(x, i, M, xi2yM);
    }, xi2r(x, i));
  };
};

// Recursive

var lazy$1 = /*#__PURE__*/o(lazy, /*#__PURE__*/o(toRule));

export { run, accepts, acceptsAsync, errors, errorsAsync, validate, validateAsync, tryValidateAsyncNow, accept, acceptAs, acceptWith, rejectWith, rejectAs, reject, remove, where, modifyError, setError, not, or, and, arrayIx, arrayId, tuple, dependentFn, freeFn, keep, propsOr, props, optional$1 as optional, cases, ifElse$1 as ifElse, choose$1 as choose, lazy$1 as lazy };
