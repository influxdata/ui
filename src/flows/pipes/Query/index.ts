import View from './view'
import './style.scss'

const PREVIOUS_REGEXP = /__PREVIOUS_RESULT__/g
const COMMENT_REMOVER = /(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm

export default register => {
  register({
    type: 'query',
    family: 'transform',
    priority: 1,
    component: View,
    button: 'Flux Script',
    initial: {
      activeQuery: 0,
      queries: [
        {
          text:
            '// Write Flux script here\n// use __PREVIOUS_RESULT__ to continue building from the previous cell',
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
      const text = pipe.queries[pipe.activeQuery].text
        .replace(COMMENT_REMOVER, '')
        .replace(/\s/g, '')

      if (!text.length) {
        append()
        return
      }

      create(text, PREVIOUS_REGEXP.test(text))
    },
  })
}
