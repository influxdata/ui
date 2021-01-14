import {useMemo} from 'react'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_OPACITY_MINIMUM,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  LEGEND_COLORIZE_ROWS_DEFAULT,
} from 'src/shared/constants'

export const useLegendOpacity = (legendOpacity: number) =>
  useMemo(() => {
    if (
      !isFlagEnabled('legendOrientation') ||
      legendOpacity < LEGEND_OPACITY_MINIMUM
    ) {
      return LEGEND_OPACITY_DEFAULT
    }
    return legendOpacity
  }, [legendOpacity])

export const useLegendOrientationThreshold = (
  legendOrientationThreshold: number
) =>
  useMemo(() => {
    if (!isFlagEnabled('legendOrientation')) {
      return LEGEND_ORIENTATION_THRESHOLD_DEFAULT
    }
    return legendOrientationThreshold
  }, [legendOrientationThreshold])

export const useLegendColorizeRows = (legendColorizeRows: boolean) =>
  useMemo(() => {
    if (!isFlagEnabled('legendOrientation')) {
      return LEGEND_COLORIZE_ROWS_DEFAULT
    }
    return legendColorizeRows
  }, [legendColorizeRows])
