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

import {view as Band} from 'src/visualization/types/Band'
import {view as Check} from 'src/visualization/types/Check'
import {view as Gauge} from 'src/visualization/types/Gauge'
import {view as Graph} from 'src/visualization/types/Graph'
import {view as Heatmap} from 'src/visualization/types/Heatmap'
import {view as Histogram} from 'src/visualization/types/Histogram'
import {view as Map} from 'src/visualization/types/Map'
import {view as Mosaic} from 'src/visualization/types/Mosaic'
import {view as Scatter} from 'src/visualization/types/Scatter'
import {view as SimpleTable} from 'src/visualization/types/SimpleTable'
import {view as SingleStat} from 'src/visualization/types/SingleStat'
import {view as SingleStatPlusLine} from 'src/visualization/types/SingleStatPlusLine'
import {view as Table} from 'src/visualization/types/Table'

export const SUPPORTED_VISUALIZATIONS: Visualizations = {
  band: Band,
  check: Check,
  gauge: Gauge,
  geo: Map,
  heatmap: Heatmap,
  histogram: Histogram,
  'line-plus-single-stat': SingleStatPlusLine,
  mosaic: Mosaic,
  scatter: Scatter,
  'simple-table': SimpleTable,
  'single-stat': SingleStat,
  table: Table,
  xy: Graph,
}

export {View} from 'src/visualization/components/View'
export {ViewOptions} from 'src/visualization/components/ViewOptions'
export {ViewTypeDropdown} from 'src/visualization/components/ViewTypeDropdown'
