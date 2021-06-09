import {useMemo} from 'react'

// Types
import {StaticLegend as StaticLegendConfig} from '@influxdata/giraffe'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {
  STATIC_LEGEND_HIDE_DEFAULT,
  STATIC_LEGEND_STYLING,
} from 'src/visualization/constants'

export const useStaticLegend = (properties): StaticLegendConfig =>
  useMemo(() => {
    const {
      staticLegend = {
        hide: STATIC_LEGEND_HIDE_DEFAULT,
      },
    } = properties
    if (!isFlagEnabled('staticLegend')) {
      return {...staticLegend, ...STATIC_LEGEND_STYLING, hide: true}
    }
    return {...staticLegend, ...STATIC_LEGEND_STYLING}
  }, [properties])
