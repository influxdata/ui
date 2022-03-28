import {AppState} from 'src/types'
import {FlagMap} from 'src/shared/actions/flags'
import {CLOUD} from 'src/shared/constants'

export const OSS_FLAGS = {
  streamEvents: false,
  'flow-panel--spotify': false,
  'flow-panel--youtube': false,
  'flow-panel--test-flux': false,
  'flow-panel--downsample': true,
  'flow-panel--markdown': true,
  'flow-panel--query-builder': true,
  'flow-panel--raw-flux': true,
  'flow-panel--to-bucket': false,
  'flow-panel--notification': true,
  'flow-panel--schedule': true,
  'flow-panel--remote': false,
  'flow-debug-queries': false,
  'load-data-client-libraries': true,
  'load-data-telegraf-plugins': true,
  'load-data-dev-tools': false,
  'load-data-flux-sources': false,
  'load-data-integrations': false,
  'notification-endpoint-telegram': false,
  exploreWithFlows: false,
  boardWithFlows: false,
  createWithFlows: false,
  leadWithFlows: false,
}

export const CLOUD_FLAGS = {
  streamEvents: false,
  'flow-panel--spotify': false,
  'flow-panel--youtube': false,
  'flow-panel--test-flux': false,
  'flow-panel--downsample': true,
  'flow-panel--markdown': true,
  'flow-panel--query-builder': true,
  'flow-panel--raw-flux': true,
  'flow-panel--to-bucket': false,
  'flow-panel--notification': true,
  'flow-panel--remote': false,
  'flow-panel--schedule': true,
  'flow-debug-queries': false,
  'load-data-client-libraries': true,
  'load-data-telegraf-plugins': true,
  'load-data-dev-tools': false,
  'load-data-flux-sources': false,
  'load-data-integrations': false,
  'notification-endpoint-telegram': false,
  exploreWithFlows: false,
  boardWithFlows: false,
  createWithFlows: false,
  leadWithFlows: false,
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
