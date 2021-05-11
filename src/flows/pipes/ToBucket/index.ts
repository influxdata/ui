import View from './view'

export default register => {
  register({
    type: 'toBucket',
    family: 'output',
    priority: 1,
    component: View,
    featureFlag: 'flow-panel--to-bucket',
    button: 'Output to Bucket',
    generateFlux: (data, create, append, withSideEffects) => {
      if (withSideEffects && data?.bucket) {
        const query = `__PREVIOUS_RESULT__ |> to(bucket: "${data.bucket?.name.trim()}")`
        create(query)
        // This is a hack and red flag that the query logic is broken as a panel shouldn't
        // have to know that it is required to run itself in limited conditions
        // how do we run a query with side effects that doesn't need a visualization?
        // or, does the concept need to be rebranded as src vs run instead?
        append('__CURRENT_RESULT__')
      } else {
        append()
      }
    },
  })
}
