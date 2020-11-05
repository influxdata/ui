// Libraries
import {Dispatch} from 'react'

// Actions
import {loadBuckets} from 'src/timeMachine/actions/queryBuilder'
import {saveAndExecuteQueries} from 'src/timeMachine/actions/queries'
import {
  reloadTagSelectors,
  Action as QueryBuilderAction,
} from 'src/timeMachine/actions/queryBuilder'
import {convertCheckToCustom} from 'src/alerting/actions/alertBuilder'
import {setDashboardTimeRange} from 'src/dashboards/actions/ranges'

// Selectors
import {getActiveQuery} from 'src/timeMachine/selectors'

// Utils
import {createView} from 'src/views/helpers'
import {createCheckQueryFromAlertBuilder} from 'src/alerting/utils/customCheck'
import {currentContext} from 'src/shared/selectors/currentContext'

// Types
import {TimeMachineState} from 'src/timeMachine/reducers'
import {Action as QueryResultsAction} from 'src/timeMachine/actions/queries'
import {Action as AlertBuilderAction} from 'src/alerting/actions/alertBuilder'
import {
  TimeRange,
  ViewType,
  Axes,
  DecimalPlaces,
  XYGeom,
  FieldOption,
  TableOptions,
  TimeMachineTab,
  AutoRefresh,
  TimeMachineID,
  XYViewProperties,
  GetState,
} from 'src/types'
import {Color} from 'src/types/colors'
import {HistogramPosition, LinePosition} from '@influxdata/giraffe'

export type Action =
  | QueryBuilderAction
  | QueryResultsAction
  | SetActiveTimeMachineAction
  | SetActiveTabAction
  | SetNameAction
  | SetAutoRefreshAction
  | SetTypeAction
  | SetActiveQueryText
  | SetIsViewingRawDataAction
  | SetGeomAction
  | SetDecimalPlaces
  | SetBackgroundThresholdColoringAction
  | SetTextThresholdColoringAction
  | SetColors
  | SetYAxisLabel
  | SetYAxisBounds
  | SetAxisPrefix
  | SetAxisSuffix
  | SetYAxisBase
  | SetPrefix
  | SetTickPrefix
  | SetSuffix
  | SetTickSuffix
  | SetActiveQueryIndexAction
  | AddQueryAction
  | RemoveQueryAction
  | ToggleQueryAction
  | EditActiveQueryAsFluxAction
  | EditActiveQueryWithBuilderAction
  | UpdateActiveQueryNameAction
  | SetFieldOptionsAction
  | UpdateFieldOptionAction
  | SetTableOptionsAction
  | SetTimeFormatAction
  | SetXColumnAction
  | SetYColumnAction
  | SetYSeriesColumnsAction
  | SetBinSizeAction
  | SetColorHexesAction
  | SetFillColumnsAction
  | SetSymbolColumnsAction
  | SetBinCountAction
  | SetHistogramPositionAction
  | ReturnType<typeof setLinePosition>
  | ReturnType<typeof setUpperColumn>
  | ReturnType<typeof setMainColumn>
  | ReturnType<typeof setLowerColumn>
  | ReturnType<typeof setLegendOpacity>
  | ReturnType<typeof setLegendOrientationThreshold>
  | ReturnType<typeof setGenerateXAxisTicks>
  | ReturnType<typeof setGenerateYAxisTicks>
  | ReturnType<typeof setXTotalTicks>
  | ReturnType<typeof setXTickStart>
  | ReturnType<typeof setXTickStep>
  | ReturnType<typeof setYTotalTicks>
  | ReturnType<typeof setYTickStart>
  | ReturnType<typeof setYTickStep>
  | SetXDomainAction
  | SetYDomainAction
  | SetXAxisLabelAction
  | SetShadeBelowAction
  | SetHoverDimensionAction
  | ReturnType<typeof toggleVisOptions>
  | ReturnType<typeof resetActiveQueryWithBuilder>

type ExternalActions =
  | ReturnType<typeof loadBuckets>
  | ReturnType<typeof saveAndExecuteQueries>

