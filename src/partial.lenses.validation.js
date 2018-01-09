import * as L from 'partial.lenses'
import * as I from 'infestines'

const header = 'partial.lenses.validation: '
const error = msg => {
  throw Error(header + msg)
}

export const object = I.curry((propsToKeep, template) => {
  const keys = I.keys(template)
  const keep = propsToKeep.length ? propsToKeep.concat(keys) : keys
  return L.toFunction([
    L.removable.apply(null, keys),
    L.rewrite(L.get(L.props.apply(null, keep))),
    L.branch(template)
  ])
})

const isNull = x => x === null
const removeIfAllNull = xs => (L.all(isNull, L.elems, xs) ? undefined : xs)

export const arrayIx = r =>
  L.toFunction([L.iso(I.id, removeIfAllNull), L.elems, L.required(null), r])

export const arrayId = r => L.toFunction([L.defaults([]), L.elems, r])

const pargs = (name, fn) =>
  (process.env.NODE_ENV === 'production'
    ? I.id
    : fn =>
        function() {
          const n = arguments.length
          if (n) {
            if (I.isArray(arguments[0])) {
              for (let i = 0; i < n; ++i) {
                const c = arguments[i]
                if (!I.isArray(c) || c.length !== 2)
                  error(name + ' must be given pairs arguments.')
              }
            } else {
              if (!pargs.warned) {
                pargs.warned = 1
                console.warn(
                  header +
                    name +
                    ' now expects pairs as arguments.  Support for unpaired arguments will be removed in v0.2.0.'
                )
              }
              if (n & 1)
                error(name + ' must be given an even number of arguments.')
            }
          }
          return fn.apply(null, arguments)
        })(function() {
    let r = accept,
      n = arguments.length
    if (n) {
      if (I.isArray(arguments[0])) {
        do {
          const c = arguments[--n]
          r = fn(c[0], c[1], r)
        } while (n)
      } else {
        do {
          n -= 2
          r = fn(arguments[n], arguments[n + 1], r)
        } while (n)
      }
    }
    return r
  })

export const cases = pargs('cases', L.ifElse)
export const unless = pargs('unless', (c, a, r) => L.ifElse(c, r, reject(a)))

export { choose } from 'partial.lenses'

export const accept = L.removeOp
export const reject = L.setOp
export const validate = L.transform
