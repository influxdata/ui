import View from './view'
import {
  parse,
  format_from_js_file,
} from 'src/languageSupport/languages/flux/parser'
import {parseQuery} from 'src/shared/contexts/query'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import {SUPPORTED_VISUALIZATIONS} from 'src/visualization'

export default register => {
  register({
    type: 'table',
    family: 'passThrough',
    priority: 3,
    component: View,
    button: 'Table',
    initial: {
      properties: SUPPORTED_VISUALIZATIONS['simple-table'].initial,
    },
    visual: (_data, query) => {
      if (!query) {
        return ''
      }

      try {
        const ast = isFlagEnabled('fastFlows')
          ? parseQuery(query)
          : parse(query)
        const expressions = ast.body.filter(
          p => p.type === 'ExpressionStatement'
        )

        if (!expressions.length) {
          return ''
        }

        expressions.forEach(e => {
          let _ast
          if (e.expression?.call?.callee?.name !== 'yield') {
            _ast = parse(`${e.location.source} |> limit(n: 100)`)
            e.expression = _ast.body[0].expression
            e.location = _ast.body[0].location
            return
          }

          _ast = parse(
            `${e.expression.argument.location.source} |> limit(n: 100) |> ${e.expression.call.location.source}`
          )
          e.expression = _ast.body[0].expression
          e.location = _ast.body[0].location
        })
        return format_from_js_file(ast)
      } catch (e) {
        console.error(e)
        return ''
      }
    },
  })
}
