import {
  deploymentVariable,
  buildVariable,
  timeMachineQuery,
} from 'src/shared/utils/mocks/data'

const deploymentQuery = deploymentVariable.arguments.values.query
const buildQuery = buildVariable.arguments.values.query

export const getMockedParse = (additionalMappings = {}) => {
  const queryASTMapping = {
    'match me!': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 9},
        source: 'match me',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 6},
            source: 'match',
          },
          expression: {
            type: 'Identifier',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 6},
              source: 'match',
            },
            name: 'match',
          },
        },
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 7},
            end: {line: 1, column: 9},
            source: 'me',
          },
          expression: {
            type: 'Identifier',
            location: {
              start: {line: 1, column: 7},
              end: {line: 1, column: 9},
              source: 'me',
            },
            name: 'me',
          },
        },
      ],
    },
    'other=~v.target': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 16},
        source: 'other=~v.target',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 16},
            source: 'other=~v.target',
          },
          expression: {
            type: 'BinaryExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 16},
              source: 'other=~v.target',
            },
            operator: '=~',
            left: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 6},
                source: 'other',
              },
              name: 'other',
            },
            right: {
              type: 'MemberExpression',
              location: {
                start: {line: 1, column: 8},
                end: {line: 1, column: 16},
                source: 'v.target',
              },
              object: {
                type: 'Identifier',
                location: {
                  start: {line: 1, column: 8},
                  end: {line: 1, column: 9},
                  source: 'v',
                },
                name: 'v',
              },
              property: {
                type: 'Identifier',
                location: {
                  start: {line: 1, column: 10},
                  end: {line: 1, column: 16},
                  source: 'target',
                },
                name: 'target',
              },
            },
          },
        },
      ],
    },
    'broke!': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 6},
        source: 'broke',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 6},
            source: 'broke',
          },
          expression: {
            type: 'Identifier',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 6},
              source: 'broke',
            },
            name: 'broke',
          },
        },
      ],
    },
    '(r)=>v.target==r.field\n': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 23},
        source: '(r)=>v.target==r.field',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 23},
            source: '(r)=>v.target==r.field',
          },
          expression: {
            type: 'FunctionExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 23},
              source: '(r)=>v.target==r.field',
            },
            params: [
              {
                type: 'Property',
                location: {
                  start: {line: 1, column: 2},
                  end: {line: 1, column: 3},
                  source: 'r',
                },
                key: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 2},
                    end: {line: 1, column: 3},
                    source: 'r',
                  },
                  name: 'r',
                },
                value: null,
              },
            ],
            body: {
              type: 'BinaryExpression',
              location: {
                start: {line: 1, column: 6},
                end: {line: 1, column: 23},
                source: 'v.target==r.field',
              },
              operator: '==',
              left: {
                type: 'MemberExpression',
                location: {
                  start: {line: 1, column: 6},
                  end: {line: 1, column: 14},
                  source: 'v.target',
                },
                object: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 6},
                    end: {line: 1, column: 7},
                    source: 'v',
                  },
                  name: 'v',
                },
                property: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 8},
                    end: {line: 1, column: 14},
                    source: 'target',
                  },
                  name: 'target',
                },
              },
              right: {
                type: 'MemberExpression',
                location: {
                  start: {line: 1, column: 16},
                  end: {line: 1, column: 23},
                  source: 'r.field',
                },
                object: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 16},
                    end: {line: 1, column: 17},
                    source: 'r',
                  },
                  name: 'r',
                },
                property: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 18},
                    end: {line: 1, column: 23},
                    source: 'field',
                  },
                  name: 'field',
                },
              },
            },
          },
        },
      ],
    },
    'v.target!=r.field': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 18},
        source: 'v.target!=r.field',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 18},
            source: 'v.target!=r.field',
          },
          expression: {
            type: 'BinaryExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 18},
              source: 'v.target!=r.field',
            },
            operator: '!=',
            left: {
              type: 'MemberExpression',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 9},
                source: 'v.target',
              },
              object: {
                type: 'Identifier',
                location: {
                  start: {line: 1, column: 1},
                  end: {line: 1, column: 2},
                  source: 'v',
                },
                name: 'v',
              },
              property: {
                type: 'Identifier',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 9},
                  source: 'target',
                },
                name: 'target',
              },
            },
            right: {
              type: 'MemberExpression',
              location: {
                start: {line: 1, column: 11},
                end: {line: 1, column: 18},
                source: 'r.field',
              },
              object: {
                type: 'Identifier',
                location: {
                  start: {line: 1, column: 11},
                  end: {line: 1, column: 12},
                  source: 'r',
                },
                name: 'r',
              },
              property: {
                type: 'Identifier',
                location: {
                  start: {line: 1, column: 13},
                  end: {line: 1, column: 18},
                  source: 'field',
                },
                name: 'field',
              },
            },
          },
        },
      ],
    },
    '\nv.target//wat?': {
      type: 'File',
      location: {
        start: {line: 2, column: 1},
        end: {line: 2, column: 9},
        source: 'v.target',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 2, column: 1},
            end: {line: 2, column: 9},
            source: 'v.target',
          },
          expression: {
            type: 'MemberExpression',
            location: {
              start: {line: 2, column: 1},
              end: {line: 2, column: 9},
              source: 'v.target',
            },
            object: {
              type: 'Identifier',
              location: {
                start: {line: 2, column: 1},
                end: {line: 2, column: 2},
                source: 'v',
              },
              name: 'v',
            },
            property: {
              type: 'Identifier',
              location: {
                start: {line: 2, column: 3},
                end: {line: 2, column: 9},
                source: 'target',
              },
              name: 'target',
            },
          },
        },
      ],
      eof: {lit: '//wat?', next: null},
    },
    '{beep:v.target}\n': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 16},
        source: '{beep:v.target}',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 16},
            source: '{beep:v.target}',
          },
          expression: {
            type: 'ObjectExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 16},
              source: '{beep:v.target}',
            },
            properties: [
              {
                type: 'Property',
                location: {
                  start: {line: 1, column: 2},
                  end: {line: 1, column: 15},
                  source: 'beep:v.target',
                },
                key: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 2},
                    end: {line: 1, column: 6},
                    source: 'beep',
                  },
                  name: 'beep',
                },
                value: {
                  type: 'MemberExpression',
                  location: {
                    start: {line: 1, column: 7},
                    end: {line: 1, column: 15},
                    source: 'v.target',
                  },
                  object: {
                    type: 'Identifier',
                    location: {
                      start: {line: 1, column: 7},
                      end: {line: 1, column: 8},
                      source: 'v',
                    },
                    name: 'v',
                  },
                  property: {
                    type: 'Identifier',
                    location: {
                      start: {line: 1, column: 9},
                      end: {line: 1, column: 15},
                      source: 'target',
                    },
                    name: 'target',
                  },
                },
              },
            ],
          },
        },
      ],
    },
    'x=v.target\n': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 11},
        source: 'x=v.target',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'VariableAssignment',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 11},
            source: 'x=v.target',
          },
          id: {
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 2},
              source: 'x',
            },
            name: 'x',
          },
          init: {
            type: 'MemberExpression',
            location: {
              start: {line: 1, column: 3},
              end: {line: 1, column: 11},
              source: 'v.target',
            },
            object: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 3},
                end: {line: 1, column: 4},
                source: 'v',
              },
              name: 'v',
            },
            property: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 5},
                end: {line: 1, column: 11},
                source: 'target',
              },
              name: 'target',
            },
          },
        },
      ],
    },
    '1>v.target<2': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 13},
        source: '1>v.target<2',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 13},
            source: '1>v.target<2',
          },
          expression: {
            type: 'BinaryExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 13},
              source: '1>v.target<2',
            },
            operator: '<',
            left: {
              type: 'BinaryExpression',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 11},
                source: '1>v.target',
              },
              operator: '>',
              left: {
                type: 'IntegerLiteral',
                location: {
                  start: {line: 1, column: 1},
                  end: {line: 1, column: 2},
                  source: '1',
                },
                value: '1',
              },
              right: {
                type: 'MemberExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 11},
                  source: 'v.target',
                },
                object: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 3},
                    end: {line: 1, column: 4},
                    source: 'v',
                  },
                  name: 'v',
                },
                property: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 5},
                    end: {line: 1, column: 11},
                    source: 'target',
                  },
                  name: 'target',
                },
              },
            },
            right: {
              type: 'IntegerLiteral',
              location: {
                start: {line: 1, column: 12},
                end: {line: 1, column: 13},
                source: '2',
              },
              value: '2',
            },
          },
        },
      ],
    },
    '1+v.target%2': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 13},
        source: '1+v.target%2',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 13},
            source: '1+v.target%2',
          },
          expression: {
            type: 'BinaryExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 13},
              source: '1+v.target%2',
            },
            operator: '+',
            left: {
              type: 'IntegerLiteral',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: '1',
              },
              value: '1',
            },
            right: {
              type: 'BinaryExpression',
              location: {
                start: {line: 1, column: 3},
                end: {line: 1, column: 13},
                source: 'v.target%2',
              },
              operator: '%',
              left: {
                type: 'MemberExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 11},
                  source: 'v.target',
                },
                object: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 3},
                    end: {line: 1, column: 4},
                    source: 'v',
                  },
                  name: 'v',
                },
                property: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 5},
                    end: {line: 1, column: 11},
                    source: 'target',
                  },
                  name: 'target',
                },
              },
              right: {
                type: 'IntegerLiteral',
                location: {
                  start: {line: 1, column: 12},
                  end: {line: 1, column: 13},
                  source: '2',
                },
                value: '2',
              },
            },
          },
        },
      ],
    },
    '1*v.target/2': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 13},
        source: '1*v.target/2',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 13},
            source: '1*v.target/2',
          },
          expression: {
            type: 'BinaryExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 13},
              source: '1*v.target/2',
            },
            operator: '/',
            left: {
              type: 'BinaryExpression',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 11},
                source: '1*v.target',
              },
              operator: '*',
              left: {
                type: 'IntegerLiteral',
                location: {
                  start: {line: 1, column: 1},
                  end: {line: 1, column: 2},
                  source: '1',
                },
                value: '1',
              },
              right: {
                type: 'MemberExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 11},
                  source: 'v.target',
                },
                object: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 3},
                    end: {line: 1, column: 4},
                    source: 'v',
                  },
                  name: 'v',
                },
                property: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 5},
                    end: {line: 1, column: 11},
                    source: 'target',
                  },
                  name: 'target',
                },
              },
            },
            right: {
              type: 'IntegerLiteral',
              location: {
                start: {line: 1, column: 12},
                end: {line: 1, column: 13},
                source: '2',
              },
              value: '2',
            },
          },
        },
      ],
    },
    '1+v.target-2': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 13},
        source: '1+v.target-2',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 13},
            source: '1+v.target-2',
          },
          expression: {
            type: 'BinaryExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 13},
              source: '1+v.target-2',
            },
            operator: '-',
            left: {
              type: 'BinaryExpression',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 11},
                source: '1+v.target',
              },
              operator: '+',
              left: {
                type: 'IntegerLiteral',
                location: {
                  start: {line: 1, column: 1},
                  end: {line: 1, column: 2},
                  source: '1',
                },
                value: '1',
              },
              right: {
                type: 'MemberExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 11},
                  source: 'v.target',
                },
                object: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 3},
                    end: {line: 1, column: 4},
                    source: 'v',
                  },
                  name: 'v',
                },
                property: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 5},
                    end: {line: 1, column: 11},
                    source: 'target',
                  },
                  name: 'target',
                },
              },
            },
            right: {
              type: 'IntegerLiteral',
              location: {
                start: {line: 1, column: 12},
                end: {line: 1, column: 13},
                source: '2',
              },
              value: '2',
            },
          },
        },
      ],
    },
    '(v.target)': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 11},
        source: '(v.target)',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 11},
            source: '(v.target)',
          },
          expression: {
            type: 'ParenExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 11},
              source: '(v.target)',
            },
            expression: {
              type: 'MemberExpression',
              location: {
                start: {line: 1, column: 2},
                end: {line: 1, column: 10},
                source: 'v.target',
              },
              object: {
                type: 'Identifier',
                location: {
                  start: {line: 1, column: 2},
                  end: {line: 1, column: 3},
                  source: 'v',
                },
                name: 'v',
              },
              property: {
                type: 'Identifier',
                location: {
                  start: {line: 1, column: 4},
                  end: {line: 1, column: 10},
                  source: 'target',
                },
                name: 'target',
              },
            },
          },
        },
      ],
    },
    '[v.target, other]': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 18},
        source: '[v.target, other]',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 18},
            source: '[v.target, other]',
          },
          expression: {
            type: 'ArrayExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 18},
              source: '[v.target, other]',
            },
            elements: [
              {
                type: 'MemberExpression',
                location: {
                  start: {line: 1, column: 2},
                  end: {line: 1, column: 10},
                  source: 'v.target',
                },
                object: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 2},
                    end: {line: 1, column: 3},
                    source: 'v',
                  },
                  name: 'v',
                },
                property: {
                  type: 'Identifier',
                  location: {
                    start: {line: 1, column: 4},
                    end: {line: 1, column: 10},
                    source: 'target',
                  },
                  name: 'target',
                },
              },
              {
                type: 'Identifier',
                location: {
                  start: {line: 1, column: 12},
                  end: {line: 1, column: 17},
                  source: 'other',
                },
                name: 'other',
              },
            ],
          },
        },
      ],
    },
    'f(x: v.target)': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 15},
        source: 'f(x: v.target)',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 15},
            source: 'f(x: v.target)',
          },
          expression: {
            type: 'CallExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 15},
              source: 'f(x: v.target)',
            },
            callee: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'f',
              },
              name: 'f',
            },
            arguments: [
              {
                type: 'ObjectExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 14},
                  source: 'x: v.target',
                },
                properties: [
                  {
                    type: 'Property',
                    location: {
                      start: {line: 1, column: 3},
                      end: {line: 1, column: 14},
                      source: 'x: v.target',
                    },
                    key: {
                      type: 'Identifier',
                      location: {
                        start: {line: 1, column: 3},
                        end: {line: 1, column: 4},
                        source: 'x',
                      },
                      name: 'x',
                    },
                    value: {
                      type: 'MemberExpression',
                      location: {
                        start: {line: 1, column: 6},
                        end: {line: 1, column: 14},
                        source: 'v.target',
                      },
                      object: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 6},
                          end: {line: 1, column: 7},
                          source: 'v',
                        },
                        name: 'v',
                      },
                      property: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 8},
                          end: {line: 1, column: 14},
                          source: 'target',
                        },
                        name: 'target',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    'f(x: v.b)': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 10},
        source: 'f(x: v.b)',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 10},
            source: 'f(x: v.b)',
          },
          expression: {
            type: 'CallExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 10},
              source: 'f(x: v.b)',
            },
            callee: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'f',
              },
              name: 'f',
            },
            arguments: [
              {
                type: 'ObjectExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 9},
                  source: 'x: v.b',
                },
                properties: [
                  {
                    type: 'Property',
                    location: {
                      start: {line: 1, column: 3},
                      end: {line: 1, column: 9},
                      source: 'x: v.b',
                    },
                    key: {
                      type: 'Identifier',
                      location: {
                        start: {line: 1, column: 3},
                        end: {line: 1, column: 4},
                        source: 'x',
                      },
                      name: 'x',
                    },
                    value: {
                      type: 'MemberExpression',
                      location: {
                        start: {line: 1, column: 6},
                        end: {line: 1, column: 9},
                        source: 'v.b',
                      },
                      object: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 6},
                          end: {line: 1, column: 7},
                          source: 'v',
                        },
                        name: 'v',
                      },
                      property: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 8},
                          end: {line: 1, column: 9},
                          source: 'b',
                        },
                        name: 'b',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    cool: {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 5},
        source: 'cool',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 5},
            source: 'cool',
          },
          expression: {
            type: 'Identifier',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 5},
              source: 'cool',
            },
            name: 'cool',
          },
        },
      ],
    },
    'nooo!': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 5},
        source: 'nooo',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 5},
            source: 'nooo',
          },
          expression: {
            type: 'Identifier',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 5},
              source: 'nooo',
            },
            name: 'nooo',
          },
        },
      ],
    },
    'f(x: v.b, y: v.c)': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 18},
        source: 'f(x: v.b, y: v.c)',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 18},
            source: 'f(x: v.b, y: v.c)',
          },
          expression: {
            type: 'CallExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 18},
              source: 'f(x: v.b, y: v.c)',
            },
            callee: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'f',
              },
              name: 'f',
            },
            arguments: [
              {
                type: 'ObjectExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 17},
                  source: 'x: v.b, y: v.c',
                },
                properties: [
                  {
                    type: 'Property',
                    location: {
                      start: {line: 1, column: 3},
                      end: {line: 1, column: 9},
                      source: 'x: v.b',
                    },
                    key: {
                      type: 'Identifier',
                      location: {
                        start: {line: 1, column: 3},
                        end: {line: 1, column: 4},
                        source: 'x',
                      },
                      name: 'x',
                    },
                    value: {
                      type: 'MemberExpression',
                      location: {
                        start: {line: 1, column: 6},
                        end: {line: 1, column: 9},
                        source: 'v.b',
                      },
                      object: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 6},
                          end: {line: 1, column: 7},
                          source: 'v',
                        },
                        name: 'v',
                      },
                      property: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 8},
                          end: {line: 1, column: 9},
                          source: 'b',
                        },
                        name: 'b',
                      },
                    },
                  },
                  {
                    type: 'Property',
                    location: {
                      start: {line: 1, column: 11},
                      end: {line: 1, column: 17},
                      source: 'y: v.c',
                    },
                    key: {
                      type: 'Identifier',
                      location: {
                        start: {line: 1, column: 11},
                        end: {line: 1, column: 12},
                        source: 'y',
                      },
                      name: 'y',
                    },
                    value: {
                      type: 'MemberExpression',
                      location: {
                        start: {line: 1, column: 14},
                        end: {line: 1, column: 17},
                        source: 'v.c',
                      },
                      object: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 14},
                          end: {line: 1, column: 15},
                          source: 'v',
                        },
                        name: 'v',
                      },
                      property: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 16},
                          end: {line: 1, column: 17},
                          source: 'c',
                        },
                        name: 'c',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    'f(x: v.f, y: v.e)': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 18},
        source: 'f(x: v.f, y: v.e)',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 18},
            source: 'f(x: v.f, y: v.e)',
          },
          expression: {
            type: 'CallExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 18},
              source: 'f(x: v.f, y: v.e)',
            },
            callee: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'f',
              },
              name: 'f',
            },
            arguments: [
              {
                type: 'ObjectExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 17},
                  source: 'x: v.f, y: v.e',
                },
                properties: [
                  {
                    type: 'Property',
                    location: {
                      start: {line: 1, column: 3},
                      end: {line: 1, column: 9},
                      source: 'x: v.f',
                    },
                    key: {
                      type: 'Identifier',
                      location: {
                        start: {line: 1, column: 3},
                        end: {line: 1, column: 4},
                        source: 'x',
                      },
                      name: 'x',
                    },
                    value: {
                      type: 'MemberExpression',
                      location: {
                        start: {line: 1, column: 6},
                        end: {line: 1, column: 9},
                        source: 'v.f',
                      },
                      object: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 6},
                          end: {line: 1, column: 7},
                          source: 'v',
                        },
                        name: 'v',
                      },
                      property: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 8},
                          end: {line: 1, column: 9},
                          source: 'f',
                        },
                        name: 'f',
                      },
                    },
                  },
                  {
                    type: 'Property',
                    location: {
                      start: {line: 1, column: 11},
                      end: {line: 1, column: 17},
                      source: 'y: v.e',
                    },
                    key: {
                      type: 'Identifier',
                      location: {
                        start: {line: 1, column: 11},
                        end: {line: 1, column: 12},
                        source: 'y',
                      },
                      name: 'y',
                    },
                    value: {
                      type: 'MemberExpression',
                      location: {
                        start: {line: 1, column: 14},
                        end: {line: 1, column: 17},
                        source: 'v.e',
                      },
                      object: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 14},
                          end: {line: 1, column: 15},
                          source: 'v',
                        },
                        name: 'v',
                      },
                      property: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 16},
                          end: {line: 1, column: 17},
                          source: 'e',
                        },
                        name: 'e',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    'f(x: v.g)': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 10},
        source: 'f(x: v.g)',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 10},
            source: 'f(x: v.g)',
          },
          expression: {
            type: 'CallExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 10},
              source: 'f(x: v.g)',
            },
            callee: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'f',
              },
              name: 'f',
            },
            arguments: [
              {
                type: 'ObjectExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 9},
                  source: 'x: v.g',
                },
                properties: [
                  {
                    type: 'Property',
                    location: {
                      start: {line: 1, column: 3},
                      end: {line: 1, column: 9},
                      source: 'x: v.g',
                    },
                    key: {
                      type: 'Identifier',
                      location: {
                        start: {line: 1, column: 3},
                        end: {line: 1, column: 4},
                        source: 'x',
                      },
                      name: 'x',
                    },
                    value: {
                      type: 'MemberExpression',
                      location: {
                        start: {line: 1, column: 6},
                        end: {line: 1, column: 9},
                        source: 'v.g',
                      },
                      object: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 6},
                          end: {line: 1, column: 7},
                          source: 'v',
                        },
                        name: 'v',
                      },
                      property: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 8},
                          end: {line: 1, column: 9},
                          source: 'g',
                        },
                        name: 'g',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    'nooooo!': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 7},
        source: 'nooooo',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 7},
            source: 'nooooo',
          },
          expression: {
            type: 'Identifier',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 7},
              source: 'nooooo',
            },
            name: 'nooooo',
          },
        },
      ],
    },
    pick: {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 5},
        source: 'pick',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 5},
            source: 'pick',
          },
          expression: {
            type: 'Identifier',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 5},
              source: 'pick',
            },
            name: 'pick',
          },
        },
      ],
    },
    'f(x: v.a, y: v.b)': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 18},
        source: 'f(x: v.a, y: v.b)',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 18},
            source: 'f(x: v.a, y: v.b)',
          },
          expression: {
            type: 'CallExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 18},
              source: 'f(x: v.a, y: v.b)',
            },
            callee: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'f',
              },
              name: 'f',
            },
            arguments: [
              {
                type: 'ObjectExpression',
                location: {
                  start: {line: 1, column: 3},
                  end: {line: 1, column: 17},
                  source: 'x: v.a, y: v.b',
                },
                properties: [
                  {
                    type: 'Property',
                    location: {
                      start: {line: 1, column: 3},
                      end: {line: 1, column: 9},
                      source: 'x: v.a',
                    },
                    key: {
                      type: 'Identifier',
                      location: {
                        start: {line: 1, column: 3},
                        end: {line: 1, column: 4},
                        source: 'x',
                      },
                      name: 'x',
                    },
                    value: {
                      type: 'MemberExpression',
                      location: {
                        start: {line: 1, column: 6},
                        end: {line: 1, column: 9},
                        source: 'v.a',
                      },
                      object: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 6},
                          end: {line: 1, column: 7},
                          source: 'v',
                        },
                        name: 'v',
                      },
                      property: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 8},
                          end: {line: 1, column: 9},
                          source: 'a',
                        },
                        name: 'a',
                      },
                    },
                  },
                  {
                    type: 'Property',
                    location: {
                      start: {line: 1, column: 11},
                      end: {line: 1, column: 17},
                      source: 'y: v.b',
                    },
                    key: {
                      type: 'Identifier',
                      location: {
                        start: {line: 1, column: 11},
                        end: {line: 1, column: 12},
                        source: 'y',
                      },
                      name: 'y',
                    },
                    value: {
                      type: 'MemberExpression',
                      location: {
                        start: {line: 1, column: 14},
                        end: {line: 1, column: 17},
                        source: 'v.b',
                      },
                      object: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 14},
                          end: {line: 1, column: 15},
                          source: 'v',
                        },
                        name: 'v',
                      },
                      property: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 16},
                          end: {line: 1, column: 17},
                          source: 'b',
                        },
                        name: 'b',
                      },
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    yay: {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 4},
        source: 'yay',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 4},
            source: 'yay',
          },
          expression: {
            type: 'Identifier',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 4},
              source: 'yay',
            },
            name: 'yay',
          },
        },
      ],
    },
    'v.target': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 9},
        source: 'v.target',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 9},
            source: 'v.target',
          },
          expression: {
            type: 'MemberExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 9},
              source: 'v.target',
            },
            object: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'v',
              },
              name: 'v',
            },
            property: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 3},
                end: {line: 1, column: 9},
                source: 'target',
              },
              name: 'target',
            },
          },
        },
      ],
    },
    '\tv.target\n': {
      type: 'File',
      location: {
        start: {line: 1, column: 5},
        end: {line: 1, column: 13},
        source: 'v.target',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 5},
            end: {line: 1, column: 13},
            source: 'v.target',
          },
          expression: {
            type: 'MemberExpression',
            location: {
              start: {line: 1, column: 5},
              end: {line: 1, column: 13},
              source: 'v.target',
            },
            object: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 5},
                end: {line: 1, column: 6},
                source: 'v',
              },
              name: 'v',
            },
            property: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 7},
                end: {line: 1, column: 13},
                source: 'target',
              },
              name: 'target',
            },
          },
        },
      ],
    },
    'v.build': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 8},
        source: 'v.build',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 8},
            source: 'v.build',
          },
          expression: {
            type: 'MemberExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 8},
              source: 'v.build',
            },
            object: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'v',
              },
              name: 'v',
            },
            property: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 3},
                end: {line: 1, column: 8},
                source: 'build',
              },
              name: 'build',
            },
          },
        },
      ],
    },
    'v.bucket': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 13},
        source: 'v.bucket',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 13},
            source: 'v.bucket',
          },
          expression: {
            type: 'MemberExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 13},
              source: 'v.bucket',
            },
            object: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'v',
              },
              name: 'v',
            },
            property: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 3},
                end: {line: 1, column: 13},
                source: 'bucket',
              },
              name: 'bucket',
            },
          },
        },
      ],
    },
    'v.deployment': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 13},
        source: 'v.deployment',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 13},
            source: 'v.deployment',
          },
          expression: {
            type: 'MemberExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 13},
              source: 'v.deployment',
            },
            object: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'v',
              },
              name: 'v',
            },
            property: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 3},
                end: {line: 1, column: 13},
                source: 'deployment',
              },
              name: 'deployment',
            },
          },
        },
      ],
    },
    [buildQuery]: {
      type: 'File',
      location: {
        start: {line: 2, column: 5},
        end: {line: 5, column: 122},
        source:
          'import "influxdata/influxdb/v1"\n    import "strings"\n    \n    v1.tagValues(bucket: v.bucket, tag: "cpu") |> filter(fn: (r) => strings.hasSuffix(v: r._value, suffix: v.deployment))',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [
        {
          type: 'ImportDeclaration',
          location: {
            start: {line: 2, column: 5},
            end: {line: 2, column: 36},
            source: 'import "influxdata/influxdb/v1"',
          },
          comments: {lit: '// build\n', next: null},
          as: null,
          path: {
            location: {
              start: {line: 2, column: 12},
              end: {line: 2, column: 36},
              source: '"influxdata/influxdb/v1"',
            },
            value: 'influxdata/influxdb/v1',
          },
        },
        {
          type: 'ImportDeclaration',
          location: {
            start: {line: 3, column: 5},
            end: {line: 3, column: 21},
            source: 'import "strings"',
          },
          as: null,
          path: {
            location: {
              start: {line: 3, column: 12},
              end: {line: 3, column: 21},
              source: '"strings"',
            },
            value: 'strings',
          },
        },
      ],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 5, column: 5},
            end: {line: 5, column: 122},
            source:
              'v1.tagValues(bucket: v.bucket, tag: "cpu") |> filter(fn: (r) => strings.hasSuffix(v: r._value, suffix: v.deployment))',
          },
          expression: {
            type: 'PipeExpression',
            location: {
              start: {line: 5, column: 5},
              end: {line: 5, column: 122},
              source:
                'v1.tagValues(bucket: v.bucket, tag: "cpu") |> filter(fn: (r) => strings.hasSuffix(v: r._value, suffix: v.deployment))',
            },
            argument: {
              type: 'CallExpression',
              location: {
                start: {line: 5, column: 5},
                end: {line: 5, column: 47},
                source: 'v1.tagValues(bucket: v.bucket, tag: "cpu")',
              },
              callee: {
                type: 'MemberExpression',
                location: {
                  start: {line: 5, column: 5},
                  end: {line: 5, column: 17},
                  source: 'v1.tagValues',
                },
                object: {
                  type: 'Identifier',
                  location: {
                    start: {line: 5, column: 5},
                    end: {line: 5, column: 7},
                    source: 'v1',
                  },
                  name: 'v1',
                },
                property: {
                  type: 'Identifier',
                  location: {
                    start: {line: 5, column: 8},
                    end: {line: 5, column: 17},
                    source: 'tagValues',
                  },
                  name: 'tagValues',
                },
              },
              arguments: [
                {
                  type: 'ObjectExpression',
                  location: {
                    start: {line: 5, column: 18},
                    end: {line: 5, column: 46},
                    source: 'bucket: v.bucket, tag: "cpu"',
                  },
                  properties: [
                    {
                      type: 'Property',
                      location: {
                        start: {line: 5, column: 18},
                        end: {line: 5, column: 34},
                        source: 'bucket: v.bucket',
                      },
                      key: {
                        type: 'Identifier',
                        location: {
                          start: {line: 5, column: 18},
                          end: {line: 5, column: 24},
                          source: 'bucket',
                        },
                        name: 'bucket',
                      },
                      value: {
                        type: 'MemberExpression',
                        location: {
                          start: {line: 5, column: 26},
                          end: {line: 5, column: 34},
                          source: 'v.bucket',
                        },
                        object: {
                          type: 'Identifier',
                          location: {
                            start: {line: 5, column: 26},
                            end: {line: 5, column: 27},
                            source: 'v',
                          },
                          name: 'v',
                        },
                        property: {
                          type: 'Identifier',
                          location: {
                            start: {line: 5, column: 28},
                            end: {line: 5, column: 34},
                            source: 'bucket',
                          },
                          name: 'bucket',
                        },
                      },
                    },
                    {
                      type: 'Property',
                      location: {
                        start: {line: 5, column: 36},
                        end: {line: 5, column: 46},
                        source: 'tag: "cpu"',
                      },
                      key: {
                        type: 'Identifier',
                        location: {
                          start: {line: 5, column: 36},
                          end: {line: 5, column: 39},
                          source: 'tag',
                        },
                        name: 'tag',
                      },
                      value: {
                        type: 'StringLiteral',
                        location: {
                          start: {line: 5, column: 41},
                          end: {line: 5, column: 46},
                          source: '"cpu"',
                        },
                        value: 'cpu',
                      },
                    },
                  ],
                },
              ],
            },
            call: {
              location: {
                start: {line: 5, column: 51},
                end: {line: 5, column: 122},
                source:
                  'filter(fn: (r) => strings.hasSuffix(v: r._value, suffix: v.deployment))',
              },
              callee: {
                type: 'Identifier',
                location: {
                  start: {line: 5, column: 51},
                  end: {line: 5, column: 57},
                  source: 'filter',
                },
                name: 'filter',
              },
              arguments: [
                {
                  type: 'ObjectExpression',
                  location: {
                    start: {line: 5, column: 58},
                    end: {line: 5, column: 121},
                    source:
                      'fn: (r) => strings.hasSuffix(v: r._value, suffix: v.deployment)',
                  },
                  properties: [
                    {
                      type: 'Property',
                      location: {
                        start: {line: 5, column: 58},
                        end: {line: 5, column: 121},
                        source:
                          'fn: (r) => strings.hasSuffix(v: r._value, suffix: v.deployment)',
                      },
                      key: {
                        type: 'Identifier',
                        location: {
                          start: {line: 5, column: 58},
                          end: {line: 5, column: 60},
                          source: 'fn',
                        },
                        name: 'fn',
                      },
                      value: {
                        type: 'FunctionExpression',
                        location: {
                          start: {line: 5, column: 62},
                          end: {line: 5, column: 121},
                          source:
                            '(r) => strings.hasSuffix(v: r._value, suffix: v.deployment)',
                        },
                        params: [
                          {
                            type: 'Property',
                            location: {
                              start: {line: 5, column: 63},
                              end: {line: 5, column: 64},
                              source: 'r',
                            },
                            key: {
                              type: 'Identifier',
                              location: {
                                start: {line: 5, column: 63},
                                end: {line: 5, column: 64},
                                source: 'r',
                              },
                              name: 'r',
                            },
                            value: null,
                          },
                        ],
                        body: {
                          type: 'CallExpression',
                          location: {
                            start: {line: 5, column: 69},
                            end: {line: 5, column: 121},
                            source:
                              'strings.hasSuffix(v: r._value, suffix: v.deployment)',
                          },
                          callee: {
                            type: 'MemberExpression',
                            location: {
                              start: {line: 5, column: 69},
                              end: {line: 5, column: 86},
                              source: 'strings.hasSuffix',
                            },
                            object: {
                              type: 'Identifier',
                              location: {
                                start: {line: 5, column: 69},
                                end: {line: 5, column: 76},
                                source: 'strings',
                              },
                              name: 'strings',
                            },
                            property: {
                              type: 'Identifier',
                              location: {
                                start: {line: 5, column: 77},
                                end: {line: 5, column: 86},
                                source: 'hasSuffix',
                              },
                              name: 'hasSuffix',
                            },
                          },
                          arguments: [
                            {
                              type: 'ObjectExpression',
                              location: {
                                start: {line: 5, column: 87},
                                end: {line: 5, column: 120},
                                source: 'v: r._value, suffix: v.deployment',
                              },
                              properties: [
                                {
                                  type: 'Property',
                                  location: {
                                    start: {line: 5, column: 87},
                                    end: {line: 5, column: 98},
                                    source: 'v: r._value',
                                  },
                                  key: {
                                    type: 'Identifier',
                                    location: {
                                      start: {line: 5, column: 87},
                                      end: {line: 5, column: 88},
                                      source: 'v',
                                    },
                                    name: 'v',
                                  },
                                  value: {
                                    type: 'MemberExpression',
                                    location: {
                                      start: {line: 5, column: 90},
                                      end: {line: 5, column: 98},
                                      source: 'r._value',
                                    },
                                    object: {
                                      type: 'Identifier',
                                      location: {
                                        start: {line: 5, column: 90},
                                        end: {line: 5, column: 91},
                                        source: 'r',
                                      },
                                      name: 'r',
                                    },
                                    property: {
                                      type: 'Identifier',
                                      location: {
                                        start: {line: 5, column: 92},
                                        end: {line: 5, column: 98},
                                        source: '_value',
                                      },
                                      name: '_value',
                                    },
                                  },
                                },
                                {
                                  type: 'Property',
                                  location: {
                                    start: {line: 5, column: 100},
                                    end: {line: 5, column: 120},
                                    source: 'suffix: v.deployment',
                                  },
                                  key: {
                                    type: 'Identifier',
                                    location: {
                                      start: {line: 5, column: 100},
                                      end: {line: 5, column: 106},
                                      source: 'suffix',
                                    },
                                    name: 'suffix',
                                  },
                                  value: {
                                    type: 'MemberExpression',
                                    location: {
                                      start: {line: 5, column: 108},
                                      end: {line: 5, column: 120},
                                      source: 'v.deployment',
                                    },
                                    object: {
                                      type: 'Identifier',
                                      location: {
                                        start: {line: 5, column: 108},
                                        end: {line: 5, column: 109},
                                        source: 'v',
                                      },
                                      name: 'v',
                                    },
                                    property: {
                                      type: 'Identifier',
                                      location: {
                                        start: {line: 5, column: 110},
                                        end: {line: 5, column: 120},
                                        source: 'deployment',
                                      },
                                      name: 'deployment',
                                    },
                                  },
                                },
                              ],
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
    [deploymentQuery]: {
      type: 'File',
      location: {
        start: {line: 2, column: 1},
        end: {line: 3, column: 72},
        source:
          'import "influxdata/influxdb/v1"\nv1.tagValues(bucket: v.bucket, tag: "cpu") |> keep(columns: ["_value"])',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [
        {
          type: 'ImportDeclaration',
          location: {
            start: {line: 2, column: 1},
            end: {line: 2, column: 32},
            source: 'import "influxdata/influxdb/v1"',
          },
          comments: {lit: '// deployment\n', next: null},
          as: null,
          path: {
            location: {
              start: {line: 2, column: 8},
              end: {line: 2, column: 32},
              source: '"influxdata/influxdb/v1"',
            },
            value: 'influxdata/influxdb/v1',
          },
        },
      ],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 3, column: 1},
            end: {line: 3, column: 72},
            source:
              'v1.tagValues(bucket: v.bucket, tag: "cpu") |> keep(columns: ["_value"])',
          },
          expression: {
            type: 'PipeExpression',
            location: {
              start: {line: 3, column: 1},
              end: {line: 3, column: 72},
              source:
                'v1.tagValues(bucket: v.bucket, tag: "cpu") |> keep(columns: ["_value"])',
            },
            argument: {
              type: 'CallExpression',
              location: {
                start: {line: 3, column: 1},
                end: {line: 3, column: 43},
                source: 'v1.tagValues(bucket: v.bucket, tag: "cpu")',
              },
              callee: {
                type: 'MemberExpression',
                location: {
                  start: {line: 3, column: 1},
                  end: {line: 3, column: 13},
                  source: 'v1.tagValues',
                },
                object: {
                  type: 'Identifier',
                  location: {
                    start: {line: 3, column: 1},
                    end: {line: 3, column: 3},
                    source: 'v1',
                  },
                  name: 'v1',
                },
                property: {
                  type: 'Identifier',
                  location: {
                    start: {line: 3, column: 4},
                    end: {line: 3, column: 13},
                    source: 'tagValues',
                  },
                  name: 'tagValues',
                },
              },
              arguments: [
                {
                  type: 'ObjectExpression',
                  location: {
                    start: {line: 3, column: 14},
                    end: {line: 3, column: 42},
                    source: 'bucket: v.bucket, tag: "cpu"',
                  },
                  properties: [
                    {
                      type: 'Property',
                      location: {
                        start: {line: 3, column: 14},
                        end: {line: 3, column: 30},
                        source: 'bucket: v.bucket',
                      },
                      key: {
                        type: 'Identifier',
                        location: {
                          start: {line: 3, column: 14},
                          end: {line: 3, column: 20},
                          source: 'bucket',
                        },
                        name: 'bucket',
                      },
                      value: {
                        type: 'MemberExpression',
                        location: {
                          start: {line: 3, column: 22},
                          end: {line: 3, column: 30},
                          source: 'v.bucket',
                        },
                        object: {
                          type: 'Identifier',
                          location: {
                            start: {line: 3, column: 22},
                            end: {line: 3, column: 23},
                            source: 'v',
                          },
                          name: 'v',
                        },
                        property: {
                          type: 'Identifier',
                          location: {
                            start: {line: 3, column: 24},
                            end: {line: 3, column: 30},
                            source: 'bucket',
                          },
                          name: 'bucket',
                        },
                      },
                    },
                    {
                      type: 'Property',
                      location: {
                        start: {line: 3, column: 32},
                        end: {line: 3, column: 42},
                        source: 'tag: "cpu"',
                      },
                      key: {
                        type: 'Identifier',
                        location: {
                          start: {line: 3, column: 32},
                          end: {line: 3, column: 35},
                          source: 'tag',
                        },
                        name: 'tag',
                      },
                      value: {
                        type: 'StringLiteral',
                        location: {
                          start: {line: 3, column: 37},
                          end: {line: 3, column: 42},
                          source: '"cpu"',
                        },
                        value: 'cpu',
                      },
                    },
                  ],
                },
              ],
            },
            call: {
              location: {
                start: {line: 3, column: 47},
                end: {line: 3, column: 72},
                source: 'keep(columns: ["_value"])',
              },
              callee: {
                type: 'Identifier',
                location: {
                  start: {line: 3, column: 47},
                  end: {line: 3, column: 51},
                  source: 'keep',
                },
                name: 'keep',
              },
              arguments: [
                {
                  type: 'ObjectExpression',
                  location: {
                    start: {line: 3, column: 52},
                    end: {line: 3, column: 71},
                    source: 'columns: ["_value"]',
                  },
                  properties: [
                    {
                      type: 'Property',
                      location: {
                        start: {line: 3, column: 52},
                        end: {line: 3, column: 71},
                        source: 'columns: ["_value"]',
                      },
                      key: {
                        type: 'Identifier',
                        location: {
                          start: {line: 3, column: 52},
                          end: {line: 3, column: 59},
                          source: 'columns',
                        },
                        name: 'columns',
                      },
                      value: {
                        type: 'ArrayExpression',
                        location: {
                          start: {line: 3, column: 61},
                          end: {line: 3, column: 71},
                          source: '["_value"]',
                        },
                        elements: [
                          {
                            type: 'StringLiteral',
                            location: {
                              start: {line: 3, column: 62},
                              end: {line: 3, column: 70},
                              source: '"_value"',
                            },
                            value: '_value',
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
    'v.values': {
      type: 'File',
      location: {
        start: {line: 1, column: 1},
        end: {line: 1, column: 9},
        source: 'v.values',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 9},
            source: 'v.values',
          },
          expression: {
            type: 'MemberExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 9},
              source: 'v.values',
            },
            object: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 1},
                end: {line: 1, column: 2},
                source: 'v',
              },
              name: 'v',
            },
            property: {
              type: 'Identifier',
              location: {
                start: {line: 1, column: 3},
                end: {line: 1, column: 9},
                source: 'values',
              },
              name: 'values',
            },
          },
        },
      ],
    },
    [timeMachineQuery]: {
      type: 'File',
      location: {
        start: {
          line: 1,
          column: 1,
        },
        end: {
          line: 6,
          column: 13,
        },
        source:
          'from(bucket: "apps")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "rum")\n  |> filter(fn: (r) => r["_field"] == "domInteractive")\n  |> map(fn: (r) => ({r with _value: r._value / 1000.0}))\n  |> group()',
      },
      metadata: 'parser-type=rust',
      package: null,
      imports: [],
      body: [
        {
          type: 'ExpressionStatement',
          location: {
            start: {
              line: 1,
              column: 1,
            },
            end: {
              line: 6,
              column: 13,
            },
            source:
              'from(bucket: "apps")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "rum")\n  |> filter(fn: (r) => r["_field"] == "domInteractive")\n  |> map(fn: (r) => ({r with _value: r._value / 1000.0}))\n  |> group()',
          },
          expression: {
            type: 'PipeExpression',
            location: {
              start: {
                line: 1,
                column: 1,
              },
              end: {
                line: 6,
                column: 13,
              },
              source:
                'from(bucket: "apps")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "rum")\n  |> filter(fn: (r) => r["_field"] == "domInteractive")\n  |> map(fn: (r) => ({r with _value: r._value / 1000.0}))\n  |> group()',
            },
            argument: {
              type: 'PipeExpression',
              location: {
                start: {
                  line: 1,
                  column: 1,
                },
                end: {
                  line: 5,
                  column: 58,
                },
                source:
                  'from(bucket: "apps")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "rum")\n  |> filter(fn: (r) => r["_field"] == "domInteractive")\n  |> map(fn: (r) => ({r with _value: r._value / 1000.0}))',
              },
              argument: {
                type: 'PipeExpression',
                location: {
                  start: {
                    line: 1,
                    column: 1,
                  },
                  end: {
                    line: 4,
                    column: 56,
                  },
                  source:
                    'from(bucket: "apps")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "rum")\n  |> filter(fn: (r) => r["_field"] == "domInteractive")',
                },
                argument: {
                  type: 'PipeExpression',
                  location: {
                    start: {
                      line: 1,
                      column: 1,
                    },
                    end: {
                      line: 3,
                      column: 51,
                    },
                    source:
                      'from(bucket: "apps")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "rum")',
                  },
                  argument: {
                    type: 'PipeExpression',
                    location: {
                      start: {
                        line: 1,
                        column: 1,
                      },
                      end: {
                        line: 2,
                        column: 59,
                      },
                      source:
                        'from(bucket: "apps")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)',
                    },
                    argument: {
                      type: 'CallExpression',
                      location: {
                        start: {
                          line: 1,
                          column: 1,
                        },
                        end: {
                          line: 1,
                          column: 21,
                        },
                        source: 'from(bucket: "apps")',
                      },
                      callee: {
                        type: 'Identifier',
                        location: {
                          start: {
                            line: 1,
                            column: 1,
                          },
                          end: {
                            line: 1,
                            column: 5,
                          },
                          source: 'from',
                        },
                        name: 'from',
                      },
                      arguments: [
                        {
                          type: 'ObjectExpression',
                          location: {
                            start: {
                              line: 1,
                              column: 6,
                            },
                            end: {
                              line: 1,
                              column: 20,
                            },
                            source: 'bucket: "apps"',
                          },
                          properties: [
                            {
                              type: 'Property',
                              location: {
                                start: {
                                  line: 1,
                                  column: 6,
                                },
                                end: {
                                  line: 1,
                                  column: 20,
                                },
                                source: 'bucket: "apps"',
                              },
                              key: {
                                type: 'Identifier',
                                location: {
                                  start: {
                                    line: 1,
                                    column: 6,
                                  },
                                  end: {
                                    line: 1,
                                    column: 12,
                                  },
                                  source: 'bucket',
                                },
                                name: 'bucket',
                              },
                              value: {
                                type: 'StringLiteral',
                                location: {
                                  start: {
                                    line: 1,
                                    column: 14,
                                  },
                                  end: {
                                    line: 1,
                                    column: 20,
                                  },
                                  source: '"apps"',
                                },
                                value: 'apps',
                              },
                            },
                          ],
                        },
                      ],
                    },
                    call: {
                      location: {
                        start: {
                          line: 2,
                          column: 6,
                        },
                        end: {
                          line: 2,
                          column: 59,
                        },
                        source:
                          'range(start: v.timeRangeStart, stop: v.timeRangeStop)',
                      },
                      callee: {
                        type: 'Identifier',
                        location: {
                          start: {
                            line: 2,
                            column: 6,
                          },
                          end: {
                            line: 2,
                            column: 11,
                          },
                          source: 'range',
                        },
                        name: 'range',
                      },
                      arguments: [
                        {
                          type: 'ObjectExpression',
                          location: {
                            start: {
                              line: 2,
                              column: 12,
                            },
                            end: {
                              line: 2,
                              column: 58,
                            },
                            source:
                              'start: v.timeRangeStart, stop: v.timeRangeStop',
                          },
                          properties: [
                            {
                              type: 'Property',
                              location: {
                                start: {
                                  line: 2,
                                  column: 12,
                                },
                                end: {
                                  line: 2,
                                  column: 35,
                                },
                                source: 'start: v.timeRangeStart',
                              },
                              key: {
                                type: 'Identifier',
                                location: {
                                  start: {
                                    line: 2,
                                    column: 12,
                                  },
                                  end: {
                                    line: 2,
                                    column: 17,
                                  },
                                  source: 'start',
                                },
                                name: 'start',
                              },
                              value: {
                                type: 'MemberExpression',
                                location: {
                                  start: {
                                    line: 2,
                                    column: 19,
                                  },
                                  end: {
                                    line: 2,
                                    column: 35,
                                  },
                                  source: 'v.timeRangeStart',
                                },
                                object: {
                                  type: 'Identifier',
                                  location: {
                                    start: {
                                      line: 2,
                                      column: 19,
                                    },
                                    end: {
                                      line: 2,
                                      column: 20,
                                    },
                                    source: 'v',
                                  },
                                  name: 'v',
                                },
                                property: {
                                  type: 'Identifier',
                                  location: {
                                    start: {
                                      line: 2,
                                      column: 21,
                                    },
                                    end: {
                                      line: 2,
                                      column: 35,
                                    },
                                    source: 'timeRangeStart',
                                  },
                                  name: 'timeRangeStart',
                                },
                              },
                            },
                            {
                              type: 'Property',
                              location: {
                                start: {
                                  line: 2,
                                  column: 37,
                                },
                                end: {
                                  line: 2,
                                  column: 58,
                                },
                                source: 'stop: v.timeRangeStop',
                              },
                              key: {
                                type: 'Identifier',
                                location: {
                                  start: {
                                    line: 2,
                                    column: 37,
                                  },
                                  end: {
                                    line: 2,
                                    column: 41,
                                  },
                                  source: 'stop',
                                },
                                name: 'stop',
                              },
                              value: {
                                type: 'MemberExpression',
                                location: {
                                  start: {
                                    line: 2,
                                    column: 43,
                                  },
                                  end: {
                                    line: 2,
                                    column: 58,
                                  },
                                  source: 'v.timeRangeStop',
                                },
                                object: {
                                  type: 'Identifier',
                                  location: {
                                    start: {
                                      line: 2,
                                      column: 43,
                                    },
                                    end: {
                                      line: 2,
                                      column: 44,
                                    },
                                    source: 'v',
                                  },
                                  name: 'v',
                                },
                                property: {
                                  type: 'Identifier',
                                  location: {
                                    start: {
                                      line: 2,
                                      column: 45,
                                    },
                                    end: {
                                      line: 2,
                                      column: 58,
                                    },
                                    source: 'timeRangeStop',
                                  },
                                  name: 'timeRangeStop',
                                },
                              },
                            },
                          ],
                        },
                      ],
                    },
                  },
                  call: {
                    location: {
                      start: {
                        line: 3,
                        column: 6,
                      },
                      end: {
                        line: 3,
                        column: 51,
                      },
                      source: 'filter(fn: (r) => r["_measurement"] == "rum")',
                    },
                    callee: {
                      type: 'Identifier',
                      location: {
                        start: {
                          line: 3,
                          column: 6,
                        },
                        end: {
                          line: 3,
                          column: 12,
                        },
                        source: 'filter',
                      },
                      name: 'filter',
                    },
                    arguments: [
                      {
                        type: 'ObjectExpression',
                        location: {
                          start: {
                            line: 3,
                            column: 13,
                          },
                          end: {
                            line: 3,
                            column: 50,
                          },
                          source: 'fn: (r) => r["_measurement"] == "rum"',
                        },
                        properties: [
                          {
                            type: 'Property',
                            location: {
                              start: {
                                line: 3,
                                column: 13,
                              },
                              end: {
                                line: 3,
                                column: 50,
                              },
                              source: 'fn: (r) => r["_measurement"] == "rum"',
                            },
                            key: {
                              type: 'Identifier',
                              location: {
                                start: {
                                  line: 3,
                                  column: 13,
                                },
                                end: {
                                  line: 3,
                                  column: 15,
                                },
                                source: 'fn',
                              },
                              name: 'fn',
                            },
                            value: {
                              type: 'FunctionExpression',
                              location: {
                                start: {
                                  line: 3,
                                  column: 17,
                                },
                                end: {
                                  line: 3,
                                  column: 50,
                                },
                                source: '(r) => r["_measurement"] == "rum"',
                              },
                              params: [
                                {
                                  type: 'Property',
                                  location: {
                                    start: {
                                      line: 3,
                                      column: 18,
                                    },
                                    end: {
                                      line: 3,
                                      column: 19,
                                    },
                                    source: 'r',
                                  },
                                  key: {
                                    type: 'Identifier',
                                    location: {
                                      start: {
                                        line: 3,
                                        column: 18,
                                      },
                                      end: {
                                        line: 3,
                                        column: 19,
                                      },
                                      source: 'r',
                                    },
                                    name: 'r',
                                  },
                                  value: null,
                                },
                              ],
                              body: {
                                type: 'BinaryExpression',
                                location: {
                                  start: {
                                    line: 3,
                                    column: 24,
                                  },
                                  end: {
                                    line: 3,
                                    column: 50,
                                  },
                                  source: 'r["_measurement"] == "rum"',
                                },
                                operator: '==',
                                left: {
                                  type: 'MemberExpression',
                                  location: {
                                    start: {
                                      line: 3,
                                      column: 24,
                                    },
                                    end: {
                                      line: 3,
                                      column: 41,
                                    },
                                    source: 'r["_measurement"]',
                                  },
                                  object: {
                                    type: 'Identifier',
                                    location: {
                                      start: {
                                        line: 3,
                                        column: 24,
                                      },
                                      end: {
                                        line: 3,
                                        column: 25,
                                      },
                                      source: 'r',
                                    },
                                    name: 'r',
                                  },
                                  property: {
                                    type: 'StringLiteral',
                                    location: {
                                      start: {
                                        line: 3,
                                        column: 26,
                                      },
                                      end: {
                                        line: 3,
                                        column: 40,
                                      },
                                      source: '"_measurement"',
                                    },
                                    value: '_measurement',
                                  },
                                },
                                right: {
                                  type: 'StringLiteral',
                                  location: {
                                    start: {
                                      line: 3,
                                      column: 45,
                                    },
                                    end: {
                                      line: 3,
                                      column: 50,
                                    },
                                    source: '"rum"',
                                  },
                                  value: 'rum',
                                },
                              },
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
                call: {
                  location: {
                    start: {
                      line: 4,
                      column: 6,
                    },
                    end: {
                      line: 4,
                      column: 56,
                    },
                    source:
                      'filter(fn: (r) => r["_field"] == "domInteractive")',
                  },
                  callee: {
                    type: 'Identifier',
                    location: {
                      start: {
                        line: 4,
                        column: 6,
                      },
                      end: {
                        line: 4,
                        column: 12,
                      },
                      source: 'filter',
                    },
                    name: 'filter',
                  },
                  arguments: [
                    {
                      type: 'ObjectExpression',
                      location: {
                        start: {
                          line: 4,
                          column: 13,
                        },
                        end: {
                          line: 4,
                          column: 55,
                        },
                        source: 'fn: (r) => r["_field"] == "domInteractive"',
                      },
                      properties: [
                        {
                          type: 'Property',
                          location: {
                            start: {
                              line: 4,
                              column: 13,
                            },
                            end: {
                              line: 4,
                              column: 55,
                            },
                            source:
                              'fn: (r) => r["_field"] == "domInteractive"',
                          },
                          key: {
                            type: 'Identifier',
                            location: {
                              start: {
                                line: 4,
                                column: 13,
                              },
                              end: {
                                line: 4,
                                column: 15,
                              },
                              source: 'fn',
                            },
                            name: 'fn',
                          },
                          value: {
                            type: 'FunctionExpression',
                            location: {
                              start: {
                                line: 4,
                                column: 17,
                              },
                              end: {
                                line: 4,
                                column: 55,
                              },
                              source: '(r) => r["_field"] == "domInteractive"',
                            },
                            params: [
                              {
                                type: 'Property',
                                location: {
                                  start: {
                                    line: 4,
                                    column: 18,
                                  },
                                  end: {
                                    line: 4,
                                    column: 19,
                                  },
                                  source: 'r',
                                },
                                key: {
                                  type: 'Identifier',
                                  location: {
                                    start: {
                                      line: 4,
                                      column: 18,
                                    },
                                    end: {
                                      line: 4,
                                      column: 19,
                                    },
                                    source: 'r',
                                  },
                                  name: 'r',
                                },
                                value: null,
                              },
                            ],
                            body: {
                              type: 'BinaryExpression',
                              location: {
                                start: {
                                  line: 4,
                                  column: 24,
                                },
                                end: {
                                  line: 4,
                                  column: 55,
                                },
                                source: 'r["_field"] == "domInteractive"',
                              },
                              operator: '==',
                              left: {
                                type: 'MemberExpression',
                                location: {
                                  start: {
                                    line: 4,
                                    column: 24,
                                  },
                                  end: {
                                    line: 4,
                                    column: 35,
                                  },
                                  source: 'r["_field"]',
                                },
                                object: {
                                  type: 'Identifier',
                                  location: {
                                    start: {
                                      line: 4,
                                      column: 24,
                                    },
                                    end: {
                                      line: 4,
                                      column: 25,
                                    },
                                    source: 'r',
                                  },
                                  name: 'r',
                                },
                                property: {
                                  type: 'StringLiteral',
                                  location: {
                                    start: {
                                      line: 4,
                                      column: 26,
                                    },
                                    end: {
                                      line: 4,
                                      column: 34,
                                    },
                                    source: '"_field"',
                                  },
                                  value: '_field',
                                },
                              },
                              right: {
                                type: 'StringLiteral',
                                location: {
                                  start: {
                                    line: 4,
                                    column: 39,
                                  },
                                  end: {
                                    line: 4,
                                    column: 55,
                                  },
                                  source: '"domInteractive"',
                                },
                                value: 'domInteractive',
                              },
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              call: {
                location: {
                  start: {
                    line: 5,
                    column: 6,
                  },
                  end: {
                    line: 5,
                    column: 58,
                  },
                  source:
                    'map(fn: (r) => ({r with _value: r._value / 1000.0}))',
                },
                callee: {
                  type: 'Identifier',
                  location: {
                    start: {
                      line: 5,
                      column: 6,
                    },
                    end: {
                      line: 5,
                      column: 9,
                    },
                    source: 'map',
                  },
                  name: 'map',
                },
                arguments: [
                  {
                    type: 'ObjectExpression',
                    location: {
                      start: {
                        line: 5,
                        column: 10,
                      },
                      end: {
                        line: 5,
                        column: 57,
                      },
                      source: 'fn: (r) => ({r with _value: r._value / 1000.0})',
                    },
                    properties: [
                      {
                        type: 'Property',
                        location: {
                          start: {
                            line: 5,
                            column: 10,
                          },
                          end: {
                            line: 5,
                            column: 57,
                          },
                          source:
                            'fn: (r) => ({r with _value: r._value / 1000.0})',
                        },
                        key: {
                          type: 'Identifier',
                          location: {
                            start: {
                              line: 5,
                              column: 10,
                            },
                            end: {
                              line: 5,
                              column: 12,
                            },
                            source: 'fn',
                          },
                          name: 'fn',
                        },
                        value: {
                          type: 'FunctionExpression',
                          location: {
                            start: {
                              line: 5,
                              column: 14,
                            },
                            end: {
                              line: 5,
                              column: 57,
                            },
                            source:
                              '(r) => ({r with _value: r._value / 1000.0})',
                          },
                          params: [
                            {
                              type: 'Property',
                              location: {
                                start: {
                                  line: 5,
                                  column: 15,
                                },
                                end: {
                                  line: 5,
                                  column: 16,
                                },
                                source: 'r',
                              },
                              key: {
                                type: 'Identifier',
                                location: {
                                  start: {
                                    line: 5,
                                    column: 15,
                                  },
                                  end: {
                                    line: 5,
                                    column: 16,
                                  },
                                  source: 'r',
                                },
                                name: 'r',
                              },
                              value: null,
                            },
                          ],
                          body: {
                            type: 'ParenExpression',
                            location: {
                              start: {
                                line: 5,
                                column: 21,
                              },
                              end: {
                                line: 5,
                                column: 57,
                              },
                              source: '({r with _value: r._value / 1000.0})',
                            },
                            expression: {
                              type: 'ObjectExpression',
                              location: {
                                start: {
                                  line: 5,
                                  column: 22,
                                },
                                end: {
                                  line: 5,
                                  column: 56,
                                },
                                source: '{r with _value: r._value / 1000.0}',
                              },
                              with: {
                                location: {
                                  start: {
                                    line: 5,
                                    column: 23,
                                  },
                                  end: {
                                    line: 5,
                                    column: 24,
                                  },
                                  source: 'r',
                                },
                                name: 'r',
                              },
                              properties: [
                                {
                                  type: 'Property',
                                  location: {
                                    start: {
                                      line: 5,
                                      column: 30,
                                    },
                                    end: {
                                      line: 5,
                                      column: 55,
                                    },
                                    source: '_value: r._value / 1000.0',
                                  },
                                  key: {
                                    type: 'Identifier',
                                    location: {
                                      start: {
                                        line: 5,
                                        column: 30,
                                      },
                                      end: {
                                        line: 5,
                                        column: 36,
                                      },
                                      source: '_value',
                                    },
                                    name: '_value',
                                  },
                                  value: {
                                    type: 'BinaryExpression',
                                    location: {
                                      start: {
                                        line: 5,
                                        column: 38,
                                      },
                                      end: {
                                        line: 5,
                                        column: 55,
                                      },
                                      source: 'r._value / 1000.0',
                                    },
                                    operator: '/',
                                    left: {
                                      type: 'MemberExpression',
                                      location: {
                                        start: {
                                          line: 5,
                                          column: 38,
                                        },
                                        end: {
                                          line: 5,
                                          column: 46,
                                        },
                                        source: 'r._value',
                                      },
                                      object: {
                                        type: 'Identifier',
                                        location: {
                                          start: {
                                            line: 5,
                                            column: 38,
                                          },
                                          end: {
                                            line: 5,
                                            column: 39,
                                          },
                                          source: 'r',
                                        },
                                        name: 'r',
                                      },
                                      property: {
                                        type: 'Identifier',
                                        location: {
                                          start: {
                                            line: 5,
                                            column: 40,
                                          },
                                          end: {
                                            line: 5,
                                            column: 46,
                                          },
                                          source: '_value',
                                        },
                                        name: '_value',
                                      },
                                    },
                                    right: {
                                      type: 'FloatLiteral',
                                      location: {
                                        start: {
                                          line: 5,
                                          column: 49,
                                        },
                                        end: {
                                          line: 5,
                                          column: 55,
                                        },
                                        source: '1000.0',
                                      },
                                      value: 1000,
                                    },
                                  },
                                },
                              ],
                            },
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
            call: {
              location: {
                start: {
                  line: 6,
                  column: 6,
                },
                end: {
                  line: 6,
                  column: 13,
                },
                source: 'group()',
              },
              callee: {
                type: 'Identifier',
                location: {
                  start: {
                    line: 6,
                    column: 6,
                  },
                  end: {
                    line: 6,
                    column: 11,
                  },
                  source: 'group',
                },
                name: 'group',
              },
            },
          },
        },
      ],
    },
  }

  Object.keys(additionalMappings).forEach(
    key => (queryASTMapping[key] = additionalMappings[key])
  )

  return query => {
    return queryASTMapping[query]
  }
}
