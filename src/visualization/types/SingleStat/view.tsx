// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Utils
import {generateThresholdsListHexs} from 'src/shared/constants/colorOperations'
import {handleUnsupportedGraphType} from 'src/visualization/utils/annotationUtils'

// Types
import {SingleStatViewProperties} from 'src/types/dashboards'
import {VisualizationProps} from 'src/visualization'

import {Config, Plot, getLatestValues} from '@influxdata/giraffe'

// Selectors
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'

interface Props extends VisualizationProps {
  properties: SingleStatViewProperties
}

const SingleStat: FC<Props> = ({properties, result}) => {
  const {prefix, suffix, colors, decimalPlaces} = properties

  const dispatch = useDispatch()
  const inAnnotationMode = useSelector(isAnnotationsModeEnabled)

  const latestValues = getLatestValues(result.table)
  const latestValue = latestValues[0]

  const {bgColor: backgroundColor, textColor} = generateThresholdsListHexs({
    colors,
    lastValue: latestValue,
    cellType: 'single-stat',
  })
  const config: Config = {
    table: result.table,
    showAxes: false,
    layers: [
      {
        type: 'single stat',
        prefix,
        suffix,
        decimalPlaces: decimalPlaces,
        textColor: textColor,
        textOpacity: 100,
        backgroundColor: backgroundColor ? backgroundColor : '',
        svgTextStyle: {
          fontSize: '100',
          fontWeight: 'lighter',
          dominantBaseline: 'middle',
          textAnchor: 'middle',
          letterSpacing: '-0.05em',
        },
        svgTextAttributes: {
          'data-testid': 'single-stat--text',
        },
      },
    ],
  }

  if (inAnnotationMode) {
    config.interactionHandlers = {
      singleClick: () => {
        dispatch(handleUnsupportedGraphType('Single Stat'))
      },
    }
  }
  return <Plot config={config} />
}

export default SingleStat
