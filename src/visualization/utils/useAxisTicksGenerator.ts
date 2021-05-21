import {useMemo} from 'react'

export const useAxisTicksGenerator = properties =>
  useMemo(() => {
    const {generateXAxisTicks, generateYAxisTicks} = properties
    const result = {
      xTotalTicks: null,
      xTickStart: null,
      xTickStep: null,
      yTotalTicks: null,
      yTickStart: null,
      yTickStep: null,
    }
    if (Array.isArray(generateXAxisTicks)) {
      generateXAxisTicks.forEach(
        tickOption => (result[tickOption] = properties[tickOption])
      )
    }
    if (Array.isArray(generateYAxisTicks)) {
      generateYAxisTicks.forEach(
        tickOption => (result[tickOption] = properties[tickOption])
      )
    }
    return result
  }, [properties])
