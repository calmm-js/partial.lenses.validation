import * as I from 'infestines'

export * from 'infestines'

export const length = x => x.length

export const lte = I.curry((l, r) => l <= r)

export const isInstanceOf = I.curry((Class, x) => x instanceof Class)
export const isInstanceOfObject = isInstanceOf(Object)

export const o = I.curry((f, g) => x => f(g(x)))

export const both = I.curry((p1, p2) => x => p1(x) && p2(x))

export const ignore = _ => {}
