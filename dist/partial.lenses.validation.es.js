import { all, branch, choose, defaults, elems, get, ifElse, optional, props, removable, removeOp, required, rewrite, setOp, toFunction, transform } from 'partial.lenses';
import { curry, id, isArray, keys } from 'infestines';

var header = 'partial.lenses.validation: ';
function error(msg) {
  throw Error(header + msg);
}

var isNull = function isNull(x) {
  return x === null;
};

var defaultsArray = /*#__PURE__*/defaults([]);
var requiredNull = /*#__PURE__*/required(null);

var removeIfAllNull = /*#__PURE__*/rewrite(function (xs) {
  return all(isNull, elems, xs) ? undefined : xs;
});

var accept = removeOp;
var reject = setOp;

var object = /*#__PURE__*/curry(function (propsToKeep, template) {
  var keys$$1 = keys(template);
  var keep = propsToKeep.length ? propsToKeep.concat(keys$$1) : keys$$1;
  return toFunction([removable.apply(null, keys$$1), rewrite(get(props.apply(null, keep))), branch(template)]);
});

var warnNonArrays = function warnNonArrays(msg) {
  return function (fn) {
    return function (rules) {
      rules = fn(rules);
      return choose(function (x) {
        if (!isArray(x) && !fn.warned) {
          fn.warned = 1;
          console.warn(header + msg);
        }
        return rules;
      });
    };
  };
};

var arrayIx = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : warnNonArrays('Currently `arrayIx` accepts non-array like objects, but in v0.2.0 it rejects them with `[]`'))(function (rules) {
  return toFunction([removeIfAllNull, elems, requiredNull, rules]);
});

var arrayId = /*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : warnNonArrays('Currently `arrayId` ignores non-array like objects, but in v0.2.0 it rejects them with `[]`'))(function (rules) {
  return toFunction([defaultsArray, elems, rules]);
});

var pargs = function pargs(name, fn) {
  return (process.env.NODE_ENV === 'production' ? id : function (fn) {
    return function () {
      var n = arguments.length;
      if (n) {
        if (isArray(arguments[0])) {
          for (var i = 0; i < n; ++i) {
            var c = arguments[i];
            if (!isArray(c) || c.length !== 2) error(name + ' must be given pairs arguments.');
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
      if (isArray(arguments[0])) {
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

var cases = /*#__PURE__*/pargs('cases', ifElse);
var unless = /*#__PURE__*/pargs('unless', function (c, a, r) {
  return ifElse(c, r, reject(a));
});

var optional$1 = function optional$$1(rules) {
  return toFunction([optional, rules]);
};

var validate = transform;

export { accept, reject, object, arrayIx, arrayId, cases, unless, optional$1 as optional, validate };
export { choose } from 'partial.lenses';
