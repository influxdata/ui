import {WebsiteMonitoringBucket} from 'src/cloud/constants'
import {CLOUD} from 'src/shared/constants'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

export const isDemoDataAvailabilityError = (
  errorCode: string,
  errorMessage: string
): boolean => {
  if (!CLOUD) {
    return false
  }

  if (errorCode === 'not found') {
    if (errorMessage.includes(WebsiteMonitoringBucket)) {
      return true
    }
  }
  return false
}

export const demoDataErrorMessage = () => {
  if (isFlagEnabled('demodata')) {
    return 'It looks like this query requires a demo data bucket to be available. You can add demodata buckets on the buckets tab'
  }

  return 'Demo data buckets are temporarily unavailable. Please try again later.'
}