interface SetActiveTimeMachineAction {
  type: 'SET_ACTIVE_TIME_MACHINE'
  payload: {
    activeTimeMachineID: TimeMachineID
    initialState: Partial<TimeMachineState>
  }
}

export const setActiveTimeMachine = (
  activeTimeMachineID: TimeMachineID,
  initialState: Partial<TimeMachineState> = {}
): SetActiveTimeMachineAction => ({
  type: 'SET_ACTIVE_TIME_MACHINE',
  payload: {activeTimeMachineID, initialState},
})

interface SetActiveTabAction {
  type: 'SET_ACTIVE_TAB'
  payload: {activeTab: TimeMachineTab}
}

export const setActiveTab = (
  activeTab: TimeMachineTab
): SetActiveTabAction => ({
  type: 'SET_ACTIVE_TAB',
  payload: {activeTab},
})

export const toggleVisOptions = () => ({
  type: 'TOGGLE_VIS_OPTIONS' as 'TOGGLE_VIS_OPTIONS',
})

interface SetNameAction {
  type: 'SET_VIEW_NAME'
  payload: {name: string}
}

export const setName = (name: string): SetNameAction => ({
  type: 'SET_VIEW_NAME',
  payload: {name},
})

export const setTimeRange = (timeRange: TimeRange) => (dispatch, getState) => {
  const state = getState()
  const contextID = currentContext(state)
  const activeQuery = getActiveQuery(state)

  dispatch(setDashboardTimeRange(contextID, timeRange))
  dispatch(saveAndExecuteQueries())
  if (activeQuery.editMode === 'builder') {
    dispatch(reloadTagSelectors())
  }
}

interface SetAutoRefreshAction {
  type: 'SET_AUTO_REFRESH'
  payload: {autoRefresh: AutoRefresh}
}

export const setAutoRefresh = (
  autoRefresh: AutoRefresh
): SetAutoRefreshAction => ({
  type: 'SET_AUTO_REFRESH',
  payload: {autoRefresh},
})

interface SetTypeAction {
  type: 'SET_VIEW_TYPE'
  payload: {type: ViewType}
}

export const setType = (type: ViewType): SetTypeAction => ({
  type: 'SET_VIEW_TYPE',
  payload: {type},
})

interface SetActiveQueryText {
  type: 'SET_ACTIVE_QUERY_TEXT'
  payload: {text: string}
}

export const setActiveQueryText = (text: string): SetActiveQueryText => ({
  type: 'SET_ACTIVE_QUERY_TEXT',
  payload: {text},
})

interface SetIsViewingRawDataAction {
  type: 'SET_IS_VIEWING_RAW_DATA'
  payload: {isViewingRawData: boolean}
}

export const setIsViewingRawData = (
  isViewingRawData: boolean
): SetIsViewingRawDataAction => ({
  type: 'SET_IS_VIEWING_RAW_DATA',
  payload: {isViewingRawData},
})

interface SetGeomAction {
  type: 'SET_GEOM'
  payload: {geom: XYGeom}
}

export const setGeom = (geom: XYGeom): SetGeomAction => ({
  type: 'SET_GEOM',
  payload: {geom},
})

interface SetYAxisLabel {
  type: 'SET_Y_AXIS_LABEL'
  payload: {yAxisLabel: string}
}

export const setYAxisLabel = (yAxisLabel: string): SetYAxisLabel => ({
  type: 'SET_Y_AXIS_LABEL',
  payload: {yAxisLabel},
})

interface SetYAxisBounds {
  type: 'SET_Y_AXIS_BOUNDS'
  payload: {bounds: Axes['y']['bounds']}
}

export const setYAxisBounds = (
  bounds: Axes['y']['bounds']
): SetYAxisBounds => ({
  type: 'SET_Y_AXIS_BOUNDS',
  payload: {bounds},
})

interface SetAxisPrefix {
  type: 'SET_AXIS_PREFIX'
  payload: {prefix: string; axis: 'x' | 'y'}
}

