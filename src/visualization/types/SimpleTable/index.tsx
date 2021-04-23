import {FluxDataType} from '@influxdata/giraffe'

import view from './view'
import icon from './icon'

export interface SimpleTableViewProperties {
  type: 'simple-table'
  showAll: boolean
}

interface SubsetTableColumn {
  name: string
  type: string
  fluxDataType: FluxDataType
  data: Array<any>
  group: boolean
}

export interface SubsetTable {
  idx: number
  yield: string
  start: number
  end: number
  signature: string
  cols: SubsetTableColumn[]
}

export default register => {
  register({
    type: 'simple-table',
    name: 'Simple Table',
    graphic: icon,
    initial: {type: 'simple-table', showAll: false},
    options: () => {},
    component: view,
  })
}
