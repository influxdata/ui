import {FunctionComponent, ComponentClass} from 'react'
import {ViewProperties, Theme, TimeZone, TimeRange} from 'src/types'
import {FromFluxResult} from '@influxdata/giraffe'

export interface VisualizationOptionProps {
  properties: ViewProperties
  results: FromFluxResult
  update: (obj: any) => void
}

export interface VisualizationProps {
  properties: ViewProperties
  result: FromFluxResult
  theme?: Theme
  timeZone?: TimeZone
  timeRange?: TimeRange
}

export interface Visualization {
  type: string // a unique string that identifies a visualization
  name: string // the name that shows up in the dropdown
  graphic: JSX.Element // the icon that shows up in the dropdown
  component?:
    | FunctionComponent<VisualizationProps>
    | ComponentClass<VisualizationProps> // the view component for rendering the interface
  disabled?: boolean // if you should show it or not, takes precidence over feature flagging
  featureFlag?: string // designates a flag that should enable the panel type
  initial: ViewProperties // the default state
  options?: FunctionComponent<VisualizationOptionProps> // the view component for rendering the interface
}

interface Visualizations {
  [visualizationType: string]: Visualization
}

export const SUPPORTED_VISUALIZATIONS: Visualizations = {}

const visualizationDefintionContext = require.context(
  './types',
  true,
  /index\.(ts|tsx)$/
)
visualizationDefintionContext
  .keys()
  .forEach(visualizationDefinitionIndexFile => {
    const visualizationDefinitionModule = visualizationDefintionContext(
      visualizationDefinitionIndexFile
    )
    visualizationDefinitionModule.default((def: Visualization) => {
      SUPPORTED_VISUALIZATIONS[def.type] = def
    })
  })

export {default as View} from 'src/visualization/components/View'
export {default as ViewOptions} from 'src/visualization/components/ViewOptions'
export {default as ViewTypeDropdown} from 'src/visualization/components/ViewTypeDropdown'
