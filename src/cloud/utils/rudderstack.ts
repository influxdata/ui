import {
  RUDDERSTACK_DATA_PLANE_URL,
  RUDDERSTACK_WRITE_KEY,
} from 'src/shared/constants'
import {ready, load} from 'rudder-sdk-js'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

function initializeRudderstack() {
  ready(() => {})
  load(RUDDERSTACK_WRITE_KEY, RUDDERSTACK_DATA_PLANE_URL)
  console.log('FOO')
}

if (isFlagEnabled('rudderstackReporting')) {
  initializeRudderstack()
}
