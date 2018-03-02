import { isFunction, id, freeze, isArray, always, curryN, curry } from 'infestines';
import { rewrite, any, modify, elems, values, get, ifElse, toFunction, choose, zero, setOp, modifyOp, Identity, traverse, setter, set, optional, branchOr, Constant, lazy } from 'partial.lenses';

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

var P = Promise;

var throwAsync = /*#__PURE__*/P.reject.bind(P);
var returnAsync = /*#__PURE__*/P.resolve.bind(P);

var chain = function chain(xyP, xP) {
  return null != xP && isFunction(xP.then) ? xP.then(xyP) : xyP(xP);
};

var Async = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : freeze)({
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
});

//

var unique = {};

var uniqueToUndefined = function uniqueToUndefined(x) {
  return x === unique ? undefined : x;
};
var undefinedToUnique = function undefinedToUnique(y) {
  return undefined !== y ? y : unique;
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
  return r = get(k, r), undefined !== r ? r : get(k, x);
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

var raised = unique;

function rejectRaisedOr(M, x) {
  var r = raised;
  if (r === unique) r = x;else raised = unique;
  return M.of(rejected(r));
}

var protect = function protect(predicate, orElse) {
  return function (x, i) {
    try {
      return predicate(x, i);
    } catch (e) {
      raised = e;
      return orElse;
    }
  };
};

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

//

var casesOfDefault = /*#__PURE__*/always(reject);
var casesOfCase = function casesOfCase(p, o$$1, r) {
  return function (y, j) {
    return function (x, i, M, xi2yM) {
      return M.chain(function (b) {
        return b ? o$$1(x, i, M, xi2yM) : undefined !== b || raised === unique ? r(y, j)(x, i, M, xi2yM) : rejectRaisedOr(M, x);
      }, p(y, j));
    };
  };
};

//

var ruleBinOp = function ruleBinOp(op) {
  return curryN(2, function (l) {
    return l = toRule(l), function (r) {
      return r = toRule(r), op(l, r);
    };
  });
};

//

var upgradesCase = function upgradesCase(revalidate) {
  return function (c) {
    return length(c) === 3 ? [c[0], both$1(modifyAfter(c[1], c[2]), revalidate)] : c;
  };
};

// General

var run = /*#__PURE__*/curryN(3, function (c) {
  var M = c.Monad || Identity;
  var onAccept = c.onAccept || id;
  var onReject = c.onReject || raise;
  var handler = function handler(r) {
    return isRejected(r) ? onReject(value(r)) : onAccept(r);
  };
  return function (rule) {
    return rule = toRule(rule), function (data) {
      return M.chain(handler, traverse(M, id, rule, data));
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

// Predicates

var where = function where(predicate) {
  return predicate = protect(predicate), function (x, i, M, _xi2yM) {
    return M.chain(function (b) {
      return b ? M.of(x) : rejectRaisedOr(M, x);
    }, predicate(x, i));
  };
};

// Elaboration

var modifyError = /*#__PURE__*/curry(function (fn, rule) {
  return rule = toRule(rule), function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? M.map(rejected, fn(x, value(r), i)) : M.of(r);
    }, rule(x, i, M, xi2yM));
  };
});

var setError = /*#__PURE__*/curry(function (error, rule) {
  return compose([rewrite(function (r) {
    return isRejected(r) ? rejected(error) : r;
  }), rule]);
});

// Transformation

var modifyAfter = /*#__PURE__*/curryN(2, function (rule) {
  return o(both$1(rule), acceptWith);
});
var setAfter = /*#__PURE__*/curryN(2, function (rule) {
  return o(both$1(rule), acceptAs);
});
var removeAfter = function removeAfter(rule) {
  return both$1(rule, remove);
};

// Logical

var both$1 = /*#__PURE__*/ruleBinOp(function (rule, rest) {
  return function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? M.of(r) : rest(r, i, M, xi2yM);
    }, rule(x, i, M, xi2yM));
  };
});

var and = /*#__PURE__*/sumRight(accept, toRule, both$1);

var not = function not(rule) {
  return compose([setter(function (r, x) {
    return isRejected(r) ? x : rejected(x);
  }), rule]);
};

var either = /*#__PURE__*/ruleBinOp(function (rule, rest) {
  return function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? rest(x, i, M, xi2yM) : M.of(r);
    }, rule(x, i, M, xi2yM));
  };
});

var or = /*#__PURE__*/sumRight(reject, toRule, either);

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

// Dependent

