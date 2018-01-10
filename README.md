# <a id="partial-lenses-validation"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#) Partial Lenses Validation &middot; [![Gitter](https://img.shields.io/gitter/room/calmm-js/chat.js.svg)](https://gitter.im/calmm-js/chat) [![GitHub stars](https://img.shields.io/github/stars/calmm-js/partial.lenses.validation.svg?style=social)](https://github.com/calmm-js/partial.lenses.validation) [![npm](https://img.shields.io/npm/dm/partial.lenses.validation.svg)](https://www.npmjs.com/package/partial.lenses.validation)

Validation [transform](https://github.com/calmm-js/partial.lenses/#transforms)
[combinators](https://wiki.haskell.org/Combinator) for [Partial
Lenses](https://github.com/calmm-js/partial.lenses/).  This library is designed
for sparse validation in UIs to give user feedback.  The main idea is to produce
validation errors in the same shape as the data structure being validated.  This
way validation errors can accessed at the same path as the data and can be
mechanically associated with the corresponding elements of the validated data
structure.

[![npm version](https://badge.fury.io/js/partial.lenses.validation.svg)](http://badge.fury.io/js/partial.lenses.validation)
[![Bower version](https://badge.fury.io/bo/partial.lenses.validation.svg)](https://badge.fury.io/bo/partial.lenses.validation)
[![Build Status](https://travis-ci.org/calmm-js/partial.lenses.validation.svg?branch=master)](https://travis-ci.org/calmm-js/partial.lenses.validation)
[![Code Coverage](https://img.shields.io/codecov/c/github/calmm-js/partial.lenses.validation/master.svg)](https://codecov.io/github/calmm-js/partial.lenses.validation?branch=master)
[![](https://david-dm.org/calmm-js/partial.lenses.validation.svg)](https://david-dm.org/calmm-js/partial.lenses.validation)
[![](https://david-dm.org/calmm-js/partial.lenses.validation/dev-status.svg)](https://david-dm.org/calmm-js/partial.lenses.validation?type=dev)

## <a id="contents"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#contents) Contents

* [An example](#an-example)
* [Reference](#reference)
  * [Operations on rules](#operations-on-rules)
    * [`V.validate(rules, data) ~> maybeErrors`](#V-validate) <small><sup>v0.1.0</sup></small>
  * [Primitive rules](#primitive-rules)
    * [`V.accept ~> rules`](#V-accept) <small><sup>v0.1.0</sup></small>
    * [`V.reject(errorValue) ~> rules`](#V-reject) <small><sup>v0.1.0</sup></small>
  * [Rules on an element](#rules-on-an-element)
    * [`V.unless(...[(maybeValue, index) => testable, errorValue]) ~> rules`](#V-unless) <small><sup>v0.1.0</sup></small>
  * [Rules on objects](#rules-on-objects)
    * [`V.object([...propNames], {prop: rules, ...}) ~> rules`](#V-object) <small><sup>v0.1.0</sup></small>
  * [Rules on arrays](#rules-on-arrays)
    * [`V.arrayId(rules) ~> rules`](#V-arrayId) <small><sup>v0.1.0</sup></small>
    * [`V.arrayIdOr(rules, rules) ~> rules`](#V-arrayIdOr) <small><sup>v0.2.0</sup></small>
    * [`V.arrayIx(rules) ~> rules`](#V-arrayIx) <small><sup>v0.1.0</sup></small>
    * [`V.arrayIxOr(rules, rules) ~> rules`](#V-arrayIxOr) <small><sup>v0.2.0</sup></small>
  * [Conditional rules](#conditional-rules)
    * [`V.cases(...[(maybeValue, index) => testable, rules]) ~> rules`](#V-cases) <small><sup>v0.1.0</sup></small>
    * [`V.choose((maybeValue, index) => rules) ~> rules`](#V-choose) <small><sup>v0.1.0</sup></small>
    * [`V.optional(rules) ~> rules`](#V-optional) <small><sup>v0.1.3</sup></small>
* [Known caveats](#known-caveats)
* [Related work](#related-work)

## <a id="an-example"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#an-example) An example

Imagine a UI for editing a data structure that is an array (table) of objects
(records) that have a `date` field and an `event` field:

```json
[
  {"date": "2017-09-11", "event": "EFSA-H"},
  {"date": "2017-09-20", "event": "EFSA-T"},
  {"date": "",           "event": "EFSA-T"}
]
```

We need to validate that each object has a valid date and an event and that
dates and events are unique.  Furthermore, we wish to give feedback on all
elements with errors so as to guide the user.

Here is a sample set of rules

```js
const rules = V.choose(events => V.arrayIx(V.object([], {
  date: V.unless(
    [isNonEmpty,                  'required'],
    [isValidDate,                 'yyyy-mm-dd'],
    [isUniqueBy('date', events),  'duplicate']),
  event: V.unless(
    [isNonEmpty,                  'required'],
    [isUniqueBy('event', events), 'duplicate'])
})))
```

where

```js
const isNonEmpty = R.identity

function isUniqueBy(p, xs) {
  const counts = L.counts([L.elems, p], xs)
  return x => counts.get(x) <= 1
}

const isValidDate = R.test(/^\d{4}-\d{2}-\d{2}$/)
```

to give such validation feedback.  The rules basically just follow the structure
of the data.

Validating with those rules we get a data structure with the potential error
feedback at the same location as the offending element:

```js
V.validate(rules, [
  {"date": "2017-09-11", "event": "EFSA-H"},
  {"date": "2017-09-20", "event": "EFSA-T"},
  {"date": "",           "event": "EFSA-T"}
])
// [ null,
//   { event: 'duplicate' },
//   { date: 'required', event: 'duplicate' } ]
```

The result tells us that the first object is valid (i.e. there are no validation
errors in it).  The `event` in the second object is a duplicate.  The third
object is missing a date and the event is a duplicate.

## <a id="reference"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#reference) Reference

The [combinators](https://wiki.haskell.org/Combinator) provided by this library
are available as named imports.  Typically one just imports the library as:

```jsx
import * as V from 'partial.lenses.validation'
```

This library is actually just a tiny library built on top of [Partial
Lenses](https://github.com/calmm-js/partial.lenses/)
[transforms](https://github.com/calmm-js/partial.lenses#transforms).  It is also
typical to use e.g. [Ramda](http://ramdajs.com/), bound as `R` in examples, to
implement predicates.

### <a id="operations-on-rules"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#operations-on-rules) Operations on rules

#### <a id="V-validate"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-validate) [`V.validate(rules, data) ~> maybeErrors`](#V-validate) <small><sup>v0.1.0</sup></small>

`V.validate` runs the given validation rules on the given data structure.  Given
properly defined rules, the result is an optional object structure in the shape
of the data structure containing the validation errors.  In case there are no
validation errors, the result is `undefined`.

For example:

```js
V.validate(V.arrayId(V.object(['id'], {
  toBeValidated: V.unless([R.equals(true), 'Must be true!'])
})), [
  {id: 101, toBeValidated: true},
  {id: 42, toBeValidated: false}
])
// [ { id: 42, toBeValidated: 'Must be true!' } ]
```

### <a id="primitive-rules"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#primitive-rules) Primitive rules

#### <a id="V-accept"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-accept) [`V.accept ~> rules`](#V-accept) <small><sup>v0.1.0</sup></small>

`V.accept` accepts the current focus by simply removing it.

For example:

```js
V.validate(V.accept, 'data')
// undefined
```

#### <a id="V-reject"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-reject) [`V.reject(errorValue) ~> rules`](#V-reject) <small><sup>v0.1.0</sup></small>

`V.reject` rejects the current focus by overwriting it with the given error.

For example:

```js
V.validate(V.reject('error'), 'data')
// 'error'
```

### <a id="rules-on-an-element"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#rules-on-an-element) Rules on an element

#### <a id="V-unless"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-unless) [`V.unless(...[(maybeValue, index) => testable, errorValue]) ~> rules`](#V-unless) <small><sup>v0.1.0</sup></small>

`V.unless` is given `[predicate, error]` -pairs as arguments.  The predicates
are called from first to last with the focus.  In case a predicate fails, the
focus is overwritten with the corresponding error.  If all predicates pass, the
focus is removed.

For example:

```js
V.validate(V.unless([R.contains(1), 'does not contain one'],
                    [R.contains(2), 'does not contain two']),
           [1])
// 'does not contain two'
```

### <a id="rules-on-objects"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#rules-on-objects) Rules on objects

#### <a id="V-object"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-object) [`V.object([...propNames], {prop: rules, ...}) ~> rules`](#V-object) <small><sup>v0.1.0</sup></small>

`V.object` is given a list or property names to preserve in case of errors and a
template object of rules with which to validate the corresponding fields.

For example:

```js
V.validate(V.object(['id'], {a: V.accept, b: V.reject('error')}),
           {id: 101, a: 1, b: 2})
// { id: 101, b: 'error' }
```

### <a id="rules-on-arrays"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#rules-on-arrays) Rules on arrays

#### <a id="V-arrayId"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-arrayId) [`V.arrayId(rules) ~> rules`](#V-arrayId) <small><sup>v0.1.0</sup></small>

`V.arrayId` is for validating an array of things that are addressed by and have
unique identities.  The result is an array containing only the rejected
elements.  In case all elements are accepted, the array is removed.  If the
focus is not an array, an empty array `[]` is written as the validation error.
`V.arrayId` is equivalent to [`V.arrayIdOr(V.reject([]))`](#V-arrayIdOr).

For example:

```js
V.validate(V.arrayId(V.object(['id'], {x: V.unless([R.equals(1), 'error'])})),
           [{id: 1, x: 2}, {id: 2, x: 1}])
// [ { id: 1, x: 'error' } ]
```

#### <a id="V-arrayIdOr"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-arrayIdOr) [`V.arrayIdOr(rules, rules) ~> rules`](#V-arrayIdOr) <small><sup>v0.2.0</sup></small>

`V.arrayIdOr` is for validating an array of things that are addressed by and
have unique identities.  The first rules given are used in case the focus is not
an array.  Otherwise the second rules are used on the elements of the array at
focus.  The result is an array containing only the rejected elements.  In case
all elements are accepted, the array is removed.  [`V.arrayId`](#V-arrayId) is
equivalent to `V.arrayIdOr(V.reject([]))`.

For example:

```js
V.validate(V.arrayIdOr(V.reject('Expected an array'),
                       V.object(['id'], {x: V.unless([R.equals(1), 'error'])})),
           [{id: 1, x: 2}, {id: 2, x: 1}])
// [ { id: 1, x: 'error' } ]
```

#### <a id="V-arrayIx"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-arrayIx) [`V.arrayIx(rules) ~> rules`](#V-arrayIx) <small><sup>v0.1.0</sup></small>

`V.arrayIx` is for validating an array of things that are addressed by their
index and have no identities.  The result is an array of the same length as the
input with accepted elements having value `null`.  In case all elements are
accepted, the array is removed.  If the focus is not an array, an empty array
`[]` is written as the validation error.  `V.arrayIx` is equivalent to
[`V.arrayIxOr(V.reject([]))`](#V-arrayIxOr).

For example:

```js
V.validate(V.arrayIx(V.unless([R.equals('a'), 'error'])),
           ['a', 'b'])
// [ null, 'error' ]
```

#### <a id="V-arrayIxOr"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-arrayIxOr) [`V.arrayIxOr(rules, rules) ~> rules`](#V-arrayIxOr) <small><sup>v0.2.0</sup></small>

`V.arrayIxOr` is for validating an array of things that are addressed by their
index and have no identities.  The first rules given are used in case the focus
is not an array.  Otherwise the second rules are used on the elements of the
array at focus.  The result is an array of the same length as the input with
accepted elements having value `null`.  In case all elements are accepted, the
array is removed.  [`V.arrayIx`](#V-arrayIx) is equivalent to
`V.arrayIxOr(V.reject([]))`.

For example:

```js
V.validate(V.arrayIxOr(V.reject('Expected an array'),
                       V.unless([R.equals('a'), 'error'])),
           ['a', 'b'])
// [ null, 'error' ]
```

### <a id="conditional-rules"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#conditional-rules) Conditional rules

#### <a id="V-cases"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-cases) [`V.cases(...[(maybeValue, index) => testable, rules]) ~> rules`](#V-cases) <small><sup>v0.1.0</sup></small>

`V.cases` is given `[predicate, rules]` -pairs as arguments.  The predicates are
called from first to last with the focus.  In case a predicate passes, the
corresponding rules are used on the focus and the remaining predicates are
skipped and rules ignored.  In case all predicates fail, the focus is removed.

For example:

```js
V.validate(V.cases(
  [R.whereEq({type: 'a'}),
   V.object([], {
     foo: V.unless([R.lt(0), 'Must be positive'])
   })],
  [R.whereEq({type: 'b'}),
   V.object([], {
     foo: V.unless([R.gt(0), 'Must be negative'])
   })]
), {
  type: 'b',
  foo: 10
})
// { foo: 'Must be negative' }
```

#### <a id="V-choose"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-choose) [`V.choose((maybeValue, index) => rules) ~> rules`](#V-choose) <small><sup>v0.1.0</sup></small>

`V.choose` is given a function that gets the current focus and then must return
rules to be used on the focus.  This allows rules to depend on the data and
allows rules that examine multiple parts of the data.

For example:

```js
V.validate(V.choose(({a, b}) => V.object([], {
  a: V.unless([R.equals(b), "Must equal 'b'"]),
  b: V.unless([R.equals(a), "Must equal 'a'"])
})), {
  a: 1,
  b: 2
})
// { a: "Must equal 'b'", b: "Must equal 'a'" }
```

Note that `V.choose` can be used to implement [`V.cases`](#V-cases) and
[`V.unless`](#V-unless).  Also note that code inside `V.choose`, including code
that constructs rules, is always run when the `V.choose` rule itself is used.
For performance reasons it can be advantageous to move invariant expressions
outside of the body of the function given to `V.choose`.  Also, when simple
conditional combinators like [`V.cases`](#V-cases) or [`V.unless`](#V-unless)
are sufficient, they can be preferable for performance reasons, because they are
given previously constructed rules.

#### <a id="V-optional"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-optional) [`V.optional(rules) ~> rules`](#V-optional) <small><sup>v0.1.3</sup></small>

`V.optional` is for validating optional fields of objects.  The focus is
accepted if it is `undefined`.  Otherwise the given rules are applied to the
focus.

For example:

```js
V.validate(V.arrayIx(V.object([], {
  field: V.optional(V.unless(R.is(Number), 'Expected a number'))
})), [
  {notTheField: []},
  {field: 'Not a number'},
  {field: 76}
])
// [ null, { field: 'Expected a number' }, null ]
```

## <a id="known-caveats"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#known-caveats) Known caveats

The implementation technique does not lend itself to an incremental
implementation.  Every time [`validate`](#V-validate) is called, everything is
recomputed.  In an interactive setting this can become a performance issue.  It
should be possible to create a library with a similar interface that could
perform validation incrementally so that on repeated calls only changes would be
recomputed.  This is left for future work.

It should actually be possible to use optics
(i.e. [`traverse`](https://github.com/calmm-js/partial.lenses/#L-traverse)) for
asynchronous validation, but this implementation does not currently support such
a thing and validation is entirely synchronous.  Again, it should be possible to
support asynchronous validation with a library that has a similar interface and
would also directly provide asynchronous validation combinators.  This is also
left for future work.

## <a id="related-work"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#related-work) Related work

This library primarily exists as a result of Stefan Rimaila's work on
[validation](https://github.com/stuf/validation) using lenses.
