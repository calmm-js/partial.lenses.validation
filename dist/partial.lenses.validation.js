(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('partial.lenses'), require('infestines')) :
	typeof define === 'function' && define.amd ? define(['exports', 'partial.lenses', 'infestines'], factory) :
	(factory((global.V = {}),global.L,global.I));
}(this, (function (exports,L,I) { 'use strict';

var header = 'partial.lenses.validation: ';
var error = function error(msg) {
  throw Error(header + msg);
};

var object = /*#__PURE__*/I.curry(function (propsToKeep, template) {
  var keys$$1 = I.keys(template);
  var keep = propsToKeep.length ? propsToKeep.concat(keys$$1) : keys$$1;
  return L.toFunction([L.removable.apply(null, keys$$1), L.rewrite(L.get(L.props.apply(null, keep))), L.branch(template)]);
});

var isNull = function isNull(x) {
  return x === null;
};
var removeIfAllNull = function removeIfAllNull(xs) {
  return L.all(isNull, L.elems, xs) ? undefined : xs;
};

var arrayIx = function arrayIx(r) {
  return L.toFunction([L.iso(I.id, removeIfAllNull), L.elems, L.required(null), r]);
};

var arrayId = function arrayId(r) {
  return L.toFunction([L.defaults([]), L.elems, r]);
};

var pargs = function pargs(name, fn) {
  return (function (fn) {
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

var accept = L.removeOp;
var reject = L.setOp;
var validate = L.transform;

exports.object = object;
exports.arrayIx = arrayIx;
exports.arrayId = arrayId;
exports.cases = cases;
exports.unless = unless;
exports.optional = optional$1;
exports.accept = accept;
exports.reject = reject;
exports.validate = validate;
exports.choose = L.choose;

Object.defineProperty(exports, '__esModule', { value: true });

})));
