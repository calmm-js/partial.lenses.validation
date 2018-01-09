## 0.1.2

`V.cases` and `V.unless` were changed to take pairs as arguments.  The main
motivation for this change is that formatting tools such as Prettier produce
more readable output for the paired style.

```diff
-V.cases(p1, c1, ..., pN, cN)
+V.cases([p1, c1], ..., [pN, CN])
```

```diff
-V.unless(p1, e1, ..., pN, eN)
+V.unless([p1, e1], ..., [pN, eN])
```

Support for the unpaired style will be removed in version 0.2.0.