export const setAxisPrefix = (
  prefix: string,
  axis: 'x' | 'y'
): SetAxisPrefix => ({
  type: 'SET_AXIS_PREFIX',
  payload: {prefix, axis},
})

interface SetAxisSuffix {
  type: 'SET_AXIS_SUFFIX'
  payload: {suffix: string; axis: 'x' | 'y'}
}

export const setAxisSuffix = (
  suffix: string,
  axis: 'x' | 'y'
): SetAxisSuffix => ({
  type: 'SET_AXIS_SUFFIX',
  payload: {suffix, axis},
})

interface SetYAxisBase {
  type: 'SET_Y_AXIS_BASE'
  payload: {base: string}
}

export const setYAxisBase = (base: string): SetYAxisBase => ({
  type: 'SET_Y_AXIS_BASE',
  payload: {base},
})

interface SetPrefix {
  type: 'SET_PREFIX'
  payload: {prefix: string}
}

export const setPrefix = (prefix: string): SetPrefix => ({
  type: 'SET_PREFIX',
  payload: {prefix},
})

interface SetTickPrefix {
  type: 'SET_TICK_PREFIX'
  payload: {tickPrefix: string}
}

export const setTickPrefix = (tickPrefix: string): SetTickPrefix => ({
  type: 'SET_TICK_PREFIX',
  payload: {tickPrefix},
})

interface SetSuffix {
  type: 'SET_SUFFIX'
  payload: {suffix: string}
}

export const setSuffix = (suffix: string): SetSuffix => ({
  type: 'SET_SUFFIX',
  payload: {suffix},
})

interface SetTickSuffix {
  type: 'SET_TICK_SUFFIX'
  payload: {tickSuffix: string}
}

export const setTickSuffix = (tickSuffix: string): SetTickSuffix => ({
  type: 'SET_TICK_SUFFIX',
  payload: {tickSuffix},
})

interface SetColors {
  type: 'SET_COLORS'
  payload: {colors: Color[]}
}

export const setColors = (colors: Color[]): SetColors => ({
  type: 'SET_COLORS',
  payload: {colors},
})

interface SetDecimalPlaces {
  type: 'SET_DECIMAL_PLACES'
  payload: {decimalPlaces: DecimalPlaces}
}

export const setDecimalPlaces = (
  decimalPlaces: DecimalPlaces
): SetDecimalPlaces => ({
  type: 'SET_DECIMAL_PLACES',
  payload: {decimalPlaces},
})

interface SetBackgroundThresholdColoringAction {
  type: 'SET_BACKGROUND_THRESHOLD_COLORING'
}

export const setBackgroundThresholdColoring = (): SetBackgroundThresholdColoringAction => ({
  type: 'SET_BACKGROUND_THRESHOLD_COLORING',
})

interface SetTextThresholdColoringAction {
  type: 'SET_TEXT_THRESHOLD_COLORING'
}

export const setTextThresholdColoring = (): SetTextThresholdColoringAction => ({
  type: 'SET_TEXT_THRESHOLD_COLORING',
})

interface EditActiveQueryWithBuilderAction {
  type: 'EDIT_ACTIVE_QUERY_WITH_BUILDER'
}

export const editActiveQueryWithBuilderSync = (): EditActiveQueryWithBuilderAction => ({
  type: 'EDIT_ACTIVE_QUERY_WITH_BUILDER',
})

export const editActiveQueryWithBuilder = () => dispatch => {
  dispatch(editActiveQueryWithBuilderSync())
  dispatch(saveAndExecuteQueries())
}

interface ResetActiveQueryWithBuilder {
  type: 'RESET_QUERY_AND_EDIT_WITH_BUILDER'
}

export const resetActiveQueryWithBuilder = (): ResetActiveQueryWithBuilder => ({
  type: 'RESET_QUERY_AND_EDIT_WITH_BUILDER',
})

export const resetActiveQuerySwitchToBuilder = () => dispatch => {
  dispatch(resetActiveQueryWithBuilder())
  dispatch(saveAndExecuteQueries())
}

