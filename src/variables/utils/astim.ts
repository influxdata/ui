// Libraries
import {get} from 'lodash'

// Utils
import {parse} from 'src/external/parser'
import {findNodes} from 'src/shared/utils/ast'

// Types
import {File} from 'src/types'

export interface ASTIM {
  variables: any[]
  getAST: () => File
  hasVariable: (v: string) => boolean
}

const parseAllVariables = (ast: File): any[] => {
  return findNodes(ast, node => get(node, 'property.type') === 'Identifier')
}

export const parseASTIM = (query: string): ASTIM => {
  const ast: File = query !== '' ? parse(query) : null
  const variables = ast ? parseAllVariables(ast) : []

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
