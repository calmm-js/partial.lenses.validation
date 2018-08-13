import * as L from 'partial.lenses'
import * as I from './ext/infestines'

//

export const copyName =
  process.env.NODE_ENV === 'production'
    ? x => x
    : (to, from) => I.defineNameU(to, from.name)

//

const throwAsync = x => Promise.reject(x)
const returnAsync = x => Promise.resolve(x)

//

function Rejected(value) {
  this.value = undefined !== value ? value : null
}

const isRejected = I.isInstanceOf(Rejected)

const rejected = (process.env.NODE_ENV === 'production' ? I.id : I.o(I.freeze))(
  value => new Rejected(value)
)

const value = x => x.value

const fromRejected = x => (isRejected(x) ? value(x) : undefined)
const fromRejectedOrNull = x => (isRejected(x) ? value(x) : null)

//

const trickle = (optic, from) => r =>
  L.any(isRejected, optic, r) ? rejected(L.modify(optic, from, r)) : r

const arrayIxTrickle = L.rewrite(trickle(L.elems, fromRejectedOrNull))
const arrayIdTrickle = L.rewrite(trickle(L.elems, fromRejected))
const propsTrickle = L.rewrite(trickle(L.values, fromRejected))

//

function toError(errors) {
  const error = Error(JSON.stringify(errors, null, 2))
  error.errors = errors
  return error
}

function raise(errors) {
  throw toError(errors)
}

const raiseRejected = r => (isRejected(r) ? raise(toError(value(r))) : r)

//

const getEither = (k, r, x) => (
  (r = L.get(k, r)), undefined !== r ? r : L.get(k, x)
)

const sumRight = (zero, one, plus) =>
  copyName(function() {
    let n = arguments.length
    let r = zero
    if (n) {
      r = one(arguments[--n], r)
      while (n) r = plus(arguments[--n], r)
    }
    return r
  }, plus)

//

const toRule = rule => {
  if (I.isFunction(rule)) {
    return I.length(rule) < 3 ? where(rule) : rule
  } else {
    const error = rule[1]
    return I.isFunction(error)
      ? modifyError(error, rule[0])
      : setError(error, rule[0])
  }
}

const toRules = L.modify(L.elems, toRule)

//

const andCompose = (p, o) => L.ifElse(p, compose(o), reject)

const compose = I.o(L.toFunction, toRules)

//

const tupleOr = ({less, rest}) => (
  (rest = toRule(rest)),
  function tupleOr() {
    const n = arguments.length
    const rules = Array(n)
    for (let i = 0; i < n; ++i) rules[i] = toRule(arguments[i])
    return andCompose(
      less ? I.isArray : I.both(I.isArray, I.o(I.lte(n), I.length)),
      [
        arrayIxTrickle,
        less
          ? (xs, i, M, xi2yM) => {
              const m = I.length(xs)
              if (m < n) {
                xs = xs.slice()
                xs.length = n
                return M.map(
                  ys => (L.any(isRejected, L.elems, ys) ? ys : ys.slice(0, m)),
                  L.elemsTotal(xs, i, M, xi2yM)
                )
              } else {
                return L.elemsTotal(xs, i, M, xi2yM)
              }
            }
          : L.elemsTotal,
        L.choose((_, i) => rules[i] || rest)
      ]
    )
  }
)

const runWith = (Monad, onAccept, onReject) => run({Monad, onAccept, onReject})

//

const unique = {}

let raised = unique

function rejectRaisedOr(M, x) {
  let r = raised
  if (r === unique) r = x
  else raised = unique
  return M.of(rejected(r))
}

const protect = (predicate, orElse) => (x, i) => {
  try {
    return predicate(x, i)
  } catch (e) {
    raised = e
    return orElse
  }
}

// Primitive

export const accept = L.zero

export const acceptAs = value =>
  function acceptAs(x, i, M, xi2yM) {
    return xi2yM(value, i)
  }

export const acceptWith = fn => (x, i, M, xi2yM) =>
  M.chain(x => xi2yM(x, i), fn(x, i))

