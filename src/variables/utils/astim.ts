// Utils
import {parse} from 'src/languageSupport/languages/flux/lspUtils'
import {findNodes} from 'src/shared/utils/ast'

// Types
import {File, MemberExpression} from 'src/types'

export interface ASTIM {
  variables: MemberExpression[]
  getAST: () => File
  hasVariable: (v: string) => boolean
}

const parseAllVariables = (ast: File): MemberExpression[] => {
  return findNodes(
    ast,
    node => node?.property?.type === 'Identifier' && node?.object?.name === 'v'
  )
}

export const parseASTIM = (query: string): ASTIM => {
  let ast: File = null
  try {
    ast = parse(query)
  } catch (e) {
    console.error(e)
  }
  const variables: MemberExpression[] = ast ? parseAllVariables(ast) : []
  const variableNames = new Set()
  variables.forEach(variable => {
    if (variable.property.type === 'Identifier') {
      variableNames.add(variable.property.name)
    } else if (variable.property.type === 'StringLiteral') {
      variableNames.add(variable.property.value)
    }
  })

  const hasVariable = (v: string): boolean => {
    return variableNames.has(v)
  }

  const getAST = (): File => {
    return ast
  }

  return {
    getAST,
    variables,
    hasVariable,
  }
}
