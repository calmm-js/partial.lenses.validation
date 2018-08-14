'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var I = require('infestines');
var L = require('partial.lenses');

var isThenable = function isThenable(x) {
  return null != x && I.isFunction(x.then);
};

var length = function length(x) {
  return x.length;
};

var lte = /*#__PURE__*/I.curry(function (l, r) {
  return l <= r;
});
var gte = /*#__PURE__*/I.curry(function (l, r) {
  return l >= r;
});
var identical = /*#__PURE__*/I.curry(I.identicalU);

var isInstanceOf = /*#__PURE__*/I.curry(function (Class, x) {
  return x instanceof Class;
});
var isInstanceOfObject = /*#__PURE__*/isInstanceOf(Object);

var isBoolean = function isBoolean(x) {
  return typeof x === 'boolean';
};

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

var copyName = process.env.NODE_ENV === 'production' ? function (x) {
  return x;
} : function (to, from) {
  return I.defineNameU(to, from.name);
};

//

var throwAsync = function throwAsync(x) {
  return Promise.reject(x);
};
var returnAsync = function returnAsync(x) {
  return Promise.resolve(x);
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
  return r = L.get(k, r), undefined !== r ? r : L.get(k, x);
};

var sumRight = function sumRight(zero, one, plus) {
  return copyName(function () {
    var n = arguments.length;
    var r = zero;
    if (n) {
      r = one(arguments[--n], r);
      while (n) {
        r = plus(arguments[--n], r);
      }
    }
    return r;
  }, plus);
};

//

var toRule = function toRule(rule) {
  if (I.isFunction(rule)) {
    return length(rule) < 3 ? where(rule) : rule;
  } else {
    var error = rule[1];
    return I.isFunction(error) ? modifyError(error, rule[0]) : setError(error, rule[0]);
  }
};

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
  return rest = toRule(rest), function tupleOr() {
    var n = arguments.length;
    var rules = Array(n);
    for (var i = 0; i < n; ++i) {
      rules[i] = toRule(arguments[i]);
    }return andCompose(less ? I.isArray : both(I.isArray, o(lte(n), length)), [arrayIxTrickle, less ? function (xs, i, M, xi2yM) {
      var m = length(xs);
      if (m < n) {
        xs = xs.slice();
        xs.length = n;
        return M.map(function (ys) {
          return L.any(isRejected, L.elems, ys) ? ys : ys.slice(0, m);
        }, L.elemsTotal(xs, i, M, xi2yM));
      } else {
        return L.elemsTotal(xs, i, M, xi2yM);
      }
    } : L.elemsTotal, L.choose(function (_, i) {
      return rules[i] || rest;
    })]);
  };
};

var runWith = function runWith(Monad, onAccept, onReject) {
  return run({ Monad: Monad, onAccept: onAccept, onReject: onReject });
};

//

var unique = {};

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

var accept = L.zero;

