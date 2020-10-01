// api
import {
  getDemoDataBuckets as getDemoDataBucketsApi,
  getDemoDataBucketMembership as getDemoDataBucketMembershipApi,
  deleteDemoDataBucketMembership as deleteDemoDataBucketMembershipApi,
  getNormalizedDemoDataBucket,
} from 'src/cloud/apis/demodata'

// side effects
import {getBucket} from 'src/client'
import {event} from 'src/cloud/utils/reporting'
import {reportErrorThroughHoneyBadger} from 'src/shared/utils/errors'
import {createDashboardFromTemplate} from 'src/templates/api'

// redux
import {addBucket, removeBucket} from 'src/buckets/actions/creators'
import {setDemoDataBuckets, setDemoDataStatus} from 'src/cloud/actions/demodata'
import {getOrg} from 'src/organizations/selectors'

import {notify} from 'src/shared/actions/notifications'
import {
  demoDataAddBucketFailed,
  demoDataDeleteBucketFailed,
  demoDataSucceeded,
} from 'src/shared/copy/notifications'

// constants
import {DemoDataTemplates} from 'src/cloud/constants'

// utils
import {getErrorMessage} from 'src/utils/api'

// types
import {DemoBucket, GetState, RemoteDataState} from 'src/types'

export const getDemoDataBuckets = () => async (
  dispatch,
  getState: GetState
) => {
  const {
    cloud: {
      demoData: {status},
    },
  } = getState()
  if (status === RemoteDataState.NotStarted) {
    dispatch(setDemoDataStatus(RemoteDataState.Loading))
  }

  try {
    const buckets = await getDemoDataBucketsApi()

    dispatch(setDemoDataBuckets(buckets))
  } catch (error) {
    console.error(error)

    reportErrorThroughHoneyBadger(error, {
      name: 'getDemoDataBuckets function',
    })

    dispatch(setDemoDataStatus(RemoteDataState.Error))
  }
}

export const getDemoDataBucketMembership = ({
  name: bucketName,
  id: bucketID,
}) => async (dispatch, getState: GetState) => {
  const state = getState()

  const {id: orgID} = getOrg(state)

  try {
    await getDemoDataBucketMembershipApi(bucketID)

    const normalizedBucket = await getNormalizedDemoDataBucket(bucketID)

    dispatch(addBucket(normalizedBucket))
  } catch (error) {
    dispatch(
      notify(demoDataAddBucketFailed(bucketName, getErrorMessage(error)))
    )

    reportErrorThroughHoneyBadger(error, {
      name: 'addDemoDataBucket failed in getDemoDataBucketMembership',
    })

    return
  }

  try {
    const template = await DemoDataTemplates[bucketName]

    if (!template) {
      throw new Error(`dashboard template was not found`)
    }

    const createdDashboard = await createDashboardFromTemplate(template, orgID)

    const url = `/orgs/${orgID}/dashboards/${createdDashboard.id}`

    dispatch(notify(demoDataSucceeded(bucketName, url)))

    event('demoData_bucketAdded', {demo_dataset: bucketName})
  } catch (error) {
    const errorMessage = getErrorMessage(error)

    dispatch(notify(demoDataAddBucketFailed(bucketName, errorMessage)))

    if (errorMessage != 'creating dashboard would exceed quota') {
      reportErrorThroughHoneyBadger(error, {
        name: 'addDemoDataDashboard failed in getDemoDataBucketMembership',
      })
    }
  }
}

export const deleteDemoDataBucketMembership = (
  bucket: DemoBucket
) => async dispatch => {
  try {
    await deleteDemoDataBucketMembershipApi(bucket.id)

    // an unsuccessful delete membership req can also return 204 to prevent userID sniffing, so need to check that bucket is really unreachable
    const resp = await getBucket({bucketID: bucket.id})

    if (resp.status === 200) {
      throw new Error('Request to remove demo data bucket did not succeed')
    }

    dispatch(removeBucket(bucket.id))
    event('demoData_bucketDeleted', {demo_dataset: bucket.name})
  } catch (error) {
    dispatch(notify(demoDataDeleteBucketFailed(bucket.name, error)))

    reportErrorThroughHoneyBadger(error, {
      name: 'deleteDemoDataBucket failed in deleteDemoDataBucketMembership',
    })
  }
}
