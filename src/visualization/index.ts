import {FunctionComponent, ComponentClass} from 'react'
import {
  AnnotationsList,
  ViewProperties,
  SimpleTableViewProperties,
  TimeRange,
} from 'src/types'
import {FluxResult} from 'src/types/flows'

export interface VisualizationProps {
  properties: ViewProperties | SimpleTableViewProperties
  result: FluxResult['parsed']
  annotations?: AnnotationsList
  cellID?: string
  timeRange?: TimeRange
  transmitWindowPeriod?: (windowPeriod: number | string) => void
}
export interface VisualizationOptionProps {
  properties: ViewProperties
  results: FluxResult['parsed']
  update: (obj: any) => void
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

import {View as Band} from 'src/visualization/types/Band'
import {View as Check} from 'src/visualization/types/Check'
import {View as Gauge} from 'src/visualization/types/Gauge'
import {View as Graph} from 'src/visualization/types/Graph'
import {View as Heatmap} from 'src/visualization/types/Heatmap'
import {View as Histogram} from 'src/visualization/types/Histogram'
import {View as Map} from 'src/visualization/types/Map'
import {View as Mosaic} from 'src/visualization/types/Mosaic'
import {View as Scatter} from 'src/visualization/types/Scatter'
import {View as SimpleTable} from 'src/visualization/types/SimpleTable'
import {View as SingleStat} from 'src/visualization/types/SingleStat'
import {View as SingleStatPlusLine} from 'src/visualization/types/SingleStatPlusLine'
import {View as Table} from 'src/visualization/types/Table'

export const SUPPORTED_VISUALIZATIONS: Visualizations = {
  band: new Band(),
  check: new Check(),
  gauge: new Gauge(),
  geo: new Map(),
  heatmap: new Heatmap(),
  histogram: new Histogram(),
  'line-plus-single-stat': new SingleStatPlusLine(),
  mosaic: new Mosaic(),
  scatter: new Scatter(),
  'simple-table': new SimpleTable(),
  'single-stat': new SingleStat(),
  table: new Table(),
  xy: new Graph(),
}

export {View} from 'src/visualization/components/View'
export {ViewOptions} from 'src/visualization/components/ViewOptions'
export {ViewTypeDropdown} from 'src/visualization/components/ViewTypeDropdown'