var acceptAs = function acceptAs(value) {
  return function acceptAs(x, i, M, xi2yM) {
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
  return function rejectWith(x, i, M, _xi2yM) {
    return M.map(rejected, fn(x, i));
  };
};

var rejectAs = /*#__PURE__*/o(L.setOp, rejected);

var reject = /*#__PURE__*/L.modifyOp(rejected);

var remove = /*#__PURE__*/acceptAs(undefined);

//

var ruleBinOp = function ruleBinOp(op) {
  return I.curryN(2, copyName(function (l) {
    return l = toRule(l), function (r) {
      return r = toRule(r), op(l, r);
    };
  }, op));
};

//

var upgradesCase = function upgradesCase(revalidate) {
  return function (c) {
    return length(c) === 3 ? [c[0], both$1(modifyAfter(c[1], c[2]), revalidate)] : c;
  };
};

// General

var run = /*#__PURE__*/I.curryN(3, function run(c) {
  var M = c.Monad || L.Identity;
  var onAccept = c.onAccept || I.id;
  var onReject = c.onReject || raise;
  var handler = function handler(r) {
    return isRejected(r) ? onReject(value(r)) : onAccept(r);
  };
  return function run(rule) {
    rule = toRule(rule);
    return function run(data) {
      return M.chain(handler, L.traverse(M, I.id, rule, data));
    };
  };
});

// Synchronous

var accepts = /*#__PURE__*/runWith(0, /*#__PURE__*/I.always(true), /*#__PURE__*/I.always(false));

var errors = /*#__PURE__*/runWith(0, ignore, I.id);

var validate = /*#__PURE__*/runWith();

// Asynchronous

var acceptsAsync = /*#__PURE__*/runWith(L.IdentityAsync, /*#__PURE__*/I.always( /*#__PURE__*/returnAsync(true)), /*#__PURE__*/I.always( /*#__PURE__*/returnAsync(false)));

var errorsAsync = /*#__PURE__*/runWith(L.IdentityAsync, /*#__PURE__*/I.always( /*#__PURE__*/returnAsync()), returnAsync);

var tryValidateAsyncNow = /*#__PURE__*/runWith(L.IdentityAsync, 0, /*#__PURE__*/o(raise, toError));

var validateAsync = /*#__PURE__*/runWith(L.IdentityAsync, returnAsync, /*#__PURE__*/o(throwAsync, toError));

// Predicates

var where = function where(predicate) {
  return predicate = protect(predicate), function (x, i, M, _xi2yM) {
    return M.chain(function (b) {
      return b ? M.of(x) : rejectRaisedOr(M, x);
    }, predicate(x, i));
  };
};

// Elaboration

var modifyError = /*#__PURE__*/I.curry(function modifyError(fn, rule) {
  rule = toRule(rule);
  return function modifyError(x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? M.map(rejected, fn(x, value(r), i)) : M.of(r);
    }, rule(x, i, M, xi2yM));
  };
});

var setError = /*#__PURE__*/I.curry(function setError(error, rule) {
  return compose([L.rewrite(function (r) {
    return isRejected(r) ? rejected(error) : r;
  }), rule]);
});

// Ad-hoc

var modifyAfter = /*#__PURE__*/I.curryN(2, function modifyAfter(rule) {
  return o(both$1(rule), acceptWith);
});
var setAfter = /*#__PURE__*/I.curryN(2, function setAfter(rule) {
  return o(both$1(rule), acceptAs);
});
var removeAfter = function removeAfter(rule) {
  return both$1(rule, remove);
};

// Logical

var both$1 = /*#__PURE__*/ruleBinOp(function both$$1(rule, rest) {
  return function both$$1(x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? M.of(r) : rest(r, i, M, xi2yM);
    }, rule(x, i, M, xi2yM));
  };
});

var and = /*#__PURE__*/sumRight(accept, toRule, both$1);

var not = function not(rule) {
  return compose([L.setter(function (r, x) {
    return isRejected(r) ? x : rejected(x);
  }), rule]);
};

var either = /*#__PURE__*/ruleBinOp(function either(rule, rest) {
  return function either(x, i, M, xi2yM) {
    return M.chain(function (r) {
      return isRejected(r) ? rest(x, i, M, xi2yM) : M.of(r);
    }, rule(x, i, M, xi2yM));
  };
});

var or = /*#__PURE__*/sumRight(reject, toRule, either);

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

var dependentFn = /*#__PURE__*/I.curry(function dependentFn(argsRule, toResRule) {
  argsRule = toRule(argsRule);
  return function (fn, i, M, _xi2yM) {
    return M.of(I.isFunction(fn) ? copyName(function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return M.chain(function (args) {
        return isRejected(args) ? raise(toError(value(args))) : M.chain(function (res) {
          return M.map(raiseRejected, L.traverse(M, I.id, toRule(toResRule.apply(null, args)), res));
        }, fn.apply(null, args));
      }, L.traverse(M, I.id, argsRule, args));
    }, fn) : rejected(fn));
  };
});

var freeFn = /*#__PURE__*/I.curry(function freeFn(argsRule, resRule) {
  return dependentFn(argsRule, I.always(resRule));
});

// Objects

