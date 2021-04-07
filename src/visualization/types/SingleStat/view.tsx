// Libraries
import React, {FC, useContext} from 'react'

// Utils
import LatestValueTransform from 'src/visualization/components/LatestValueTransform'
import {generateThresholdsListHexs} from 'src/shared/constants/colorOperations'
import {getFormatter} from 'src/visualization/utils/getFormatter'

// Types
import {SingleStatViewProperties} from 'src/types/dashboards'
import {VisualizationProps} from 'src/visualization'

import {
  Config,
  Plot,
  getLatestValues,
  formatStatValue,
} from '@influxdata/giraffe'

import './style.scss'
import {isFlagEnabled} from '../../../shared/utils/featureFlag'
import {AppSettingContext} from 'src/shared/contexts/app'
import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'

interface Props extends VisualizationProps {
  properties: SingleStatViewProperties
}

const SingleStat: FC<Props> = ({properties, result}) => {
  const {prefix, suffix, colors, decimalPlaces} = properties
  const {timeZone} = useContext(AppSettingContext)

  if (isFlagEnabled('useGiraffeGraphs')) {
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
    return <Plot config={config} />
  } else {
    return (
      <LatestValueTransform table={result.table} allowString={true}>
        {latestValue => {
          const {
            bgColor: backgroundColor,
            textColor,
          } = generateThresholdsListHexs({
            colors,
            lastValue: latestValue,
            cellType: 'single-stat',
          })

          const timeFormatter = getFormatter('time', {
            timeZone: timeZone === 'Local' ? undefined : timeZone,
            timeFormat: DEFAULT_TIME_FORMAT,
          })

          const formattedValue =
            result.table.getColumnType('_value') === 'time'
              ? timeFormatter(latestValue)
              : formatStatValue(latestValue, {
                  decimalPlaces,
                  prefix,
                  suffix,
                })

          return (
            <div
              className="single-stat"
              style={{backgroundColor}}
              data-testid="single-stat"
            >
              <div className="single-stat--resizer">
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${formattedValue.length * 55} 100`}
                >
                  <text
                    className="single-stat--text"
                    data-testid="single-stat--text"
                    fontSize="100"
                    y="59%"
                    x="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    style={{fill: textColor}}
                  >
                    {formattedValue}
                  </text>
                </svg>
              </div>
            </div>
          )
        }}
      </LatestValueTransform>
    )
  }
}

export default SingleStat
