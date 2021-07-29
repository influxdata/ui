import {parse, format_from_js_file} from '@influxdata/flux'
import {find} from 'src/flows/context/query'
import View from './view'
import './style.scss'

const PREVIOUS_REGEXP = /__PREVIOUS_RESULT__/g

export default register => {
  register({
    type: 'rawFluxEditor',
    family: 'transform',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--raw-flux',
    button: 'Flux Script',
    initial: {
      activeQuery: 0,
      queries: [
        {
          text:
            '// Uncomment the following line to continue building from the previous cell\n// __PREVIOUS_RESULT__\n',
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
      const ast = parse(
        data.queries[data.activeQuery].text.replace(PREVIOUS_REGEXP, query)
      )
      find(ast, node => !!Object.keys(node.comments || {}).length).forEach(
        node => {
          delete node.comments
        }
      )
      return format_from_js_file(ast)
    },
  })
}