export const rejectWith = fn =>
  function rejectWith(x, i, M, _xi2yM) {
    return M.map(rejected, fn(x, i))
  }

export const rejectAs = I.o(L.setOp, rejected)

export const reject = L.modifyOp(rejected)

export const remove = acceptAs(undefined)

//

const ruleBinOp = op =>
  I.curryN(
    2,
    copyName(l => ((l = toRule(l)), r => ((r = toRule(r)), op(l, r))), op)
  )

//

const upgradesCase = revalidate => c =>
  I.length(c) === 3 ? [c[0], both(modifyAfter(c[1], c[2]), revalidate)] : c

// General

export const run = I.curryN(3, function run(c) {
  const M = c.Monad || L.Identity
  const onAccept = c.onAccept || I.id
  const onReject = c.onReject || raise
  const handler = r => (isRejected(r) ? onReject(value(r)) : onAccept(r))
  return function run(rule) {
    rule = toRule(rule)
    return function run(data) {
      return M.chain(handler, L.traverse(M, I.id, rule, data))
    }
  }
})

// Synchronous

export const accepts = runWith(0, I.always(true), I.always(false))

export const errors = runWith(0, I.ignore, I.id)

export const validate = runWith()

// Asynchronous

export const acceptsAsync = runWith(
  L.IdentityAsync,
  I.always(returnAsync(true)),
  I.always(returnAsync(false))
)

export const errorsAsync = runWith(
  L.IdentityAsync,
  I.always(returnAsync()),
  returnAsync
)

export const tryValidateAsyncNow = runWith(
  L.IdentityAsync,
  0,
  I.o(raise, toError)
)

export const validateAsync = runWith(
  L.IdentityAsync,
  returnAsync,
  I.o(throwAsync, toError)
)

// Predicates

export const where = predicate => (
  (predicate = protect(predicate)),
  (x, i, M, _xi2yM) =>
    M.chain(b => (b ? M.of(x) : rejectRaisedOr(M, x)), predicate(x, i))
)

// Elaboration

export const modifyError = I.curry(function modifyError(fn, rule) {
  rule = toRule(rule)
  return function modifyError(x, i, M, xi2yM) {
    return M.chain(
      r => (isRejected(r) ? M.map(rejected, fn(x, value(r), i)) : M.of(r)),
      rule(x, i, M, xi2yM)
    )
  }
})

export const setError = I.curry(function setError(error, rule) {
  return compose([L.rewrite(r => (isRejected(r) ? rejected(error) : r)), rule])
})

// Ad-hoc

export const modifyAfter = I.curryN(2, function modifyAfter(rule) {
  return I.o(both(rule), acceptWith)
})
export const setAfter = I.curryN(2, function setAfter(rule) {
  return I.o(both(rule), acceptAs)
})
export const removeAfter = rule => both(rule, remove)

// Logical

export const both = ruleBinOp(function both(rule, rest) {
  return function both(x, i, M, xi2yM) {
    return M.chain(
      r => (isRejected(r) ? M.of(r) : rest(r, i, M, xi2yM)),
      rule(x, i, M, xi2yM)
    )
  }
})

export const and = sumRight(accept, toRule, both)

export const not = rule =>
  compose([L.setter((r, x) => (isRejected(r) ? x : rejected(x))), rule])

export const either = ruleBinOp(function either(rule, rest) {
  return function either(x, i, M, xi2yM) {
    return M.chain(
      r => (isRejected(r) ? rest(x, i, M, xi2yM) : M.of(r)),
      rule(x, i, M, xi2yM)
    )
  }
})

export const or = sumRight(reject, toRule, either)

// Uniform

export const arrayId = rule =>
  andCompose(I.isArray, [arrayIdTrickle, L.elems, rule])

export const arrayIx = rule =>
  andCompose(I.isArray, [arrayIxTrickle, L.elems, rule])

// Varying

export const args = tupleOr({less: true, rest: accept})

export const tuple = tupleOr({less: false, rest: reject})

// Functions

