// Libraries
import React, {FC} from 'react'

// Utils
import LatestValueTransform from 'src/visualization/components/LatestValueTransform'
import {generateThresholdsListHexs} from 'src/shared/constants/colorOperations'
import {formatStatValue} from 'src/visualization/utils/formatStatValue'

// Types
import {SingleStatViewProperties} from 'src/types/dashboards'
import {VisualizationProps} from 'src/visualization'

import './style.scss'

interface Props extends VisualizationProps {
  properties: SingleStatViewProperties
}

const SingleStat: FC<Props> = ({properties, result}) => {
  const {prefix, suffix, colors, decimalPlaces} = properties

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

        const formattedValue = formatStatValue(latestValue, {
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

export default SingleStat
