import View from './view'
import './style.scss'

import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

export default register => {
  register({
    type: 'downsample',
    family: 'transform',
    component: View,
    featureFlag: 'flow-panel--downsample',
    button: 'Downsample',
    initial: {
      functions: [{name: 'mean'}],
      aggregateWindow: {
        period: '',
        fillValues: false,
      },
    },
    generateFlux: (pipe, create) => {
      if (!pipe.aggregateWindow.period || !pipe.functions.length) {
        return
      }

      const _build = (config, fn?): string => {
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

        const period = config.aggregateWindow.period
        const flux = fnSpec.flux(
          period === 'auto' || !period ? 'v.windowPeriod' : period,
          config.aggregateWindow.fillValues
        )

        return `__PREVIOUS_RESULT__ ${flux} |> yield(name: "${fn.name}")`
      }

      const query = _build(pipe)

      if (!query) {
        return
      }

      create(query)
    },
  })
}
