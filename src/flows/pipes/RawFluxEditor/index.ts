import {parse, format_from_js_file} from '@influxdata/flux-lsp-browser'
import {find} from 'src/shared/contexts/query'
import View from './view'
import ReadOnly from './readOnly'
import './style.scss'

export default register => {
  register({
    type: 'rawFluxEditor',
    family: 'inputs',
    priority: 0,
    component: View,
    readOnlyComponent: ReadOnly,
    featureFlag: 'flow-panel--raw-flux',
    button: 'Flux Script',
    initial: {
      activeQuery: 0,
      queries: [
        {
          text: '// Uncomment the following line to continue building from the previous cell\n// __PREVIOUS_RESULT__\n',
          editMode: 'advanced',
          builderConfig: {
            buckets: [],
            tags: [],
            functions: [],
          },
        },
      ],
    },
    source: (data, query) => {
      try {
        const q = parse(query)
        const ast = parse(data.queries[data.activeQuery].text)
        const body = q.body.map(b => b.location.source).join('\n')

        if (!ast.body.length) {
          return ''
        }

        ast.imports = Object.values(
          q.imports.concat(ast.imports).reduce((acc, curr) => {
            acc[curr.path.value] = curr
            return acc
          }, {})
        )

        find(ast, node => !!Object.keys(node.comments || {}).length).forEach(
          node => {
            delete node.comments
          }
        )

        find(
          ast,
          node =>
            node.type === 'Identifier' && node.name === '__PREVIOUS_RESULT__'
        ).forEach(node => {
          node.name = body
        })

        return format_from_js_file(ast)
      } catch {
        return
      }
    },
  })
}