var keep = /*#__PURE__*/I.curry(function keep(key, rule) {
  return andCompose(isInstanceOfObject, [L.setter(function (r, x) {
    return isRejected(r) ? rejected(L.set(key, getEither(key, value(r), x), value(r))) : r;
  }), rule]);
});

var optional = function optional(rule) {
  return compose([L.optional, rule]);
};

var propsOr = /*#__PURE__*/I.curry(function propsOr(onOthers, template) {
  return andCompose(isInstanceOfObject, [propsTrickle, L.branchOr(toRule(onOthers), L.modify(L.values, toRule, template))]);
});

var props = /*#__PURE__*/propsOr(reject);

// Dependent

var choose = function choose(xi2r) {
  return xi2r = protect(xi2r), copyName(function (x, i, M, xi2yM) {
    var r = xi2r(x, i);
    return r ? toRule(r)(x, i, M, xi2yM) : rejectRaisedOr(M, x);
  }, xi2r);
};

// Conditional

var cases = /*#__PURE__*/sumRight(reject, function (alt, rest) {
  return length(alt) === 1 ? alt[0] : ifElse(alt[0], alt[1], rest);
}, function cases(alt, rest) {
  return ifElse(alt[0], alt[1], rest);
});

var ifElse = /*#__PURE__*/I.curry(function ifElse(p, c, a) {
  p = protect(p);
  c = toRule(c);
  a = toRule(a);
  return function ifElse(x, i, M, xi2yM) {
    var b = p(x, i);
    return b ? c(x, i, M, xi2yM) : undefined !== b || raised === unique ? a(x, i, M, xi2yM) : rejectRaisedOr(M, x);
  };
});

function casesOf(of) {
  of = L.toFunction(of);

  var n = arguments.length - 1;
  if (!n) return reject;

  var def = arguments[n];
  if (def.length === 1) {
    --n;
    def = toRule(def[0]);
  } else {
    def = reject;
  }

  var ps = Array(n);
  var os = Array(n + 1);
  for (var i = 0; i < n; ++i) {
    var c = arguments[i + 1];
    ps[i] = protect(c[0]);
    os[i] = toRule(c[1]);
  }
  os[n] = def;

  return function casesOf(x, i, M, xi2yM) {
    var min = n;
    var r = of(x, i, L.Select, function (y, j) {
      for (var _i = 0; _i < min; ++_i) {
        var b = ps[_i](y, j);
        if (b) {
          min = _i;
          if (_i === 0) return 0;else break;
        } else if (undefined === b && raised !== unique) {
          var _r = raised;
          raised = unique;
          return M.of(rejected(_r));
        }
      }
    });
    return r ? r : os[min](x, i, M, xi2yM);
  };
}

// Recursive

var lazy = /*#__PURE__*/o(L.lazy, /*#__PURE__*/o(toRule));

// Promotion

var promote = function promote() {
  for (var _len2 = arguments.length, cs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    cs[_key2] = arguments[_key2];
  }

  return lazy(function (rec) {
    return or.apply(null, cs.map(function (c) {
      return length(c) === 2 ? both$1(modifyAfter(c[0], c[1]), rec) : c[0];
    }));
  });
};

var upgrades = function upgrades() {
  for (var _len3 = arguments.length, cs = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    cs[_key3] = arguments[_key3];
  }

  return lazy(function (rec) {
    return cases.apply(null, cs.map(upgradesCase(rec)));
  });
};

var upgradesOf = function upgradesOf(of) {
  for (var _len4 = arguments.length, cs = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    cs[_key4 - 1] = arguments[_key4];
  }

  return lazy(function (rec) {
    return casesOf.apply(null, [of].concat(cs.map(upgradesCase(rec))));
  });
};

// Contract helpers

var any = accept;

var thenable = function thenable(t) {
  return modifyAfter(isThenable, function (p) {
    return p.then(validate(t));
  });
};

var monad = /*#__PURE__*/propsOr(accept, {
  map: I.isFunction,
  ap: I.isFunction,
  of: I.isFunction,
  chain: I.isFunction
});

