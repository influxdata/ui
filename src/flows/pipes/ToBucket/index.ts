import View from './view'

export default register => {
  register({
    type: 'toBucket',
    family: 'output',
    priority: 1,
    component: View,
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
