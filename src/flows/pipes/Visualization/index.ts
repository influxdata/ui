import View from './view'
import './style.scss'

import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

export default register => {
  register({
    type: 'visualization',
    family: 'passThrough',
    component: View,
    button: 'Visualization',
    initial: {
      panelVisibility: 'visible',
      panelHeight: 200,
      functions: [{name: 'mean'}],
      period: '',
      properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
    },
    generateFlux: (pipe, _, append) => {
      if (!pipe.functions.length) {
        append('__CURRENT_RESULT__')
        return
      }

      if (!pipe.period) {
        append()
        return
      }

      const _build = (config, fn?) => {
        if (config.functions) {
          return config.functions
            .map(fnc => {
              const conf = {...config}
              delete conf.functions
              return _build(conf, fnc)
            })
            .filter(q => q.length)
            .join('\n\n')
        }

        const fnSpec = fn && FUNCTIONS.find(spec => spec.name === fn.name)

        if (!fnSpec) {
          return ''
        }

        const flux = fnSpec.flux(pipe.period, false)

        return `__CURRENT_RESULT__ ${flux} |> yield(name: "${fn.name}")`
      }

      const query = _build(pipe)

      if (query) {
        append(query)
      }
    },
  })
}
