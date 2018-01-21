import * as R from 'ramda'

import * as V from '../dist/partial.lenses.validation.cjs'

function show(x) {
  switch (typeof x) {
    case 'string':
    case 'object':
      return JSON.stringify(x)
    default:
      return `${x}`
  }
}

function testEq(expect, thunk) {
  const expr = thunk
    .toString()
    .replace(/\s+/g, ' ')
    .replace(/^\s*function\s*\(\s*\)\s*{\s*(return\s*)?/, '')
    .replace(/\s*;?\s*}\s*$/, '')

  it(`${expr} => ${show(expect)}`, () => {
    const actual = thunk()
    if (!R.equals(actual, expect))
      throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
  })
}

describe('ad hoc', () => {
  testEq(
    [
      {
        id: 1,
        rules: [null, 'b', 'a'],
        cases: [null, 1, 2]
      }
    ],
    () =>
      V.validate(
        V.arrayId(
          V.cases(
            [
              R.has('id'),
              V.object(['id'], {
                rules: V.arrayIx(V.unless([R.lt(1), 'a'], [R.lt(2), 'b'])),
                cases: V.arrayIx(
                  V.cases([R.has('a'), V.reject(1)], [R.has('b'), V.reject(2)])
                )
              })
            ],
            [
              R.T,
              V.object([], {
                array: V.arrayIx(V.accept)
              })
            ]
          )
        ),
        [
          {
            id: 1,
            rules: [3, 2, 1],
            cases: [{}, {a: 0}, {b: 0}]
          },
          {array: []}
        ]
      )
  )
})

describe('V.optional', () => {
  testEq([null, null, {x: 'not one'}], () =>
    V.validate(
      V.arrayIx(
        V.object([], {
          x: V.optional(V.unless([R.equals(1), 'not one']))
        })
      ),
      [{y: 1}, {x: 1}, {x: 2}]
    )
  )
})

describe('V.object', () => {
  R.forEach(
    v =>
      testEq({required: 'error'}, () =>
        V.validate(V.object([], {required: V.unless([R.identity, 'error'])}), v)
      ),
    [{}, null, 42, 'anything', []]
  )
})

describe('V.cases', () => {
  testEq(undefined, () => V.validate(V.cases(), 'anything'))
})

describe('V.unless', () => {
  testEq(undefined, () => V.validate(V.unless(), 'anything'))
})

describe('V.arrayIx', () => {
  testEq([], () => V.validate(V.arrayIx(V.reject('never')), 42))
})

describe('V.arrayId', () => {
  testEq([], () => V.validate(V.arrayId(V.reject('never')), {}))
  testEq([], () => V.validate(V.arrayId(V.reject('never')), 42))
})

describe('V.objectWith', () => {
  testEq(undefined, () =>
    V.validate(
      V.object([], {foo: V.objectWith(V.reject('unexpected'), [], {})}),
      {foo: {}}
    )
  )

  testEq(
    [
      {optional: 'not one', required: 'not one', id: 2, extra: 'unexpected'},
      {id: 3, extra: 'unexpected'}
    ],
    () =>
      V.validate(
        V.arrayId(
          V.objectWith(V.reject('unexpected'), ['id'], {
            optional: V.optional(V.unless([R.equals(1), 'not one'])),
            required: V.unless([R.equals(1), 'not one'])
          })
        ),
        [
          {id: 1, optional: 1, required: 1},
          {id: 2, optional: 2, required: 2, extra: 2},
          {id: 3, required: 1, extra: 2}
        ]
      )
  )
})

if (process.env.NODE_ENV !== 'production') {
  describe('diagnostics', () => {
    R.forEach(
      ([op, name]) =>
        it(`${name} throws if not given pairs as arguments`, () => {
          R.forEach(
            args => {
              try {
                op(...args)
              } catch (_) {
                return
              }
              throw Error('unexpected')
            },
            [
              [R.T, R.accept],
              [[R.T]],
              [['not function', '']],
              [[(_too, _many, _args) => {}, '']]
            ]
          )
        }),
      [[V.cases, 'V.cases'], [V.unless, 'V.unless']]
    )
  })
}
