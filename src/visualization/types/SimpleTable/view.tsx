// Libraries
import React, {FC} from 'react'
import {Config, Plot} from '@influxdata/giraffe'

// Types
import {SimpleTableViewProperties} from 'src/types'
import {FluxResult} from 'src/types/flows'
import {VisualizationProps} from 'src/visualization'

interface Props extends VisualizationProps {
  properties: SimpleTableViewProperties
  result: FluxResult['parsed']
}

const SimpleTable: FC<Props> = ({properties, result}) => {
  const config: Config = {
    fromFluxResult: result,
    layers: [
      {
        type: 'simple table',
        showAll: properties.showAll,
      },
    ],
  }
  return <Plot config={config} />
}

export default SimpleTable