var choose$1 = function choose$$1(xi2r) {
  return xi2r = protect(xi2r), function (x, i, M, xi2yM) {
    return M.chain(function (r) {
      return r ? toRule(r)(x, i, M, xi2yM) : rejectRaisedOr(M, x);
    }, xi2r(x, i));
  };
};

// Conditional

var cases = /*#__PURE__*/sumRight(reject, /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : validate(freeFn(tuple(or(tuple(accept), tuple(isFunction, accept)), accept), accept)))(function (alt, rest) {
  return length(alt) === 1 ? alt[0] : ifElse$1(alt[0], alt[1], rest);
}), /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : validate(freeFn(tuple(tuple(isFunction, accept), accept), accept)))(function (alt, rest) {
  return ifElse$1(alt[0], alt[1], rest);
}));

var ifElse$1 = /*#__PURE__*/curry(function (p, c, a) {
  return p = protect(p), c = toRule(c), a = toRule(a), function (x, i, M, xi2yM) {
    return M.chain(function (b) {
      return b ? c(x, i, M, xi2yM) : undefined !== b || raised === unique ? a(x, i, M, xi2yM) : rejectRaisedOr(M, x);
    }, p(x, i));
  };
});

var casesOf = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : validate(modifyAfter(freeFn(choose$1(function (args) {
  var last = length(args) - 1;
  return tupleOr({
    less: false,
    rest: ifElse$1(function (_, i) {
      return i === last;
    }, or(tuple(accept), tuple(isFunction, accept)), tuple(isFunction, accept))
  })(accept);
}), accept), function (fn) {
  return function (lens) {
    for (var _len2 = arguments.length, cases = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      cases[_key2 - 1] = arguments[_key2];
    }

    return fn.apply(undefined, [lens].concat(cases));
  };
})))(function (lens) {
  lens = toFunction(lens);
  var n = arguments.length;
  var op = casesOfDefault;
  while (--n) {
    var c = arguments[n];
    op = length(c) !== 1 ? casesOfCase(protect(c[0]), toRule(c[1]), op) : always(toRule(c[0]));
  }
  return function (x, i, M, xi2yM) {
    return lens(x, i, Constant, op)(x, i, M, xi2yM);
  };
});

// Recursive

var lazy$1 = /*#__PURE__*/o(lazy, /*#__PURE__*/o(toRule));

// Promotion

var promote = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : validate(freeFn([function (xs) {
  return length(xs) === 0 || xs.every(function (c) {
    return isArray(c) && 1 <= length(c) && length(c) <= 2;
  }) && xs.some(function (c) {
    return length(c) < 2;
  });
}, '`promote` given an invalid set of cases'], accept)))(function () {
  for (var _len3 = arguments.length, cs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    cs[_key3] = arguments[_key3];
  }

  return lazy$1(function (rec) {
    return or.apply(null, cs.map(function (c) {
      return length(c) === 2 ? both$1(modifyAfter(c[0], c[1]), rec) : c[0];
    }));
  });
});

var upgrades = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : validate(freeFn([function (xs) {
  return length(xs) === 0 || xs.every(function (c) {
    return isArray(c) && 1 <= length(c) && length(c) <= 3;
  }) && xs.some(function (c) {
    return length(c) < 3;
  });
}, '`upgrades` given an invalid set of cases'], accept)))(function () {
  for (var _len4 = arguments.length, cs = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    cs[_key4] = arguments[_key4];
  }

  return lazy$1(function (rec) {
    return cases.apply(null, cs.map(upgradesCase(rec)));
  });
});

var upgradesOf = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : validate(freeFn([function (xs) {
  return length(xs) === 1 || xs.slice(1).every(function (c) {
    return isArray(c) && 1 <= length(c) && length(c) <= 3;
  }) && xs.slice(1).some(function (c) {
    return length(c) < 3;
  });
}, '`upgradesOf` given an invalid set of cases'], accept)))(function (lens) {
  for (var _len5 = arguments.length, cs = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    cs[_key5 - 1] = arguments[_key5];
  }

  return lazy$1(function (rec) {
    return casesOf.apply(null, [lens].concat(cs.map(upgradesCase(rec))));
  });
});

export { accept, acceptAs, acceptWith, rejectWith, rejectAs, reject, remove, run, accepts, errors, validate, acceptsAsync, errorsAsync, tryValidateAsyncNow, validateAsync, where, modifyError, setError, modifyAfter, setAfter, removeAfter, both$1 as both, and, not, either, or, arrayId, arrayIx, args, tuple, dependentFn, freeFn, keep, optional$1 as optional, propsOr, props, choose$1 as choose, cases, ifElse$1 as ifElse, casesOf, lazy$1 as lazy, promote, upgrades, upgradesOf };
