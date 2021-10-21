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
    output: (data, query) => {
      if (!data?.bucket) {
        return query
      }

      return `${query} |> to(bucket: "${data.bucket?.name.trim()}")`
    },
  })
}
