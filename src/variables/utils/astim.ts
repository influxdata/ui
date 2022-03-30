// Utils
import {parse} from 'src/external/languages/flux/parser'
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
  const ast: File = parse(query)
  // Using `any` to circumvent ts error
  const variables: any = ast ? parseAllVariables(ast) : []
  const variableNames = new Set()
  variables.forEach(variable => variableNames.add(variable.property.name))

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
