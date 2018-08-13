import * as I from './ext/infestines'
import * as V from './core'

// Contract helpers

const any = V.accept

const thenable = t => V.modifyAfter(I.isThenable, p => p.then(V.validate(t)))

const monad = V.propsOr(V.accept, {
  map: I.isFunction,
  ap: I.isFunction,
  of: I.isFunction,
  chain: I.isFunction
})

const fn = [I.isFunction, x => `Expected function, but got ${x}`]

const fnMaxN = n =>
  V.and(fn, [
    I.o(I.gte(n), I.length),
    x => `Expected function of max arity ${n}, but got arity ${I.length(x)}`
  ])

const fnN = n =>
  V.and(fn, [
    I.o(I.identical(n), I.length),
    x => `Expected function of arity ${n}, but got arity ${I.length(x)}`
  ])

const runCallback = fnMaxN(1)
const predicateFn = fnMaxN(2)
const transformFn = fnMaxN(2)
const errorTransformFn = fnMaxN(3)
const opticFn = fnN(4)

const rule = V.lazy(rule => V.or(predicateFn, opticFn, V.tuple(rule, V.accept)))

const traversal = V.lazy(traversal =>
  V.or(I.isString, I.isNumber, transformFn, opticFn, V.arrayIx(traversal))
)

const tagError = (tag, rule) => V.modifyError((_, e) => [tag, e], rule)

const tagArgs = (name, rule) =>
  tagError(
    `partial.lenses.validation: \`${name}\` given invalid arguments`,
    rule
  )

const curriedFn = (name, ps, r) =>
  V.choose(fn =>
    V.modifyAfter(V.freeFn(tagArgs(name, V.tuple.apply(null, ps)), r), f =>
      I.arityN(I.length(fn), f)
    )
  )

const fml = (firsts, middle, lasts) =>
  V.choose(xs =>
    V.arrayIx(
      V.casesOf.apply(
        null,
        [I.sndU].concat(
          firsts.map((rule, i) => [I.identical(i), rule]),
          lasts.map((rule, i) => [
            I.identical(I.length(xs) - I.length(lasts) + i),
            rule
          ]),
          [[middle]]
        )
      )
    )
  )

const variadicFn1 = fn => V.copyName((x, ...xs) => fn(x, ...xs), fn)

const caseR = V.tuple(rule)
const casePR = V.tuple(predicateFn, rule)
const caseRT = V.tuple(rule, transformFn)
const casePRT = V.tuple(predicateFn, rule, transformFn)

const caseR_casePR = V.or(caseR, casePR)
const caseR_caseRT = V.or(caseR, caseRT)
const casePR_casePRT = V.or(casePR, casePRT)

const C =
  process.env.NODE_ENV === 'production' ? x => x : (x, c) => V.validate(c, x)

// Primitive

export const accept = C(V.accept, rule)

export const acceptAs = C(V.acceptAs, curriedFn('acceptAs', [any], rule))

export const acceptWith = C(
  V.acceptWith,
  curriedFn('acceptWith', [transformFn], rule)
)

export const rejectWith = C(
  V.rejectWith,
  curriedFn('rejectWith', [transformFn], rule)
)

export const rejectAs = C(V.rejectAs, curriedFn('rejectAs', [any], rule))

export const reject = C(V.reject, rule)

export const remove = C(V.remove, rule)

// General

export const run = C(
  V.run,
  curriedFn(
    'run',
    [
      V.props({
        monad: V.optional(monad),
        onAccept: V.optional(runCallback),
        onReject: V.optional(runCallback)
      }),
      rule,
      any
    ],
    any
  )
)

// Synchronous

export const accepts = C(
  V.accepts,
  curriedFn('accepts', [rule, any], I.isBoolean)
)

export const errors = C(V.errors, curriedFn('errors', [rule, any], any))

export const validate = C(V.validate, curriedFn('validate', [rule, any], any))

// Asynchronous

export const acceptsAsync = C(
  V.acceptsAsync,
  curriedFn('acceptsAsync', [rule, any], thenable(I.isBoolean))
)

