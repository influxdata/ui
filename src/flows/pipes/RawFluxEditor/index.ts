import View from './view'
import './style.scss'

const COMMENT_REMOVER = /(\/\*([\s\S]*?)\*\/)|(\/\/(.*)$)/gm

export default register => {
  register({
    type: 'rawFluxEditor',
    family: 'transform',
    priority: 1,
    component: View,
    button: 'Flux Script',
    initial: {
      activeQuery: 0,
      queries: [
        {
          text:
            '// Use __PREVIOUS_RESULT__ to continue building from the previous cell\n// Write Flux script here',
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

      create(text)
    },
  })
}
