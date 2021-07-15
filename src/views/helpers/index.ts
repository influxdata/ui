// Constants
import {DEFAULT_CELL_NAME} from 'src/dashboards/constants'
import {
  DEFAULT_FILLVALUES,
  AGG_WINDOW_AUTO,
  DEFAULT_AGGREGATE_FUNCTION,
} from 'src/timeMachine/constants/queryBuilder'

// Types
import {
  BuilderConfig,
  CheckType,
  CheckViewProperties,
  Color,
  DashboardQuery,
  NewView,
  RemoteDataState,
  TableViewProperties,
  ViewProperties,
  ViewType,
} from 'src/types'

import {DEFAULT_THRESHOLDS_LIST_COLORS} from 'src/shared/constants/thresholds'
import {DEFAULT_CHECK_EVERY} from 'src/alerting/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'

import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

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

const SPECIAL_TYPES = {
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
  // these aren't currently supported visualizations
  if (SPECIAL_TYPES[viewType]) {
    return SPECIAL_TYPES[viewType]() as NewView<T>
  }

  if (!SUPPORTED_VISUALIZATIONS[viewType]) {
    throw new Error(`no view creator implemented for view of type ${viewType}`)
  }

  const creator = {
    ...defaultView(),
    properties: JSON.parse(
      JSON.stringify(SUPPORTED_VISUALIZATIONS[viewType].initial)
    ),
  }

  return creator as NewView<T>
}
