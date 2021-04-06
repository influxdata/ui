// Constants
import {OPTION_NAME} from 'src/variables/constants'

// Types
import {File, Property} from 'src/types/ast'
import {VariableAssignment} from 'src/types/ast'

export const buildExtern = (
  variables: VariableAssignment[],
  isProfilingQuery: boolean
): File => {
  const extern = {
    type: 'File',
    package: null,
    imports: null,
    body: [],
  } as File

  if (variables && variables.length > 0) {
    extern.body.push({
      type: 'OptionStatement',
      assignment: {
        type: 'VariableAssignment',
        id: {
          type: 'Identifier',
          name: OPTION_NAME,
        },
        init: {
          type: 'ObjectExpression',
          properties: variables.filter(v => !!v).map(assignmentToProperty),
        },
      },
    })
  }
  if (isProfilingQuery) {
    extern.imports = [
      {
        type: 'ImportDeclaration',
        path: {
          type: 'StringLiteral',
          value: 'profiler',
        },
        as: null,
      },
    ]
    extern.body.push({
      assignment: {
        member: {
          object: {
            name: 'profiler',
            type: 'Identifier',
          },
          property: {
            name: 'enabledProfilers',
            type: 'Identifier',
          },
          type: 'MemberExpression',
        },
        init: {
          type: 'ArrayExpression',
          elements: [
            {
              type: 'StringLiteral',
              value: 'query',
            },
            {
              type: 'StringLiteral',
              value: 'operator',
            },
          ],
        },
        type: 'MemberAssignment',
      },
      type: 'OptionStatement',
    })
  }
  return extern
}

const assignmentToProperty = (variable: VariableAssignment): Property => {
  return {
    type: 'Property',
    key: variable.id,
    value: variable.init,
  }
}
