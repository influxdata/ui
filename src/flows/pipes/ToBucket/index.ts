import View from './view'

export default register => {
  register({
    type: 'toBucket',
    family: 'output',
    priority: 1,
    component: View,
    button: 'Output to Bucket',
    generateFlux: (data, create, append, withSideEffects) => {
      if (withSideEffects && data?.bucket) {
        const query = `__PREVIOUS_RESULT__ |> to(bucket: "${data.bucket?.name.trim()}")`
        create(query)
      } else {
        append()
      }
    },
  })
}
