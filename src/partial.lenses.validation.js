import * as L from 'partial.lenses'
import * as I from './ext/infestines'

//

const Sync = L.transform((_x, _i, M, _xi2yM) => M, 0)

//

const throwAsync = x => Promise.reject(x)
const returnAsync = x => Promise.resolve(x)

const isThenable = x => null != x && typeof x.then === 'function'

const Async = {
  map: (xyP, xP) => (isThenable(xP) ? xP.then(xyP) : xyP(xP)),
  ap: (xyP, xP) =>
    isThenable(xP) || isThenable(xyP)
      ? Promise.all([xyP, xP]).then(xy_x => xy_x[0](xy_x[1]))
      : xyP(xP),
  of: x => x,
  chain: (xyP, xP) => (isThenable(xP) ? xP.then(xyP) : xyP(xP))
}

//

const unique = {}

const uniqueToUndefined = x => (x === unique ? undefined : x)
const undefinedToUnique = y => (undefined === y ? unique : y)

const fromUniques = L.rewrite(xs => {
  const r = isRejected(xs)
  if (r) xs = value(xs)
  xs = xs.map(uniqueToUndefined)
  return r ? rejected(xs) : xs
})

const toUnique = (x, i, M, xi2yM) => M.map(undefinedToUnique, xi2yM(x, i))

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

//

const getEither = (k, r, x) => (
  (r = L.get(k, r)), void 0 === r ? L.get(k, x) : r
)

const sumRight = (zero, one, plus) =>
  function() {
    let n = arguments.length
    let r = zero
    if (n) {
      r = one(arguments[--n], r)
      while (n) r = plus(arguments[--n], r)
    }
    return r
  }

const andCompose = (p, o) => L.ifElse(p, compose(o), reject)

// Internals

const toRule = (process.env.NODE_ENV === 'production'
  ? I.id
  : fn => rule => {
      if (
        (I.isFunction(rule) && (I.length(rule) < 3 || I.length(rule) === 4)) ||
        (I.isArray(rule) && I.length(rule) === 2)
      ) {
        return fn(rule)
      } else {
        throw Error(`Invalid rule: ${rule}`)
      }
    })(rule => {
  if (I.isFunction(rule)) {
    return I.length(rule) < 3 ? where(rule) : rule
  } else {
    const error = rule[1]
    return I.isFunction(error)
      ? modifyError(error, rule[0])
      : setError(error, rule[0])
  }
})

const toRules = L.modify(L.elems, toRule)

const compose = I.o(L.toFunction, toRules)

const raiseRejected = r => (isRejected(r) ? raise(toError(value(r))) : r)

// Elimination

export const run = I.curryN(3, ({Monad, onAccept, onReject}) => {
  Monad = Monad || Sync
  onAccept = onAccept || I.id
  onReject = onReject || raise
  const handler = r => (isRejected(r) ? onReject(value(r)) : onAccept(r))
  return rule => (
    (rule = toRule(rule)),
    data => Monad.chain(handler, L.traverse(Monad, I.id, rule, data))
  )
})

export const accepts = run({
  onAccept: I.always(true),
  onReject: I.always(false)
})

export const acceptsAsync = run({
  Monad: Async,
  onAccept: I.always(returnAsync(true)),
  onReject: I.always(returnAsync(false))
})

export const errors = run({onAccept: I.ignore, onReject: I.id})

export const errorsAsync = run({
  Monad: Async,
  onAccept: I.always(returnAsync()),
  onReject: returnAsync
})

export const validate = run(I.object0)

export const validateAsync = run({
  Monad: Async,
  onAccept: returnAsync,
  onReject: I.o(throwAsync, toError)
})

export const tryValidateAsyncNow = run({
  Monad: Async,
  onReject: I.o(raise, toError)
})

// Primitive

export const accept = L.zero

export const acceptAs = value => (x, i, M, xi2yM) => xi2yM(value, i)

export const acceptWith = fn => (x, i, M, xi2yM) =>
  M.chain(x => xi2yM(x, i), fn(x, i))

export const rejectWith = fn => (x, i, M, _xi2yM) => M.map(rejected, fn(x, i))

export const rejectAs = I.o(L.setOp, rejected)

export const reject = L.modifyOp(rejected)

export const remove = acceptAs(undefined)

