import {VisTypeRegistration} from 'src/types'
import {ViewProperties} from 'src/types'
import {FromFluxResult} from '@influxdata/giraffe'

interface VisTypeRegistrationMap {
  [key: string]: VisTypeRegistration
}

export const TYPE_DEFINITIONS: VisTypeRegistrationMap = {}

const context = require.context('./types', true, /index\.(ts|tsx)$/)
context.keys().forEach(key => {
  const module = context(key)
  module.default((def: VisTypeRegistration) => {
    TYPE_DEFINITIONS[def.type] = def
  })
})

// TODO: all of this needs to be removed by refactoring
// the underlying logic. Managing state like this is a
// recipe for long dev cycles, stale logic, and many bugs
// these default value mechanisms should exist within giraffe

const _transform = (
  properties: ViewProperties,
  results: FromFluxResult
): ViewProperties => {
  if (!results) {
    return properties
  }

  if (properties.type === 'table') {
    const existing = (properties.fieldOptions || []).reduce((prev, curr) => {
      prev[curr.internalName] = curr
      return prev
    }, {})

    results.table.columnKeys
      .filter(o => !existing.hasOwnProperty(o))
      .filter(o => !['result', '', 'table', 'time'].includes(o))
      .forEach(o => {
        existing[o] = {
          internalName: o,
          displayName: o,
          visible: true,
        }
      })
    return {
      ...properties,
      fieldOptions: Object.keys(existing).map(e => existing[e]),
    }
  }

  if (properties.type === 'histogram') {
    return {
      ...properties,
      fillColumns: results.fluxGroupKeyUnion,
    }
  }

  if (properties.type === 'heatmap') {
    return {
      ...properties,
      xColumn:
        ['_time', '_start', '_stop'].filter(field =>
          results.table.columnKeys.includes(field)
        )[0] || results.table.columnKeys[0],
      yColumn:
        ['_value'].filter(field =>
          results.table.columnKeys.includes(field)
        )[0] || results.table.columnKeys[0],
    }
  }

  if (properties.type === 'scatter') {
    return {
      ...properties,
      fillColumns: results.fluxGroupKeyUnion,
      symbolColumns: results.fluxGroupKeyUnion,
      xColumn:
        ['_time', '_start', '_stop'].filter(field =>
          results.table.columnKeys.includes(field)
        )[0] || results.table.columnKeys[0],
      yColumn:
        ['_value'].filter(field =>
          results.table.columnKeys.includes(field)
        )[0] || results.table.columnKeys[0],
    }
  }

  return properties
}

export {_transform}
