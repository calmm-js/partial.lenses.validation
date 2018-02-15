import * as L from 'partial.lenses'
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

const toExpr = thunk =>
  thunk
    .toString()
    .replace(/\s+/g, ' ')
    .replace(/^\s*function\s*\(\s*\)\s*{\s*(return\s*)?/, '')
    .replace(/\s*;?\s*}\s*$/, '')
    .replace(/function\s*(\([a-zA-Z]*\))\s*/g, '$1 => ')
    .replace(/{\s*return\s*([^{;]+)\s*;\s*}/g, '$1')
    .replace(/{\s*return\s*([^{;]+)\s*;\s*}/g, '$1')

const assertEqual = (expected, actual) =>
  Promise.resolve(actual).then(actual => {
    if (!R.equals(actual, expected))
      throw Error(`Expected: ${show(expected)}, actual: ${show(actual)}`)
  })

const testEq = (expect, thunk) =>
  it(`${toExpr(thunk)} => ${show(expect)}`, () => assertEqual(expect, thunk()))

const testAcceptedAs = (result, value, rules) =>
  it(`V.validate(${toExpr(rules)}, ${show(value)}) => ${show(result)}`, () =>
    assertEqual(result, V.validate(rules(), value)))

const testAccepted = (value, rules) => testAcceptedAs(value, value, rules)

const testRejectedAs = (result, value, rules) =>
  it(`V.errors(${toExpr(rules)}, ${show(value)}) => ${show(result)}`, () =>
    assertEqual(result, V.errors(rules(), value)))

const testRejected = (value, rules) => testRejectedAs(value, value, rules)

const testThrows = thunk =>
  it(`${toExpr(thunk)} => throws`, () =>
    new Promise((fulfill, reject) => {
      try {
        const a = thunk()
        Promise.resolve(a)
          .then(a =>
            reject(Error(`Expected to throw, but returned ${show(a)}`))
          )
          .catch(fulfill)
      } catch (e) {
        fulfill()
      }
    }))

describe('Integration: Pregrading 2018', () => {
  const mapsTo = R.curry((value, map, key) => map.get(key) === value)

  const dateRE = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/

  const matches = re => R.both(R.is(String), R.test(re))

  const PregradingStaged = V.and(
    V.props({
      tutkintokerta: matches(/^\d{4}[KS]$/),
      koe: R.is(String),
      osa: R.equals(null),
      koulunumero: R.is(Number),
      arvostelunPäivämäärä: matches(dateRE),
      kysymykset: V.arrayId(R.is(String)),
      kokelaat: V.arrayId(
        V.props({
          etunimet: V.arrayId(R.is(String)),
          sukunimi: R.is(String),
          kokelasnumero: R.is(Number),
          valmistavaArvostelu: V.arrayId(
            V.props({
              kysymys: R.is(String),
              pisteet: R.both(Number.isInteger, R.lte(0))
            })
          ),
          pisteidenSumma: R.is(Number)
        })
      )
    }),
    V.choose(({kysymykset}) => {
      const kysymysCounts = L.counts(L.elems, kysymykset)
      return V.propsOr(V.accept, {
        kysymykset: V.arrayId(mapsTo(1, kysymysCounts)),
        kokelaat: V.arrayId(
          V.choose(({valmistavaArvostelu}) =>
            V.propsOr(V.accept, {
              valmistavaArvostelu: V.arrayId(
                V.propsOr(V.accept, {
                  kysymys: V.and(
                    mapsTo(
                      1,
                      L.counts([L.elems, 'kysymys'], valmistavaArvostelu)
                    ),
                    mapsTo(1, kysymysCounts)
                  )
                })
              ),
              pisteidenSumma: R.equals(
                L.sum([L.elems, 'pisteet'], valmistavaArvostelu)
              )
            })
          )
        )
      })
    })
  )

  const PregradingFused = V.choose(input => {
    const kysymysCounts = L.counts(['kysymykset', L.elems], input)
    return V.props({
      tutkintokerta: matches(/^\d{4}[KS]$/),
      koe: R.is(String),
      osa: R.equals(null),
      koulunumero: R.is(Number),
      arvostelunPäivämäärä: matches(dateRE),
      kysymykset: V.arrayId(R.both(R.is(String), mapsTo(1, kysymysCounts))),
      kokelaat: V.arrayId(
        V.choose(kokelas =>
          V.props({
            etunimet: V.arrayId(R.is(String)),
            sukunimi: R.is(String),
            kokelasnumero: R.is(Number),
            valmistavaArvostelu: V.arrayId(
              V.props({
                kysymys: V.and(
                  R.is(String),
                  mapsTo(
                    1,
                    L.counts(
                      ['valmistavaArvostelu', L.elems, 'kysymys'],
                      kokelas
                    )
                  ),
                  mapsTo(1, kysymysCounts)
                ),
                pisteet: R.both(Number.isInteger, R.lte(0))
              })
            ),
            pisteidenSumma: R.both(
              R.is(Number),
              R.equals(
                L.sum(['valmistavaArvostelu', L.elems, 'pisteet'], kokelas)
              )
            )
          })
        )
      )
    })
  })

  const valid = {
    tutkintokerta: '2018K',
    koe: 'M',
    osa: null,
    koulunumero: 1001,
    arvostelunPäivämäärä: '2018-01-23T10:29:07.326Z',
    kysymykset: ['1-1', '1-2', '1-3', '2', '3'],
    kokelaat: [
      {
        etunimet: ['Jussi', 'Matti'],
        sukunimi: 'Jokinen',
        kokelasnumero: 1,
        valmistavaArvostelu: [
          {kysymys: '1-1', pisteet: 3},
          {kysymys: '1-2', pisteet: 1},
          {kysymys: '2', pisteet: 4},
          {kysymys: '3', pisteet: 1}
        ],
        pisteidenSumma: 9
      }
    ]
  }

  testAccepted(valid, () => PregradingStaged)
  testAccepted(valid, () => PregradingFused)
})

describe('Integration: Set of Products', () => {
  const SetOfProducts = V.arrayId(
    V.keep(
      'id',
      V.props({
        id: R.is(Number),
        name: V.and(R.is(String), V.not(R.isEmpty)),
        price: V.and(R.is(Number), R.lte(0)),
        tags: V.optional(V.and(V.arrayIx(R.is(String)), V.not(R.isEmpty))),
        dimensions: V.optional(
          V.props({
            length: R.is(Number),
            width: R.is(Number),
            height: R.is(Number)
          })
        ),
        warehouseLocation: V.optional(
          V.props({
            latitude: R.is(Number),
            longitude: R.is(Number)
          })
        )
      })
    )
  )

  const valid = [
    {
      id: 2,
      name: 'An ice sculpture',
      price: 12.5,
      tags: ['cold', 'ice'],
      dimensions: {
        length: 7.0,
        width: 12.0,
        height: 9.5
      },
      warehouseLocation: {
        latitude: -78.75,
        longitude: 20.4
      }
    },
    {
      id: 3,
      name: 'A blue mouse',
      price: 25.5,
      dimensions: {
        length: 3.1,
        width: 1.0,
        height: 1.0
      },
      warehouseLocation: {
        latitude: 54.4,
        longitude: -32.7
      }
    }
  ]

  testAccepted(valid, () => SetOfProducts)
})

describe('Integration: Ad Hoc', () => {
  testRejectedAs(
    [{rules: [null, 'b', 'a'], cases: [{}, 1, 4], id: 1}],
    [{id: 1, rules: [3, 2, 1], cases: [{}, {a: 0}, {b: 0}]}, {array: []}],
    () =>
      V.arrayId(
        V.cases(
          [
            R.has('id'),
            V.keep(
              'id',
              V.props({
                rules: V.arrayIx(V.and([R.lt(1), 'a'], [R.lt(2), 'b'])),
                cases: V.arrayIx(
                  V.cases(
                    [R.has('a'), V.rejectAs(1)],
                    [
                      R.has('b'),
                      V.rejectWith((x, i) => Object.keys(x).length + i + 1)
                    ]
                  )
                )
              })
            )
          ],
          [V.props({array: V.arrayIx(V.accept)})]
        )
      )
  )
})

describe('V.optional', () => {
  testRejectedAs([null, null, {x: 'not one'}], [{y: 1}, {x: 1}, {x: 2}], () =>
    V.arrayIx(V.propsOr(V.accept, {x: V.optional([R.equals(1), 'not one'])}))
  )
})

describe('V.lazy', () => {
  const nestedOf = rules =>
    V.lazy(rec => V.cases([R.is(Array), V.arrayIx(rec)], [rules]))
  testRejectedAs([null, ['Must be number']], [[[1, 2]], ['3']], () =>
    nestedOf([R.is(Number), 'Must be number'])
  )
})

describe('V.props', () => {
  R.forEach(
    v =>
      testRejectedAs({required: 'error'}, v, () =>
        V.props({required: [R.identity, 'error']})
      ),
    [{}, []]
  )

  R.forEach(
    v => testRejected(v, () => V.props({required: [R.identity, 'error']})),
    [null, 42, 'anything']
  )
})

describe('V.cases', () => {
  testRejected('anything', () => V.cases())

  testAccepted(['a', 'b', 'c'], () =>
    V.arrayIx(
      V.cases(
        [(_, i) => i === 1, R.equals('b')],
        [(_, i) => i === 0, R.equals('a')],
        [(_, i) => i === 2, R.equals('c')]
      )
    )
  )
})

describe('V.arrayIx', () => {
  testRejected(42, () => V.arrayIx(V.reject))
})

describe('V.arrayId', () => {
  testRejected({}, () => V.arrayId(V.reject))
  testRejected(42, () => V.arrayId(V.reject))
})

describe('V.choose', () => {
  testAccepted(['1', '2', '3'], () =>
    V.arrayIx(V.choose((_, i) => R.equals(`${i + 1}`)))
  )
})

describe('V.ifElse', () => {
  testAccepted([1, '2', 3, '4'], () =>
    V.arrayIx(V.ifElse((_, i) => i % 2, R.is(String), R.is(Number)))
  )
})

describe('V.propsOr', () => {
  testAccepted({bar: 'ignored', foo: {}}, () =>
    V.propsOr(V.accept, {foo: V.props({})})
  )

  testAcceptedAs({foo: {}}, {bar: 'removed', foo: {}}, () =>
    V.propsOr(V.remove, {foo: V.props({})})
  )

  testRejectedAs(
    [
      {optional: 'not one', required: 'required: not one (2)', extra: 2, id: 2},
      {extra: 2, id: 3},
      {id: 'not number'}
    ],
    [
      {id: 1, optional: 1, required: 1},
      {id: 2, optional: 2, required: 2, extra: 2},
      {id: 3, required: 1, extra: 2},
      {id: 'wong', optional: 1, required: 1}
    ],
    () =>
      V.arrayId(
        V.keep(
          'id',
          V.propsOr(V.reject, {
            id: [R.is(Number), 'not number'],
            optional: V.optional([R.equals(1), 'not one']),
            required: [R.equals(1), (x, _, i) => `${i}: not one (${x})`]
          })
        )
      )
  )
})

describe('V.not', () => {
  testAccepted(2, () => V.not([R.equals(1), 'not one']))
  testRejected(1, () => V.not([R.equals(1), 'not one']))
})

describe('V.and', () => {
  testRejectedAs('error', 'anything', () => V.and(V.rejectAs('error')))
  testAccepted(1, () => V.and())
  testAccepted(1, () => V.and([x => x < 2, 'large']))
  testRejectedAs('large', 2, () => V.and([x => x < 2, 'large']))
  testRejectedAs('2nd', 2, () =>
    V.and([x => x < 3, '1st'], [x => x < 2, '2nd'], [x => x < 1, '3rd'])
  )
  testAcceptedAs(3, 1, () =>
    V.and(R.equals(1), V.acceptWith(R.inc), R.equals(2), V.acceptWith(R.inc))
  )
})

describe('V.or', () => {
  testRejectedAs('error', 'anything', () => V.or(V.rejectAs('error')))
  testRejectedAs('error 2', 'anything', () =>
    V.or(V.rejectAs('error 1'), V.rejectAs('error 2'))
  )
  testRejected(1, () => V.or())
  testAccepted(1, () => V.or(R.equals(1), V.rejectAs('not one')))
  testAccepted(2, () =>
    V.or([R.equals(1), 'not one'], [R.equals(2), 'not two'])
  )
  testAcceptedAs(2, 1, () =>
    V.or(
      V.and(R.equals(2), V.acceptWith(R.inc)),
      V.and(R.equals(1), V.acceptWith(R.inc)),
      V.and(R.equals(1), V.acceptWith(R.dec))
    )
  )
})

describe('elaboration', () => {
  testRejectedAs(
    {some: 'some: anything fails with something'},
    {some: 'anything'},
    () =>
      V.props({
        some: V.modifyError(
          (x, e, i) => `${i}: ${x} fails with ${e}`,
          V.rejectAs('something')
        )
      })
  )
  testRejectedAs('ANYTHING', 'anything', () => [V.reject, R.toUpper])
  testAccepted('anything', () => V.modifyError(R.toUpper, V.accept))

  testRejectedAs('Really', 'anything', () => V.setError('Really', V.reject))
  testRejectedAs('Really', 'anything', () => [V.reject, 'Really'])
  testAccepted('anything', () => V.setError('Really', V.accept))
})

describe('transformation', () => {
  testAcceptedAs({what: 'what is SOMETHING'}, {what: 'something'}, () =>
    V.props({
      what: V.or(V.reject, V.acceptWith((x, i) => `${i} is ${R.toUpper(x)}`))
    })
  )
  testRejected('something', () => V.and(V.reject, V.acceptWith(R.toUpper)))

  testAcceptedAs('Yeah', 'something', () => V.and(V.accept, V.acceptAs('Yeah')))
  testRejected('something', () => V.and(V.reject, V.acceptAs('Yeah')))

  testAcceptedAs([[1, 0]], [1], () =>
    V.arrayIx(V.modifyAfter(R.equals(1), (v, i) => [v, i]))
  )
  testAcceptedAs(['2'], [1], () => V.arrayId(V.setAfter(R.equals(1), '2')))
  testAcceptedAs([], [1], () => V.arrayId(V.removeAfter(R.equals(1))))
})

describe('V.freeFn', () => {
  testEq(10, () =>
    V.validate(V.freeFn(V.args(R.is(Number)), R.lte(0)), Math.abs)(-10)
  )
  testThrows(() =>
    V.validate(
      V.freeFn(V.args((_, i) => i === 0, R.is(Number)), V.accept),
      Math.max
    )('not a number', 'another')
  )
  testThrows(() =>
    V.validate(V.freeFn(V.args(R.is(Number)), R.lte(0)), x => x + 1)(-10.5)
  )

  testThrows(() =>
    V.validate(V.freeFn(V.args(V.accept), V.accept), 'not a function')
  )
})

describe('V.dependentFn', () => {
  testEq(1, () =>
    V.validate(
      V.dependentFn(V.args(R.is(Number)), x => R.equals(x * x)),
      Math.sqrt
    )(1)
  )
  testThrows(() =>
    V.validate(
      V.dependentFn(V.args(R.is(Number)), x => R.equals(x * x)),
      Math.sqrt
    )(2)
  )
})

describe('V.tuple', () => {
  testRejected([], () => V.tuple(V.accept))
  testAccepted(['1', 2], () => V.tuple(R.is(String), R.is(Number)))
  testAccepted([1, undefined, '2'], () => V.tuple(V.accept, V.accept, V.accept))
  testRejectedAs([null, null, '2'], [1, undefined, '2'], () =>
    V.tuple(V.accept, V.accept, V.reject)
  )
  testRejectedAs([null, 2], [1, 2], () => V.tuple(V.accept))
  testRejected([1], () => V.tuple(V.accept, V.accept))
})

describe('V.args', () => {
  testAccepted([], () => V.args(V.optional(R.is(Number))))
  testAccepted([101, 'and more'], () => V.args(V.optional(R.is(Number))))
  testRejected(['nope'], () => V.args(V.optional(R.is(Number))))
  testRejectedAs([null], [], () => V.args(R.is(Number)))
})

describe('V.errors', () => {
  testEq(undefined, () => V.errors(R.is(String), 'This is accepted.'))

  testEq(null, () => V.errors(V.reject, undefined))
})

describe(`V.validate`, () => {
  testEq({message: '[\n  "the errors"\n]', errors: ['the errors']}, () => {
    try {
      V.validate(V.arrayId([R.is(Number), 'the errors']), ['not a number'])
    } catch (e) {
      return {
        message: e.message,
        errors: e.errors
      }
    }
  })
})

describe('where raised', () => {
  testRejectedAs(['error'], [1, 2], () =>
    V.arrayId(x => {
      if (x === 2) {
        throw 'error'
      } else {
        return true
      }
    })
  )
})

describe('V.casesOf', () => {
  testRejected('anything', () => V.casesOf([]))
  testAccepted([{type: 'a', a: 1}, {type: 'b', b: 'x'}], () => {
    const base = {type: R.is(String)}
    return V.arrayIx(
      V.casesOf(
        'type',
        [R.identical('a'), V.props({...base, a: R.is(Number)})],
        [R.identical('b'), V.props({...base, b: R.is(String)})]
      )
    )
  })
  testRejectedAs(
    ['unknown', null, {b: 1}],
    [null, {type: 'a', a: 1}, {type: 'b', b: 1}],
    () => {
      const base = {type: R.is(String)}
      return V.arrayIx(
        V.casesOf(
          'type',
          [R.identical('a'), V.props({...base, a: R.is(Number)})],
          [R.identical('b'), V.props({...base, b: R.is(String)})],
          [V.rejectAs('unknown')]
        )
      )
    }
  )
})

describe('async', () => {
  const delay = ms => new Promise(fulfill => setTimeout(fulfill, ms))
  const after = (ms, value) => delay(ms).then(() => value)

  testThrows(() =>
    V.validateAsync(V.arrayIx(n => 10 < n || after(n * 10, n < 10)), [
      5,
      15,
      10
    ])
  )

  testEq([[15], [10, 5]], () =>
    V.validateAsync(V.arrayIx(V.arrayIx(n => 10 <= n || after(n * 10, true))), [
      [15],
      [10, 5]
    ])
  )

  testEq(101, () =>
    V.tryValidateAsyncNow(
      V.dependentFn(V.tuple(x => after(10, R.is(Number, x))), x => y =>
        after(10, R.equals(x + 1, y))
      ),
      x => after(10, x + 1)
    )(100)
  )
})

if (process.env.NODE_ENV !== 'production') {
  describe('diagnostics', () => {
    testThrows(() => V.cases([]))
    testThrows(() => V.cases([1, 2, 3]))
    testThrows(() => V.cases([], [1]))
    testThrows(() => V.validate([1, 'too', 'many']))
    testThrows(() => V.validate(['too few']))
  })
}
