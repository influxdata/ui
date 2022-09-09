import {FunctionComponent, ComponentClass} from 'react'
import {AnnotationsList, ViewProperties, TimeRange} from 'src/types'
import {FluxResult} from 'src/types/flows'
import {SimpleTableViewProperties} from 'src/types'

export interface VisualizationOptionProps {
  properties: ViewProperties
  results: FluxResult['parsed']
  update: (obj: any) => void
}

export interface VisualizationProps {
  properties: ViewProperties | SimpleTableViewProperties
  result: FluxResult['parsed']
  annotations?: AnnotationsList
  cellID?: string
  timeRange?: TimeRange
  transmitWindowPeriod?: (windowPeriod: number | string) => void
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

export interface Visualizations {
  [visualizationType: string]: Visualization
}

export const buildSupportedVisualizations = (): Visualizations => {
  const supportedVisualizations: Visualizations = {}
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
      visualizationDefinitionModule.default((visualization: Visualization) => {
        supportedVisualizations[visualization.type] = visualization
      })
    })

  return supportedVisualizations
}
