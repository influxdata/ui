import {useMemo} from 'react'
import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_OPACITY_MINIMUM,
} from 'src/visualization/constants'

export const useLegendOpacity = (legendOpacity: number) =>
  useMemo(() => {
    if (
      legendOpacity < LEGEND_OPACITY_MINIMUM ||
      legendOpacity !== legendOpacity
    ) {
      return LEGEND_OPACITY_DEFAULT
    }
    return legendOpacity
  }, [legendOpacity])
