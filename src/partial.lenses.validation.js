import * as L from 'partial.lenses'
import * as I from './ext/infestines'

//

const P = Promise

const throwAsync = P.reject.bind(P)
const returnAsync = P.resolve.bind(P)

const chain = (xyP, xP) =>
  null != xP && I.isFunction(xP.then) ? xP.then(xyP) : xyP(xP)

const Async = (process.env.NODE_ENV === 'production' ? I.id : I.freeze)({
  map: chain,
  ap: (xyP, xP) => chain(xP => chain(xyP => xyP(xP), xyP), xP),
  of: I.id,
  chain
})

//

const unique = {}

const uniqueToUndefined = x => (x !== unique ? x : undefined)
const undefinedToUnique = y => (undefined !== y ? y : unique)

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

const raiseRejected = r => (isRejected(r) ? raise(toError(value(r))) : r)

//

const getEither = (k, r, x) => (
  (r = L.get(k, r)), undefined !== r ? r : L.get(k, x)
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

//

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

//

const andCompose = (p, o) => L.ifElse(p, compose(o), reject)

const compose = I.o(L.toFunction, toRules)

//

const tupleOr = ({less, rest}) => (
  (rest = toRule(rest)),
  function() {
    const rules = []
    const n = arguments.length
    for (let i = 0; i < n; ++i) rules.push(toRule(arguments[i]))
    return andCompose(
      less ? I.isArray : I.both(I.isArray, I.o(I.lte(n), I.length)),
      [
        fromUniques,
        arrayIxTrickle,
        less
          ? (xs, i, M, xi2yM) => {
              const m = I.length(xs)
              if (m < n) {
                xs = xs.slice()
                xs.length = n
                return M.map(
                  ys => (L.any(isRejected, L.elems, ys) ? ys : ys.slice(0, m)),
                  L.elems(xs, i, M, xi2yM)
                )
              } else {
                return L.elems(xs, i, M, xi2yM)
              }
            }
          : L.elems,
        toUnique,
        L.choose((_, i) => rules[i] || rest)
      ]
    )
  }
)

const runWith = (Monad, onAccept, onReject) => run({Monad, onAccept, onReject})

//

let raised = unique

function callPredicate(predicate, x, i) {
  try {
    return predicate(x, i)
  } catch (e) {
    raised = e
    return false
  }
}

// Primitive

export const accept = L.zero

export const acceptAs = value => (x, i, M, xi2yM) => xi2yM(value, i)

export const acceptWith = fn => (x, i, M, xi2yM) =>
  M.chain(x => xi2yM(x, i), fn(x, i))

export const rejectWith = fn => (x, i, M, _xi2yM) => M.map(rejected, fn(x, i))

export const rejectAs = I.o(L.setOp, rejected)

export const reject = L.modifyOp(rejected)

export const remove = acceptAs(undefined)

//

const casesOfDefault = I.always(reject)
const casesOfCase = (p, o, r) => (y, j) => (p(y, j) ? o : r(y, j))

//

const ruleBinOp = op =>
  I.curryN(2, l => ((l = toRule(l)), r => ((r = toRule(r)), op(l, r))))

// General

export const run = I.curryN(3, c => {
  const M = c.Monad || L.Identity
  const onAccept = c.onAccept || I.id
  const onReject = c.onReject || raise
  const handler = r => (isRejected(r) ? onReject(value(r)) : onAccept(r))
  return rule => (
    (rule = toRule(rule)),
    data => M.chain(handler, L.traverse(M, I.id, rule, data))
  )
})

// Synchronous

export const accepts = runWith(0, I.always(true), I.always(false))

export const errors = runWith(0, I.ignore, I.id)

export const validate = runWith()

// Asynchronous

export const acceptsAsync = runWith(
  Async,
  I.always(returnAsync(true)),
  I.always(returnAsync(false))
)

export const errorsAsync = runWith(Async, I.always(returnAsync()), returnAsync)

export const tryValidateAsyncNow = runWith(Async, 0, I.o(raise, toError))

export const validateAsync = runWith(
  Async,
  returnAsync,
  I.o(throwAsync, toError)
)

// Predicates

export const where = predicate => (x, i, M, _xi2yM) =>
  M.chain(
    b =>
      b
        ? x
        : rejected((raised === unique || ((x = raised), (raised = unique)), x)),
    callPredicate(predicate, x, i)
  )

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

// Transformation

export const modifyAfter = I.curryN(2, rule => I.o(both(rule), acceptWith))
export const setAfter = I.curryN(2, rule => I.o(both(rule), acceptAs))
export const removeAfter = rule => both(rule, remove)

// Logical

export const both = ruleBinOp((rule, rest) => (x, i, M, xi2yM) =>
  M.chain(
    r => (isRejected(r) ? M.of(r) : rest(r, i, M, xi2yM)),
    rule(x, i, M, xi2yM)
  )
)

export const and = sumRight(accept, toRule, both)

export const not = rule =>
  compose([L.setter((r, x) => (isRejected(r) ? x : rejected(x))), rule])

export const either = ruleBinOp((rule, rest) => (x, i, M, xi2yM) =>
  M.chain(
    r => (isRejected(r) ? rest(x, i, M, xi2yM) : M.of(r)),
    rule(x, i, M, xi2yM)
  )
)

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

export const optional = rule => compose([L.optional, rule])

export const propsOr = I.curry((onOthers, template) =>
  andCompose(I.isInstanceOfObject, [
    propsTrickle,
    L.branchOr(toRule(onOthers), L.modify(L.values, toRule, template))
  ])
)

export const props = propsOr(reject)

// Dependent

export const choose = xi2r => (x, i, M, xi2yM) =>
  M.chain(r => toRule(r)(x, i, M, xi2yM), xi2r(x, i))

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
    : validate(freeFn(tuple(tuple(I.isFunction, accept), accept), accept)))(
    (alt, rest) => ifElse(alt[0], alt[1], rest)
  )
)

export const ifElse = I.curry(
  (p, c, a) => (
    (c = toRule(c)),
    (a = toRule(a)),
    (x, i, M, xi2yM) =>
      M.chain(b => (b ? c(x, i, M, xi2yM) : a(x, i, M, xi2yM)), p(x, i))
  )
)

export const casesOf = (process.env.NODE_ENV === 'production'
  ? I.id
  : validate(
      modifyAfter(
        freeFn(
          choose(args => {
            const last = I.length(args) - 1
            return tupleOr({
              less: false,
              rest: ifElse(
                (_, i) => i === last,
                or(tuple(accept), tuple(I.isFunction, accept)),
                tuple(I.isFunction, accept)
              )
            })(accept)
          }),
          accept
        ),
        fn => (of, ...cases) => fn(of, ...cases)
      )
    ))(function(of) {
  of = L.toFunction(of)
  let n = arguments.length
  let op = casesOfDefault
  while (--n) {
    const c = arguments[n]
    op =
      I.length(c) !== 1
        ? casesOfCase(c[0], toRule(c[1]), op)
        : I.always(toRule(c[0]))
  }
  return (x, i, M, xi2yM) => of(x, i, L.Constant, op)(x, i, M, xi2yM)
})

// Recursive

export const lazy = I.o(L.lazy, I.o(toRule))