export const errorsAsync = C(
  V.errorsAsync,
  curriedFn('errorsAsync', [rule, any], I.isThenable)
)

export const tryValidateAsyncNow = C(
  V.tryValidateAsyncNow,
  curriedFn('tryValidateAsyncNow', [rule, any], any)
)

export const validateAsync = C(
  V.validateAsync,
  curriedFn('validateAsync', [rule, any], I.isThenable)
)

// Predicates

export const where = C(V.where, curriedFn('where', [predicateFn], rule))

// Elaboration

export const modifyError = C(
  V.modifyError,
  curriedFn('modifyError', [errorTransformFn, rule], rule)
)

export const setError = C(V.setError, curriedFn('setError', [any, rule], rule))

// Ad-hoc

export const modifyAfter = C(
  V.modifyAfter,
  curriedFn('modifyAfter', [rule, transformFn], rule)
)

export const setAfter = C(V.setAfter, curriedFn('setAfter', [rule, any], rule))

export const removeAfter = C(V.removeAfter, rule)

// Logical

export const both = C(V.both, curriedFn('both', [rule, rule], rule))

export const and = C(V.and, V.freeFn(tagArgs('and', V.arrayIx(rule)), rule))

export const not = C(V.not, curriedFn('not', [rule], rule))

export const either = C(V.either, curriedFn('either', [rule, rule], rule))

export const or = C(V.or, V.freeFn(tagArgs('or', V.arrayIx(rule)), rule))

// Uniform

export const arrayId = C(V.arrayId, curriedFn('arrayId', [rule], rule))

export const arrayIx = C(V.arrayIx, curriedFn('arrayIx', [rule], rule))

// Varying

export const args = C(V.args, V.freeFn(tagArgs('args', V.arrayIx(rule)), rule))

export const tuple = C(
  V.tuple,
  V.freeFn(tagArgs('tuple', V.arrayIx(rule)), rule)
)

// Functions

export const dependentFn = C(
  V.dependentFn,
  curriedFn('dependentFn', [rule, V.freeFn(V.arrayIx(any), rule)], rule)
)

export const freeFn = C(V.freeFn, curriedFn('freeFn', [rule, rule], rule))

// Objects

export const keep = C(V.keep, curriedFn('keep', [I.isString, rule], rule))

export const optional = C(V.optional, curriedFn('optional', [rule], rule))

export const propsOr = C(
  V.propsOr,
  curriedFn('propsOr', [rule, V.propsOr(rule, {})], rule)
)

export const props = C(V.props, curriedFn('props', [V.propsOr(rule, {})], rule))

// Dependent

export const choose = C(
  V.choose,
  curriedFn('choose', [V.freeFn(V.tuple(any, any), rule)], rule)
)

// Conditional

export const cases = C(
  V.cases,
  V.freeFn(tagArgs('cases', fml([], casePR, [caseR_casePR])), rule)
)

export const ifElse = C(
  V.ifElse,
  curriedFn('ifElse', [predicateFn, rule, rule], rule)
)

export const casesOf = C(
  V.casesOf,
  V.modifyAfter(
    V.freeFn(
      tagArgs('casesOf', fml([traversal], casePR, [caseR_casePR])),
      rule
    ),
    variadicFn1
  )
)

// Recursive

export const lazy = C(
  V.lazy,
  curriedFn('lazy', [V.freeFn(tuple(rule), rule)], rule)
)

// Promotion

export const promote = C(
  V.promote,
  V.freeFn(tagArgs('promote', V.arrayIx(caseR_caseRT)), rule)
)

export const upgrades = C(
  V.upgrades,
  V.freeFn(tagArgs('upgrades', fml([], casePR_casePRT, [caseR_casePR])), rule)
)

export const upgradesOf = C(
  V.upgradesOf,
  V.modifyAfter(
    V.freeFn(
      tagArgs('upgradesOf', fml([traversal], casePR_casePRT, [caseR_casePR])),
      rule
    ),
    variadicFn1
  )
)
