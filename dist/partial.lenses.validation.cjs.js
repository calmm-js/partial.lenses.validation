'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var L = require('partial.lenses');
var I = require('infestines');

var object = /*#__PURE__*/I.curry(function (propsToKeep, template) {
  var keys$$1 = I.keys(template);
  var keep = propsToKeep.length ? propsToKeep.concat(keys$$1) : keys$$1;
  return [L.removable.apply(null, keys$$1), L.rewrite(L.get(L.props.apply(null, keep))), L.branch(template)];
});

var isNull = function isNull(x) {
  return x === null;
};
var removeIfAllNull = function removeIfAllNull(xs) {
  return L.all(isNull, L.elems, xs) ? undefined : xs;
};

var arrayIx = function arrayIx(r) {
  return [L.iso(I.id, removeIfAllNull), L.elems, L.required(null), r];
};

var arrayId = function arrayId(r) {
  return [L.defaults([]), L.elems, r];
};

var pargs = function pargs(name, fn) {
  return (/*#__PURE__*/(process.env.NODE_ENV === 'production' ? I.id : function (fn) {
      return function () {
        if (arguments.length & 1) throw Error('partial.lenses.validation: `' + name + '` must be given an even number of arguments.');
        return fn.apply(null, arguments);
      };
    })(function () {
      var r = accept,
          n = arguments.length;
      while (n) {
        n -= 2;
        r = fn(arguments[n], arguments[n + 1], r);
      }
      return r;
    })
  );
};

var cases = /*#__PURE__*/pargs('cases', L.iftes);
var unless = /*#__PURE__*/pargs('unless', function (c, a, r) {
  return L.iftes(c, r, reject(a));
});

var accept = L.removeOp;
var reject = L.setOp;
var validate = L.transform;

exports.object = object;
exports.arrayIx = arrayIx;
exports.arrayId = arrayId;
exports.cases = cases;
exports.unless = unless;
exports.accept = accept;
exports.reject = reject;
exports.validate = validate;
exports.choose = L.choose;
