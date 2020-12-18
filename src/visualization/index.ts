import {FunctionComponent, ComponentClass} from 'react'
import {ViewProperties, Theme, TimeZone, TimeRange} from 'src/types'
import {FromFluxResult} from '@influxdata/giraffe'

export interface VisOptionProps {
  properties: ViewProperties
  results: FromFluxResult
  update: (obj: any) => void
}

export interface VisProps {
  properties: ViewProperties
  result: FromFluxResult
  theme?: Theme
  timeZone?: TimeZone
  timeRange?: TimeRange
}

export interface VisTypeRegistration {
  type: string // a unique string that identifies a visualization
  name: string // the name that shows up in the dropdown
  graphic: JSX.Element // the icon that shows up in the dropdown
  component?: FunctionComponent<VisProps> | ComponentClass<VisProps> // the view component for rendering the interface
  disabled?: boolean // if you should show it or not
  featureFlag?: string // designates a flag that should enable the panel type
  initial: ViewProperties // the default state
  options?: FunctionComponent<VisOptionProps> // the view component for rendering the interface
}

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

  return properties
}

export {_transform}
