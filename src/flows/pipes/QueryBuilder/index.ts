import View from './view'
import './style.scss'

export default register => {
  register({
    type: 'queryBuilder',
    family: 'inputs',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--query-builder',
    button: 'Query Builder',
    initial: {
      activeQuery: 0,
      queries: [
        {
          text: '',
          editMode: 'builder',
          builderConfig: {
            buckets: [],
            tags: [],
            functions: [],
          },
        },
      ],
    },
    generateFlux: (pipe, create, append) => {
        return
    },
  })
}
