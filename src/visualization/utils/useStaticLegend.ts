// Libraries
import {useMemo, useCallback} from 'react'
import {useDispatch} from 'react-redux'

// Actions
import {setStaticLegend} from 'src/timeMachine/actions'

// Types
import {StaticLegend as StaticLegendConfig} from '@influxdata/giraffe'
import {StaticLegend as StaticLegendAPI} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {
  STATIC_LEGEND_HEIGHT_RATIO_DEFAULT,
  STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_MINIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
  STATIC_LEGEND_SHOW_DEFAULT,
  STATIC_LEGEND_STYLING,
} from 'src/visualization/constants'
import {
  LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL,
  LEGEND_ORIENTATION_THRESHOLD_VERTICAL,
} from 'src/shared/constants'
import {NOISY_LEGEND_COLUMN_NAMES} from 'src/shared/utils/vis'

// Metrics
import {event} from 'src/cloud/utils/reporting'

/*
 ***************************************************************
 * "hide" on the frontend vs "show" on the backend explanation *
 ***************************************************************

  There are 3 states for the Static Legend:
  - show
  - hide
  - not set

  On the frontend:
  Giraffe uses "hide" as the property name because
    - staticLegend itself is a config property, an inner object
    - staticLegend can be missing which is considered "not set" or "hide"
    - staticLegend when present allows hiding, without removing (and later rebuilding) the whole object
    - staticLegend.hide = true is considered "hide"
    - staticLegend.hide = false is considered "show"

  On the backend:
  The api uses "show" as the property name because
    - staticLegend options of a cell must always be tracked as a struct
    - staticLegend should not be forced on a user that has not selected it
    - staticLegend.show = true is considered "show"
    - staticLegend.show = false is considered "hide"
    - staticLegend when missing the show property (which happens when falsy) is considered "not set" or "hide"
*/

const convertShowToHide = (showState: boolean): boolean => !showState

const eventPrefix = 'visualization.customize.staticlegend'

export const useStaticLegend = (properties): StaticLegendConfig => {
  const {legendOrientationThreshold} = properties
  const dispatch = useDispatch()
  const update = useCallback(
    (staticLegend: StaticLegendAPI) => {
      dispatch(
        setStaticLegend({
          ...properties.staticLegend,
          ...staticLegend,
        })
      )
    },
    [dispatch, properties.staticLegend]
  )
  return useMemo(() => {
    const {
      staticLegend = {
        show: STATIC_LEGEND_SHOW_DEFAULT,
      } as StaticLegendAPI,
    } = properties

    const {show, ...config} = staticLegend

    return {
      ...config,
      hide: isFlagEnabled('staticLegend') ? convertShowToHide(show) : true,
      ...STATIC_LEGEND_STYLING,
      renderEffect: options => {
        const {
          staticLegendHeight,
          totalHeight,
          legendDataLength,
          lineCount,
          padding,
          headerTextMetrics,
          sampleTextMetrics,
        } = options

        const headerMaxHeight = headerTextMetrics.height
        const sampleMaxHeight = sampleTextMetrics.height

        if (staticLegendHeight === STATIC_LEGEND_HEIGHT_RATIO_NOT_SET) {
          let estimatedHeight = STATIC_LEGEND_HEIGHT_RATIO_DEFAULT

          if (
            legendOrientationThreshold ===
            LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL
          ) {
            estimatedHeight =
              lineCount * sampleMaxHeight + headerMaxHeight + padding / 2
          }

          if (
            legendOrientationThreshold === LEGEND_ORIENTATION_THRESHOLD_VERTICAL
          ) {
            const length =
              legendDataLength - NOISY_LEGEND_COLUMN_NAMES.length > 0
                ? legendDataLength - NOISY_LEGEND_COLUMN_NAMES.length
                : legendDataLength
            estimatedHeight = length * sampleMaxHeight + padding
          }

          let heightRatio = estimatedHeight / totalHeight

          if (heightRatio > STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM) {
            heightRatio = STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM
          }
          if (heightRatio < STATIC_LEGEND_HEIGHT_RATIO_MINIMUM) {
            heightRatio = STATIC_LEGEND_HEIGHT_RATIO_MINIMUM
          }
          if (typeof heightRatio !== 'number' || heightRatio !== heightRatio) {
            heightRatio = STATIC_LEGEND_HEIGHT_RATIO_DEFAULT
          }

          update({
            heightRatio,
          })
          event(`${eventPrefix}.heightRatio.autoAdjust`, {
            type: properties.type,
            heightRatio,
          })
        }
      },
    }
  }, [legendOrientationThreshold, properties, update])
}
