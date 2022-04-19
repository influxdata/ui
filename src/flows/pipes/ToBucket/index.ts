import {IconFont} from '@influxdata/clockface'
import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'toBucket',
    family: 'output',
    priority: 0,
    component: View,
    readOnlyComponent: ReadOnly,
    featureFlag: 'flow-panel--to-bucket',
    button: 'Output to Bucket',
    description: 'Write out to a bucket',
    icon: IconFont.Plus_New,
    output: (data, query) => {
      if (!data?.bucket) {
        return query
      }

      return `${query} |> to(bucket: "${data.bucket?.name.trim()}")`
    },
  })
}
