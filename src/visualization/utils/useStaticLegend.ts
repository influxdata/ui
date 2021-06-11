import {useMemo} from 'react'

// Types
import {StaticLegend as StaticLegendConfig} from '@influxdata/giraffe'
import {StaticLegend as StaticLegendAPI} from 'src/types'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {
  STATIC_LEGEND_SHOW_DEFAULT,
  STATIC_LEGEND_STYLING,
} from 'src/visualization/constants'

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

export const useStaticLegend = (properties): StaticLegendConfig =>
  useMemo(() => {
    const {
      staticLegend = {
        show: STATIC_LEGEND_SHOW_DEFAULT,
      } as StaticLegendAPI,
    } = properties

    const {show, ...config} = staticLegend

    if (!isFlagEnabled('staticLegend')) {
      return {...config, ...STATIC_LEGEND_STYLING, hide: true}
    }

    return {...config, hide: convertShowToHide(show), ...STATIC_LEGEND_STYLING}
  }, [properties])
