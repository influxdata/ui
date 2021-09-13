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
    visual: (_data, query) => {
      return `${query} |> limit(n: 100)`
    },
    source: (data, query) => {
      if (!Object.values(data.mappings).length) {
        return query
      }

      const mods = Object.entries(data.mappings as Hash<Mapping>).reduce(
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

      const splitQuery = query.split('|>')

      let queryString = splitQuery[0]

      splitQuery.slice(1).map(q => {
        if (q.indexOf('yield') === -1) {
          queryString += `|>${q}`
        } else {
          if (mods.renamed.length) {
            queryString += `|> rename(columns: {${mods.renamed.join(', ')}})\n`
          }

          if (mods.dropped.length) {
            queryString += `|> drop(columns: [${mods.dropped.join(', ')}])\n`
          }
          queryString += `|> ${q}`
        }
      })

      return queryString
    },
  })
}
