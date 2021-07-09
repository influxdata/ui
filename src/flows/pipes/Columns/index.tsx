import View, {TableColumnKey} from './view'

export default register => {
  register({
    type: 'columnEditor',
    family: 'passThrough',
    component: View,
    button: 'Column Editor',
    initial: {
      updatedTableKeys: {},
    },
    generateFlux: (pipe, create, append) => {
      append(`__CURRENT_RESULT__ |> limit(n: 100)`)
      if (!Object.values(pipe.updatedTableKeys).length) {
        return
      }

      const toggleHide = Object.entries(
        pipe.updatedTableKeys as {[_: string]: TableColumnKey}
      ).reduce((a, [k, v]) => {
        if (v.visible) {
          return a
        } else {
          if (v.name !== k) {
            a.push(`"${v.name}"`)
          } else {
            a.push(`"${k}"`)
          }
          return a
        }
      }, [])

      const rename = Object.entries(
        pipe.updatedTableKeys as {[_: string]: TableColumnKey}
      ).reduce((a, [k, v]) => {
        if (k === v.name) {
          return a
        } else {
          a.push(`${k}: "${v.name}"`)
          return a
        }
      }, [])

      if (rename.length) {
        create(`
                __PREVIOUS_RESULT__
                |> rename(columns: {${rename.join(', ')}})
                `)
      }

      if (toggleHide.length) {
        create(`__PREVIOUS_RESULT__
               |> drop(columns: [${toggleHide.join(', ')}])`)
      }
    },
  })
}
