(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('partial.lenses'), require('infestines')) :
	typeof define === 'function' && define.amd ? define(['exports', 'partial.lenses', 'infestines'], factory) :
	(factory((global.V = {}),global.L,global.I));
}(this, (function (exports,L,I) { 'use strict';

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

var rejectArray = /*#__PURE__*/reject([]);

var objectWith = /*#__PURE__*/I.curry(function (onOthers, propsToKeep, template) {
  onOthers = L.toFunction(onOthers);
  var op = {};
  var n = propsToKeep && propsToKeep.length;
  var toKeep = n ? {} : I.object0;
  for (var i = 0; i < n; ++i) {
    var k = propsToKeep[i];
    op[k] = L.zero;
    toKeep[k] = 1;
  }
  for (var _k in template) {
    op[_k] = L.toFunction(template[_k]);
  }var min = {};
  for (var _k2 in template) {
    min[_k2] = undefined;
  }return L.toFunction([function (x, i, C, xi2yC) {
    return C.map(function (o) {
      for (var _k3 in o) {
        if (undefined === toKeep[_k3]) return o;
      }
    }, xi2yC(I.assign({}, min, x, i)));
  }, L.values, function (x, i, C, xi2yC) {
    return (op[i] || onOthers)(x, i, C, xi2yC);
  }]);
});

var object = /*#__PURE__*/objectWith(accept);

var arrayIxOr = /*#__PURE__*/I.curry(function (onOther, rules) {
  return L.ifElse(I.isArray, [removeIfAllNull, L.elems, requiredNull, rules], onOther);
});

var arrayIx = /*#__PURE__*/arrayIxOr(rejectArray);

var arrayIdOr = /*#__PURE__*/I.curry(function (onOther, rules) {
  return L.ifElse(I.isArray, [defaultsArray, L.elems, rules], onOther);
});

var arrayId = /*#__PURE__*/arrayIdOr(rejectArray);

var pargs = function pargs(name, fn) {
  return (function (fn) {
    return function () {
      for (var i = 0, n = arguments.length; i < n; ++i) {
        var c = arguments[i];
        if (!I.isArray(c) || c.length !== 2) error(name + ' must be given pairs arguments.');
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
exports.objectWith = objectWith;
exports.object = object;
exports.arrayIxOr = arrayIxOr;
exports.arrayIx = arrayIx;
exports.arrayIdOr = arrayIdOr;
exports.arrayId = arrayId;
exports.cases = cases;
exports.unless = unless;
exports.optional = optional$1;
exports.validate = validate;
exports.choose = L.choose;

Object.defineProperty(exports, '__esModule', { value: true });

})));
