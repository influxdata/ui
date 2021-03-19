import React, {FC} from 'react'

import PageControl from 'src/visualization/types/SimpleTable/PageControl'
import PagedTable from 'src/visualization/types/SimpleTable/PagedTable'

import {SimpleTableViewProperties} from 'src/visualization/types/SimpleTable'
import {FluxResult} from 'src/types/flows'
import {VisualizationProps} from 'src/visualization'

import {PaginationProvider} from 'src/visualization/context/pagination'

import './style.scss'

interface Props extends VisualizationProps {
  properties: SimpleTableViewProperties
  result: FluxResult['parsed']
}

const SimpleTable: FC<Props> = ({result}) => {
  return (
    <div className="visualization--simple-table">
      <PaginationProvider total={result?.table?.length || 0}>
        <PageControl />
        <PagedTable result={result} />
      </PaginationProvider>
    </div>
  )
}

export default SimpleTable
