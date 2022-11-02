// Libraries
import React, {FC, useContext} from 'react'

// Utils
import {AppSettingContext} from 'src/shared/contexts/app'
import {parseFromFluxResults} from 'src/timeMachine/utils/rawFluxDataTable'

// Types
import {TableViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'
import {Config, HoverTimeProvider, Plot} from '@influxdata/giraffe'

interface Props extends VisualizationProps {
  properties: TableViewProperties
}

export const Table: FC<Props> = ({properties, result}) => {
  const {theme} = useContext(AppSettingContext)

  const {timeZone} = useContext(AppSettingContext)
  const parsed = parseFromFluxResults(result)
  const fluxResponse = parsed.tableData.join('\n')
  const config: Config = {
    fluxResponse,
    layers: [
      {
        type: 'table',
        properties,
        timeZone: timeZone,
        tableTheme: theme,
      },
    ],
  }
  return (
    <HoverTimeProvider>
      <Plot config={config} />
    </HoverTimeProvider>
  )
}
