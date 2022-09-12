// Libraries
import {useMemo, useContext, useCallback} from 'react'
import {useDispatch} from 'react-redux'

// Context
import {PipeContext} from 'src/flows/context/pipe'

// Actions
import {setStaticLegend} from 'src/timeMachine/actions'

// Types
import {StaticLegend as StaticLegendConfig} from '@influxdata/giraffe'
import {StaticLegend as StaticLegendAPI} from 'src/types'

// Constants
import {
  LEGEND_COLORIZE_ROWS_DEFAULT,
  LEGEND_OPACITY_DEFAULT,
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
  const {id, data, update} = useContext(PipeContext)

  const dispatch = useDispatch()
  const timeMachineUpdate = useCallback(
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

  let updateStaticLegendProperties
  const notebookViewProperties = data?.properties || {}
  const notebookStaticLegend = notebookViewProperties.staticLegend || {}
  if (id) {
    updateStaticLegendProperties = (updatedProperties: StaticLegendAPI) =>
      update({
        properties: {
          ...notebookViewProperties,
          staticLegend: {...notebookStaticLegend, ...updatedProperties},
        },
      })
  } else {
    updateStaticLegendProperties = timeMachineUpdate
  }

  return useMemo(() => {
    const {legendOrientationThreshold = LEGEND_ORIENTATION_THRESHOLD_DEFAULT} =
      properties

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
      colorizeRows = false,
      heightRatio = STATIC_LEGEND_HEIGHT_RATIO_NOT_SET,
      opacity = LEGEND_OPACITY_DEFAULT,
      orientationThreshold = legendOrientationThreshold,
      show = STATIC_LEGEND_SHOW_DEFAULT,
      ...config
    } = staticLegend

    return {
      ...config,
      colorizeRows,
      heightRatio,
      hide: convertShowToHide(show),
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

          updateStaticLegendProperties({
            heightRatio: updatedHeightRatio,
          })
        }
      },
    }
  }, [properties, updateStaticLegendProperties])
}
