## 2.0.0

To reduce implementation complexity the following combinators no longer allow
the predicates or functions passed to them to be asynchronous:

* `V.ifElse`
* `V.choose`
* `V.cases`
* `V.casesOf`

The functions that are allowed to be asynchronous are now marked in the document
with the `async` keyword.

## 0.3.8

Fixed `V.run` contract.

## 0.3.5

Now immediate exceptions from user defined predicates are caught and the
corresponding focus is rejected with the exception.

## 0.3.2

`V.where` now catches exceptions from predicates.  In case a predicate throws an
exception, the focus is rejected with the exception.

## 0.3.0

**Major** redesign of the library &mdash; hopefully getting close to `1.0.0`.  I
can only apologize for this.  In retrospect, the original implementation was
more of a proof-of-concept and was designed with a very limited use case &mdash;
namely giving validation feedback in UIs &mdash; in mind.  The new design
supports a fundamentally wider range of use cases.

* Previously the combinators only built the rejected part of the validated data
  structure.  That is like using an option type for validation errors.  The
  library now (re)builds the accepted data structure unless a part is rejected
  after which the whole result will be considered rejected.  That is like using
  an either type for validation results.  This allows two new major features to
  be expressed:

  * First of all it is possible to not only validate a data structure, but it is
    also possible to transform it during validation (i.e. the new `V.acceptWith`
    combinator).

  * It is now also possible to support validation of higher order things like
    functions (i.e. the new `V.dependentFn` combinator) that require wrapping
    the accepted value with a validating membrane.

* Rejection by default, i.e. the `V.reject` rule, uses the value in focus as the
  error.

    ```diff
    -V.reject(error)
    +V.rejectAs(error)
    ```

* `V.validate` was changed to return the validated data structure instead of the
  errors.

    ```diff
    -V.validate(rule, data)
    +V.errors(rule, data)
    ```

* Added rule level logical operators `V.and`, `V.or`, and `V.not`.  Also made it
  so that any unary or binary function is treated as a rule (e.g.
  `V.and(R.is(Array), V.not(R.isEmpty))` is a valid rule).

* Dropped `V.object` and `V.objectWith` combinators and introduced `V.keep`,
  `V.props`, and `V.propsOr` to express equivalent functionality more
  compositionally.

    ```diff
    -V.objectWith(rule, [key], {...})
    +V.keep(key, V.propsOr(rule, {...}))
    ```

* The new `V.props` combinator rejects unexpected fields by default.  You can
  get the old behaviour by using `V.propsOr(V.accept)`


    ```diff
    -V.object([key], {...})
    +V.keep(key, V.propsOr(V.accept, {...}))
    ```

  but experience has shown that it is very easy to make mistakes and *it is
  better to have strict validation by default*.

* Dropped `V.arrayIxOr` and `V.arrayIdOr`.  Use `V.ifElse` with `V.arrayIx` or
  `V.arrayId` instead.

    ```diff
    -V.arrayIxOr(otherwise, rule)
    +V.ifElse(R.is(Array), V.arrayIx(rule), otherwise)
    ```

* Dropped `V.unless` and made it so that a pair `[rule, mystery]` is treated as
  `V.rejectAs(mystery, rule)` or `V.rejectWith(mystery, rule)` depending on
  whether `mystery` is a function or not.  This way `V.unless(...)` can be
  replaced with `V.and(...)`.

    ```diff
    -V.unless([p1, e1], ..., [pN, eN])
    +V.and([p1, e1], ..., [pN, eN])
    ```

* Changed `V.cases` to reject in case none of the case predicates is satisfied
  and also to accept a singleton rule as the last case.

    ```diff
    -V.cases(..., [R.T, rule])
    +V.cases(..., [rule])
    ```

  If you specifically want to accept any input in case none of the predicates is
  satisfied, you can get the old behaviour by adding `[V.accept]` as the last
  case

    ```diff
    -V.cases([p1, r1], ..., [pN, rN])
    +V.cases([p1, r1], ..., [pN, rN], [V.accept])
    ```

  but *you usually do not want this*.

## 0.2.1 and 0.2.2

Bug fixes to `V.objectWith`. :(

## 0.2.0

Removed deprecated non-paired functionality from `V.cases` and `V.unless`.

`V.arrayIx` and `V.arrayId` now produce `[]` in case the focus is not an array.

## 0.1.4

The behaviour of `V.arrayIx` and `V.arrayId` on non-arrays was not carefully
defined and has now been deprecated.  In version `0.2.0` `V.arrayId` and
`V.arrayIx` will reject with `[]` as the error value in case the focus is not an
array.  The choice of `[]` as the validation error is motivated by the idea that
the user of the validation combinators can freely choose the format of error
messages.  Version `0.2.0` will also include `V.arrayIxOr` and `V.arrayIdOr`
combinators that allow the user to specify the desired rejection error.

## 0.1.2

`V.cases` and `V.unless` were changed to take pairs as arguments.  The main
motivation for this change is that formatting tools such as Prettier produce
more readable output for the paired style.

```diff
-V.cases(p1, c1, ..., pN, cN)
+V.cases([p1, c1], ..., [pN, cN])
```

```diff
-V.unless(p1, e1, ..., pN, eN)
+V.unless([p1, e1], ..., [pN, eN])
```

Support for the unpaired style will be removed in version `0.2.0`.
