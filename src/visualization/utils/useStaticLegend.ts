// Libraries
import {useMemo, useCallback} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Actions
import {setStaticLegend} from 'src/timeMachine/actions'

// Types
import {StaticLegend as StaticLegendConfig} from '@influxdata/giraffe'
import {StaticLegend as StaticLegendAPI} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getActiveTimeMachine} from 'src/timeMachine/selectors'

// Constants
import {
  LEGEND_COLORIZE_ROWS_DEFAULT,
  LEGEND_OPACITY_DEFAULT,
  LEGEND_OPACITY_MINIMUM,
  LEGEND_OPACITY_MAXIMUM,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL,
  LEGEND_ORIENTATION_THRESHOLD_VERTICAL,
  STATIC_LEGEND_HEIGHT_RATIO_DEFAULT,
  STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_MINIMUM,
  STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
  STATIC_LEGEND_SHOW_DEFAULT,
  STATIC_LEGEND_STYLING,
  STATIC_LEGEND_WIDTH_RATIO_DEFAULT,
} from 'src/visualization/constants'
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
  const {isViewingVisOptions} = useSelector(getActiveTimeMachine)
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
      legendColorizeRows = LEGEND_COLORIZE_ROWS_DEFAULT,
      legendOpacity = LEGEND_OPACITY_DEFAULT,
      legendOrientationThreshold = LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
    } = properties

    const {
      staticLegend = {
        colorizeRows: LEGEND_COLORIZE_ROWS_DEFAULT,
        heightRatio: STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
        opacity: LEGEND_OPACITY_DEFAULT,
        orientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
        show: STATIC_LEGEND_SHOW_DEFAULT,
        widthRatio: STATIC_LEGEND_WIDTH_RATIO_DEFAULT,
      } as StaticLegendAPI,
    } = properties

    const {
      colorizeRows = false, // undefined is false because of omitempty
      heightRatio = STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
      opacity = LEGEND_OPACITY_DEFAULT,
      orientationThreshold = legendOrientationThreshold,
      show = STATIC_LEGEND_SHOW_DEFAULT,
      ...config
    } = staticLegend

    if (
      isFlagEnabled('staticLegend') &&
      isViewingVisOptions &&
      !show &&
      heightRatio === STATIC_LEGEND_HEIGHT_RATIO_NOT_SET
    ) {
      let validOpacity = LEGEND_OPACITY_DEFAULT
      if (
        typeof legendOpacity === 'number' &&
        legendOpacity === legendOpacity &&
        legendOpacity >= LEGEND_OPACITY_MINIMUM &&
        legendOpacity <= LEGEND_OPACITY_MAXIMUM
      ) {
        validOpacity = legendOpacity
      }

      let validThreshold: number
      if (
        typeof legendOrientationThreshold !== 'number' ||
        legendOrientationThreshold !== legendOrientationThreshold ||
        legendOrientationThreshold > 0
      ) {
        validThreshold = LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL
      } else {
        validThreshold = LEGEND_ORIENTATION_THRESHOLD_VERTICAL
      }

      update({
        colorizeRows: legendColorizeRows,
        opacity: validOpacity,
        orientationThreshold: validThreshold,
      })
    }

    return {
      ...config,
      colorizeRows,
      heightRatio,
      hide: isFlagEnabled('staticLegend') ? convertShowToHide(show) : true,
      opacity,
      orientationThreshold,
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
            orientationThreshold === LEGEND_ORIENTATION_THRESHOLD_HORIZONTAL
          ) {
            estimatedHeight =
              lineCount * sampleMaxHeight + headerMaxHeight + padding / 2
          }

          if (orientationThreshold === LEGEND_ORIENTATION_THRESHOLD_VERTICAL) {
            const length =
              legendDataLength - NOISY_LEGEND_COLUMN_NAMES.length > 0
                ? legendDataLength - NOISY_LEGEND_COLUMN_NAMES.length
                : legendDataLength
            estimatedHeight = length * sampleMaxHeight + padding
          }

          let updatedHeightRatio = estimatedHeight / totalHeight

          if (updatedHeightRatio > STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM) {
            updatedHeightRatio = STATIC_LEGEND_HEIGHT_RATIO_MAXIMUM
          }
          if (updatedHeightRatio < STATIC_LEGEND_HEIGHT_RATIO_MINIMUM) {
            updatedHeightRatio = STATIC_LEGEND_HEIGHT_RATIO_MINIMUM
          }
          if (
            typeof updatedHeightRatio !== 'number' ||
            updatedHeightRatio !== updatedHeightRatio
          ) {
            updatedHeightRatio = STATIC_LEGEND_HEIGHT_RATIO_DEFAULT
          }

          event(`${eventPrefix}.heightRatio.autoAdjust`, {
            type: properties.type,
            updatedHeightRatio,
          })

          update({
            heightRatio: updatedHeightRatio,
          })
        }
      },
    }
  }, [properties, isViewingVisOptions, update])
}
