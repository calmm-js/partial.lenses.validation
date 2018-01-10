'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var L = require('partial.lenses');
var I = require('infestines');

var header = 'partial.lenses.validation: ';
function error(msg) {
  throw Error(header + msg);
}

var isNull = function isNull(x) {
  return x === null;
};

var defaultsArray = /*#__PURE__*/L.defaults([]);
var requiredNull = /*#__PURE__*/L.required(null);

var removeIfAllNull = /*#__PURE__*/L.rewrite(function (xs) {
  return L.all(isNull, L.elems, xs) ? undefined : xs;
});

var accept = L.removeOp;
var reject = L.setOp;

var object = /*#__PURE__*/I.curry(function (propsToKeep, template) {
  var keys$$1 = I.keys(template);
  var keep = propsToKeep.length ? propsToKeep.concat(keys$$1) : keys$$1;
  return L.toFunction([L.removable.apply(null, keys$$1), L.rewrite(L.get(L.props.apply(null, keep))), L.branch(template)]);
});

var warnNonArrays = function warnNonArrays(msg) {
  return function (fn) {
    return function (rules) {
      rules = fn(rules);
      return L.choose(function (x) {
        if (!I.isArray(x) && !fn.warned) {
          fn.warned = 1;
          console.warn(header + msg);
        }
        return rules;
      });
    };
  };
};

var arrayIx = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? I.id : warnNonArrays('Currently `arrayIx` accepts non-array like objects, but in v0.2.0 it rejects them with `[]`'))(function (rules) {
  return L.toFunction([removeIfAllNull, L.elems, requiredNull, rules]);
});

var arrayId = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? I.id : warnNonArrays('Currently `arrayId` ignores non-array like objects, but in v0.2.0 it rejects them with `[]`'))(function (rules) {
  return L.toFunction([defaultsArray, L.elems, rules]);
});

var pargs = function pargs(name, fn) {
  return (process.env.NODE_ENV === 'production' ? I.id : function (fn) {
    return function () {
      var n = arguments.length;
      if (n) {
        if (I.isArray(arguments[0])) {
          for (var i = 0; i < n; ++i) {
            var c = arguments[i];
            if (!I.isArray(c) || c.length !== 2) error(name + ' must be given pairs arguments.');
          }
        } else {
          if (!pargs[name]) {
            pargs[name] = 1;
            console.warn(header + '`' + name + '` now expects pairs as arguments: call as `' + name + '([p1, x1], ..., [pN, xN])` instead of `' + name + '(p1, x1, ..., pM, xN)`.  Support for unpaired arguments will be removed in v0.2.0.');
          }
          if (n & 1) error(name + ' must be given an even number of arguments.');
        }
      }
      return fn.apply(null, arguments);
    };
  })(function () {
    var r = accept,
        n = arguments.length;
    if (n) {
      if (I.isArray(arguments[0])) {
        do {
          var c = arguments[--n];
          r = fn(c[0], c[1], r);
        } while (n);
      } else {
        do {
          n -= 2;
          r = fn(arguments[n], arguments[n + 1], r);
        } while (n);
      }
    }
    return r;
  });
};

var cases = /*#__PURE__*/pargs('cases', L.ifElse);
var unless = /*#__PURE__*/pargs('unless', function (c, a, r) {
  return L.ifElse(c, r, reject(a));
});

var optional$1 = function optional$$1(rules) {
  return L.toFunction([L.optional, rules]);
};

var validate = L.transform;

exports.accept = accept;
exports.reject = reject;
exports.object = object;
exports.arrayIx = arrayIx;
exports.arrayId = arrayId;
exports.cases = cases;
exports.unless = unless;
exports.optional = optional$1;
exports.validate = validate;
exports.choose = L.choose;