interface EditActiveQueryAsFluxAction {
  type: 'EDIT_ACTIVE_QUERY_AS_FLUX'
}

export const editActiveQueryAsFlux = (): EditActiveQueryAsFluxAction => ({
  type: 'EDIT_ACTIVE_QUERY_AS_FLUX',
})

interface SetActiveQueryIndexAction {
  type: 'SET_ACTIVE_QUERY_INDEX'
  payload: {activeQueryIndex: number}
}

export const setActiveQueryIndexSync = (
  activeQueryIndex: number
): SetActiveQueryIndexAction => ({
  type: 'SET_ACTIVE_QUERY_INDEX',
  payload: {activeQueryIndex},
})

export const setActiveQueryIndex = (activeQueryIndex: number) => (
  dispatch: Dispatch<Action | ExternalActions>
) => {
  dispatch(setActiveQueryIndexSync(activeQueryIndex))
  dispatch(loadBuckets())
}

interface AddQueryAction {
  type: 'ADD_QUERY'
}

export const addQuerySync = (): AddQueryAction => ({
  type: 'ADD_QUERY',
})

export const addQuery = () => (
  dispatch: Dispatch<Action | ExternalActions>
) => {
  dispatch(addQuerySync())
  dispatch(loadBuckets())
}

interface RemoveQueryAction {
  type: 'REMOVE_QUERY'
  payload: {queryIndex: number}
}

export const removeQuerySync = (queryIndex: number): RemoveQueryAction => ({
  type: 'REMOVE_QUERY',
  payload: {queryIndex},
})

interface ToggleQueryAction {
  type: 'TOGGLE_QUERY'
  payload: {queryIndex: number}
}

export const toggleQuerySync = (queryIndex: number): ToggleQueryAction => ({
  type: 'TOGGLE_QUERY',
  payload: {queryIndex},
})

export const removeQuery = (queryIndex: number) => (
  dispatch: Dispatch<Action | ExternalActions>
) => {
  dispatch(removeQuerySync(queryIndex))
  dispatch(loadBuckets())
  dispatch(saveAndExecuteQueries())
}

export const toggleQuery = (queryIndex: number) => (
  dispatch: Dispatch<Action | ExternalActions>
) => {
  dispatch(toggleQuerySync(queryIndex))
  dispatch(saveAndExecuteQueries())
}

interface UpdateActiveQueryNameAction {
  type: 'UPDATE_ACTIVE_QUERY_NAME'
  payload: {queryName: string}
}

export const updateActiveQueryName = (
  queryName: string
): UpdateActiveQueryNameAction => ({
  type: 'UPDATE_ACTIVE_QUERY_NAME',
  payload: {queryName},
})

interface SetFieldOptionsAction {
  type: 'SET_FIELD_OPTIONS'
  payload: {
    fieldOptions: FieldOption[]
  }
}

export const setFieldOptions = (
  fieldOptions: FieldOption[]
): SetFieldOptionsAction => ({
  type: 'SET_FIELD_OPTIONS',
  payload: {fieldOptions},
})

interface UpdateFieldOptionAction {
  type: 'UPDATE_FIELD_OPTION'
  payload: {
    option: FieldOption
  }
}

export const updateFieldOption = (
  option: FieldOption
): UpdateFieldOptionAction => ({
  type: 'UPDATE_FIELD_OPTION',
  payload: {option},
})

interface SetTableOptionsAction {
  type: 'SET_TABLE_OPTIONS'
  payload: {
    tableOptions: TableOptions
  }
}

export const setTableOptions = (
  tableOptions: TableOptions
): SetTableOptionsAction => ({
  type: 'SET_TABLE_OPTIONS',
  payload: {tableOptions},
})

interface SetTimeFormatAction {
  type: 'SET_TIME_FORMAT'
  payload: {
    timeFormat: string
  }
}