export const dependentFn = I.curry(function dependentFn(argsRule, toResRule) {
  argsRule = toRule(argsRule)
  return (fn, i, M, _xi2yM) =>
    M.of(
      I.isFunction(fn)
        ? copyName(
            (...args) =>
              M.chain(
                args =>
                  isRejected(args)
                    ? raise(toError(value(args)))
                    : M.chain(
                        res =>
                          M.map(
                            raiseRejected,
                            L.traverse(
                              M,
                              I.id,
                              toRule(toResRule.apply(null, args)),
                              res
                            )
                          ),
                        fn.apply(null, args)
                      ),
                L.traverse(M, I.id, argsRule, args)
              ),
            fn
          )
        : rejected(fn)
    )
})

export const freeFn = I.curry(function freeFn(argsRule, resRule) {
  return dependentFn(argsRule, I.always(resRule))
})

// Objects

export const keep = I.curry(function keep(key, rule) {
  return andCompose(I.isInstanceOfObject, [
    L.setter(
      (r, x) =>
        isRejected(r)
          ? rejected(L.set(key, getEither(key, value(r), x), value(r)))
          : r
    ),
    rule
  ])
})

export const optional = rule => compose([L.optional, rule])

export const propsOr = I.curry(function propsOr(onOthers, template) {
  return andCompose(I.isInstanceOfObject, [
    propsTrickle,
    L.branchOr(toRule(onOthers), L.modify(L.values, toRule, template))
  ])
})

export const props = propsOr(reject)

// Dependent

export const choose = xi2r => (
  (xi2r = protect(xi2r)),
  copyName((x, i, M, xi2yM) => {
    const r = xi2r(x, i)
    return r ? toRule(r)(x, i, M, xi2yM) : rejectRaisedOr(M, x)
  }, xi2r)
)

// Conditional

export const cases = sumRight(
  reject,
  (alt, rest) => (I.length(alt) === 1 ? alt[0] : ifElse(alt[0], alt[1], rest)),
  function cases(alt, rest) {
    return ifElse(alt[0], alt[1], rest)
  }
)

export const ifElse = I.curry(function ifElse(p, c, a) {
  p = protect(p)
  c = toRule(c)
  a = toRule(a)
  return function ifElse(x, i, M, xi2yM) {
    const b = p(x, i)
    return b
      ? c(x, i, M, xi2yM)
      : undefined !== b || raised === unique
        ? a(x, i, M, xi2yM)
        : rejectRaisedOr(M, x)
  }
})

export function casesOf(of) {
  of = L.toFunction(of)

  let n = arguments.length - 1
  if (!n) return reject

  let def = arguments[n]
  if (def.length === 1) {
    --n
    def = toRule(def[0])
  } else {
    def = reject
  }

  const ps = Array(n)
  const os = Array(n + 1)
  for (let i = 0; i < n; ++i) {
    const c = arguments[i + 1]
    ps[i] = protect(c[0])
    os[i] = toRule(c[1])
  }
  os[n] = def

  return function casesOf(x, i, M, xi2yM) {
    let min = n
    const r = of(x, i, L.Select, (y, j) => {
      for (let i = 0; i < min; ++i) {
        const b = ps[i](y, j)
        if (b) {
          min = i
          if (i === 0) return 0
          else break
        } else if (undefined === b && raised !== unique) {
          const r = raised
          raised = unique
          return M.of(rejected(r))
        }
      }
    })
    return r ? r : os[min](x, i, M, xi2yM)
  }
}

// Recursive

export const lazy = I.o(L.lazy, I.o(toRule))

// Promotion

export const promote = (...cs) =>
  lazy(rec =>
    or.apply(
      null,
      cs.map(
        c => (I.length(c) === 2 ? both(modifyAfter(c[0], c[1]), rec) : c[0])
      )
    )
  )

export const upgrades = (...cs) =>
  lazy(rec => cases.apply(null, cs.map(upgradesCase(rec))))

export const upgradesOf = (of, ...cs) =>
  lazy(rec => casesOf.apply(null, [of].concat(cs.map(upgradesCase(rec)))))
