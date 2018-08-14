# <a id="partial-lenses-validation"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#) [Partial Lenses Validation](#partial-lenses-validation) &middot; [![Gitter](https://img.shields.io/gitter/room/calmm-js/chat.js.svg)](https://gitter.im/calmm-js/chat) [![GitHub stars](https://img.shields.io/github/stars/calmm-js/partial.lenses.validation.svg?style=social)](https://github.com/calmm-js/partial.lenses.validation) [![npm](https://img.shields.io/npm/dm/partial.lenses.validation.svg)](https://www.npmjs.com/package/partial.lenses.validation)

This is a library of validation
[transform](https://github.com/calmm-js/partial.lenses/#transforms)
[combinators](https://wiki.haskell.org/Combinator).  The main idea is to produce
validation errors in the same shape as the data structure being validated.  This
way validation errors can be accessed at the same path as the data and can be
mechanically associated with the corresponding elements of the validated data
structure.

Note that the [▶
links](https://calmm-js.github.io/partial.lenses.validation/index.html#) take
you to a live version of this page and that there is a
[playground](https://calmm-js.github.io/partial.lenses.validation/playground.html#GoOghgxhCmAOAuBnAFAKAEogJYoMrwCcsA7AcwEoAaVAcgHUj5oACCAewBMWALaA6AIQ1U5IA)
for sharing examples.

[![npm version](https://badge.fury.io/js/partial.lenses.validation.svg)](http://badge.fury.io/js/partial.lenses.validation)
[![Bower version](https://badge.fury.io/bo/partial.lenses.validation.svg)](https://badge.fury.io/bo/partial.lenses.validation)
[![Build Status](https://travis-ci.org/calmm-js/partial.lenses.validation.svg?branch=master)](https://travis-ci.org/calmm-js/partial.lenses.validation)
[![Code Coverage](https://img.shields.io/codecov/c/github/calmm-js/partial.lenses.validation/master.svg)](https://codecov.io/github/calmm-js/partial.lenses.validation?branch=master)
[![](https://david-dm.org/calmm-js/partial.lenses.validation.svg)](https://david-dm.org/calmm-js/partial.lenses.validation)
[![](https://david-dm.org/calmm-js/partial.lenses.validation/dev-status.svg)](https://david-dm.org/calmm-js/partial.lenses.validation?type=dev)

## <a id="contents"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#contents) [Contents](#contents)

* [Examples](#examples)
  * [Event table UI](#event-table-ui)
  * [Library contracts](#library-contracts)
* [Reference](#reference)
  * [Elimination](#elimination)
    * [Synchronous](#synchronous)
      * [`V.accepts(rule, data) ~> boolean`](#V-accepts) <small><sup>v0.3.0</sup></small>
      * [`V.errors(rule, data) ~> errors | undefined`](#V-errors) <small><sup>v0.3.0</sup></small>
      * [`V.validate(rule, data) ~{throws}~> data`](#V-validate) <small><sup>v0.3.0</sup></small>
    * [Asynchronous](#asynchronous)
      * [`V.acceptsAsync(rule, data) ~> promise(boolean)`](#V-acceptsAsync) <small><sup>v0.3.0</sup></small>
      * [`V.errorsAsync(rule, data) ~> promise(errors | undefined)`](#V-errorsAsync) <small><sup>v0.3.0</sup></small>
      * [`V.tryValidateAsyncNow(rule, data) ~{throws}~> data | promise(data)`](#V-tryValidateAsyncNow) <small><sup>v0.3.0</sup></small>
      * [`V.validateAsync(rule, data) ~> promise(data)`](#V-validateAsync) <small><sup>v0.3.0</sup></small>
    * [General](#general)
      * [`V.run({Monad, onAccept: data => any, onReject: error => any}, rule, data) ~> any`](#V-run) <small><sup>v0.3.0</sup></small>
  * [Primitive](#primitive)
    * [`V.accept ~> rule`](#V-accept) <small><sup>v0.3.0</sup></small>
    * [`V.acceptAs(value) ~> rule`](#V-acceptAs) <small><sup>v0.3.0</sup></small>
    * [`V.acceptWith(async (value, index) => value) ~> rule`](#V-acceptWith) <small><sup>v0.3.0</sup></small>
    * [`V.reject ~> rule`](#V-reject) <small><sup>v0.3.0</sup></small>
    * [`V.rejectAs(error) ~> rule`](#V-rejectAs) <small><sup>v0.3.0</sup></small>
    * [`V.rejectWith(async (value, index) => error) ~> rule`](#V-rejectWith) <small><sup>v0.3.0</sup></small>
    * [`V.remove ~> rule`](#V-remove) <small><sup>v0.3.0</sup></small>
  * [Predicates](#predicates)
    * [`V.where(async (value, index) => testable) ~> rule`](#V-where) <small><sup>v0.3.0</sup></small>
  * [Elaboration](#elaboration)
    * [`V.modifyError(async (value, error, index) => error, rule) ~> rule`](#V-modifyError) <small><sup>v0.3.0</sup></small>
    * [`V.setError(error, rule) ~> rule`](#V-setError) <small><sup>v0.3.0</sup></small>
  * [Logical](#logical)
    * [`V.and(...rules) ~> rule`](#V-and) <small><sup>v0.3.0</sup></small>
    * [`V.both(rule, rule) ~> rule`](#V-both) <small><sup>v0.3.3</sup></small>
    * [`V.either(rule, rule) ~> rule`](#V-either) <small><sup>v0.3.3</sup></small>
    * [`V.not(rule) ~> rule`](#V-not) <small><sup>v0.3.0</sup></small>
    * [`V.or(...rules) ~> rule`](#V-or) <small><sup>v0.3.0</sup></small>
  * [Arrays](#arrays)
    * [Uniform](#uniform)
      * [`V.arrayId(rule) ~> rule`](#V-arrayId) <small><sup>v0.3.0</sup></small>
      * [`V.arrayIx(rule) ~> rule`](#V-arrayIx) <small><sup>v0.3.0</sup></small>
    * [Varying](#varying)
      * [`V.args(...rules) ~> rule`](#V-args) <small><sup>v0.3.1</sup></small>
      * [`V.tuple(...rules) ~> rule`](#V-tuple) <small><sup>v0.3.0</sup></small>
  * [Functions](#functions)
    * [`V.dependentFn(rule, (...args) => rule) ~> rule`](#V-dependentFn) <small><sup>v0.3.0</sup></small>
    * [`V.freeFn(rule, rule) ~> rule`](#V-freeFn) <small><sup>v0.3.0</sup></small>
  * [Objects](#objects)
    * [`V.keep('prop', rule) ~> rule`](#V-keep) <small><sup>v0.3.0</sup></small>
    * [`V.optional(rule) ~> rule`](#V-optional) <small><sup>v0.3.0</sup></small>
    * [`V.props({...prop: rule}) ~> rule`](#V-props) <small><sup>v0.3.0</sup></small>
    * [`V.propsOr(rule, {...prop: rule}) ~> rule`](#V-propsOr) <small><sup>v0.3.0</sup></small>
  * [Conditional](#conditional)
    * <a href="#V-cases"><code>V.cases(...[(value, index) =&gt; testable, rule][, [rule]]) ~&gt; rule</code></a> <small><sup>v0.3.0</sup></small>
    * <a href="#V-casesOf"><code>V.casesOf(traversal, ...[(value, index) =&gt; testable, rule][, [rule]]) ~&gt; rule</code></a> <small><sup>v0.3.4</sup></small>
    * [`V.ifElse((value, index) => testable, rule, rule) ~> rule`](#V-ifElse) <small><sup>v0.3.0</sup></small>
  * [Dependent](#dependent)
    * [`V.choose((value, index) => rule) ~> rule`](#V-choose) <small><sup>v0.3.0</sup></small>
  * [Recursive](#recursive)
    * [`V.lazy(rule => rule) ~> rule`](#V-lazy) <small><sup>v0.3.0</sup></small>
  * [Transformation](#transformation)
    * [Ad-hoc](#ad-hoc)
      * [`V.modifyAfter(rule, async (value, index) => value) ~> rule`](#V-modifyAfter) <small><sup>v0.3.3</sup></small>
      * [`V.setAfter(rule, value) ~> rule`](#V-setAfter) <small><sup>v0.3.3</sup></small>
      * [`V.removeAfter(rule) ~> rule`](#V-removeAfter) <small><sup>v0.3.3</sup></small>
    * [Promotion](#promotion)
      * <a href="#V-promote"><code>V.promote(...[rule[, (value, index) =&gt; value]]) ~&gt; rule</code></a> <small><sup>v0.3.6</sup></small>
      * <a href="#V-upgrades"><code>V.upgrades(...[(value, index) =&gt; testable, rule[, async (value, index) =&gt; value]]) ~&gt; rule</code></a> <small><sup>v0.3.6</sup></small>
      * <a href="#V-upgradesOf"><code>V.upgradesOf(traversal, ...[(value, index) =&gt; testable, rule[, async (value, index) => value]]) ~&gt; rule</code></a> <small><sup>v0.3.6</sup></small>
* [Tips](#tips)
  * [Prefer case analysis to logical OR](#prefer-case-analysis-to-logical-or)
  * [Prefer rule templates to logical AND](#prefer-rule-templates-to-logical-and)
* [Known caveats](#known-caveats)
* [Related work](#related-work)

## <a id="examples"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#examples) [Examples](#examples)

The following sections briefly describe some examples based on actual use cases
of this library.

### <a id="event-table-ui"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#event-table-ui) [Event table UI](#event-table-ui)

Imagine a UI &mdash; or take a look at this [live
example](https://codesandbox.io/s/x20w218owo) &mdash; for editing a data
structure that is an array (table) of objects (records) that have a `date` field
and an `event` field:

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
const rules = V.choose(events => V.arrayIx(V.props({
  date: V.and(
    [isNonEmpty,                  'required'],
    [isValidDate,                 'yyyy-mm-dd'],
    [isUniqueBy('date', events),  'duplicate']),
  event: V.and(
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
V.errors(rules, [
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

### <a id="library-contracts"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#library-contracts) [Library contracts](#library-contracts)

The interface file of this library,
[partial.lenses.validation.js](./src/partial.lenses.validation.js), uses the
library itself to specify the contracts for the exports.

Assuming `process.env.NODE_ENV` is not `"production"` and you pass invalid
arguments to a function of this library, you will likely get an error message.
For example,

```js
V.validate(
  V.casesOf(
    'type',
    [
      R.identical('number'),
      V.props({
        type: R.is(String),
        value: R.isNumber
      })
    ],
    [
      R.identical('boolean'),
      V.props({
        type: R.is(String),
        value: R.is(Boolean)
      })
    ],
  ),
  {
    type: 'boolean',
    value: false
  }
)
// Error: {
//   "errors": [
//     "partial.lenses.validation: `props` given invalid arguments",
//     [
//       {
//         "value": null
//       }
//     ]
//   ]
// }
```

throws an error, because `R.isNumber` is not defined.  The error is thrown as
soon as the call to [`V.props`](#V-props) is made.

Examples of other libraries using Partial Lenses Validation for contract
checking:

* [Prettier Printer](https://github.com/polytypic/prettier-printer/blob/master/src/prettier-printer.js)
* [Partial Lenses History](https://github.com/calmm-js/partial.lenses.history/blob/master/src/partial.lenses.history.js)

## <a id="reference"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#reference) [Reference](#reference)

The [combinators](https://wiki.haskell.org/Combinator) provided by this library
are available as named imports.  Typically one just imports the library as:

```jsx
import * as V from 'partial.lenses.validation'
```

This library is actually built on top of [Partial
Lenses](https://github.com/calmm-js/partial.lenses/)
[transforms](https://github.com/calmm-js/partial.lenses#transforms).  It is also
typical to use e.g. [Ramda](http://ramdajs.com/), bound as `R` in examples, to
implement predicates.

### <a id="elimination"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#elimination) [Elimination](#elimination)

To use a validation rule one runs it using one of the elimination functions.

#### <a id="synchronous"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#synchronous) [Synchronous](#synchronous)

In case a validation rule is fully synchronous, it is better to use a
synchronous elimination function, because synchronous validation is faster than
asynchronous validation.

##### <a id="V-accepts"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-accepts) [`V.accepts(rule, data) ~> boolean`](#V-accepts) <small><sup>v0.3.0</sup></small>

`V.accepts(rule, data)` runs the given validation rule on the given data and
simply returns `true` in case the data is accepted and `false` if not.

For example:

```js
V.accepts(V.arrayIx(R.is(String)), ['Yes', 'No'])
// true
```

##### <a id="V-errors"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-errors) [`V.errors(rule, data) ~> errors | undefined`](#V-errors) <small><sup>v0.3.0</sup></small>

`V.errors(rule, data)` runs the given validation rule on the given data.  In
case the data is accepted by the rule, the result is `undefined`.  Otherwise the
result is an object structure in the shape of the data structure containing the
validation errors.

For example:

```js
V.errors(
  V.props({
    no: R.is(Number),
    yes: R.is(String)
  }),
  {
    yes: 101,
  }
)
// { no: null, yes: 101 }
```

Note that in case a validation error would be `undefined`, a `null` is reported
instead.

##### <a id="V-validate"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-validate) [`V.validate(rule, data) ~{throws}~> data`](#V-validate) <small><sup>v0.3.0</sup></small>

`V.validate(rule, data)` runs the given validation rule on the given input data.
In case the data is accepted, the validated output data is returned.  In case
the data is rejected, an [`Error`
object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
is thrown whose message is the stringified validation error and that has an
extra `errors` property that has the (non-stringified) validation errors.

For example:

```js
V.validate(
  V.props({
    missing: R.is(String)
  }),
  {
    unexpected: 'field'
  }
)
// Error: {
//   "missing": null
//   "unexpected": "field"
// }
```

#### <a id="asynchronous"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#asynchronous) [Asynchronous](#asynchronous)

In case a validation rule contains asynchronous parts, it is necessary to use
one of the asynchronous elimination functions.  Functions that are *allowed, but
not required*, to be asynchronous are indicated in the documentation using the
`async` keyword.

The below `ghInfoOfAsync` function is a simple asynchronous function that tries
to use the [public GitHub search
API](https://developer.github.com/v3/search/#search-repositories) to search for
information on a GitHub project of specified name:

```js
async function ghInfoOfAsync(name) {
  const q = encodeURIComponent(name)
  const res = await fetch(`https://api.github.com/search/repositories?q=${q}`)
  const body = await res.json()
  return L.get(['items', L.find(R.whereEq({name}))], body)
}
```

##### <a id="V-acceptsAsync"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-acceptsAsync) [`V.acceptsAsync(rule, data) ~> promise(boolean)`](#V-acceptsAsync) <small><sup>v0.3.0</sup></small>

`V.acceptsAsync(rule, data)` runs the given validation rule on the given data
like [`V.accepts`](#V-accepts) except that the validation rule is allowed to
contain asynchronous validation [predicates](#V-where) and
[transformations](#V-acceptWith).  The result will always be returned as a
[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

##### <a id="V-errorsAsync"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-errorsAsync) [`V.errorsAsync(rule, data) ~> promise(errors | undefined)`](#V-errorsAsync) <small><sup>v0.3.0</sup></small>

`V.errorsAsync(rule, data)` runs the given validation rule on the given data
like [`V.errors`](#V-errors) except that the validation rule is allowed to
contain asynchronous validation [predicates](#V-where) and
[transformations](#V-acceptWith).  The result will always be returned as a
[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

For example:

```js
V.errorsAsync(
  V.arrayId(
    R.pipeP(ghInfoOfAsync, L.get('stargazers_count'), R.lte(100))
  ),
  [
    'partial.lenses',
    'partial.lenses.validation'
  ]
).catch(R.identity).then(console.log)
// [ 'partial.lenses.validation' ]
```

##### <a id="V-tryValidateAsyncNow"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-tryValidateAsyncNow) [`V.tryValidateAsyncNow(rule, data) ~{throws}~> data | promise(data)`](#V-tryValidateAsyncNow) <small><sup>v0.3.0</sup></small>

`V.tryValidateAsyncNow(rule, data)` runs the given validation rule on the given
data like [`V.validateAsync`](#V-validateAsync) except that in case the
validation result is synchronously available it is returned or thrown
immediately as is without wrapping it inside a
[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
In case the result is not available synchronously, a promise is returned.

`V.tryValidateAsyncNow` can be used for wrapping asynchronous functions, for
example, because the first stage of validating a function is always synchronous.

For example:

```js
const ghInfoOfAsyncChecked = V.tryValidateAsyncNow(
  V.dependentFn(
    V.args(R.and(R.is(String), V.not(R.isEmpty))),
    name => V.optional(
      V.propsOr(V.accept, {
        name: R.identical(name),
        stargazers_count: R.is(Number)
        // ...
      })
    )
  ),
  ghInfoOfAsync
)
```

##### <a id="V-validateAsync"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-validateAsync) [`V.validateAsync(rule, data) ~> promise(data)`](#V-validateAsync) <small><sup>v0.3.0</sup></small>

`V.validateAsync(rule, data)` runs the given validation rule on the given data
like [`V.validate`](#V-validate) except that the validation rule is allowed to
contain asynchronous validation [predicates](#V-where) and
[transformations](#V-acceptWith).  The result, whether accepted or rejected, is
returned as a
[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

For example:

```js
V.validateAsync(
  V.arrayId(
    V.and(
      R.is(String),
      V.acceptWith(ghInfoOfAsyncChecked),
      V.keep(
        'name',
        V.propsOr(V.remove, {
          name: R.is(String),
          stargazers_count: V.and(
            R.is(Number),
            [R.lte(1000), n => `Only ${n} stars. You know how to fix it!`]
          )
        })
      )
    )
  ),
  [
    'partial.lenses',
    'partial.lenses.validation'
  ]
).catch(R.identity).then(console.log)
// Error: [
//   {
//     "stargazers_count": "Only 448 stars. You know how to fix it!",
//     "name": "partial.lenses"
//   },
//   {
//     "stargazers_count": "Only 5 stars. You know how to fix it!"
//     "name": "partial.lenses.validation",
//   }
// ]
```

#### <a id="general"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#general) [General](#general)

It is also possible to run validation rules with an arbitrary computational
monad such as a monad based on observables.

##### <a id="V-run"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-run) [`V.run({Monad, onAccept: data => any, onReject: error => any}, rule, data) ~> any`](#V-run) <small><sup>v0.3.0</sup></small>

`V.run({Monad, onAccept, onReject}, rule, data)` runs the given validation rule
on the given data using the specified computational monad and either calls the
accept callback with the validated data or the reject callback with the
validation errors.

The parameters `Monad`, `onAccept`, and `onReject` are optional and default to
what [`V.validate`](#V-validate) uses.  The `Monad` parameter needs to be a
[Static Land](https://github.com/rpominov/static-land) compatible
[Monad](https://github.com/rpominov/static-land) with all the four functions.
If you specify the `Monad`, you will likely want to specify both `onAccept` and
`onReject` as well.

### <a id="primitive"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#primitive) [Primitive](#primitive)

At the most basic level a rule either accepts or rejects the value in focus.

#### <a id="V-accept"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-accept) [`V.accept ~> rule`](#V-accept) <small><sup>v0.3.0</sup></small>

`V.accept` accepts the current focus as is.  `V.accept` should be rarely used as
it performs no validation whatsoever.

#### <a id="V-acceptAs"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-acceptAs) [`V.acceptAs(value) ~> rule`](#V-acceptAs) <small><sup>v0.3.0</sup></small>

`V.acceptAs(value)` accepts the current focus and replaces it with the given
value.  `V.acceptAs` is rarely used alone, because it performs no validation as
such, and is usually combined with e.g. [`V.and`](#V-and).

For example:

```js
V.validate(V.and(R.identical(1), V.acceptAs('one')), 1)
// 'one'
```

#### <a id="V-acceptWith"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-acceptWith) [`V.acceptWith(async (value, index) => value) ~> rule`](#V-acceptWith) <small><sup>v0.3.0</sup></small>

`V.acceptWith(fn)` accepts the current focus and replaces it with the value
returned by the given [possibly async](#asynchronous) function.  `V.acceptWith`
is rarely used alone, because it performs no validation as such, and is usually
combined with e.g. [`V.and`](#V-and).

In a logical [`V.or`](#V-or) each rule gets the same value as input and the
result of the first accepting rule becomes the result.  In a logical
[`V.and`](#V-and) the output of a previous rule becomes the input of the next
rule.

For example:

```js
V.validate(
  V.and(
    V.or(
      V.and(
        R.is(Number),
        V.acceptWith(n => `number ${n}`)
      ),
      R.is(String)
    ),
    V.acceptWith(R.toUpper)
  ),
  10
)
// 'NUMBER 10'
```

#### <a id="V-reject"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-reject) [`V.reject ~> rule`](#V-reject) <small><sup>v0.3.0</sup></small>

`V.reject` rejects the current focus as is.  In case the focus is `undefined`,
the error will be `null` instead.

The idea is that the validation error data structure simply contains the parts
of the validated data structure that weren't accepted.  This usually allows a
programmer who is familiar with the system to quickly diagnose the problem.

For example:

```js
V.errors(
  V.propsOr(V.reject, {}),
  {
    thisField: 'is not allowed',
  }
)
// { thisField: 'is not allowed' }
```

#### <a id="V-rejectAs"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-rejectAs) [`V.rejectAs(error) ~> rule`](#V-rejectAs) <small><sup>v0.3.0</sup></small>

`V.rejectAs(error)` rejects the current focus as the given error value.  In case
the given error value is `undefined`, it is replaced with `null` instead.

Using `V.rejectAs` one can specify what the error should be.  This way an error
data structure can be constructed that can, for example, contain error messages
to be displayed in a form that an end user can understand.

For example:

```js
V.errors(
  V.propsOr(V.rejectAs('Unexpected field'), {}),
  {
    thisField: 'is not allowed',
  }
)
// { thisField: 'Unexpected field' }
```

#### <a id="V-rejectWith"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-rejectWith) [`V.rejectWith(async (value, index) => error) ~> rule`](#V-rejectWith) <small><sup>v0.3.0</sup></small>

`V.rejectWith(fn)` rejects the current focus with the error value returned by
the given [possibly async](#asynchronous) function from the value in focus.  In
case the return value is `undefined`, the error will be `null` instead.

Using `V.rejectWith` one can specify what the error should be depending on the
value in focus.  This allows detailed error messages to be constructed.

For example:

```js
V.errors(
  V.propsOr(
    V.rejectWith(value => `Unexpected field: ${JSON.stringify(value)}`),
    {}
  ),
  {
    thisField: 'is not allowed',
  }
)
// { thisField: 'Unexpected field: "is not allowed"' }
```

#### <a id="V-remove"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-remove) [`V.remove ~> rule`](#V-remove) <small><sup>v0.3.0</sup></small>

`V.remove` replaces the not yet rejected value in focus with `undefined`,
which means that it is removed from the surrounding array or object.  Beware
that `V.remove` by itself performs no validation.  You usually combine
`V.remove` with e.g. [`V.and`](#V-and) or [`V.propsOr`](#V-propsOr).

For example:

```js
V.validate(
  V.propsOr(V.remove, {
    required: R.is(String)
  }),
  {
    required: 'field',
    unexpected: 'and removed'
  }
)
// { required: 'field' }
```

### <a id="predicates"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#predicates) [Predicates](#predicates)

Unary (and binary) functions are implicitly treated as predicates and lifted to
validation rules using [`V.where`](#V-where).

#### <a id="V-where"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-where) [`V.where(async (value, index) => testable) ~> rule`](#V-where) <small><sup>v0.3.0</sup></small>

`V.where(predicate)`, or using the shorthand notation `predicate`, lifts the
given [possibly async](#asynchronous) predicate to a validation rule.  In case
the focus does not satisfy the predicate, it is rejected with
[`V.reject`](#V-reject).

Note that explicitly calling `V.where` is typically unnecessary, because unary
(and binary) functions are implicitly treated as predicates and lifted with
`V.where` to rules in this library.

For example:

```js
V.validate(
  V.props({
    isNumber: V.where(R.is(Number)),
    alsoNumber: R.is(Number) // <-- implicit `V.where`
  }),
  {
    isNumber: 101,
    alsoNumber: 42
  }
)
// { isNumber: 101, alsoNumber: 42 }
```

In case the predicate throws an exception, the focus is rejected with the
exception as the error value.

### <a id="elaboration"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#elaboration) [Elaboration](#elaboration)

It is also possible to modify the error after a rule has rejected the focus.

#### <a id="V-modifyError"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-modifyError) [`V.modifyError(async (value, error, index) => error, rule) ~> rule`](#V-modifyError) <small><sup>v0.3.0</sup></small>

`V.modifyError(fn, rule)`, or using the shorthand notation `[rule, fn]`, acts
like `rule` except that in case the rule rejects the focus, the error is
computed using the given [possibly async](#asynchronous) function that is given
the value in focus, the error from the rule and the index of the focus.  In case
the given function returns `undefined`, the error will be `null` instead.

Note that the shorthand notation `[rule, fn]` can be used instead of a more
verbose function call.  This shorthand is provided to make it more convenient to
attach detailed error messages to rules.

For example:

```js
V.errors(
  V.choose(data => {
    const expectedSum = L.sum(['numbers', L.elems], data)
    return V.props({
      numbers: V.arrayIx(R.is(Number)),
      sum: [ // <-- Implicit `V.modifyError`
        R.identical(expectedSum),
        actualSum => `Expected ${expectedSum} instead of ${actualSum}`
      ]
    })
  }),
  {
    numbers: [3, 1, 4],
    sum: 9
  }
)
// { sum: 'Expected 8 instead of 9' }
```

#### <a id="V-setError"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-setError) [`V.setError(error, rule) ~> rule`](#V-setError) <small><sup>v0.3.0</sup></small>

`V.setError(error, rule)`, or using the shorthand notation `[rule, error]` when
`error` is not a function, acts like `rule` except that in case the rule rejects
the focus, the given error is used instead.  In case the given error is
`undefined`, it is replaced with `null` instead.

Note that the shorthand notation `[rule, error]` can be used instead of a more
verbose function call when the `error` is not a function.  In case `error` is a
function, it is called like with [`V.modifyError`](#V-modifyError).  This
shorthand is provided to make it more convenient to attach detailed error
messages to rules.

For example:

```js
V.errors(
  V.choose(data => {
    const expectedSum = L.sum(['numbers', L.elems], data)
    return V.props({
      numbers: V.arrayIx(R.is(Number)),
      sum: [ // <-- Implicit `V.setError`
        R.identical(expectedSum),
        `Expected ${expectedSum}`
      ]
    })
  }),
  {
    numbers: [3, 1, 4],
    sum: 9
  }
)
// { sum: 'Expected 8' }
```

### <a id="logical"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#logical) [Logical](#logical)

Logical connectives provide a simple means to combine rules to form more complex
rules.

#### <a id="V-and"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-and) [`V.and(...rules) ~> rule`](#V-and) <small><sup>v0.3.0</sup></small>

`V.and(rule1, ..., ruleN)` validates the value in focus with all of the given
rules one-by-one starting from the first given rule.  In case some rule rejects
the focus, that becomes the result of `V.and`.  Otherwise the result of `V.and`
is the accepted result produced by passing the original focus through all of the
given rules.  Note that `V.and` is not curried like [`V.both`](#V-both).

#### <a id="V-both"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-both) [`V.both(rule, rule) ~> rule`](#V-both) <small><sup>v0.3.3</sup></small>

`V.both(rule1, rule2)` validates the value in focus with both of the given rules
starting with the first of the given rules.  `V.both(rule1, rule2)` is
equivalent to [`V.and(rule1, rule2)`](#V-and).

#### <a id="V-either"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-either) [`V.either(rule, rule) ~> rule`](#V-either) <small><sup>v0.3.3</sup></small>

`V.either(rule1, rule2)` validates the value in focus with either of the given
rules starting with the first of the given rules.  `V.either(rule1, rule2)` is
equivalent to [`V.or(rule1, rule2)`](#V-or).

#### <a id="V-not"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-not) [`V.not(rule) ~> rule`](#V-not) <small><sup>v0.3.0</sup></small>

`V.not(rule)` validates the value in focus with the given rule.  In case the
rule accepts the focus, `V.not` rejects it instead.  In case the rule rejects
the focus, `V.not` accepts it instead.

#### <a id="V-or"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-or) [`V.or(...rules) ~> rule`](#V-or) <small><sup>v0.3.0</sup></small>

`V.or(rule1, ..., ruleN)` tries to validate the value in focus with one of the
given rules starting from the first given rule.  In case some rule accepts the
focus, that becomes the result of `V.or`.  Otherwise the error produced by the
last of the given rules becomes the result of `V.or`.  Note that `V.or` is not
curried like [`V.either`](#V-either).

### <a id="arrays"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#arrays) [Arrays](#arrays)

Rules for validating elements can be lifted to rules for validating arrays of
elements.

#### <a id="uniform"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#uniform) [Uniform](#uniform)

All elements in a uniform array have the same form.

##### <a id="V-arrayId"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-arrayId) [`V.arrayId(rule) ~> rule`](#V-arrayId) <small><sup>v0.3.0</sup></small>

`V.arrayId(rule)` validates the elements of an array with the given rule.  In
case one or more elements are rejected, the error is an array containing only
the rejected elements.

The idea is that the elements of the validated array are addressed by some
unique identities intrinsic to the elements.  Filtering out the accepted
elements keeps the error result readable.

##### <a id="V-arrayIx"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-arrayIx) [`V.arrayIx(rule) ~> rule`](#V-arrayIx) <small><sup>v0.3.0</sup></small>

`V.arrayIx(rule)` validates the elements of an array with the given rule.  In
case one or more elements are rejected, the error is an array containing the
rejected elements and `null` values for the accepted elements.

The idea is that elements of the validated array are addressed only by their
index and it is necessary to keep the rejected elements at their original
indices.  The accepted elements are replaced with `null` to make the output less
noisy.

#### <a id="varying"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#varying) [Varying](#varying)

Elements at different positions in a varying array may have different forms.

##### <a id="V-args"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-args) [`V.args(...rules) ~> rule`](#V-args) <small><sup>v0.3.1</sup></small>

`V.args(rule1, ..., ruleN)` validates an array by validating each element of the
array with a specific rule.  If the array is shorter than the number of rules,
the missing elements are treated as being `undefined` and validated with the
corresponding rules.  This means that rules for optional elements need to be
explicitly specified as such.  If the array is longer than the number of rules,
the extra elements are simply accepted.  This is roughly how JavaScript treats
function arguments.  See also [`V.tuple`](#V-tuple).

##### <a id="V-tuple"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-tuple) [`V.tuple(...rules) ~> rule`](#V-tuple) <small><sup>v0.3.0</sup></small>

`V.tuple(rule1, ..., ruleN)` validates a fixed length array by validating each
element of the array with a specific rule.  See also [`V.args`](#V-args).

For example:

```js
V.accepts(
  V.tuple(R.is(String), R.is(Number)),
  ['one', 2]
)
// true
```

Note that elements cannot be removed from a tuple using [`V.remove`](#V-remove).

### <a id="functions"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#functions) [Functions](#functions)

It is also possible to validate functions.  Of course, validating a function is
different from validating data, because it is not possible to validate the
actual arguments to a function before the function is called and likewise it is
only possible to validate the return value of a function after the function
returns.  Therefore validating a function means that the function is wrapped
with a function that performs validation of arguments and the return value as
the function is called.

#### <a id="V-dependentFn"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-dependentFn) [`V.dependentFn(rule, (...args) => rule) ~> rule`](#V-dependentFn) <small><sup>v0.3.0</sup></small>

`V.dependentFn(argumentsRule, argumentsToResultRule)` [wraps](#V-acceptWith) the
function at focus with a validating wrapper that validates the arguments to and
return value from the function as it is called.  The rule for validating the
return value is constructed by calling the given function with the validated
arguments.  In case there is no need for the return value rule to depend on the
actual arguments, one can use the simpler [`V.freeFn`](#V-freeFn) combinator
instead.

For example:

```js
const sqrt = V.validate(
  V.dependentFn(
    V.args(R.both(R.is(Number), R.lte(0))),
    x => y => Math.abs(y*y - x) < 0.001
  ),
  Math.sqrt
)

sqrt(4)
// 2
```

Note that the wrapped function produced by `V.dependentFn` is not curried and
has zero arity.  If necessary, you can wrap the produced function with
e.g. [`R.curryN`](http://ramdajs.com/docs/#curryN) or
[`R.nAry`](http://ramdajs.com/docs/#nAry) to change the arity of the function.

#### <a id="V-freeFn"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-freeFn) [`V.freeFn(rule, rule) ~> rule`](#V-freeFn) <small><sup>v0.3.0</sup></small>

`V.freeFn(argumentsRule, resultRule)` [wraps](#V-acceptWith) the function at
focus with a validating wrapper that validates the arguments to and return value
from the function as it is called.  `V.freeFn` does not allow the rule for the
return value to depend on the arguments.  If you wish to validate the return
value depending on the arguments you need to use the
[`V.dependentFn`](#V-dependentFn) combinator.

For example:

```js
const random = V.validate(
  V.freeFn(
    V.tuple(),
    R.both(R.lte(0), R.gt(1))
  ),
  Math.random
)

random('Does not take arguments!')
// Error: [
//   "Does not take arguments!"
// ]
```

Note that the wrapped function produced by `V.freeFn` is not curried and has
zero arity.  If necessary, you can wrap the produced function with
e.g. [`R.curryN`](http://ramdajs.com/docs/#curryN) or
[`R.nAry`](http://ramdajs.com/docs/#nAry) to change the arity of the function.

### <a id="objects"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#objects) [Objects](#objects)

Rules for validating objects can be formed by composing rules for validating
individual properties of objects.

#### <a id="V-keep"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-keep) [`V.keep('prop', rule) ~> rule`](#V-keep) <small><sup>v0.3.0</sup></small>

`V.keep('prop', rule)` acts like the given rule except that in case the rule
rejects the focus, the specified property is copied from the original object to
the error object.  This is useful when e.g. validating arrays of objects with an
identifying property.  Keeping the identifying property allows the rejected
object to be identified.

#### <a id="V-optional"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-optional) [`V.optional(rule) ~> rule`](#V-optional) <small><sup>v0.3.0</sup></small>

`V.optional(rule)` acts like the given rule except that in case the focus is
`undefined` it is accepted without invoking the given rule.  This is
particularly designed for specifying that an object property is optional.

For example:

```js
V.validate(
  V.arrayIx(
    V.props({
      field: V.optional([R.is(Number), 'Expected a number'])
    })
  ),
  [
    {notTheField: []},
    {field: 'Not a number'},
    {field: 76}
  ]
)
// Error: [
//   {
//     "notTheField": []
//   },
//   {
//     "field": "Expected a number"
//   },
//   null
// ]
```

#### <a id="V-props"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-props) [`V.props({...prop: rule}) ~> rule`](#V-props) <small><sup>v0.3.0</sup></small>

`V.props({prop: rule, ...})` is for validating an object and is given a template
object of rules with which to validate the corresponding fields.  Unexpected
fields are rejected.  Note that `V.props` is equivalent to
[`V.propsOr(V.reject)`](#V-propsOr).

#### <a id="V-propsOr"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-propsOr) [`V.propsOr(rule, {...prop: rule}) ~> rule`](#V-propsOr) <small><sup>v0.3.0</sup></small>

`V.propsOr(otherwise, {prop: rule, ...})` is for validating an object and is
given a rule to apply to fields not otherwise specified and a template object of
rules with which to validate the corresponding fields.  Note that
[`V.props`](#V-props) is equivalent to `V.propsOr(V.reject)`.

### <a id="conditional"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#conditional) [Conditional](#conditional)

Rules can be chosen conditionally on the data being validated.

#### <a id="V-cases"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-cases) <a href="#V-cases"><code>V.cases(...[(value, index) =&gt; testable, rule][, [rule]]) ~&gt; rule</code></a> <small><sup>v0.3.0</sup></small>

`V.cases([p1, r1], ..., [pN, rN], [r])` is given `[predicate, rule]` -pairs as
arguments.  The predicates are called from first to last with the focus.  In
case a predicate passes, the corresponding rule is used on the focus and the
remaining predicates are skipped and rules ignored.  The last argument to
`V.cases` can be a default rule that omits the predicate, `[rule]`, in which
case the rule is always applied in case no predicate passes.  In case all
predicates fail and there is no default rule, the focus is rejected.

For example:

```js
V.validate(
  V.cases(
    [
      R.whereEq({type: 'a'}),
      V.propsOr(V.accept, {
        foo: [R.lt(0), 'Must be positive']
      })
    ],
    [
      V.propsOr(V.accept, {
        foo: [R.gt(0), 'Must be negative']
      })
    ]
  ),
  {
    type: 'b',
    foo: 10
  }
)
// Error: {
//   "foo": "Must be negative"
// }
```

Note that, like with [`V.ifElse`](#V-ifElse), `V.cases([p1, r1], ..., [rN])` can
be expressed in terms of the logical operators, but `V.cases` has a simpler
internal implementation and is likely to be faster.

#### <a id="V-casesOf"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-casesOf) <a href="#V-casesOf"><code>V.casesOf(traversal, ...[(value, index) =&gt; testable, rule][, [rule]]) ~&gt; rule</code></a> <small><sup>v0.3.4</sup></small>

`V.casesOf(traversal, [p1, r1], ..., [pN, rN], [r])` is like
[`V.cases`](#V-cases) except that subfocuses for the predicates are produced by
the given traversal from the current focus and a case is taken if the predicate
accepts any one of the subfocuses.

For example:

```js
V.validate(
  V.casesOf(
    'type',
    [R.identical('number'), V.props({type: R.is(String), value: R.is(Number)})],
    [R.identical('string'), V.props({type: R.is(String), value: R.is(String)})]
  ),
  {
    type: 'string',
    value: 'foo'
  }
)
// { type: 'string', value: 'foo' }
```

#### <a id="V-ifElse"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-ifElse) [`V.ifElse((value, index) => testable, rule, rule) ~> rule`](#V-ifElse) <small><sup>v0.3.0</sup></small>

`V.ifElse(predicate, consequent, alternative)` acts like the given consequent
rule in case the predicate is satisfied by the focus and otherwise like the
given alternative rule.

For example:

```js
V.validate(
  V.ifElse(R.is(Number), R.lte(0), R.is(String)),
  -1
)
// Error: -1
```

Note that `V.ifElse(p, c, a)` can be expressed as `V.or(V.and(p, c),
V.and(V.not(p), a))`, but `V.ifElse` has a simpler internal implementation and
is likely to be faster.

### <a id="dependent"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#dependent) [Dependent](#dependent)

Rules can depend on the data being validated.

#### <a id="V-choose"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-choose) [`V.choose((value, index) => rule) ~> rule`](#V-choose) <small><sup>v0.3.0</sup></small>

`V.choose(fn)` is given a function that gets the current focus and then must
return rules to be used on the focus.  This allows rules to depend on the data
and allows rules that examine multiple parts of the data.

For example:

```js
V.validate(
  V.choose(({a, b}) => V.props({
    a: [R.equals(b), "Must equal 'b'"],
    b: [R.equals(a), "Must equal 'a'"]
  })),
  {
    a: 1,
    b: 2
  }
)
// Error: {
//   "a": "Must equal 'b'",
//   "b": "Must equal 'a'"
// }
```

Note that `V.choose` can be used to implement conditionals like
[`V.cases`](#V-cases) and [`V.ifElse`](#V-ifElse).  Also note that code inside
`V.choose`, including code that constructs rules, is always run when the
`V.choose` rule itself is used.  For performance reasons it can be advantageous
to move invariant expressions outside of the body of the function given to
`V.choose`.  Also, when simpler conditional combinators like
[`V.cases`](#V-cases) or [`V.ifElse`](#V-ifElse) are sufficient, they can be
preferable for performance reasons, because they are given previously
constructed rules.

### <a id="recursive"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#recursive) [Recursive](#recursive)

Rules for recursive data structures can be constructed with the help of
[`V.choose`](#V-choose) and [`V.lazy`](#V-lazy), which both allow one to refer
back to the rule itself or to delay the invocation of a rule computing function.

#### <a id="V-lazy"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-lazy) [`V.lazy(rule => rule) ~> rule`](#V-lazy) <small><sup>v0.3.0</sup></small>

`V.lazy(fn)` constructs a rule lazily.  The given function is passed a
forwarding proxy to its own return value.  This allows the rule to use itself as
a subrule and construct a recursive rule.

For example:

```js
V.accepts(
  V.lazy(tree => V.arrayId(
    V.props({
      name: R.is(String),
      children: tree
    })
  )),
  [
    {
      name: 'root',
      children: [
        {name: '1st child', children: []},
        {
          name: '2nd child',
          children: [{name: 'You got the point', children: []}]
        },
      ]
    }
  ]
)
// true
```

### <a id="transformation"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#transformation) [Transformation](#transformation)

Rules can modify the value after a rule has accepted the focus.

#### <a id="ad-hoc"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#ad-hoc) [Ad-hoc](#ad-hoc)

Rules can include simple ad-hoc post-validation transformations.

##### <a id="V-modifyAfter"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-modifyValue) [`V.modifyAfter(rule, async (value, index) => value) ~> rule`](#V-modifyAfter) <small><sup>v0.3.3</sup></small>

`V.modifyAfter(rule, fn)` replaces the focus after the given rule has accepted
it with the value returned by the given [possibly async](#asynchronous)
function.  `V.modifyAfter(rule, fn)` is equivalent to [`V.both(rule,
V.acceptWith(fn))`](#V-both).

##### <a id="V-setAfter"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-setValue) [`V.setAfter(rule, value) ~> rule`](#V-setAfter) <small><sup>v0.3.3</sup></small>

`V.setAfter(rule, value)` replaces the focus after the given rule has accepted
it with the given value.  `V.setAfter(rule, value)` is equivalent to
[`V.both(rule, V.acceptAs(value))`](#V-both).

##### <a id="V-removeAfter"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-removeValue) [`V.removeAfter(rule) ~> rule`](#V-removeAfter) <small><sup>v0.3.3</sup></small>

`V.removeAfter(rule)` removes the focus after the given rule has accepted it.
`V.removeAfter(rule)` is equivalent to [`V.both(rule, V.remove)`](#V-both).

#### <a id="promotion"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#promotion) [Promotion](#promotion)

Rules can validate versioned data and transform it to another version in the
process.  The combinators [`V.promote`](#V-promote),
[`V.upgrades`](#V-upgrades), [`V.upgradesOf`](#V-upgradesOf) are designed for
cases where there are multiple versions of data or schema.  Using them one can
validate any one of the versions and also convert the data to desired version
&mdash; usually to the latest version &mdash; so that rest of the program does
not need to deal with different versions.

##### <a id="V-promote"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-promote) <a href="#V-promote"><code>V.promote(...[rule[, (value, index) =&gt; value]]) ~&gt; rule</code></a> <small><sup>v0.3.6</sup></small>

`V.promote` is like [`V.or`](#V-or), but the rules given to `V.promote` need to
be wrapped inside an array `[rule]` and may optionally include a transformation
function, `[rule, fn]`.  `V.promote` tries, like [`V.or`](#V-or), to find a rule
that accepts the focus.  If no such rule is found, the focus is rejected.
Otherwise if the accepting rule has an associated function, then the function is
used to transform the focus and the same validation process is rerun.  This way
any sequence of transformations is also validated.

For example:

```js
V.validate(
  V.promote(
    [
      V.props({
        type: R.identical('v2'),
        value: R.is(Number)
      })
    ],
    [
      V.props({
        type: R.identical('v1'),
        constant: R.is(Number)
      }),
      ({constant}) => ({type: 'v2', value: constant})
    ]
  ),
  {type: 'v1', constant: 42}
)
// { type: 'v2', value: 42 }
```

Note that [`V.or(r1, ..., rN)`](#V-or) is equivalent to `V.promote([r1], ...,
[rN])`.

##### <a id="V-upgrades"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-upgrades) <a href="#V-upgrades"><code>V.upgrades(...[(value, index) =&gt; testable, rule[, async (value, index) =&gt; value]]) ~&gt; rule</code></a> <small><sup>v0.3.6</sup></small>

`V.upgrades` is like [`V.cases`](#V-cases), but each case may optionally include
a transformation function, `[predicate, rule, fn]`.  `V.upgrades` tries, like
[`V.cases`](#V-cases), to find the first passing predicate.  When no such
predicate is found, the focus is rejected.  Otherwise the focus is validated
with the associated rule.  If the case also includes a [possibly
async](#asynchronous) transformation function, the function is used to transform
the value in focus and the same validation process is rerun.  This way any
sequence of transformations is also validated.

For example:

```js
V.validate(
  V.upgrades(
    [
      L.get(['type', R.identical('v1')]),
      V.props({
        type: R.is(String),
        constant: R.is(Number)
      }),
      ({constant}) => ({type: 'v2', value: constant})
    ],
    [
      L.get(['type', R.identical('v2')]),
      V.props({
        type: R.is(String),
        value: R.is(Number)
      })
    ]
  ),
  {type: 'v1', constant: 42}
)
// { type: 'v2', value: 42 }
```

Note that `V.cases([p1, r1], ..., [[pN, ]rN])` is equivalent to `V.upgrades([p1,
r1], ..., [[pN, ]rN])`.

##### <a id="V-upgradesOf"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#V-upgradesOf) <a href="#V-upgradesOf"><code>V.upgradesOf(traversal, ...[(value, index) =&gt; testable, rule[, async (value, index) => value]]) ~&gt; rule</code></a> <small><sup>v0.3.6</sup></small>

`V.upgradesOf` is like [`V.casesOf`](#V-casesOf), but each case may optionally
include a transformation function, `[predicate, rule, fn]`.  `V.upgradesOf`
tries, like [`V.casesOf`](#V-casesOf), to find the first predicate that accepts
any one of the the traversed subfocuses.  When no such predicate is found, the
focus is rejected.  Otherwise the focus is validated with the associated rule.
If the case also includes a [possibly async](#asynchronous) transformation
function, the function is used to transform the value in focus and the same
validation process is rerun.  This way any sequence of transformations is also
validated.

For example:

```js
V.validate(
  V.upgradesOf(
    'type',
    [
      R.identical('v1'),
      V.props({
        type: R.is(String),
        constant: R.is(Number)
      }),
      ({constant}) => ({type: 'v2', value: constant})
    ],
    [
      R.identical('v2'),
      V.props({
        type: R.is(String),
        value: R.is(Number)
      })
    ]
  ),
  {type: 'v1', constant: 42}
)
// { type: 'v2', value: 42 }
```

Note that `V.casesOf(t, [p1, r1], ..., [[pN, ]rN])` is equivalent to
`V.upgradesOf(t, [p1, r1], ..., [[pN, ]rN])`.

## <a id="tips"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#tips) [Tips](#tips)

The following subsections give some tips on effective use of this library.

### <a id="prefer-case-analysis-to-logical-or"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#prefer-case-analysis-to-logical-or) [Prefer case analysis to logical OR](#prefer-case-analysis-to-logical-or)

The logical combinators [`V.or`](#V-or), [`V.either`](#V-either), and also
[`V.promote`](#V-promote), can be convenient, but it is often preferable to use
conditional combinators like [`V.cases`](#V-cases) and
[`V.upgrades`](#V-upgrades), because, once a case predicate has been satisfied,
no other cases are attempted in case the corresponding rule fails and the
resulting error is likely to be of higher quality.

### <a id="prefer-rule-templates-to-logical-and"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#prefer-rule-templates-to-logical-and) [Prefer rule templates to logical AND](#prefer-rule-templates-to-logical-and)

It might be tempting to use [`V.and`](#V-and) to combine
[`V.propsOr(V.accept)`](#V-propsOr) rules

```jsx
V.and(
  V.propsOr(V.accept, rules1),
  V.propsOr(V.accept, rules2),
  // ...
)
```

but this has a couple of disadvantages:

* The resulting rule will accept additional properties.
* If one of the `V.propsOr` rules rejects, then errors from later rules are not
  reported.

It is usually better to combine rule templates inside [`V.props`](#V-props) instead:

```jsx
V.props({
  ...rules1,
  ...rules2,
  // ...
})
```

This way additional properties are not accepted and errors from all rules are
reported in case of rejection.

## <a id="known-caveats"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#known-caveats) [Known caveats](#known-caveats)

Probably the main weakness in the design of this library is that this library
specifically tries to avoid having to implement everything.  In particular, one
of the ideas is to simply allow arbitrary predicates from a library like
[Ramda](http://ramdajs.com/) to be used as rules.  This means that rules do not
contain extra information such as a corresponding [random value
generator](https://en.wikipedia.org/wiki/QuickCheck) of values matching the rule
or a traversable specification of the rule for exporting the specification for
[external tools](https://en.wikipedia.org/wiki/OpenAPI_Specification).  One way
to provide such features is to pair validation rules with the necessary extra
information.  It should be possible to do that outside of this library.

The current implementation does not operate
[incrementally](https://en.wikipedia.org/wiki/Incremental_computing).  Every
time e.g. [`V.validate`](#V-validate) is called, everything is recomputed.  This
can become a performance issue particularly in an interactive setting where
small incremental changes to a data structure are being validated in response to
user actions.  It should be possible to implement caching so that on repeated
calls only changes would be recomputed.  This is left for future work.

## <a id="related-work"></a> [≡](#contents) [▶](https://calmm-js.github.io/partial.lenses.validation/index.html#related-work) [Related work](#related-work)

This library primarily exists as a result of Stefan Rimaila's work on
[validation](https://github.com/stuf/validation) using lenses.
