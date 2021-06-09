// Libraries
import {get} from 'lodash'

// Utils
import {parse} from 'src/external/parser'
import {findNodes} from 'src/shared/utils/ast'

// Types
import {File} from 'src/types'

export interface ASTIM {
  variables: any[]
  getAST: (v: string) => File
  hasVariable: (v: string) => boolean
}

const parseAllVariables = (ast: File): any[] => {
  return findNodes(ast, node => get(node, 'property.type') === 'Identifier')
}

export const parseASTIM = (query: string): ASTIM => {
  const ast: File = parse(query)
  const variables = parseAllVariables(ast)

  const hasVariable = (v: string): boolean => {
    const hasAny = variables.some(variable => variable.property.name === v)

    return hasAny
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
