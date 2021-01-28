import View from './view'
import './style.scss'

import {FUNCTIONS} from 'src/timeMachine/constants/queryBuilder'
import {BuilderConfig} from 'src/types'

export default register => {
  register({
    type: 'queryBuilder',
    family: 'inputs',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--query-builder',
    button: 'Query Builder',
    initial: {
      buckets: [],
      tags: [
        {
          key: '_measurement',
          values: [],
          aggregateFunctionType: 'filter',
        },
      ],
      functions: [{name: 'mean'}],
      aggregateWindow: {
        period: 'auto',
        fillValues: false,
      },
    },
    generateFlux: (pipe, create, _append) => {
      if (!pipe.buckets[0] || !pipe.tags.length) {
        return
      }

      const _build = (
        config: BuilderConfig,
        fn?: BuilderConfig['functions'][0]
      ): string => {
        if (config.functions) {
          return config.functions
            .map(fnc => {
              const conf = {...config}
              delete conf.functions
              return _build(conf, fnc)
            })
            .join('\n\n')
        }

        const tags = config.tags
          .map(tag => {
            if (!tag.key) {
              return ''
            }

            if (tag.aggregateFunctionType === 'filter') {
              if (!tag.values.length) {
                return ''
              }

              const vals = tag.values
                .map(
                  value =>
                    `r["${tag.key}"] == "${value.replace(/\\/g, '\\\\')}"`
                )
                .join(' or ')

              return `\n  |> filter(fn: (r) => ${vals})`
            }

            if (tag.aggregateFunctionType === 'group') {
              const quotedValues = tag.values.map(value => `"${value}"`) // wrap the value in double quotes

              if (quotedValues.length) {
                return `\n  |> group(columns: [${quotedValues.join(', ')}])` // join with a comma (e.g. "foo","bar","baz")
              }

              return '\n  |> group()'
            }

            return ''
          })
          .join('')

        let fnFlux = ''
        const fnSpec = fn && FUNCTIONS.find(spec => spec.name === fn.name)

        if (fnSpec) {
          const period = config.aggregateWindow.period
          const flux = fnSpec.flux(
            period === 'auto' || !period ? 'v.windowPeriod' : period,
            config.aggregateWindow.fillValues
          )
          fnFlux = `\n  ${flux}\n  |> yield(name: "${fn.name}")`
        }

        return `from(bucket: "${config.buckets[0]}") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)${tags}${fnFlux}`
      }

      const query = _build(pipe)

      if (!query) {
        return
      }

      create(query)
    },
  })
}
