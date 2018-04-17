import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'

const build = ({NODE_ENV, format, suffix}) => ({
  external: ['infestines', 'partial.lenses'],
  input: 'src/partial.lenses.validation.js',
  output: {
    globals: {infestines: 'I', 'partial.lenses': 'L'},
    name: 'V',
    format,
    file: `dist/partial.lenses.validation.${suffix}`
  },
  plugins: [
    NODE_ENV && replace({'process.env.NODE_ENV': JSON.stringify(NODE_ENV)}),
    nodeResolve({modulesOnly: true}),
    babel(),
    NODE_ENV === 'production' &&
      uglify({
        compress: {
          hoist_funs: true,
          passes: 3,
          pure_getters: true,
          pure_funcs: ['require', 'Object.freeze']
        }
      })
  ].filter(x => x)
})

export default [
  build({format: 'cjs', suffix: 'cjs.js'}),
  build({format: 'es', suffix: 'es.js'}),
  build({format: 'umd', suffix: 'js', NODE_ENV: 'dev'}),
  build({format: 'umd', suffix: 'min.js', NODE_ENV: 'production'})
]
