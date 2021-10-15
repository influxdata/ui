import View from './view'
import './style.scss'
import {parse} from '@influxdata/flux'

import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'
import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'

export default register => {
  register({
    type: 'visualization',
    family: 'passThrough',
    component: View,
    button: 'Graph',
    initial: {
      functions: [{name: 'mean'}],
      period: '',
      properties: SUPPORTED_VISUALIZATIONS['xy'].initial,
    },
    visual: (data, query) => {
      if (!query) {
        return ''
      }

      try {
        const ast = parse(query)
        if (!ast.body.length) {
          return ''
        }
      } catch {
        return ''
      }

      if (data.properties.type === 'simple-table') {
        return `${query} |> limit(n: 100)`
      }

      if (
        data.properties.type === 'single-stat' ||
        data.properties.type === 'gauge'
      ) {
        return `${query} |> last()`
      }

      if (!data.functions || !data.functions.length || !data.period) {
        return query
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

        const flux = fnSpec.flux(data.period, false)

        return `${query} ${flux} |> yield(name: "${fn.name}")`
      }

      return _build(data)
    },
  })
}
