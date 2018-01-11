import { all, defaults, elems, ifElse, optional, removeOp, required, rewrite, setOp, toFunction, transform, values, zero } from 'partial.lenses';
import { assign, curry, id, isArray, object0 } from 'infestines';

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

var rejectArray = /*#__PURE__*/reject([]);

var objectWith = /*#__PURE__*/curry(function (onOthers, propsToKeep, template) {
  onOthers = toFunction(onOthers);
  var op = {};
  var n = propsToKeep && propsToKeep.length;
  var toKeep = n ? {} : object0;
  for (var i = 0; i < n; ++i) {
    var k = propsToKeep[i];
    op[k] = zero;
    toKeep[k] = 1;
  }
  for (var _k in template) {
    op[_k] = toFunction(template[_k]);
  }var min = {};
  for (var _k2 in template) {
    min[_k2] = undefined;
  }return toFunction([function (x, i, C, xi2yC) {
    return C.map(function (o) {
      for (var _k3 in o) {
        if (undefined === toKeep[_k3]) return o;
      }
    }, xi2yC(assign({}, min, x), i));
  }, values, function (x, i, C, xi2yC) {
    return (op[i] || onOthers)(x, i, C, xi2yC);
  }]);
});

var object = /*#__PURE__*/objectWith(accept);

var arrayIxOr = /*#__PURE__*/curry(function (onOther, rules) {
  return ifElse(isArray, [removeIfAllNull, elems, requiredNull, rules], onOther);
});

var arrayIx = /*#__PURE__*/arrayIxOr(rejectArray);

var arrayIdOr = /*#__PURE__*/curry(function (onOther, rules) {
  return ifElse(isArray, [defaultsArray, elems, rules], onOther);
});

var arrayId = /*#__PURE__*/arrayIdOr(rejectArray);

var pargs = function pargs(name, fn) {
  return (process.env.NODE_ENV === 'production' ? id : function (fn) {
    return function () {
      for (var i = 0, n = arguments.length; i < n; ++i) {
        var c = arguments[i];
        if (!isArray(c) || c.length !== 2) error(name + ' must be given pairs arguments.');
      }
      return fn.apply(null, arguments);
    };
  })(function () {
    var r = accept;
    var n = arguments.length;
    while (n) {
      var c = arguments[--n];
      r = fn(c[0], c[1], r);
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

export { accept, reject, objectWith, object, arrayIxOr, arrayIx, arrayIdOr, arrayId, cases, unless, optional$1 as optional, validate };
export { choose } from 'partial.lenses';
