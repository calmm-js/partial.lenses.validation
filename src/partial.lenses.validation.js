import * as L from 'partial.lenses'
import * as I from 'infestines'

export const object = /*#__PURE__*/I.curry((propsToKeep, template) => {
  const keys = I.keys(template)
  const keep = propsToKeep.length ? propsToKeep.concat(keys) : keys
  return [L.removable.apply(null, keys),
          L.rewrite(L.get(L.props.apply(null, keep))),
          L.branch(template)]
})

const isNull = x => x === null
const removeIfAllNull = xs => L.all(isNull, L.elems, xs) ? undefined : xs

export const arrayIx = r => [
  L.iso(I.id, removeIfAllNull),
  L.elems,
  L.required(null),
  r]

export const arrayId = r => [L.defaults([]), L.elems, r]

const pargs = (name, fn) => /*#__PURE__*/(process.env.NODE_ENV === 'production' ? I.id : fn => function () {
  if (arguments.length & 1)
    throw Error(`partial.lenses.validation: \`${name}\` must be given an even number of arguments.`)
  return fn.apply(null, arguments)
})(function () {
  let r = accept, n = arguments.length
  while (n) {
    n -= 2
    r = fn(arguments[n], arguments[n+1], r)
  }
  return r
})

export const cases = /*#__PURE__*/pargs('cases', L.iftes)
export const unless = /*#__PURE__*/pargs('unless', (c, a, r) => L.iftes(c, r, reject(a)))

export { choose } from 'partial.lenses'

export const accept = L.removeOp
export const reject = L.setOp
export const validate = L.transform
