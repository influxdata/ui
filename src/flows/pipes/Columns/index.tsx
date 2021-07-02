import View from './view'
export default register => {
  register({
    type: 'columnEditor',
    family: 'passThrough',
    component: View,
    button: 'Column Editor',
    initial: {
      table: {
        columnKeys: [],
        columns: {},
      },
    },
    generateFlux: (pipe, create, append) => {
      console.log(pipe)
      const ast = `__PREVIOUS_RESULT__ `
      create(ast)
      append(`__CURRENT_RESULT__ |> limit(n: 100)`)
    },
  })
}
