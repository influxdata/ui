import {Columns} from '@influxdata/clockface'

export const QUERY_RESULTS_STATUS_EMPTY = 'empty'
export const QUERY_RESULTS_STATUS_ERROR = 'error'
export const QUERY_RESULTS_STATUS_SUCCESS = 'success'
export const QUERY_RESULTS_STATUS_TIMEOUT = 'timeout'

export const GRAPH_INFO = {
  rate_limits: [
    {
      title: 'Limit Events',
      groupColumns: ['_field'],
      column: '_value',
      units: '',
      isGrouped: true,
      type: 'sparkline',
    },
  ],
  billing_stats: [
    {
      title: 'Data In',
      groupColumns: [],
      column: 'writes_mb',
      units: 'MB',
      isGrouped: false,
      type: 'stat',
      pricingVersions: [3, 4],
    },
    {
      title: 'Query Count',
      groupColumns: [],
      column: 'query_count',
      units: '',
      isGrouped: false,
      type: 'stat',
      pricingVersions: [4],
    },
    {
      title: 'Storage',
      groupColumns: [],
      column: 'storage_gb',
      units: 'GB-hr',
      isGrouped: false,
      type: 'stat',
      pricingVersions: [3, 4],
    },
    {
      title: 'Data Out',
      groupColumns: [],
      column: 'reads_gb',
      units: 'GB',
      isGrouped: false,
      type: 'stat',
      pricingVersions: [4],
    },
  ],
  usage_stats: [
    {
      title: 'Data In (MB)',
      groupColumns: [],
      column: 'write_mb',
      units: 'MB',
      isGrouped: true,
      type: 'sparkline',
      pricingVersions: [3, 4],
    },
    {
      title: 'Query Count',
      groupColumns: [],
      column: 'query_count',
      units: '',
      isGrouped: false,
      type: 'sparkline',
      pricingVersions: [4],
    },
    {
      title: 'Storage (GB-hr)',
      groupColumns: [],
      column: 'storage_gb',
      units: 'GB',
      isGrouped: false,
      type: 'sparkline',
      pricingVersions: [3, 4],
    },
    {
      title: 'Data Out (GB)',
      groupColumns: [],
      column: 'reads_gb',
      units: 'GB',
      isGrouped: false,
      type: 'sparkline',
      pricingVersions: [4],
    },
  ],
}
