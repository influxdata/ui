import {parse, format_from_js_file} from '@influxdata/flux'
import View from './view'
import './style.scss'

// TODO: replaces this with the src/flows/context/query:find export once that's merged
const _walk = (node, test, acc = []) => {
  if (!node) {
    return acc
  }

  if (test(node)) {
    acc.push(node)
  }

  Object.values(node).forEach(val => {
    if (Array.isArray(val)) {
      val.forEach(_val => {
        _walk(_val, test, acc)
      })
    } else if (typeof val === 'object') {
      _walk(val, test, acc)
    }
  })

  return acc
}

export default register => {
  register({
    type: 'rawFluxEditor',
    family: 'transform',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--raw-flux',
    button: 'Flux Script',
    description:
      'Unlock the full potential of the system with a raw flux editor',
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
    generateFlux: (pipe, create, append) => {
      const ast = parse(pipe.queries[pipe.activeQuery].text)
      _walk(ast, node => !!Object.keys(node.comments || {}).length).forEach(
        node => {
          delete node.comments
        }
      )
      const text = format_from_js_file(ast)

      if (!text.length) {
        return
      }

      create(text)
      append(`__CURRENT_RESULT__ |> limit(n: 100)`)
    },
  })
}
