import {Cell, Dashboard, RemoteDataState} from 'src/types'
import {DecimalPlaces} from 'src/types'

import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'
import {DashboardSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

export const UNTITLED_GRAPH: string = 'Untitled Graph'

export const DEFAULT_DECIMAL_PLACES: DecimalPlaces = {
  isEnforced: true,
  digits: 2,
}

export type NewDefaultCell = Pick<
  Cell,
  Exclude<keyof Cell, 'id' | 'links' | 'dashboardID' | 'name'>
>

export const NEW_DEFAULT_DASHBOARD_CELL: NewDefaultCell = {
  x: 0,
  y: 0,
  w: 4,
  h: 4,
  status: RemoteDataState.Done,
}

export type EmptyDefaultDashboard = Pick<
  Dashboard,
  Exclude<
    keyof Dashboard,
    'templates' | 'links' | 'organization' | 'cells' | 'labels' | 'orgID'
  >
> & {
  cells: NewDefaultCell[]
}

export const DEFAULT_DASHBOARD_SORT_OPTIONS = {
  sortDirection: Sort.Ascending,
  sortType: SortTypes.String,
  sortKey: 'name' as DashboardSortKey,
}

export const EMPTY_DASHBOARD: EmptyDefaultDashboard = {
  id: '0',
  name: '',
  cells: [NEW_DEFAULT_DASHBOARD_CELL],
  status: RemoteDataState.Done,
  sortOptions: DEFAULT_DASHBOARD_SORT_OPTIONS,
}

export const DashboardTemplate: EmptyDefaultDashboard = {
  id: '0',
  name: 'Create a New Dashboard',
  cells: [],
  status: RemoteDataState.Done,
  sortOptions: DEFAULT_DASHBOARD_SORT_OPTIONS,
}

type NewDefaultDashboard = Pick<
  Dashboard,
  Exclude<keyof Dashboard, 'id' | 'templates' | 'organization' | 'cells'> & {
    cells: NewDefaultCell[]
  }
>
export const DEFAULT_CELL_NAME = 'Name this Cell'
export const DEFAULT_DASHBOARD_NAME = 'Name this Dashboard'
export const DEFAULT_BUCKET_NAME = 'Name this Bucket'
export const DEFAULT_COLLECTOR_NAME = 'Name this Collector'
export const DEFAULT_TASK_NAME = 'Name this Task'
export const DEFAULT_SCRAPER_NAME = 'Name this Scraper'
export const DEFAULT_TOKEN_DESCRIPTION = 'Describe this Token'

export const NEW_DASHBOARD: NewDefaultDashboard = {
  name: DEFAULT_DASHBOARD_NAME,
  cells: [NEW_DEFAULT_DASHBOARD_CELL],
}

export const TYPE_QUERY_CONFIG: string = 'queryConfig'
export const TYPE_SHIFTED: string = 'shifted queryConfig'
export const TYPE_FLUX: string = 'flux'
export const DASHBOARD_NAME_MAX_LENGTH: number = 50
export const CELL_NAME_MAX_LENGTH: number = 68

export enum CEOTabs {
  Queries = 'Queries',
  Vis = 'Visualization',
}

// used in importing dashboards and mapping sources
export const DYNAMIC_SOURCE = 'dynamic'
export const DYNAMIC_SOURCE_INFO = {
  name: 'Dynamic Source',
  id: DYNAMIC_SOURCE,
  link: '',
}

export const UPDATED_AT_TIME_FORMAT = 'YYYY-MM-DD HH:MM:ss'
