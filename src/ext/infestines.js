import * as I from 'infestines'

export * from 'infestines'

export const isThenable = x => null != x && I.isFunction(x.then)

export const length = x => x.length

export const lte = I.curry((l, r) => l <= r)
export const gte = I.curry((l, r) => l >= r)
export const identical = I.curry(I.identicalU)

export const isInstanceOf = I.curry((Class, x) => x instanceof Class)
export const isInstanceOfObject = isInstanceOf(Object)

export const isBoolean = x => typeof x === 'boolean'

export const o = I.curry((f, g) => x => f(g(x)))

export const both = I.curry((p1, p2) => x => p1(x) && p2(x))

export const ignore = _ => {}