var fn = [I.isFunction, function (x) {
  return 'Expected function, but got ' + x;
}];

var fnMaxN = function fnMaxN(n) {
  return and(fn, [o(gte(n), length), function (x) {
    return 'Expected function of max arity ' + n + ', but got arity ' + length(x);
  }]);
};

var fnN = function fnN(n) {
  return and(fn, [o(identical(n), length), function (x) {
    return 'Expected function of arity ' + n + ', but got arity ' + length(x);
  }]);
};

var runCallback = /*#__PURE__*/fnMaxN(1);
var predicateFn = /*#__PURE__*/fnMaxN(2);
var transformFn = /*#__PURE__*/fnMaxN(2);
var errorTransformFn = /*#__PURE__*/fnMaxN(3);
var opticFn = /*#__PURE__*/fnN(4);

var rule = /*#__PURE__*/lazy(function (rule) {
  return or(predicateFn, opticFn, tuple(rule, accept));
});

var traversal = /*#__PURE__*/lazy(function (traversal) {
  return or(I.isString, I.isNumber, transformFn, opticFn, arrayIx(traversal));
});

var tagError = function tagError(tag, rule) {
  return modifyError(function (_, e) {
    return [tag, e];
  }, rule);
};

var tagArgs = function tagArgs(name, rule) {
  return tagError('partial.lenses.validation: `' + name + '` given invalid arguments', rule);
};

var curriedFn = function curriedFn(name, ps, r) {
  return choose(function (fn) {
    return modifyAfter(freeFn(tagArgs(name, tuple.apply(null, ps)), r), function (f) {
      return I.arityN(length(fn), f);
    });
  });
};

var fml = function fml(firsts, middle, lasts) {
  return choose(function (xs) {
    return arrayIx(casesOf.apply(null, [I.sndU].concat(firsts.map(function (rule, i) {
      return [identical(i), rule];
    }), lasts.map(function (rule, i) {
      return [identical(length(xs) - length(lasts) + i), rule];
    }), [[middle]])));
  });
};

var variadicFn1 = function variadicFn1(fn) {
  return copyName(function (x) {
    for (var _len = arguments.length, xs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      xs[_key - 1] = arguments[_key];
    }

    return fn.apply(undefined, [x].concat(xs));
  }, fn);
};

var caseR = /*#__PURE__*/tuple(rule);
var casePR = /*#__PURE__*/tuple(predicateFn, rule);
var caseRT = /*#__PURE__*/tuple(rule, transformFn);
var casePRT = /*#__PURE__*/tuple(predicateFn, rule, transformFn);

var caseR_casePR = /*#__PURE__*/or(caseR, casePR);
var caseR_caseRT = /*#__PURE__*/or(caseR, caseRT);
var casePR_casePRT = /*#__PURE__*/or(casePR, casePRT);

var C = process.env.NODE_ENV === 'production' ? function (x) {
  return x;
} : function (x, c) {
  return validate(c, x);
};

// Primitive

var accept$1 = /*#__PURE__*/C(accept, rule);

var acceptAs$1 = /*#__PURE__*/C(acceptAs, /*#__PURE__*/curriedFn('acceptAs', [any], rule));

var acceptWith$1 = /*#__PURE__*/C(acceptWith, /*#__PURE__*/curriedFn('acceptWith', [transformFn], rule));

var rejectWith$1 = /*#__PURE__*/C(rejectWith, /*#__PURE__*/curriedFn('rejectWith', [transformFn], rule));

var rejectAs$1 = /*#__PURE__*/C(rejectAs, /*#__PURE__*/curriedFn('rejectAs', [any], rule));

var reject$1 = /*#__PURE__*/C(reject, rule);

var remove$1 = /*#__PURE__*/C(remove, rule);

// General

var run$1 = /*#__PURE__*/C(run, /*#__PURE__*/curriedFn('run', [/*#__PURE__*/props({
  monad: /*#__PURE__*/optional(monad),
  onAccept: /*#__PURE__*/optional(runCallback),
  onReject: /*#__PURE__*/optional(runCallback)
}), rule, any], any));

// Synchronous

