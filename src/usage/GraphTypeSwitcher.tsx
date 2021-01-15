import React, {FC} from 'react'

import SparkLine from 'src/usage/SparkLine'
import SingleStat from 'src/usage/SingleStat'
import EmptyGraph from 'src/usage/EmptyGraph'
import {Table} from '@influxdata/giraffe'

import {
  QUERY_RESULTS_STATUS_ERROR,
  QUERY_RESULTS_STATUS_EMPTY,
  QUERY_RESULTS_STATUS_TIMEOUT,
} from 'src/usage/Constants'

interface OwnProps {
  graphInfo: any
  status: string
  table: Table
}

const GraphTypeSwitcher: FC<OwnProps> = ({graphInfo, status, table}) => {
  switch (status) {
    case QUERY_RESULTS_STATUS_ERROR:
      return <EmptyGraph title={graphInfo.title} isError={true} />

    case QUERY_RESULTS_STATUS_TIMEOUT:
      return (
        <EmptyGraph
          title={graphInfo.title}
          isError={true}
          errorMessage="Query has timed out"
        />
      )

    case QUERY_RESULTS_STATUS_EMPTY:
      return <EmptyGraph title={graphInfo.title} isError={false} />

    default:
      if (graphInfo.type === 'sparkline') {
        return <SparkLine {...graphInfo} table={table} />
      }

      if (graphInfo.type === 'stat') {
        return <SingleStat {...graphInfo} table={table} />
      }

      return <div />
  }
}

export default GraphTypeSwitcher