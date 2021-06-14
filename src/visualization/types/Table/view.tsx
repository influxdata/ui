// Libraries
import React, { FC, useContext } from 'react'
import { Config, HoverTimeProvider, Plot } from '@influxdata/giraffe'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'

// Utils
import {AppSettingContext} from 'src/shared/contexts/app'

// Types
import {TableViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'
import { parseFromFluxResults } from 'src/timeMachine/utils/rawFluxDataTable'

interface Props extends VisualizationProps {
  properties: TableViewProperties
}

const TableGraphs: FC<Props> = ({properties, result}) => {

  // Is it safe to clear these unused fields
  const { type, queries, colors, shape, note, 
    showNoteWhenEmpty, tableOptions, fieldOptions, 
    timeFormat, decimalPlaces } = properties
  const fluxResponse = parseFromFluxResults(result).tableData.join('\n')

  const {theme, timeZone} = useContext(AppSettingContext)
  const currentTheme = theme === 'light' ? VIS_THEME_LIGHT : VIS_THEME

  // What other configs are needed.
  const config: Config = {
    ...currentTheme,
    fluxResponse,
    layers: [
      {
        type,
        timeZone,
        tableTheme: theme,
        properties: {
          colors,
          tableOptions,
          fieldOptions, 
          timeFormat,
          decimalPlaces,
        }
      }
    ],
  } 

  // Is HoverTimeProvider necessary
  return (
    <HoverTimeProvider>
      <Plot config={config} /> 
    </HoverTimeProvider>
  )
}

export default TableGraphs