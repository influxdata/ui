// Libraries
import {InfluxColors} from '@influxdata/clockface'

// Constants
import {INFERNO, NINETEEN_EIGHTY_FOUR} from '@influxdata/giraffe'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {DEFAULT_CELL_NAME} from 'src/dashboards/constants'
import {
  LEGEND_OPACITY_DEFAULT,
  LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  LEGEND_COLORIZE_ROWS_DEFAULT,
} from 'src/shared/constants'
import {
  DEFAULT_GAUGE_COLORS,
  DEFAULT_THRESHOLDS_LIST_COLORS,
  DEFAULT_THRESHOLDS_TABLE_COLORS,
} from 'src/shared/constants/thresholds'
import {DEFAULT_CHECK_EVERY} from 'src/alerting/constants'
import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
  DEFAULT_AGGREGATE_FUNCTION,
} from 'src/timeMachine/constants/queryBuilder'

// Types
import {
  Axis,
  BandViewProperties,
  Base,
  BuilderConfig,
  CheckType,
  CheckViewProperties,
  Color,
  DashboardQuery,
  GaugeViewProperties,
  GeoViewProperties,
  HeatmapViewProperties,
  HistogramViewProperties,
  LinePlusSingleStatProperties,
  MarkdownViewProperties,
  MosaicViewProperties,
  NewView,
  RemoteDataState,
  ScatterViewProperties,
  SingleStatViewProperties,
  StaticLegend,
  TableViewProperties,
  ViewProperties,
  ViewType,
  XYViewProperties,
} from 'src/types'
import {LineHoverDimension} from '@influxdata/giraffe/dist/types'
import {
  STATIC_LEGEND_HEIGHT_RATIO_DEFAULT,
  STATIC_LEGEND_WIDTH_RATIO_DEFAULT,
} from 'src/visualization/constants'

export const defaultView = (name: string = DEFAULT_CELL_NAME) => {
  return {
    name,
    status: RemoteDataState.Done,
  }
}

export function defaultViewQuery(): DashboardQuery {
  return {
    name: '',
    text: '',
    editMode: 'builder',
    builderConfig: defaultBuilderConfig(),
  }
}

export function defaultBuilderConfig(): BuilderConfig {
  return {
    buckets: [],
    tags: [{key: '_measurement', values: [], aggregateFunctionType: 'filter'}],
    functions: [{name: DEFAULT_AGGREGATE_FUNCTION}],
    aggregateWindow: {period: AGG_WINDOW_AUTO, fillValues: DEFAULT_FILLVALUES},
  }
}

const legendProps = {
  legendOpacity: LEGEND_OPACITY_DEFAULT,
  legendOrientationThreshold: LEGEND_ORIENTATION_THRESHOLD_DEFAULT,
  legendColorizeRows: LEGEND_COLORIZE_ROWS_DEFAULT,
}

const staticLegend = {
  heightRatio: STATIC_LEGEND_HEIGHT_RATIO_DEFAULT,
  hide: true,
  widthRatio: STATIC_LEGEND_WIDTH_RATIO_DEFAULT,
} as StaticLegend

const tickProps = {
  generateXAxisTicks: [],
  generateYAxisTicks: [],
  xTotalTicks: null,
  xTickStart: null,
  xTickStep: null,
  yTotalTicks: null,
  yTickStart: null,
  yTickStep: null,
}

export function defaultLineViewProperties() {
  return {
    ...legendProps,
    staticLegend,
    queries: [defaultViewQuery()],
    colors: DEFAULT_LINE_COLORS as Color[],
    note: '',
    showNoteWhenEmpty: false,
    ...tickProps,
    axes: {
      x: {
        bounds: ['', ''],
        label: '',
        prefix: '',
        suffix: '',
        base: '10',
        scale: 'linear',
      } as Axis,
      y: {
        bounds: ['', ''],
        label: '',
        prefix: '',
        suffix: '',
        base: '10' as Base,
        scale: 'linear',
      } as Axis,
    },
    hoverDimension: 'auto' as LineHoverDimension,
  }
}

export function defaultBandViewProperties() {
  return {
    ...legendProps,
    queries: [defaultViewQuery()],
    colors: DEFAULT_LINE_COLORS as Color[],
    note: '',
    showNoteWhenEmpty: false,
    ...tickProps,
    axes: {
      x: {
        bounds: ['', ''],
        label: '',
        prefix: '',
        suffix: '',
        scale: 'linear',
      } as Axis,
      y: {
        bounds: ['', ''],
        label: '',
        prefix: '',
        suffix: '',
        scale: 'linear',
      } as Axis,
    },
    hoverDimension: 'auto' as LineHoverDimension,
    upperColumn: '',
    mainColumn: DEFAULT_AGGREGATE_FUNCTION,
    lowerColumn: '',
  }
}

