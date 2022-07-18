import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {PIPE_DEFINITIONS} from 'src/flows'
import {getBuckets, Buckets} from 'src/client'
import {getByIDAPI, updateAPI} from 'src/writeData/subscriptions/context/api'
import {Subscription} from 'src/types'

const getSubscriptionMeasurementValues = (sub: Subscription): string[] => {
  if (sub.dataFormat === 'json') {
    return sub.jsonMeasurementKey.name ? [sub.jsonMeasurementKey.name] : []
  } else if (sub.dataFormat === 'string') {
    return sub.stringMeasurement.name ? [sub.stringMeasurement.name] : []
  } else {
    return []
  }
}

export default register =>
  register({
    type: 'subscription',
    callback: (subscriptionID: string, notebookID: string) =>
      updateAPI({id: subscriptionID, data: {notebookID}}),
    init: (subscriptionID: string) =>
      getByIDAPI({id: subscriptionID}).then(sub =>
        getBuckets({query: {orgID: sub.orgID}}).then(res => {
          const data = (res.data as Buckets).buckets
          const name = `${sub.name} Subscription`
          const buckets = res.status == 200 ? data : []
          return Promise.resolve({
            name,
            spec: {
              readOnly: false,
              range: DEFAULT_TIME_RANGE,
              refresh: AUTOREFRESH_DEFAULT,
              pipes: [
                {
                  type: 'queryBuilder',
                  title: `Query ${sub.bucket} Bucket`,
                  visible: true,
                  ...JSON.parse(
                    JSON.stringify(PIPE_DEFINITIONS['queryBuilder'].initial)
                  ),
                  buckets: buckets.filter(a => a.name === sub.bucket),
                  tags: [
                    {
                      key: '_measurement',
                      values: getSubscriptionMeasurementValues(sub),
                      aggregateFunctionType: 'filter',
                    },
                  ],
                },
                {
                  title: `Subscription ${sub.name} Data`,
                  visible: true,
                  type: 'table',
                },
                {
                  type: 'queryBuilder',
                  title: 'Query _monitoring Bucket',
                  visible: true,
                  ...JSON.parse(
                    JSON.stringify(PIPE_DEFINITIONS['queryBuilder'].initial)
                  ),
                  buckets: buckets.filter(a => a.name === '_monitoring'),
                  tags: [
                    {
                      key: '_measurement',
                      values: ['subscriptions'],
                      aggregateFunctionType: 'filter',
                    },
                  ],
                },
                {
                  title: 'Subscriptions Error Data',
                  visible: true,
                  type: 'table',
                },
              ],
            },
          })
        })
      ),
  })
