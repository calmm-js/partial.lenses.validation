import { all, branch, defaults, elems, get, ifElse, iso, props, removable, removeOp, required, rewrite, setOp, toFunction, transform } from 'partial.lenses';
import { curry, id, keys } from 'infestines';

var object = /*#__PURE__*/curry(function (propsToKeep, template) {
  var keys$$1 = keys(template);
  var keep = propsToKeep.length ? propsToKeep.concat(keys$$1) : keys$$1;
  return toFunction([removable.apply(null, keys$$1), rewrite(get(props.apply(null, keep))), branch(template)]);
});

var isNull = function isNull(x) {
  return x === null;
};
var removeIfAllNull = function removeIfAllNull(xs) {
  return all(isNull, elems, xs) ? undefined : xs;
};

var arrayIx = function arrayIx(r) {
  return toFunction([iso(id, removeIfAllNull), elems, required(null), r]);
};

var arrayId = function arrayId(r) {
  return toFunction([defaults([]), elems, r]);
};

var pargs = function pargs(name, fn) {
  return (/*#__PURE__*/(process.env.NODE_ENV === 'production' ? id : function (fn) {
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

var cases = /*#__PURE__*/pargs('cases', ifElse);
var unless = /*#__PURE__*/pargs('unless', function (c, a, r) {
  return ifElse(c, r, reject(a));
});

var accept = removeOp;
var reject = setOp;
var validate = transform;

export { object, arrayIx, arrayId, cases, unless, accept, reject, validate };
export { choose } from 'partial.lenses';
