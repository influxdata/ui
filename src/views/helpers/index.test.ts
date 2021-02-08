import {createView, defaultBuilderConfig} from 'src/views/helpers/index'
import {
  XYViewProperties,
  ScatterViewProperties,
  BandViewProperties,
  HeatmapViewProperties,
} from '../../client'

import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  LEGEND_COLORIZE_ROWS_DEFAULT,
} from 'src/shared/constants'

describe('intro test', () => {
  it('get the dbc (default bucket config)', () => {
    const foo = defaultBuilderConfig()
    expect(foo.buckets).toEqual([])
  })
})

describe('testing view refactoring/components', () => {
  const ticks = {
    generateXAxisTicks: [],
    generateYAxisTicks: [],
    xTotalTicks: null,
    xTickStart: null,
    xTickStep: null,
    yTotalTicks: null,
    yTickStart: null,
    yTickStep: null,
  }

  const checkTickProps = graphProps => {
    expect(graphProps.generateXAxisTicks).toEqual(ticks.generateXAxisTicks)
    expect(graphProps.generateYAxisTicks).toEqual(ticks.generateYAxisTicks)

    expect(graphProps.xTotalTicks).toEqual(ticks.xTotalTicks)
    expect(graphProps.yTotalTicks).toEqual(ticks.yTotalTicks)

    expect(graphProps.xTickStart).toEqual(ticks.xTickStart)
    expect(graphProps.yTickStart).toEqual(ticks.yTickStart)

    expect(graphProps.xTickStep).toEqual(ticks.xTickStep)
    expect(graphProps.yTickStep).toEqual(ticks.yTickStep)
  }

  const legendProps = {
    legendOpacity: LEGEND_OPACITY_DEFAULT,
    legendOrientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
    legendColorizeRows: LEGEND_COLORIZE_ROWS_DEFAULT,
  }

  const checkLegendProps = graphProps => {
    expect(graphProps.legendOpacity).toEqual(legendProps.legendOpacity)
    expect(graphProps.legendOrientationThreshold).toEqual(
      legendProps.legendOrientationThreshold
    )
    expect(graphProps.legendColorizeRows).toEqual(
      legendProps.legendColorizeRows
    )
  }

  it('xy configuration test should be the same (ticks & legend)', () => {
    const ack = createView<XYViewProperties>('xy').properties
    checkTickProps(ack)
    checkLegendProps(ack)
  })

  it('band properties (ticks & legendProps) test', () => {
    const bandProps = createView<BandViewProperties>('band').properties
    checkTickProps(bandProps)
    checkLegendProps(bandProps)
  })

  it('heatmap tick & legend property test', () => {
    const heatProps = createView<HeatmapViewProperties>('heatmap').properties
    checkTickProps(heatProps)
    checkLegendProps(heatProps)
  })

  it('scatter tick & legend prop test', () => {
    const scatterProps = createView<ScatterViewProperties>('scatter').properties
    checkTickProps(scatterProps)
    checkLegendProps(scatterProps)
  })
})
