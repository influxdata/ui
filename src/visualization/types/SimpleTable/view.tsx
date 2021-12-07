// Libraries
import React, {FC} from 'react'
import {Config, Plot} from '@influxdata/giraffe'

// Types
import {SimpleTableViewProperties} from 'src/types'
import {FluxResult} from 'src/types/flows'
import {VisualizationProps} from 'src/visualization'

// Utils
import {parseFromFluxResults} from 'src/timeMachine/utils/rawFluxDataTable'

import './style.scss'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import PageControl from 'src/visualization/types/SimpleTable/PageControl'
import PagedTable from 'src/visualization/types/SimpleTable/PagedTable'
import {PaginationProvider} from 'src/visualization/context/pagination'

interface Props extends VisualizationProps {
  properties: SimpleTableViewProperties
  result: FluxResult['parsed']
}

const SimpleTable: FC<Props> = ({properties, result}) => {
  if (isFlagEnabled('useGiraffeGraphs')) {
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
  }

  return (
    <div className="visualization--simple-table" data-testid="simple-table">
      <PaginationProvider total={result?.table?.length || 0}>
        <PagedTable properties={properties} result={result} />
        <PageControl />
      </PaginationProvider>
    </div>
  )
}

export default SimpleTable
