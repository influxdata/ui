import {AppState} from 'src/types'
import {FlagMap} from 'src/shared/actions/flags'
import {CLOUD, CLOUD_BILLING_VISIBLE} from 'src/shared/constants'

export const OSS_FLAGS = {
  cursorAtEOF: false,
  customCheckQuery: false,
  deleteWithPredicate: false,
  demodata: false,
  downloadCellCSV: false,
  fluxParser: false,
  matchingNotificationRules: false,
  flows: false,
  streamEvents: false,
  'flow-move-cells': false,
  'flow-panel--spotify': false,
  'flow-panel--youtube': false,
  'flow-panel--test-flux': false,
  'flow-panel--downsample': true,
  'flow-panel--markdown': true,
  'flow-panel--query-builder': true,
  'flow-panel--raw-flux': true,
  'flow-panel--to-bucket': true,
  'flow-debug-queries': false,
  collapseotron: false,
  disableDefaultTableSort: false,
  'load-data-client-libraries': true,
  'load-data-telegraf-plugins': true,
  'load-data-dev-tools': false,
  'load-data-flux-sources': false,
  'load-data-integrations': false,
  'client-library--arduino': true,
  'client-library--csharp': true,
  'client-library--go': true,
  'client-library--java': true,
  'client-library--javascript': true,
  'client-library--kotlin': true,
  'client-library--php': true,
  'client-library--python': true,
  'client-library--ruby': true,
  'client-library--scala': true,
  'client-library--swift': true,
  'notification-endpoint-telegram': false,
  'molly-first': false,
  'managed-functions': false,
  'simple-table': false,
}

export const CLOUD_FLAGS = {
  cloudBilling: CLOUD_BILLING_VISIBLE, // should be visible in dev and acceptance, but not in cloud
  cursorAtEOF: false,
  customCheckQuery: false,
  deleteWithPredicate: false,
  demodata: true,
  downloadCellCSV: false,
  fluxParser: false,
  matchingNotificationRules: false,
  flows: false,
  streamEvents: false,
  'flow-move-cells': false,
  'flow-panel--spotify': false,
  'flow-panel--youtube': false,
  'flow-panel--test-flux': false,
  'flow-panel--downsample': true,
  'flow-panel--markdown': true,
  'flow-panel--query-builder': true,
  'flow-panel--raw-flux': true,
  'flow-panel--to-bucket': true,
  'flow-debug-queries': false,
  collapseotron: false,
  disableDefaultTableSort: false,
  'load-data-client-libraries': true,
  'load-data-telegraf-plugins': true,
  'load-data-dev-tools': false,
  'load-data-flux-sources': false,
  'load-data-integrations': false,
  'client-library--arduino': true,
  'client-library--csharp': true,
  'client-library--go': true,
  'client-library--java': true,
  'client-library--javascript': true,
  'client-library--kotlin': true,
  'client-library--php': true,
  'client-library--python': true,
  'client-library--ruby': true,
  'client-library--scala': true,
  'client-library--swift': true,
  'notification-endpoint-telegram': false,
  unity: false,
  'molly-first': false,
  'managed-functions': false,
  'simple-table': false,
}

export const activeFlags = (state: AppState): FlagMap => {
  const localState = CLOUD ? CLOUD_FLAGS : OSS_FLAGS
  const networkState = state.flags.original || {}
  const override = state.flags.override || {}

  return {
    ...localState,
    ...networkState,
    ...override,
  }
}
