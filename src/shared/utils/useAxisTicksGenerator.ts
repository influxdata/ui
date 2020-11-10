import {useMemo} from 'react'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const useAxisTicksGenerator = options =>
  useMemo(() => {
    const {generateXAxisTicks, generateYAxisTicks} = options
    const result = {
      xTotalTicks: null,
      xTickStart: null,
      xTickStep: null,
      yTotalTicks: null,
      yTickStart: null,
      yTickStep: null,
    }
    if (isFlagEnabled('axisTicksGenerator')) {
      if (Array.isArray(generateXAxisTicks)) {
        generateXAxisTicks.forEach(
          tickOption => (result[tickOption] = options[tickOption])
        )
      }
      if (Array.isArray(generateYAxisTicks)) {
        generateYAxisTicks.forEach(
          tickOption => (result[tickOption] = options[tickOption])
        )
      }
    }
    return result
  }, [options])
