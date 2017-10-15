# <a id="partial-lenses-validation"></a> [≡](#contents) Partial Lenses Validation &middot; [![Gitter](https://img.shields.io/gitter/room/calmm-js/chat.js.svg)](https://gitter.im/calmm-js/chat) [![GitHub stars](https://img.shields.io/github/stars/calmm-js/partial.lenses.validation.svg?style=social)](https://github.com/calmm-js/partial.lenses.validation) [![npm](https://img.shields.io/npm/dm/partial.lenses.validation.svg)](https://www.npmjs.com/package/partial.lenses.validation)

Validation [transform](https://github.com/calmm-js/partial.lenses/#transforms)
[combinators](https://wiki.haskell.org/Combinator) for [Partial
Lenses](https://github.com/calmm-js/partial.lenses/).  The main idea is to
produce validation errors in the same shape as the data being validated.  This
way validation errors can be mechanically associated with the corresponding
elements of the validated data structure.

[![npm version](https://badge.fury.io/js/partial.lenses.validation.svg)](http://badge.fury.io/js/partial.lenses.validation)
[![Bower version](https://badge.fury.io/bo/partial.lenses.validation.svg)](https://badge.fury.io/bo/partial.lenses.validation)
[![Build Status](https://travis-ci.org/calmm-js/partial.lenses.validation.svg?branch=master)](https://travis-ci.org/calmm-js/partial.lenses.validation)
[![Code Coverage](https://img.shields.io/codecov/c/github/calmm-js/partial.lenses.validation/master.svg)](https://codecov.io/github/calmm-js/partial.lenses.validation?branch=master)
[![](https://david-dm.org/calmm-js/partial.lenses.validation.svg)](https://david-dm.org/calmm-js/partial.lenses.validation)
[![](https://david-dm.org/calmm-js/partial.lenses.validation/dev-status.svg)](https://david-dm.org/calmm-js/partial.lenses.validation?type=dev)

## <a id="contents"></a> [≡](#contents) Contents

* [Reference](#reference)
  * [Operations on rules](#operations-on-rules)
    * [`V.validate(rules, data) ~> maybeErrors`](#V-validate) <small><sup>v0.1.0</sup></small>
  * [Primitive rules](#primitive-rules)
    * [`V.accept ~> rules`](#V-accept) <small><sup>v0.1.0</sup></small>
    * [`V.reject(error) ~> rules`](#V-reject) <small><sup>v0.1.0</sup></small>
  * [Rules on an element](#rules-on-an-element)
    * [`V.unless(predicate, error, ...) ~> rules`](#V-rules) <small><sup>v0.1.0</sup></small>
  * [Rules on objects](#rules-on-objects)
    * [`V.object([...propNames], {prop: rules, ...}) ~> rules`](#V-object) <small><sup>v0.1.0</sup></small>
  * [Rules on arrays](#rules-on-arrays)
    * [`V.arrayIx(rules) ~> rules`](#V-arrayIx) <small><sup>v0.1.0</sup></small>
    * [`V.arrayId(rules) ~> rules`](#V-arrayId) <small><sup>v0.1.0</sup></small>
  * [Conditional rules](#conditional-rules)
    * [`V.cases(predicate, rules, ...) ~> rules`](#V-cases) <small><sup>v0.1.0</sup></small>
    * [`V.choose(maybeData -> rules) ~> rules`](#V-choose) <small><sup>v0.1.0</sup></small>
* [Known caveats](#known-caveats)
* [Related work](#related-work)

## <a id="reference"></a> [≡](#contents) Reference

The [combinators](https://wiki.haskell.org/Combinator) provided by this library
are available as named imports.  Typically one just imports the library as:

```js
import * as V from "partial.lenses.validation"
```

### <a id="operations-on-rules"></a> [≡](#contents) Operations on rules
##### <a id="V-validate"></a> [≡](#contents) [`V.validate(rules, data) ~> maybeErrors`](#V-validate) <small><sup>v0.1.0</sup></small>

`V.validate` runs the given validation rules on the given data structure.  Given
properly defined rules, the result is an optional object structure in the shape
of the data structure containing the validation errors.  In case there are no
validation errors, the result is `undefined`.

For example:

```js
V.validate(V.reject('error'), 'data')
// 'error'
V.validate(V.accept, 'data')
// undefined
```

`V.validate` is actually a synonym for
[`L.transform`](https://github.com/calmm-js/partial.lenses/#L-transform) and
"rules" are just Partial Lenses
[transforms](https://github.com/calmm-js/partial.lenses#transforms).

### <a id="primitive-rules"></a> [≡](#contents) Primitive rules
##### <a id="V-accept"></a> [≡](#contents) [`V.accept ~> rules`](#V-accept) <small><sup>v0.1.0</sup></small>

`V.accept` accepts the current focus by simply removing it.

##### <a id="V-reject"></a> [≡](#contents) [`V.reject(error) ~> rules`](#V-reject) <small><sup>v0.1.0</sup></small>

`V.reject` overwrite the focus with the given error.

### <a id="rules-on-an-element"></a> [≡](#contents) Rules on an element
##### <a id="V-unless"></a> [≡](#contents) [`V.unless(predicate, error, ...) ~> rules`](#V-rules) <small><sup>v0.1.0</sup></small>

`V.unless` is given a list of predicate-error -pairs as arguments.  The
predicates are called from first to last with the focus.  In case a predicate
fails, the focus is overwritten with the corresponding error.  If all predicates
pass, the focus is removed.

For example:

```js
V.validate(V.unless(R.contains(1), 'does not contain one',
                    R.contains(2), 'does not contain two'),
           [1])
// 'does not contain two'
```

### <a id="rules-on-objects"></a> [≡](#contents) Rules on objects
##### <a id="V-object"></a> [≡](#contents) [`V.object([...propNames], {prop: rules, ...}) ~> rules`](#V-object) <small><sup>v0.1.0</sup></small>

`V.object` is given a list or property names to preserve in case of errors and a
template object of rules with which to validate the corresponding fields.

For example:

```js
V.validate(V.object(['id'], {a: V.accept, b: V.reject('error')}),
           {id: 101, a: 1, b: 2})
// { id: 101, b: 'error' }
```

### <a id="rules-on-arrays"></a> [≡](#contents) Rules on arrays
##### <a id="V-arrayIx"></a> [≡](#contents) [`V.arrayIx(rules) ~> rules`](#V-arrayIx) <small><sup>v0.1.0</sup></small>

`V.arrayIx` is for validating an array of things that are addressed by their
index and have no identities.  The result is an array of the same length as the
input with accepted elements having value `null`.  In case all elements are
accepted, the array is removed.

```js
V.validate(V.arrayIx(V.unless(R.equals('a'), 'error')),
           ['a', 'b'])
// [ null, 'error' ]
```

##### <a id="V-arrayId"></a> [≡](#contents) [`V.arrayId(rules) ~> rules`](#V-arrayId) <small><sup>v0.1.0</sup></small>

`V.arrayId` is for validating an array of things that are addressed by and have
unique identities.  The result is an array containing only the rejected
elements.  In case all elements are accepted, the array is removed.

```js
V.validate(V.arrayId(V.object(['id'], {x: V.unless(R.equals(1), 'error')})),
           [{id: 1, x: 2}, {id: 2, x: 1}])
// [ { id: 1, x: 'error' } ]
```

### <a id="conditional-rules"></a> [≡](#contents) Conditional rules
##### <a id="V-cases"></a> [≡](#contents) [`V.cases(predicate, rules, ...) ~> rules`](#V-cases) <small><sup>v0.1.0</sup></small>

`V.cases` is given a list of predicate-rule -pairs as arguments.  The predicates
are called from first to last with the focus.  In case a predicate passes, the
corresponding rule is used on the focus and the remaining predicates are skipped
and rules ignored.  In case all predicates fail, the focus is removed.

##### <a id="V-choose"></a> [≡](#contents) [`V.choose(maybeData -> rules) ~> rules`](#V-choose) <small><sup>v0.1.0</sup></small>

`V.choose` is given a function that gets the current focus and then must return
rules to be used on the focus.  This allows rules to depend on the data and
allows rules that examine multiple parts of the data.

## <a id="known-caveats"></a> [≡](#contents) Known caveats

The implementation technique does not lend itself to an incremental
implementation.  Every time [`validate`](V-validate) is run, everything is
recomputed.  In an interactive settings this can become a performance issue.

It would actually likely be possible to use optics for asynchronous validation,
but this implementation does not directly support such a thing and validation is
entirely synchronous.

## <a id="related-work"></a> [≡](#contents) Related work

This library primarily exists as a result of Stefan Rimaila's work on
[validation](https://github.com/stuf/validation) using lenses.