var accepts$1 = /*#__PURE__*/C(accepts, /*#__PURE__*/curriedFn('accepts', [rule, any], isBoolean));

var errors$1 = /*#__PURE__*/C(errors, /*#__PURE__*/curriedFn('errors', [rule, any], any));

var validate$1 = /*#__PURE__*/C(validate, /*#__PURE__*/curriedFn('validate', [rule, any], any));

// Asynchronous

var acceptsAsync$1 = /*#__PURE__*/C(acceptsAsync, /*#__PURE__*/curriedFn('acceptsAsync', [rule, any], /*#__PURE__*/thenable(isBoolean)));

var errorsAsync$1 = /*#__PURE__*/C(errorsAsync, /*#__PURE__*/curriedFn('errorsAsync', [rule, any], isThenable));

var tryValidateAsyncNow$1 = /*#__PURE__*/C(tryValidateAsyncNow, /*#__PURE__*/curriedFn('tryValidateAsyncNow', [rule, any], any));

var validateAsync$1 = /*#__PURE__*/C(validateAsync, /*#__PURE__*/curriedFn('validateAsync', [rule, any], isThenable));

// Predicates

var where$1 = /*#__PURE__*/C(where, /*#__PURE__*/curriedFn('where', [predicateFn], rule));

// Elaboration

var modifyError$1 = /*#__PURE__*/C(modifyError, /*#__PURE__*/curriedFn('modifyError', [errorTransformFn, rule], rule));

var setError$1 = /*#__PURE__*/C(setError, /*#__PURE__*/curriedFn('setError', [any, rule], rule));

// Ad-hoc

var modifyAfter$1 = /*#__PURE__*/C(modifyAfter, /*#__PURE__*/curriedFn('modifyAfter', [rule, transformFn], rule));

var setAfter$1 = /*#__PURE__*/C(setAfter, /*#__PURE__*/curriedFn('setAfter', [rule, any], rule));

var removeAfter$1 = /*#__PURE__*/C(removeAfter, rule);

// Logical

var both$2 = /*#__PURE__*/C(both$1, /*#__PURE__*/curriedFn('both', [rule, rule], rule));

var and$1 = /*#__PURE__*/C(and, /*#__PURE__*/freeFn( /*#__PURE__*/tagArgs('and', /*#__PURE__*/arrayIx(rule)), rule));

var not$1 = /*#__PURE__*/C(not, /*#__PURE__*/curriedFn('not', [rule], rule));

var either$1 = /*#__PURE__*/C(either, /*#__PURE__*/curriedFn('either', [rule, rule], rule));

var or$1 = /*#__PURE__*/C(or, /*#__PURE__*/freeFn( /*#__PURE__*/tagArgs('or', /*#__PURE__*/arrayIx(rule)), rule));

// Uniform

var arrayId$1 = /*#__PURE__*/C(arrayId, /*#__PURE__*/curriedFn('arrayId', [rule], rule));

var arrayIx$1 = /*#__PURE__*/C(arrayIx, /*#__PURE__*/curriedFn('arrayIx', [rule], rule));

// Varying

var args$1 = /*#__PURE__*/C(args, /*#__PURE__*/freeFn( /*#__PURE__*/tagArgs('args', /*#__PURE__*/arrayIx(rule)), rule));

var tuple$1 = /*#__PURE__*/C(tuple, /*#__PURE__*/freeFn( /*#__PURE__*/tagArgs('tuple', /*#__PURE__*/arrayIx(rule)), rule));

// Functions

var dependentFn$1 = /*#__PURE__*/C(dependentFn, /*#__PURE__*/curriedFn('dependentFn', [rule, /*#__PURE__*/freeFn( /*#__PURE__*/arrayIx(any), rule)], rule));

var freeFn$1 = /*#__PURE__*/C(freeFn, /*#__PURE__*/curriedFn('freeFn', [rule, rule], rule));

// Objects

var keep$1 = /*#__PURE__*/C(keep, /*#__PURE__*/curriedFn('keep', [I.isString, rule], rule));

