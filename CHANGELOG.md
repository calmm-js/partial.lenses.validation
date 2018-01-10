## 0.1.4

The behaviour of `V.arrayIx` and `V.arrayId` on non-arrays was not carefully
defined and has now been deprecated.  In version 0.2.0 `V.arrayId` and
`V.arrayIx` will reject with `[]` as the error value in case the focus is not an
array.  The choice of `[]` as the validation error is motivated by the idea that
the user of the validation combinators can freely choose the format of error
messages.  Version 0.2.0 will also include `V.arrayIxOr` and `V.arrayIdOr`
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

Support for the unpaired style will be removed in version 0.2.0.
