import React, {FC} from 'react'

import PageControl from 'src/visualization/types/SimpleTable/PageControl'
import PagedTable from 'src/visualization/types/SimpleTable/PagedTable'

import {SimpleTableViewProperties} from 'src/types'
import {FluxResult} from 'src/types/flows'
import {VisualizationProps} from 'src/visualization'

import {parseFromFluxResults} from 'src/timeMachine/utils/rawFluxDataTable'
import {PaginationProvider} from 'src/visualization/context/pagination'

import {
  Config,
  Plot,
} from '@influxdata/giraffe'

import './style.scss'

interface Props extends VisualizationProps {
  properties: SimpleTableViewProperties
  result: FluxResult['parsed']
}

const SimpleTable: FC<Props> = ({properties, result}) => {
  console.log(properties)
  const parsed = parseFromFluxResults(result)
  const fluxResponse = parsed.tableData.join('\n')
  const config: Config = {
    fluxResponse,
    layers: [
      {
        type: 'simple table',
        showAll: properties.showAll,
      },
    ],
  }
  return <Plot config={config} />
  /*
  return (
    <div className="visualization--simple-table">
      <PaginationProvider total={result?.table?.length || 0}>
        <PagedTable properties={properties} result={result} />
        <PageControl />
      </PaginationProvider>
    </div>
  )*/
}


export default SimpleTable