function defaultGaugeViewProperties() {
  return {
    queries: [defaultViewQuery()],
    colors: DEFAULT_GAUGE_COLORS as Color[],
    prefix: '',
    tickPrefix: '',
    suffix: '',
    tickSuffix: '',
    note: '',
    showNoteWhenEmpty: false,
    decimalPlaces: {
      isEnforced: true,
      digits: 2,
    },
  }
}

function defaultSingleStatViewProperties() {
  return {
    queries: [defaultViewQuery()],
    colors: DEFAULT_THRESHOLDS_LIST_COLORS as Color[],
    prefix: '',
    tickPrefix: '',
    suffix: '',
    tickSuffix: '',
    note: '',
    showNoteWhenEmpty: false,
    decimalPlaces: {
      isEnforced: true,
      digits: 2,
    },
  }
}

// Defines the zero values of the various view types
const NEW_VIEW_CREATORS = {
  xy: (): NewView<XYViewProperties> => ({
    ...defaultView(),
    properties: {
      ...defaultLineViewProperties(),
      type: 'xy',
      shape: 'chronograf-v2',
      geom: 'line',
      xColumn: null,
      yColumn: null,
      position: 'overlaid',
    },
  }),
  band: (): NewView<BandViewProperties> => ({
    ...defaultView(),
    properties: {
      ...defaultBandViewProperties(),
      type: 'band',
      shape: 'chronograf-v2',
      geom: 'line',
      xColumn: null,
      yColumn: null,
    },
  }),
  histogram: (): NewView<HistogramViewProperties> => ({
    ...defaultView(),
    properties: {
      ...legendProps,
      queries: [],
      type: 'histogram',
      shape: 'chronograf-v2',
      xColumn: '_value',
      xDomain: null,
      xAxisLabel: '',
      fillColumns: null,
      position: 'stacked',
      binCount: 30,
      colors: DEFAULT_LINE_COLORS as Color[],
      note: '',
      showNoteWhenEmpty: false,
    },
  }),
  heatmap: (): NewView<HeatmapViewProperties> => ({
    ...defaultView(),
    properties: {
      ...legendProps,
      queries: [],
      type: 'heatmap',
      shape: 'chronograf-v2',
      xColumn: null,
      yColumn: null,
      xDomain: null,
      yDomain: null,
      xAxisLabel: '',
      yAxisLabel: '',
      xPrefix: '',
      xSuffix: '',
      yPrefix: '',
      ySuffix: '',
      colors: INFERNO,
      binSize: 10,
      note: '',
      showNoteWhenEmpty: false,
      ...tickProps,
    },
  }),
  'single-stat': (): NewView<SingleStatViewProperties> => ({
    ...defaultView(),
    properties: {
      ...defaultSingleStatViewProperties(),
      type: 'single-stat',
      shape: 'chronograf-v2',
    },
  }),
  gauge: (): NewView<GaugeViewProperties> => ({
    ...defaultView(),
    properties: {
      ...defaultGaugeViewProperties(),
      type: 'gauge',
      shape: 'chronograf-v2',
    },
  }),
  'line-plus-single-stat': (): NewView<LinePlusSingleStatProperties> => ({
    ...defaultView(),
    properties: {
      ...defaultLineViewProperties(),
      ...defaultSingleStatViewProperties(),
      type: 'line-plus-single-stat',
      shape: 'chronograf-v2',
      xColumn: null,
      yColumn: null,
      position: 'overlaid',
    },
  }),
  table: (): NewView<TableViewProperties> => ({
    ...defaultView(),
    properties: {
      type: 'table',
      shape: 'chronograf-v2',
      queries: [defaultViewQuery()],
      colors: DEFAULT_THRESHOLDS_TABLE_COLORS as Color[],
      tableOptions: {
        verticalTimeAxis: true,
        sortBy: null,
        fixFirstColumn: false,
      },
      fieldOptions: [],
      decimalPlaces: {
        isEnforced: false,
        digits: 2,
      },
      timeFormat: 'YYYY-MM-DD HH:mm:ss',
      note: '',
      showNoteWhenEmpty: false,
    },
  }),
  markdown: (): NewView<MarkdownViewProperties> => ({
    ...defaultView(),
    properties: {
      type: 'markdown',
      shape: 'chronograf-v2',
      note: '',
    },
  }),
  scatter: (): NewView<ScatterViewProperties> => ({
    ...defaultView(),
    properties: {
      ...legendProps,
      type: 'scatter',
      shape: 'chronograf-v2',
      queries: [defaultViewQuery()],
      colors: NINETEEN_EIGHTY_FOUR,
      note: '',
      showNoteWhenEmpty: false,
      ...tickProps,
      fillColumns: null,
      symbolColumns: null,
      xColumn: null,
      xDomain: null,
      yColumn: null,
      yDomain: null,
      xAxisLabel: '',
      yAxisLabel: '',
      xPrefix: '',
      xSuffix: '',
      yPrefix: '',
      ySuffix: '',
    },
  }),
  mosaic: (): NewView<MosaicViewProperties> => ({
    ...defaultView(),
    properties: {
      ...legendProps,
      type: 'mosaic',
      shape: 'chronograf-v2',
      queries: [defaultViewQuery()],
      colors: NINETEEN_EIGHTY_FOUR,
      note: '',
      showNoteWhenEmpty: false,
      generateXAxisTicks: [],
      xTotalTicks: null,
      xTickStart: null,
      xTickStep: null,
      fillColumns: null,
      xColumn: null,
      xDomain: null,
      ySeriesColumns: null,
      yLabelColumns: null,
      yLabelColumnSeparator: '',
      yDomain: null,
      xAxisLabel: '',
      yAxisLabel: '',
      xPrefix: '',
      xSuffix: '',
      yPrefix: '',
      ySuffix: '',
    },
  }),
  geo: (): NewView<GeoViewProperties> => ({
    ...defaultView(),
    properties: {
      type: 'geo',
      shape: 'chronograf-v2',
      queries: [defaultViewQuery()],
      colors: [],
      note: '',
      showNoteWhenEmpty: false,
      center: {
        lat: 0,
        lon: 0,
      },
      zoom: 6,
      allowPanAndZoom: true,
      detectCoordinateFields: false,
      mapStyle: '',
      layers: [
        {
          type: 'pointMap',
          colorDimension: {label: 'Value'},
          colorField: '_value',
          colors: [
            {type: 'min', hex: InfluxColors.Star},
            {value: 50, hex: InfluxColors.Star},
            {type: 'max', hex: InfluxColors.Star},
          ],
          isClustered: false,
        },
      ],
    },
  }),
  threshold: (): NewView<CheckViewProperties> => ({
    ...defaultView('check'),
    properties: {
      type: 'check',
      shape: 'chronograf-v2',
      checkID: '',
      queries: [
        {
          name: '',
          text: '',
          editMode: 'builder',
          builderConfig: {
            buckets: [],
            tags: [
              {
                key: '_measurement',
                values: [],
                aggregateFunctionType: 'filter',
              },
            ],
            functions: [{name: 'mean'}],
            aggregateWindow: {
              period: DEFAULT_CHECK_EVERY,
              fillValues: DEFAULT_FILLVALUES,
            },
          },
        },
      ],
      colors: DEFAULT_LINE_COLORS as Color[],
    },
  }),
  deadman: (): NewView<CheckViewProperties> => ({
    ...defaultView('check'),
    properties: {
      type: 'check',
      shape: 'chronograf-v2',
      checkID: '',
      queries: [
        {
          name: '',
          text: '',
          editMode: 'builder',
          builderConfig: {
            buckets: [],
            tags: [
              {
                key: '_measurement',
                values: [],
                aggregateFunctionType: 'filter',
              },
            ],
            functions: [],
          },
        },
      ],
      colors: DEFAULT_LINE_COLORS as Color[],
    },
  }),
  custom: (): NewView<TableViewProperties> => ({
    ...defaultView(),
    properties: {
      type: 'table',
      shape: 'chronograf-v2',
      queries: [],
      colors: DEFAULT_THRESHOLDS_LIST_COLORS as Color[],
      tableOptions: {
        verticalTimeAxis: true,
        sortBy: null,
        fixFirstColumn: false,
      },
      fieldOptions: [],
      decimalPlaces: {
        isEnforced: false,
        digits: 2,
      },
      timeFormat: 'YYYY-MM-DD HH:mm:ss',
      note: '',
      showNoteWhenEmpty: false,
    },
  }),
}

type CreateViewType = ViewType | CheckType

export function createView<T extends ViewProperties = ViewProperties>(
  viewType: CreateViewType = 'xy'
): NewView<T> {
  const creator = NEW_VIEW_CREATORS[viewType]

  if (!creator) {
    throw new Error(`no view creator implemented for view of type ${viewType}`)
  }

  return creator() as NewView<T>
}
