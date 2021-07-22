import View from './view'

export interface Hash<T> {
  [column: string]: T
}

export interface Mapping {
  name: string
  visible: boolean
}

export default register => {
  register({
    type: 'columnEditor',
    family: 'transform',
    component: View,
    button: 'Column Editor',
    initial: {
      mappings: {} as Hash<Mapping>,
    },
    generateFlux: (pipe, create, append) => {
      append(`__CURRENT_RESULT__ |> limit(n: 100)`)

      if (!Object.values(pipe.mappings).length) {
        return
      }

      const mods = Object.entries(pipe.mappings as Hash<Mapping>).reduce(
        (acc, [k, v]) => {
          if (!v.visible) {
            acc.dropped.push(`"${k}"`)
            return acc
          }

          acc.renamed.push(`"${k}": "${v.name}"`)
          return acc
        },
        {
          renamed: [],
          dropped: [],
        }
      )

      let query = `__PREVIOUS_RESULT__`

      if (mods.renamed.length) {
        query += `\n |> rename(columns: {${mods.renamed.join(', ')}})`
      }

      if (mods.dropped.length) {
        query += `\n |> drop(columns: [${mods.dropped.join(', ')}])`
      }

      create(query)
    },
  })
}