// Predicates

export const where = predicate => (x, i, M, _xi2yM) =>
  M.chain(b => (b ? x : rejected(x)), predicate(x, i))

// Elaboration

export const modifyError = I.curry(
  (fn, rule) => (
    (rule = toRule(rule)),
    (x, i, M, xi2yM) =>
      M.chain(
        r => (isRejected(r) ? M.map(rejected, fn(x, value(r), i)) : r),
        rule(x, i, M, xi2yM)
      )
  )
)

export const setError = I.curry((error, rule) =>
  compose([L.rewrite(r => (isRejected(r) ? rejected(error) : r)), rule])
)

// Logical

export const not = rule =>
  compose([L.setter((r, x) => (isRejected(r) ? x : rejected(x))), rule])

export const or = sumRight(
  reject,
  toRule,
  (rule, rest) => (
    (rule = toRule(rule)),
    (x, i, M, xi2yM) =>
      M.chain(
        r => (isRejected(r) ? rest(x, i, M, xi2yM) : M.of(r)),
        rule(x, i, M, xi2yM)
      )
  )
)

export const and = sumRight(
  accept,
  toRule,
  (rule, rest) => (
    (rule = toRule(rule)),
    (x, i, M, xi2yM) =>
      M.chain(
        r => (isRejected(r) ? M.of(r) : rest(r, i, M, xi2yM)),
        rule(x, i, M, xi2yM)
      )
  )
)

// Arrays

export const arrayIx = rule =>
  andCompose(I.isArray, [arrayIxTrickle, L.elems, rule])

export const arrayId = rule =>
  andCompose(I.isArray, [arrayIdTrickle, L.elems, rule])

export function tuple() {
  const rules = []
  const n = arguments.length
  for (let i = 0; i < n; ++i) rules.push(toRule(arguments[i]))
  return andCompose(I.both(I.isArray, I.sameLength(rules)), [
    fromUniques,
    arrayIxTrickle,
    L.elems,
    toUnique,
    L.choose((_, i) => rules[i])
  ])
}

// Functions

export const dependentFn = I.curry(
  (argsRule, toResRule) => (
    (argsRule = toRule(argsRule)),
    (fn, i, M, _xi2yM) =>
      M.of(
        I.isFunction(fn)
          ? (...args) =>
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
              )
          : rejected(fn)
      )
  )
)

export const freeFn = I.curry((argsRule, resRule) =>
  dependentFn(argsRule, I.always(resRule))
)

// Objects

export const keep = I.curry((key, rule) =>
  andCompose(I.isInstanceOfObject, [
    L.setter(
      (r, x) =>
        isRejected(r)
          ? rejected(L.set(key, getEither(key, value(r), x), value(r)))
          : r
    ),
    rule
  ])
)

export const propsOr = I.curry((onOthers, template) =>
  andCompose(I.isInstanceOfObject, [
    propsTrickle,
    L.branchOr(toRule(onOthers), L.modify(L.values, toRule, template))
  ])
)

export const props = propsOr(reject)

export const optional = rule => compose([L.optional, rule])

// Conditional

export const cases = sumRight(
  reject,
  (process.env.NODE_ENV === 'production'
    ? I.id
    : validate(
        freeFn(
          tuple(or(tuple(accept), tuple(I.isFunction, accept)), accept),
          accept
        )
      ))(
    (alt, rest) => (I.length(alt) === 1 ? alt[0] : ifElse(alt[0], alt[1], rest))
  ),
  (process.env.NODE_ENV === 'production'
    ? I.id
    : validate(
        freeFn(tuple(tuple(I.isFunction, accept), accept), accept)
      ))((alt, rest) => ifElse(alt[0], alt[1], rest))
)

export const ifElse = I.curry(
  (p, c, a) => (
    (c = toRule(c)),
    (a = toRule(a)),
    (x, i, M, xi2yM) =>
      M.chain(b => (b ? c(x, i, M, xi2yM) : a(x, i, M, xi2yM)), p(x, i))
  )
)

// Dependent

export const choose = xi2r => (x, i, M, xi2yM) =>
  M.chain(r => toRule(r)(x, i, M, xi2yM), xi2r(x, i))

// Recursive

export const lazy = I.o(L.lazy, I.o(toRule))
