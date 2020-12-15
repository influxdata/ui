// Libraries
import React, {FunctionComponent, createElement} from 'react'
import {Plot, FromFluxResult} from '@influxdata/giraffe'

// Components
import TableGraphs from 'src/shared/components/tables/TableGraphs'
import FluxTablesTransform from 'src/shared/components/FluxTablesTransform'
import CheckPlot from 'src/shared/components/CheckPlot'

import {TYPE_DEFINITIONS} from 'src/visualization'

// Types
import {
  CheckViewProperties,
  QueryViewProperties,
  StatusRow,
  TimeZone,
  TimeRange,
  CheckType,
  Threshold,
  Theme,
} from 'src/types'

interface Props {
  giraffeResult: FromFluxResult
  files?: string[]
  properties: QueryViewProperties | CheckViewProperties
  timeZone: TimeZone
  statuses?: StatusRow[][]
  timeRange?: TimeRange | null
  checkType?: CheckType
  checkThresholds?: Threshold[]
  theme: Theme
}

const ViewSwitcher: FunctionComponent<Props> = ({
  properties,
  timeRange,
  files,
  giraffeResult,
  timeZone,
  statuses,
  checkType = null,
  checkThresholds = [],
  theme,
}) => {
  if (TYPE_DEFINITIONS[properties.type]?.component) {
    return createElement(TYPE_DEFINITIONS[properties.type].component, {
      result: giraffeResult,
      properties: properties,
      timeRange,
      theme,
      timeZone,
    })
  }

  switch (properties.type) {
    case 'table':
      return (
        <FluxTablesTransform files={files}>
          {tables => (
            <TableGraphs
              tables={tables}
              properties={properties}
              timeZone={timeZone}
              theme={theme}
            />
          )}
        </FluxTablesTransform>
      )

    case 'check':
      return (
        <CheckPlot
          checkType={checkType}
          thresholds={checkThresholds}
          table={giraffeResult.table}
          fluxGroupKeyUnion={giraffeResult.fluxGroupKeyUnion}
          timeZone={timeZone}
          viewProperties={properties}
          statuses={statuses}
        >
          {config => <Plot config={config} />}
        </CheckPlot>
      )

    default:
      throw new Error('Unknown view type in <ViewSwitcher /> ')
  }
}

export default ViewSwitcher