export const setTimeFormat = (timeFormat: string): SetTimeFormatAction => ({
  type: 'SET_TIME_FORMAT',
  payload: {timeFormat},
})

interface SetXColumnAction {
  type: 'SET_X_COLUMN'
  payload: {xColumn: string}
}

export const setXColumn = (xColumn: string): SetXColumnAction => ({
  type: 'SET_X_COLUMN',
  payload: {xColumn},
})

interface SetYColumnAction {
  type: 'SET_Y_COLUMN'
  payload: {yColumn: string}
}

export const setYColumn = (yColumn: string): SetYColumnAction => ({
  type: 'SET_Y_COLUMN',
  payload: {yColumn},
})

interface SetYSeriesColumnsAction {
  type: 'SET_Y_SERIES_COLUMNS'
  payload: {ySeriesColumns: string[]}
}

export const setYSeriesColumns = (
  ySeriesColumns: string[]
): SetYSeriesColumnsAction => ({
  type: 'SET_Y_SERIES_COLUMNS',
  payload: {ySeriesColumns},
})

interface SetShadeBelowAction {
  type: 'SET_SHADE_BELOW'
  payload: {shadeBelow}
}

export const setShadeBelow = (shadeBelow: boolean): SetShadeBelowAction => ({
  type: 'SET_SHADE_BELOW',
  payload: {shadeBelow},
})

interface SetHoverDimensionAction {
  type: 'SET_HOVER_DIMENSION'
  payload: {hoverDimension}
}

export const setHoverDimension = (
  hoverDimension: 'auto' | 'x' | 'y' | 'xy'
): SetHoverDimensionAction => ({
  type: 'SET_HOVER_DIMENSION',
  payload: {hoverDimension},
})

interface SetBinSizeAction {
  type: 'SET_BIN_SIZE'
  payload: {binSize: number}
}

export const setBinSize = (binSize: number): SetBinSizeAction => ({
  type: 'SET_BIN_SIZE',
  payload: {binSize},
})

interface SetColorHexesAction {
  type: 'SET_COLOR_HEXES'
  payload: {colors: string[]}
}

export const setColorHexes = (colors: string[]): SetColorHexesAction => ({
  type: 'SET_COLOR_HEXES',
  payload: {colors},
})

interface SetFillColumnsAction {
  type: 'SET_FILL_COLUMNS'
  payload: {fillColumns: string[]}
}

export const setFillColumns = (
  fillColumns: string[]
): SetFillColumnsAction => ({
  type: 'SET_FILL_COLUMNS',
  payload: {fillColumns},
})

interface SetSymbolColumnsAction {
  type: 'SET_SYMBOL_COLUMNS'
  payload: {symbolColumns: string[]}
}

export const setSymbolColumns = (
  symbolColumns: string[]
): SetSymbolColumnsAction => ({
  type: 'SET_SYMBOL_COLUMNS',
  payload: {symbolColumns},
})

interface SetBinCountAction {
  type: 'SET_BIN_COUNT'
  payload: {binCount: number}
}

export const setBinCount = (binCount: number): SetBinCountAction => ({
  type: 'SET_BIN_COUNT',
  payload: {binCount},
})

interface SetHistogramPositionAction {
  type: 'SET_HISTOGRAM_POSITION'
  payload: {position: HistogramPosition}
}

export const setHistogramPosition = (
  position: HistogramPosition
): SetHistogramPositionAction => ({
  type: 'SET_HISTOGRAM_POSITION',
  payload: {position},
})

export const setLinePosition = (position: LinePosition) => ({
  type: 'SET_LINE_POSITION' as 'SET_LINE_POSITION',
  payload: {position},
})

interface SetXDomainAction {
  type: 'SET_VIEW_X_DOMAIN'
  payload: {xDomain: [number, number]}
}

export const setXDomain = (xDomain: [number, number]): SetXDomainAction => ({
  type: 'SET_VIEW_X_DOMAIN',
  payload: {xDomain},
})

interface SetYDomainAction {
  type: 'SET_VIEW_Y_DOMAIN'
  payload: {yDomain: [number, number]}
}

