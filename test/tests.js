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

describe('validation', () => {
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
            cases: [{}, { a: 0 }, { b: 0 }]
          },
          { array: [] }
        ]
      )
  )

  testEq([null, null, { x: 'not one' }], () =>
    V.validate(
      V.arrayIx(
        V.object([], {
          x: V.optional(V.unless([R.equals(1), 'not one']))
        })
      ),
      [{ y: 1 }, { x: 1 }, { x: 2 }]
    )
  )

  R.forEach(
    v =>
      testEq({ required: 'error' }, () =>
        V.validate(
          V.object([], { required: V.unless([R.identity, 'error']) }),
          v
        )
      ),
    [{}, null, 42, 'anything', []]
  )

  testEq(undefined, () => V.validate(V.cases(), 'anything'))
  testEq(undefined, () => V.validate(V.unless(), 'anything'))

  testEq([], () => V.validate(V.arrayIx(V.reject('never')), 42))
  testEq([], () => V.validate(V.arrayId(V.reject('never')), {}))
  testEq([], () => V.validate(V.arrayId(V.reject('never')), 42))
})

if (process.env.NODE_ENV !== 'production') {
  describe('diagnostics', () => {
    it('V.cases throws if not given pairs as arguments', () => {
      R.forEach(
        args => {
          try {
            V.cases(...args)
          } catch (_) {
            return
          }
          throw Error('unexpected')
        },
        [[R.T, R.accept], [[R.T]]]
      )
    })
  })
}
