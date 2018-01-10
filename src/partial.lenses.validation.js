import * as L from 'partial.lenses'
import * as I from 'infestines'

const header = 'partial.lenses.validation: '
function error(msg) {
  throw Error(header + msg)
}

const isNull = x => x === null

const defaultsArray = L.defaults([])
const requiredNull = L.required(null)

const removeIfAllNull = L.rewrite(
  xs => (L.all(isNull, L.elems, xs) ? undefined : xs)
)

export const accept = L.removeOp
export const reject = L.setOp

export const object = I.curry((propsToKeep, template) => {
  const keys = I.keys(template)
  const keep = propsToKeep.length ? propsToKeep.concat(keys) : keys
  return L.toFunction([
    L.removable.apply(null, keys),
    L.rewrite(L.get(L.props.apply(null, keep))),
    L.branch(template)
  ])
})

const warnNonArrays = msg => fn => rules => {
  rules = fn(rules)
  return L.choose(x => {
    if (!I.isArray(x) && !fn.warned) {
      fn.warned = 1
      console.warn(header + msg)
    }
    return rules
  })
}

export const arrayIx = (process.env.NODE_ENV === 'production'
  ? I.id
  : warnNonArrays(
      'Currently `arrayIx` accepts non-array like objects, but in v0.2.0 it rejects them with `[]`'
    ))(rules => L.toFunction([removeIfAllNull, L.elems, requiredNull, rules]))

export const arrayId = (process.env.NODE_ENV === 'production'
  ? I.id
  : warnNonArrays(
      'Currently `arrayId` ignores non-array like objects, but in v0.2.0 it rejects them with `[]`'
    ))(rules => L.toFunction([defaultsArray, L.elems, rules]))

const pargs = (name, fn) =>
  (process.env.NODE_ENV === 'production'
    ? I.id
    : fn =>
        function() {
          for (let i = 0, n = arguments.length; i < n; ++i) {
            const c = arguments[i]
            if (!I.isArray(c) || c.length !== 2)
              error(name + ' must be given pairs arguments.')
          }
          return fn.apply(null, arguments)
        })(function() {
    let r = accept
    let n = arguments.length
    while (n) {
      const c = arguments[--n]
      r = fn(c[0], c[1], r)
    }
    return r
  })

export const cases = pargs('cases', L.ifElse)
export const unless = pargs('unless', (c, a, r) => L.ifElse(c, r, reject(a)))

export { choose } from 'partial.lenses'

export const optional = rules => L.toFunction([L.optional, rules])

export const validate = L.transform