export const setYDomain = (yDomain: [number, number]): SetYDomainAction => ({
  type: 'SET_VIEW_Y_DOMAIN',
  payload: {yDomain},
})

interface SetXAxisLabelAction {
  type: 'SET_X_AXIS_LABEL'
  payload: {xAxisLabel: string}
}

export const setXAxisLabel = (xAxisLabel: string): SetXAxisLabelAction => ({
  type: 'SET_X_AXIS_LABEL',
  payload: {xAxisLabel},
})

export const setUpperColumn = (upperColumn: string) => ({
  type: 'SET_UPPER_COLUMN' as 'SET_UPPER_COLUMN',
  payload: {upperColumn},
})

export const setMainColumn = (mainColumn: string) => ({
  type: 'SET_MAIN_COLUMN' as 'SET_MAIN_COLUMN',
  payload: {mainColumn},
})

export const setLowerColumn = (lowerColumn: string) => ({
  type: 'SET_LOWER_COLUMN' as 'SET_LOWER_COLUMN',
  payload: {lowerColumn},
})

export const setLegendOpacity = (legendOpacity: number) => ({
  type: 'SET_LEGEND_OPACITY' as 'SET_LEGEND_OPACITY',
  payload: {legendOpacity},
})

export const setLegendOrientationThreshold = (
  legendOrientationThreshold: number
) => ({
  type: 'SET_LEGEND_ORIENTATION_THRESHOLD' as 'SET_LEGEND_ORIENTATION_THRESHOLD',
  payload: {legendOrientationThreshold},
})

export const setGenerateXAxisTicks = (generateXAxisTicks: string[]) => ({
  type: 'SET_GENERATE_X_AXIS_TICKS' as 'SET_GENERATE_X_AXIS_TICKS',
  payload: {generateXAxisTicks},
})

export const setGenerateYAxisTicks = (generateYAxisTicks: string[]) => ({
  type: 'SET_GENERATE_Y_AXIS_TICKS' as 'SET_GENERATE_Y_AXIS_TICKS',
  payload: {generateYAxisTicks},
})

export const setXTotalTicks = (xTotalTicks: number) => ({
  type: 'SET_X_TOTAL_TICKS' as 'SET_X_TOTAL_TICKS',
  payload: {xTotalTicks},
})

export const setXTickStart = (xTickStart: number) => ({
  type: 'SET_X_TICK_START' as 'SET_X_TICK_START',
  payload: {xTickStart},
})

export const setXTickStep = (xTickStep: number) => ({
  type: 'SET_X_TICK_STEP' as 'SET_X_TICK_STEP',
  payload: {xTickStep},
})

export const setYTotalTicks = (yTotalTicks: number) => ({
  type: 'SET_Y_TOTAL_TICKS' as 'SET_Y_TOTAL_TICKS',
  payload: {yTotalTicks},
})

export const setYTickStart = (yTickStart: number) => ({
  type: 'SET_Y_TICK_START' as 'SET_Y_TICK_START',
  payload: {yTickStart},
})

export const setYTickStep = (yTickStep: number) => ({
  type: 'SET_Y_TICK_STEP' as 'SET_Y_TICK_STEP',
  payload: {yTickStep},
})

export const loadNewVEO = () => (
  dispatch: Dispatch<Action | ExternalActions>
): void => {
  dispatch(
    setActiveTimeMachine('veo', {
      view: createView<XYViewProperties>('xy'),
    })
  )
}

export const loadCustomCheckQueryState = () => (
  dispatch: Dispatch<Action | AlertBuilderAction>,
  getState: GetState
) => {
  const state = getState()

  const {alertBuilder} = state

  const {builderConfig} = getActiveQuery(state)

  dispatch(
    setActiveQueryText(
      createCheckQueryFromAlertBuilder(builderConfig, alertBuilder)
    )
  )

  dispatch(setType('table'))

  dispatch(convertCheckToCustom())

  dispatch(setActiveTab('customCheckQuery'))
}
