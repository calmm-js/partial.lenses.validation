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

const run = expr => eval(`() => ${expr}`)(V)

const testEq = (exprIn, expect) => {
  const expr = exprIn.replace(/[ \n]+/g, ' ')
  it(`${expr} => ${show(expect)}`, () => {
    const actual = run(expr)
    if (!R.equals(actual, expect))
      throw new Error(`Expected: ${show(expect)}, actual: ${show(actual)}`)
  })
}

describe('validation', () => {
  testEq(`V.validate(
            V.arrayId(
              V.cases(
                R.has('id'), V.object(['id'], {
                  rules: V.arrayIx(V.unless(R.lt(1), 'a', R.lt(2), 'b')),
                  cases: V.arrayIx(V.cases(R.has('a'), V.reject(1),
                                           R.has('b'), V.reject(2)))
                }),
                R.T, V.object([], {
                  array: V.arrayIx(V.accept)
                }))),
            [{id: 1,
              rules: [3,2,1],
              cases: [{}, {a: 0}, {b: 0}]},
             {array: []}])`,
         [{id: 1,
           rules: [null, 'b', 'a'],
           cases: [null, 1, 2]}])
})

if (process.env.NODE_ENV !== 'production') describe('diagnostics', () => {
  it('V.cases throws if not given an even number of arguments', () => {
    try {
      V.cases(R.T)
    } catch (_) {
      return
    }
    throw Error('unexpected')
  })
})
