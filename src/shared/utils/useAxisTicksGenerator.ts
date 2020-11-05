import {useMemo} from 'react'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const useAxisTicksGenerator = ({
  xTotalTicks,
  xTickStart,
  xTickStep,
  yTotalTicks,
  yTickStart,
  yTickStep,
}) =>
  useMemo(() => {
    if (!isFlagEnabled('axisTicksGenerator')) {
      return {
        xTotalTicks: null,
        xTickStart: null,
        xTickStep: null,
        yTotalTicks: null,
        yTickStart: null,
        yTickStep: null,
      }
    }
    return {
      xTotalTicks,
      xTickStart,
      xTickStep,
      yTotalTicks,
      yTickStart,
      yTickStep,
    }
  }, [xTotalTicks, xTickStart, xTickStep, yTotalTicks, yTickStart, yTickStep])
