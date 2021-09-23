import View from './view'
import ReadOnly from './readOnly'

export default register => {
  register({
    type: 'toBucket',
    family: 'output',
    priority: 1,
    component: View,
    readOnlyComponent: ReadOnly,
    featureFlag: 'flow-panel--to-bucket',
    button: 'Output to Bucket',
    source: (data, query, scope) => {
      if (!scope.withSideEffects || !data?.bucket) {
        return query
      }

      return `${query} |> to(bucket: "${data.bucket?.name.trim()}")`
    },
  })
}