var optional$1 = /*#__PURE__*/C(optional, /*#__PURE__*/curriedFn('optional', [rule], rule));

var propsOr$1 = /*#__PURE__*/C(propsOr, /*#__PURE__*/curriedFn('propsOr', [rule, /*#__PURE__*/propsOr(rule, {})], rule));

var props$1 = /*#__PURE__*/C(props, /*#__PURE__*/curriedFn('props', [/*#__PURE__*/propsOr(rule, {})], rule));

// Dependent

var choose$1 = /*#__PURE__*/C(choose, /*#__PURE__*/curriedFn('choose', [/*#__PURE__*/freeFn( /*#__PURE__*/tuple(any, any), rule)], rule));

// Conditional

var cases$1 = /*#__PURE__*/C(cases, /*#__PURE__*/freeFn( /*#__PURE__*/tagArgs('cases', /*#__PURE__*/fml([], casePR, [caseR_casePR])), rule));

var ifElse$1 = /*#__PURE__*/C(ifElse, /*#__PURE__*/curriedFn('ifElse', [predicateFn, rule, rule], rule));

var casesOf$1 = /*#__PURE__*/C(casesOf, /*#__PURE__*/modifyAfter( /*#__PURE__*/freeFn( /*#__PURE__*/tagArgs('casesOf', /*#__PURE__*/fml([traversal], casePR, [caseR_casePR])), rule), variadicFn1));

// Recursive

var lazy$1 = /*#__PURE__*/C(lazy, /*#__PURE__*/curriedFn('lazy', [/*#__PURE__*/freeFn( /*#__PURE__*/tuple$1(rule), rule)], rule));

// Promotion

var promote$1 = /*#__PURE__*/C(promote, /*#__PURE__*/freeFn( /*#__PURE__*/tagArgs('promote', /*#__PURE__*/arrayIx(caseR_caseRT)), rule));

var upgrades$1 = /*#__PURE__*/C(upgrades, /*#__PURE__*/freeFn( /*#__PURE__*/tagArgs('upgrades', /*#__PURE__*/fml([], casePR_casePRT, [caseR_casePR])), rule));

var upgradesOf$1 = /*#__PURE__*/C(upgradesOf, /*#__PURE__*/modifyAfter( /*#__PURE__*/freeFn( /*#__PURE__*/tagArgs('upgradesOf', /*#__PURE__*/fml([traversal], casePR_casePRT, [caseR_casePR])), rule), variadicFn1));

exports.accept = accept$1;
exports.acceptAs = acceptAs$1;
exports.acceptWith = acceptWith$1;
exports.rejectWith = rejectWith$1;
exports.rejectAs = rejectAs$1;
exports.reject = reject$1;
exports.remove = remove$1;
exports.run = run$1;
exports.accepts = accepts$1;
exports.errors = errors$1;
exports.validate = validate$1;
exports.acceptsAsync = acceptsAsync$1;
exports.errorsAsync = errorsAsync$1;
exports.tryValidateAsyncNow = tryValidateAsyncNow$1;
exports.validateAsync = validateAsync$1;
exports.where = where$1;
exports.modifyError = modifyError$1;
exports.setError = setError$1;
exports.modifyAfter = modifyAfter$1;
exports.setAfter = setAfter$1;
exports.removeAfter = removeAfter$1;
exports.both = both$2;
exports.and = and$1;
exports.not = not$1;
exports.either = either$1;
exports.or = or$1;
exports.arrayId = arrayId$1;
exports.arrayIx = arrayIx$1;
exports.args = args$1;
exports.tuple = tuple$1;
exports.dependentFn = dependentFn$1;
exports.freeFn = freeFn$1;
exports.keep = keep$1;
exports.optional = optional$1;
exports.propsOr = propsOr$1;
exports.props = props$1;
exports.choose = choose$1;
exports.cases = cases$1;
exports.ifElse = ifElse$1;
exports.casesOf = casesOf$1;
exports.lazy = lazy$1;
exports.promote = promote$1;
exports.upgrades = upgrades$1;
exports.upgradesOf = upgradesOf$1;
