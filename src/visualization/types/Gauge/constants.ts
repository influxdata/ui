import {InfluxColors} from '@influxdata/clockface'

export interface GaugeTheme {
  degree: number
  lineCount: number
  smallLineCount: number
  lineColor: string
  labelColor: string
  labelFontSize: number
  lineStrokeSmall: number
  lineStrokeLarge: number
  tickSizeSmall: number
  tickSizeLarge: number
  minFontSize: number
  minLineWidth: number
  valueColor: string
  needleColor0: string
  needleColor1: string
  overflowDelta: number
}

export const GAUGE_THEME_LIGHT: GaugeTheme = {
  degree: (5 / 4) * Math.PI,
  labelColor: `${InfluxColors.Grey45}`,
  labelFontSize: 13,
  lineColor: `${InfluxColors.Grey85}`,
  lineCount: 5,
  lineStrokeLarge: 3,
  lineStrokeSmall: 1,
  minFontSize: 22,
  minLineWidth: 24,
  needleColor0: `${InfluxColors.Grey55}`,
  needleColor1: `${InfluxColors.Grey25}`,
  smallLineCount: 10,
  tickSizeLarge: 18,
  tickSizeSmall: 9,
  valueColor: `${InfluxColors.Grey35}`,

  // This constant expresses how far past the gauge max the needle should be
  // drawn if the value for the needle is greater than the gauge max. It is
  // expressed as a percentage of the circumference of a circle, e.g. 0.5 means
  // draw halfway around the gauge from the max value
  overflowDelta: 0.03,
}

export const GAUGE_THEME_DARK: GaugeTheme = {
  degree: (5 / 4) * Math.PI,
  labelColor: `${InfluxColors.Grey55}`,
  labelFontSize: 13,
  lineColor: `${InfluxColors.Grey35}`,
  lineCount: 5,
  lineStrokeLarge: 3,
  lineStrokeSmall: 1,
  minFontSize: 22,
  minLineWidth: 24,
  needleColor0: `${InfluxColors.Grey25}`,
  needleColor1: `${InfluxColors.White}`,
  smallLineCount: 10,
  tickSizeLarge: 18,
  tickSizeSmall: 9,
  valueColor: `${InfluxColors.White}`,

  // This constant expresses how far past the gauge max the needle should be
  // drawn if the value for the needle is greater than the gauge max. It is
  // expressed as a percentage of the circumference of a circle, e.g. 0.5 means
  // draw halfway around the gauge from the max value
  overflowDelta: 0.03,
}

export const GAUGE_ARC_LENGTH_DEFAULT = 1.5 * Math.PI
export const GAUGE_VALUE_POSITION_X_OFFSET_DEFAULT = 0
export const GAUGE_VALUE_POSITION_Y_OFFSET_DEFAULT = 1.5
