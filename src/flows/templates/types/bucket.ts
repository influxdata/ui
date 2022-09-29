import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'
import {PIPE_DEFINITIONS} from 'src/flows'
import {getBucket, getBuckets, Buckets} from 'src/client'

export default register =>
  register({
    type: 'bucket',
    init: (name: string, bucketID: string | undefined) =>
      getBucket({bucketID})
        .then(res => {
          if (res.status == 200) {
            return Promise.resolve({
              ...res,
              data: {buckets: [res.data]} as Buckets,
            })
          }
          return getBuckets({query: {name}})
        })
        .then(res => {
          // handle both get request payloads
          const data = (res.data as Buckets).buckets
          const name =
            res.status == 200
              ? `Explore the ${data[0].name} bucket`
              : `Select a bucket`
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
                  title: 'Build a Query',
                  visible: true,
                  ...JSON.parse(
                    JSON.stringify(PIPE_DEFINITIONS['queryBuilder'].initial)
                  ),
                  buckets,
                },
                {
                  title: 'Validate the Data',
                  visible: true,
                  type: 'table',
                },
                {
                  title: 'Visualize the Result',
                  visible: true,
                  type: 'visualization',
                  ...JSON.parse(
                    JSON.stringify(PIPE_DEFINITIONS['visualization'].initial)
                  ),
                },
              ],
            },
          })
        }),
  })
