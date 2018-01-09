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
})

describe('deprecated', () => {
  testEq('yes', () =>
    V.validate(V.unless(R.equals(1), 'no', R.equals(2), 'yes'), 1)
  )
})

if (process.env.NODE_ENV !== 'production') {
  describe('diagnostics', () => {
    it('V.cases throws if not given an even number of arguments', () => {
      try {
        V.cases(R.T)
      } catch (_) {
        return
      }
      throw Error('unexpected')
    })

    it('V.cases throws if not given pairs as arguments', () => {
      try {
        V.cases([R.T])
      } catch (_) {
        return
      }
      throw Error('unexpected')
    })
  })
}
