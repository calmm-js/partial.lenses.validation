import { isFunction, id, freeze, isArray, curryN, always, curry } from 'infestines';
import { transform, rewrite, any, modify, elems, values, get, ifElse, toFunction, choose, traverse, zero, setOp, modifyOp, setter, set, optional, branchOr, lazy } from 'partial.lenses';

var length = function length(x) {
  return x.length;
};

var lte = /*#__PURE__*/curry(function (l, r) {
  return l <= r;
});

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

var P = Promise;

var throwAsync = /*#__PURE__*/P.reject.bind(P);
var returnAsync = /*#__PURE__*/P.resolve.bind(P);

var chain = function chain(xyP, xP) {
  return null != xP && isFunction(xP.then) ? xP.then(xyP) : xyP(xP);
};

var Async = {
  map: chain,
  ap: function ap(xyP, xP) {
    return chain(function (xP) {
      return chain(function (xyP) {
        return xyP(xP);
      }, xyP);
    }, xP);
  },
  of: id,
  chain: chain

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

var raiseRejected = function raiseRejected(r) {
  return isRejected(r) ? raise(toError(value(r))) : r;
};

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

//

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

//

var andCompose = function andCompose(p, o$$1) {
  return ifElse(p, compose(o$$1), reject);
};

var compose = /*#__PURE__*/o(toFunction, toRules);

//

var tupleOr = function tupleOr(_ref) {
  var less = _ref.less,
      rest = _ref.rest;
  return rest = toRule(rest), function () {
    var rules = [];
    var n = arguments.length;
    for (var i = 0; i < n; ++i) {
      rules.push(toRule(arguments[i]));
    }return andCompose(less ? isArray : both(isArray, o(lte(n), length)), [fromUniques, arrayIxTrickle, less ? function (xs, i, M, xi2yM) {
      var m = length(xs);
      if (m < n) {
        xs = xs.slice();
        xs.length = n;
        return M.map(function (ys) {
          return any(isRejected, elems, ys) ? ys : ys.slice(0, m);
        }, elems(xs, i, M, xi2yM));
      } else {
        return elems(xs, i, M, xi2yM);
      }
    } : elems, toUnique, choose(function (_, i) {
      return rules[i] || rest;
    })]);
  };
};

var runWith = function runWith(Monad, onAccept, onReject) {
  return run({ Monad: Monad, onAccept: onAccept, onReject: onReject });
};

//

var raised = false;

function callPredicate(predicate, x, i) {
  try {
    return raised = predicate(x, i);
  } catch (e) {
    raised = e;
    return false;
  }
}

// General

var run = /*#__PURE__*/curryN(3, function (c) {
  var Monad = c.Monad || Sync;
  var onAccept = c.onAccept || id;
  var onReject = c.onReject || raise;
  var handler = function handler(r) {
    return isRejected(r) ? onReject(value(r)) : onAccept(r);
  };
  return function (rule) {
    return rule = toRule(rule), function (data) {
      return Monad.chain(handler, traverse(Monad, id, rule, data));
    };
  };
});

// Synchronous

var accepts = /*#__PURE__*/runWith(0, /*#__PURE__*/always(true), /*#__PURE__*/always(false));

var errors = /*#__PURE__*/runWith(0, ignore, id);

var validate = /*#__PURE__*/runWith();

// Asynchronous

var acceptsAsync = /*#__PURE__*/runWith(Async, /*#__PURE__*/always( /*#__PURE__*/returnAsync(true)), /*#__PURE__*/always( /*#__PURE__*/returnAsync(false)));

var errorsAsync = /*#__PURE__*/runWith(Async, /*#__PURE__*/always( /*#__PURE__*/returnAsync()), returnAsync);

var tryValidateAsyncNow = /*#__PURE__*/runWith(Async, 0, /*#__PURE__*/o(raise, toError));

var validateAsync = /*#__PURE__*/runWith(Async, returnAsync, /*#__PURE__*/o(throwAsync, toError));

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
      return b ? x : rejected(raised || x);
    }, callPredicate(predicate, x, i));
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

var and = /*#__PURE__*/sumRight(accept, toRule, function (rule, rest) {
  return rule = toRule(rule), function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? M.of(r) : rest(r, i, M, xi2yM);
    }, rule(x, i, M, xi2yM));
  };
});

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

// Uniform

var arrayId = function arrayId(rule) {
  return andCompose(isArray, [arrayIdTrickle, elems, rule]);
};

var arrayIx = function arrayIx(rule) {
  return andCompose(isArray, [arrayIxTrickle, elems, rule]);
};

// Varying

var args = /*#__PURE__*/tupleOr({ less: true, rest: accept });

var tuple = /*#__PURE__*/tupleOr({ less: false, rest: reject });

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

var optional$1 = function optional$$1(rule) {
  return compose([optional, rule]);
};

var propsOr = /*#__PURE__*/curry(function (onOthers, template) {
  return andCompose(isInstanceOfObject, [propsTrickle, branchOr(toRule(onOthers), modify(values, toRule, template))]);
});

var props = /*#__PURE__*/propsOr(reject);

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

export { run, accepts, errors, validate, acceptsAsync, errorsAsync, tryValidateAsyncNow, validateAsync, accept, acceptAs, acceptWith, rejectWith, rejectAs, reject, remove, where, modifyError, setError, and, not, or, arrayId, arrayIx, args, tuple, dependentFn, freeFn, keep, optional$1 as optional, propsOr, props, cases, ifElse$1 as ifElse, choose$1 as choose, lazy$1 as lazy };
