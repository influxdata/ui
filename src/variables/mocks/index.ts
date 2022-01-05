// Types
import {Variable, RemoteDataState} from 'src/types'
import {VariableAssignment} from 'src/types/ast'
import {VariableNode} from 'src/variables/utils/hydrateVars'

export const defaultVariableAssignments: VariableAssignment[] = [
  {
    type: 'VariableAssignment',
    id: {
      type: 'Identifier',
      name: 'timeRangeStart',
    },
    init: {
      type: 'UnaryExpression',
      operator: '-',
      argument: {
        type: 'DurationLiteral',
        values: [{magnitude: 1, unit: 'h'}],
      },
    },
  },
  {
    type: 'VariableAssignment',
    id: {
      type: 'Identifier',
      name: 'timeRangeStop',
    },
    init: {
      type: 'CallExpression',
      callee: {type: 'Identifier', name: 'now'},
    },
  },
  {
    type: 'VariableAssignment',
    id: {
      type: 'Identifier',
      name: 'createdVariable',
    },
    init: {
      type: 'StringLiteral',
      value: 'randomValue',
    },
  },
]

export const createVariable = (
  name: string,
  query: string,
  selected?: string,
  status: RemoteDataState = RemoteDataState.Done
): Variable => ({
  name,
  id: name,
  orgID: 'howdy',
  selected: selected ? [selected] : [],
  labels: [],
  arguments: {
    type: 'query',
    values: {
      query,
      language: 'flux',
    },
  },
  status,
})

export const createMapVariable = (
  name: string,
  map: {[key: string]: string} = {},
  selected?: string
): Variable => ({
  name,
  id: name,
  orgID: 'howdy',
  selected: selected ? [selected] : [],
  labels: [],
  arguments: {
    type: 'map',
    values: {...map},
  },
  status: RemoteDataState.Done,
})

export const defaultSubGraph: VariableNode[] = [
  {
    variable: {
      id: '05b740973c68e000',
      orgID: '05b740945a91b000',
      name: 'static',
      description: '',
      selected: ['defbuck'],
      arguments: {
        type: 'constant',
        values: ['beans', 'defbuck'],
      },
      createdAt: '2020-05-19T06:00:00.113169-07:00',
      updatedAt: '2020-05-19T06:00:00.113169-07:00',
      labels: [],
      links: {
        self: '/api/v2/variables/05b740973c68e000',
        labels: '/api/v2/variables/05b740973c68e000/labels',
        org: '/api/v2/orgs/05b740945a91b000',
      },
      status: RemoteDataState.Done,
    },
    values: null,
    parents: [
      {
        variable: {
          id: '05b740974228e000',
          orgID: '05b740945a91b000',
          name: 'dependent',
          description: '',
          selected: [],
          arguments: {
            type: 'query',
            values: {
              query:
                'from(bucket: v.static)\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "test")\n  |> keep(columns: ["container_name"])\n  |> rename(columns: {"container_name": "_value"})\n  |> last()\n  |> group()',
              language: 'flux',
              results: [],
            },
          },
          createdAt: '2020-05-19T06:00:00.136597-07:00',
          updatedAt: '2020-05-19T06:00:00.136597-07:00',
          labels: [],
          links: {
            self: '/api/v2/variables/05b740974228e000',
            labels: '/api/v2/variables/05b740974228e000/labels',
            org: '/api/v2/orgs/05b740945a91b000',
          },
          status: RemoteDataState.Loading,
        },
        cancel: () => {},
        values: null,
        parents: [],
        children: [
          {
            variable: {
              orgID: '',
              id: 'timeRangeStart',
              name: 'timeRangeStart',
              arguments: {
                type: 'system',
                values: [
                  [
                    {
                      magnitude: 1,
                      unit: 'h',
                    },
                  ],
                ],
              },
              status: RemoteDataState.Done,
              labels: [],
              selected: [],
            },
            values: null,
            parents: [null],
            children: [],
            status: RemoteDataState.Done,
            cancel: () => {},
          },
          {
            variable: {
              orgID: '',
              id: 'timeRangeStop',
              name: 'timeRangeStop',
              arguments: {
                type: 'system',
                values: ['now()'],
              },
              status: RemoteDataState.Done,
              labels: [],
              selected: [],
            },
            values: null,
            parents: [null],
            children: [],
            status: RemoteDataState.Done,
            cancel: () => {},
          },
        ],
        status: RemoteDataState.NotStarted,
      },
    ],
    children: [],
    status: RemoteDataState.Done,
    cancel: () => {},
  },
]

export const defaultGraph: VariableNode[] = [
  {
    variable: {
      id: '05b740973c68e000',
      orgID: '05b740945a91b000',
      name: 'static',
      description: '',
      selected: ['defbuck'],
      arguments: {
        type: 'constant',
        values: ['beans', 'defbuck'],
      },
      createdAt: '2020-05-19T06:00:00.113169-07:00',
      updatedAt: '2020-05-19T06:00:00.113169-07:00',
      labels: [],
      links: {
        self: '/api/v2/variables/05b740973c68e000',
        labels: '/api/v2/variables/05b740973c68e000/labels',
        org: '/api/v2/orgs/05b740945a91b000',
      },
      status: RemoteDataState.Done,
    },
    values: null,
    parents: [
      {
        cancel: () => {},
        variable: {
          id: '05b740974228e000',
          orgID: '05b740945a91b000',
          name: 'dependent',
          description: '',
          selected: [],
          arguments: {
            type: 'query',
            values: {
              query:
                'from(bucket: v.static)\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "test")\n  |> keep(columns: ["container_name"])\n  |> rename(columns: {"container_name": "_value"})\n  |> last()\n  |> group()',
              language: 'flux',
              results: [],
            },
          },
          createdAt: '2020-05-19T06:00:00.136597-07:00',
          updatedAt: '2020-05-19T06:00:00.136597-07:00',
          labels: [],
          links: {
            self: '/api/v2/variables/05b740974228e000',
            labels: '/api/v2/variables/05b740974228e000/labels',
            org: '/api/v2/orgs/05b740945a91b000',
          },
          status: RemoteDataState.Loading,
        },
        values: null,
        parents: [],
        children: [
          {
            variable: {
              orgID: '',
              id: 'timeRangeStart',
              name: 'timeRangeStart',
              arguments: {
                type: 'system',
                values: [
                  [
                    {
                      magnitude: 1,
                      unit: 'h',
                    },
                  ],
                ],
              },
              status: RemoteDataState.Done,
              labels: [],
              selected: [],
            },
            values: null,
            parents: [null],
            children: [],
            status: RemoteDataState.Done,
            cancel: () => {},
          },
          {
            variable: {
              orgID: '',
              id: 'timeRangeStop',
              name: 'timeRangeStop',
              arguments: {
                type: 'system',
                values: ['now()'],
              },
              status: RemoteDataState.Done,
              labels: [],
              selected: [],
            },
            values: null,
            parents: [null],
            children: [],
            status: RemoteDataState.Done,
            cancel: () => {},
          },
        ],
        status: RemoteDataState.NotStarted,
      },
    ],
    children: [],
    status: RemoteDataState.Done,
    cancel: () => {},
  },
  {
    variable: {
      id: '05b740974228e000',
      orgID: '05b740945a91b000',
      name: 'dependent',
      description: '',
      selected: [],
      arguments: {
        type: 'query',
        values: {
          query:
            'from(bucket: v.static)\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "test")\n  |> keep(columns: ["container_name"])\n  |> rename(columns: {"container_name": "_value"})\n  |> last()\n  |> group()',
          language: 'flux',
          results: [],
        },
      },
      createdAt: '2020-05-19T06:00:00.136597-07:00',
      updatedAt: '2020-05-19T06:00:00.136597-07:00',
      labels: [],
      links: {
        self: '/api/v2/variables/05b740974228e000',
        labels: '/api/v2/variables/05b740974228e000/labels',
        org: '/api/v2/orgs/05b740945a91b000',
      },
      status: RemoteDataState.Loading,
    },
    values: null,
    parents: [],
    children: [
      {
        variable: {
          id: '05b740973c68e000',
          orgID: '05b740945a91b000',
          name: 'static',
          description: '',
          selected: ['defbuck'],
          arguments: {
            type: 'constant',
            values: ['beans', 'defbuck'],
          },
          createdAt: '2020-05-19T06:00:00.113169-07:00',
          updatedAt: '2020-05-19T06:00:00.113169-07:00',
          labels: [],
          links: {
            self: '/api/v2/variables/05b740973c68e000',
            labels: '/api/v2/variables/05b740973c68e000/labels',
            org: '/api/v2/orgs/05b740945a91b000',
          },
          status: RemoteDataState.Done,
        },
        values: null,
        parents: [null],
        children: [],
        status: RemoteDataState.Done,
        cancel: () => {},
      },
      {
        variable: {
          orgID: '',
          id: 'timeRangeStart',
          name: 'timeRangeStart',
          arguments: {
            type: 'system',
            values: [
              [
                {
                  magnitude: 1,
                  unit: 'h',
                },
              ],
            ],
          },
          status: RemoteDataState.Done,
          labels: [],
          selected: [],
        },
        values: null,
        parents: [null],
        children: [],
        status: RemoteDataState.Done,
        cancel: () => {},
      },
      {
        variable: {
          orgID: '',
          id: 'timeRangeStop',
          name: 'timeRangeStop',
          arguments: {
            type: 'system',
            values: ['now()'],
          },
          status: RemoteDataState.Done,
          labels: [],
          selected: [],
        },
        values: null,
        parents: [null],
        children: [],
        status: RemoteDataState.Done,
        cancel: () => {},
      },
    ],
    status: RemoteDataState.NotStarted,
    cancel: () => {},
  },
  {
    variable: {
      orgID: '',
      id: 'timeRangeStart',
      name: 'timeRangeStart',
      arguments: {
        type: 'system',
        values: [
          [
            {
              magnitude: 1,
              unit: 'h',
            },
          ],
        ],
      },
      status: RemoteDataState.Done,
      labels: [],
      selected: [],
    },
    values: null,
    parents: [
      {
        variable: {
          id: '05b740974228e000',
          orgID: '05b740945a91b000',
          name: 'dependent',
          description: '',
          selected: [],
          arguments: {
            type: 'query',
            values: {
              query:
                'from(bucket: v.static)\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "test")\n  |> keep(columns: ["container_name"])\n  |> rename(columns: {"container_name": "_value"})\n  |> last()\n  |> group()',
              language: 'flux',
              results: [],
            },
          },
          createdAt: '2020-05-19T06:00:00.136597-07:00',
          updatedAt: '2020-05-19T06:00:00.136597-07:00',
          labels: [],
          links: {
            self: '/api/v2/variables/05b740974228e000',
            labels: '/api/v2/variables/05b740974228e000/labels',
            org: '/api/v2/orgs/05b740945a91b000',
          },
          status: RemoteDataState.Loading,
        },
        values: null,
        parents: [],
        children: [
          {
            variable: {
              id: '05b740973c68e000',
              orgID: '05b740945a91b000',
              name: 'static',
              description: '',
              selected: ['defbuck'],
              arguments: {
                type: 'constant',
                values: ['beans', 'defbuck'],
              },
              createdAt: '2020-05-19T06:00:00.113169-07:00',
              updatedAt: '2020-05-19T06:00:00.113169-07:00',
              labels: [],
              links: {
                self: '/api/v2/variables/05b740973c68e000',
                labels: '/api/v2/variables/05b740973c68e000/labels',
                org: '/api/v2/orgs/05b740945a91b000',
              },
              status: RemoteDataState.Done,
            },
            values: null,
            parents: [null],
            children: [],
            status: RemoteDataState.Done,
            cancel: () => {},
          },
          {
            variable: {
              orgID: '',
              id: 'timeRangeStop',
              name: 'timeRangeStop',
              arguments: {
                type: 'system',
                values: ['now()'],
              },
              status: RemoteDataState.Done,
              labels: [],
              selected: [],
            },
            values: null,
            parents: [null],
            children: [],
            status: RemoteDataState.Done,
            cancel: () => {},
          },
        ],
        status: RemoteDataState.NotStarted,
        cancel: () => {},
      },
    ],
    children: [],
    status: RemoteDataState.Done,
    cancel: () => {},
  },
  {
    variable: {
      orgID: '',
      id: 'timeRangeStop',
      name: 'timeRangeStop',
      arguments: {
        type: 'system',
        values: ['now()'],
      },
      status: RemoteDataState.Done,
      labels: [],
      selected: [],
    },
    values: null,
    parents: [
      {
        variable: {
          id: '05b740974228e000',
          orgID: '05b740945a91b000',
          name: 'dependent',
          description: '',
          selected: [],
          arguments: {
            type: 'query',
            values: {
              query:
                'from(bucket: v.static)\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "test")\n  |> keep(columns: ["container_name"])\n  |> rename(columns: {"container_name": "_value"})\n  |> last()\n  |> group()',
              language: 'flux',
              results: [],
            },
          },
          createdAt: '2020-05-19T06:00:00.136597-07:00',
          updatedAt: '2020-05-19T06:00:00.136597-07:00',
          labels: [],
          links: {
            self: '/api/v2/variables/05b740974228e000',
            labels: '/api/v2/variables/05b740974228e000/labels',
            org: '/api/v2/orgs/05b740945a91b000',
          },
          status: RemoteDataState.Loading,
        },
        values: null,
        parents: [],
        children: [
          {
            variable: {
              id: '05b740973c68e000',
              orgID: '05b740945a91b000',
              name: 'static',
              description: '',
              selected: ['defbuck'],
              arguments: {
                type: 'constant',
                values: ['beans', 'defbuck'],
              },
              createdAt: '2020-05-19T06:00:00.113169-07:00',
              updatedAt: '2020-05-19T06:00:00.113169-07:00',
              labels: [],
              links: {
                self: '/api/v2/variables/05b740973c68e000',
                labels: '/api/v2/variables/05b740973c68e000/labels',
                org: '/api/v2/orgs/05b740945a91b000',
              },
              status: RemoteDataState.Done,
            },
            values: null,
            parents: [null],
            children: [],
            status: RemoteDataState.Done,
            cancel: () => {},
          },
          {
            variable: {
              orgID: '',
              id: 'timeRangeStart',
              name: 'timeRangeStart',
              arguments: {
                type: 'system',
                values: [
                  [
                    {
                      magnitude: 1,
                      unit: 'h',
                    },
                  ],
                ],
              },
              status: RemoteDataState.Done,
              labels: [],
              selected: [],
            },
            values: null,
            parents: [null],
            children: [],
            status: RemoteDataState.Done,
            cancel: () => {},
          },
          null,
        ],
        status: RemoteDataState.NotStarted,
        cancel: () => {},
      },
    ],
    children: [],
    status: RemoteDataState.Done,
    cancel: () => {},
  },
  {
    variable: {
      orgID: '',
      id: 'windowPeriod',
      name: 'windowPeriod',
      arguments: {
        type: 'system',
        values: [10000],
      },
      status: RemoteDataState.Done,
      labels: [],
      selected: [],
    },
    values: null,
    parents: [],
    children: [],
    status: RemoteDataState.Done,
    cancel: () => {},
  },
]

export const defaultVariable: Variable = {
  id: '05b73f4bffe8e000',
  orgID: '05b73f49a1d1b000',
  name: 'static',
  description: 'defaultVariable',
  selected: ['defbuck'],
  arguments: {type: 'constant', values: ['beans', 'defbuck']},
  createdAt: '2020-05-19T05:54:20.927477-07:00',
  updatedAt: '2020-05-19T05:54:20.927477-07:00',
  labels: [],
  links: {
    self: '/api/v2/variables/05b73f4bffe8e000',
    labels: '/api/v2/variables/05b73f4bffe8e000/labels',
    org: '/api/v2/orgs/05b73f49a1d1b000',
  },
  status: RemoteDataState.Done,
}

export const associatedVariable: Variable = {
  id: '05b740974228e000',
  orgID: '05b740945a91b000',
  name: 'dependent',
  description: 'associatedVariable',
  selected: [],
  arguments: {
    type: 'query',
    values: {
      query:
        'from(bucket: v.static)\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "test")\n  |> keep(columns: ["container_name"])\n  |> rename(columns: {"container_name": "_value"})\n  |> last()\n  |> group()',
      language: 'flux',
      results: [],
    },
  },
  createdAt: '2020-05-19T06:00:00.136597-07:00',
  updatedAt: '2020-05-19T06:00:00.136597-07:00',
  labels: [],
  links: {
    self: '/api/v2/variables/05b740974228e000',
    labels: '/api/v2/variables/05b740974228e000/labels',
    org: '/api/v2/orgs/05b740945a91b000',
  },
  status: RemoteDataState.Loading,
}

export const timeRangeStartVariable: Variable = {
  orgID: '',
  id: 'timeRangeStart',
  name: 'timeRangeStart',
  arguments: {
    type: 'system',
    values: [
      [
        {
          magnitude: 1,
          unit: 'h',
        },
      ],
    ],
  },
  status: RemoteDataState.Done,
  labels: [],
  selected: [],
}

export const timeRangeStopVariable: Variable = {
  orgID: '',
  id: 'timeRangeStop',
  name: 'timeRangeStop',
  arguments: {
    type: 'system',
    values: ['now()'],
  },
  status: RemoteDataState.Done,
  labels: [],
  selected: [],
}

export const windowPeriodVariable: Variable = {
  orgID: '',
  id: 'windowPeriod',
  name: 'windowPeriod',
  arguments: {
    type: 'system',
    values: [10000],
  },
  status: RemoteDataState.Done,
  labels: [],
  selected: [],
}

export const defaultVariables: Variable[] = [
  defaultVariable,
  associatedVariable,
  timeRangeStartVariable,
  timeRangeStopVariable,
  windowPeriodVariable,
]

const testQuery = `from(bucket: v.static)
  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
  |> filter(fn: (r) => r["_measurement"] == "test")
  |> keep(columns: ["container_name"])
  |> rename(columns: {"container_name": "_value"})
  |> last()
  |> group()`

export const hydrateVarsAdditionalMappings = {
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
  'f(x: v.c)': {
    type: 'File',
    location: {
      start: {line: 1, column: 1},
      end: {line: 1, column: 10},
      source: 'f(x: v.c)',
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
          source: 'f(x: v.c)',
        },
        expression: {
          type: 'CallExpression',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 10},
            source: 'f(x: v.c)',
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
                source: 'x: v.c',
              },
              properties: [
                {
                  type: 'Property',
                  location: {
                    start: {line: 1, column: 3},
                    end: {line: 1, column: 9},
                    source: 'x: v.c',
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
                      source: 'v.c',
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
  'f(x: v.d)': {
    type: 'File',
    location: {
      start: {line: 1, column: 1},
      end: {line: 1, column: 10},
      source: 'f(x: v.d)',
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
          source: 'f(x: v.d)',
        },
        expression: {
          type: 'CallExpression',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 10},
            source: 'f(x: v.d)',
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
                source: 'x: v.d',
              },
              properties: [
                {
                  type: 'Property',
                  location: {
                    start: {line: 1, column: 3},
                    end: {line: 1, column: 9},
                    source: 'x: v.d',
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
                      source: 'v.d',
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
                        source: 'd',
                      },
                      name: 'd',
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
  'f(x: v.b, y: v.e)': {
    type: 'File',
    location: {
      start: {line: 1, column: 1},
      end: {line: 1, column: 18},
      source: 'f(x: v.b, y: v.e)',
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
          source: 'f(x: v.b, y: v.e)',
        },
        expression: {
          type: 'CallExpression',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 18},
            source: 'f(x: v.b, y: v.e)',
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
                source: 'x: v.b, y: v.e',
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
  'f() // called by f': {
    type: 'File',
    location: {
      start: {line: 1, column: 1},
      end: {line: 1, column: 4},
      source: 'f()',
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
          source: 'f()',
        },
        expression: {
          type: 'CallExpression',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 4},
            source: 'f()',
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
        },
      },
    ],
    eof: {lit: '// called by f', next: null},
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
  'f() // called by g': {
    type: 'File',
    location: {
      start: {line: 1, column: 1},
      end: {line: 1, column: 4},
      source: 'f()',
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
          source: 'f()',
        },
        expression: {
          type: 'CallExpression',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 4},
            source: 'f()',
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
        },
      },
    ],
    eof: {lit: '// called by g', next: null},
  },
  'f()': {
    type: 'File',
    location: {
      start: {line: 1, column: 1},
      end: {line: 1, column: 4},
      source: 'f()',
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
          source: 'f()',
        },
        expression: {
          type: 'CallExpression',
          location: {
            start: {line: 1, column: 1},
            end: {line: 1, column: 4},
            source: 'f()',
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
        },
      },
    ],
  },
  [testQuery]: {
    type: 'File',
    location: {
      start: {line: 1, column: 1},
      end: {line: 7, column: 17},
      source:
        'from(bucket: v.static)\n      |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n      |> filter(fn: (r) => r["_measurement"] == "test")\n      |> keep(columns: ["container_name"])\n      |> rename(columns: {"container_name": "_value"})\n      |> last()\n      |> group()',
    },
    metadata: 'parser-type=rust',
    package: null,
    imports: [],
    body: [
      {
        type: 'ExpressionStatement',
        location: {
          start: {line: 1, column: 1},
          end: {line: 7, column: 17},
          source:
            'from(bucket: v.static)\n      |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n      |> filter(fn: (r) => r["_measurement"] == "test")\n      |> keep(columns: ["container_name"])\n      |> rename(columns: {"container_name": "_value"})\n      |> last()\n      |> group()',
        },
        expression: {
          type: 'PipeExpression',
          location: {
            start: {line: 1, column: 1},
            end: {line: 7, column: 17},
            source:
              'from(bucket: v.static)\n      |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n      |> filter(fn: (r) => r["_measurement"] == "test")\n      |> keep(columns: ["container_name"])\n      |> rename(columns: {"container_name": "_value"})\n      |> last()\n      |> group()',
          },
          argument: {
            type: 'PipeExpression',
            location: {
              start: {line: 1, column: 1},
              end: {line: 6, column: 16},
              source:
                'from(bucket: v.static)\n      |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n      |> filter(fn: (r) => r["_measurement"] == "test")\n      |> keep(columns: ["container_name"])\n      |> rename(columns: {"container_name": "_value"})\n      |> last()',
            },
            argument: {
              type: 'PipeExpression',
              location: {
                start: {line: 1, column: 1},
                end: {line: 5, column: 55},
                source:
                  'from(bucket: v.static)\n      |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n      |> filter(fn: (r) => r["_measurement"] == "test")\n      |> keep(columns: ["container_name"])\n      |> rename(columns: {"container_name": "_value"})',
              },
              argument: {
                type: 'PipeExpression',
                location: {
                  start: {line: 1, column: 1},
                  end: {line: 4, column: 43},
                  source:
                    'from(bucket: v.static)\n      |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n      |> filter(fn: (r) => r["_measurement"] == "test")\n      |> keep(columns: ["container_name"])',
                },
                argument: {
                  type: 'PipeExpression',
                  location: {
                    start: {line: 1, column: 1},
                    end: {line: 3, column: 56},
                    source:
                      'from(bucket: v.static)\n      |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n      |> filter(fn: (r) => r["_measurement"] == "test")',
                  },
                  argument: {
                    type: 'PipeExpression',
                    location: {
                      start: {line: 1, column: 1},
                      end: {line: 2, column: 63},
                      source:
                        'from(bucket: v.static)\n      |> range(start: v.timeRangeStart, stop: v.timeRangeStop)',
                    },
                    argument: {
                      type: 'CallExpression',
                      location: {
                        start: {line: 1, column: 1},
                        end: {line: 1, column: 23},
                        source: 'from(bucket: v.static)',
                      },
                      callee: {
                        type: 'Identifier',
                        location: {
                          start: {line: 1, column: 1},
                          end: {line: 1, column: 5},
                          source: 'from',
                        },
                        name: 'from',
                      },
                      arguments: [
                        {
                          type: 'ObjectExpression',
                          location: {
                            start: {line: 1, column: 6},
                            end: {line: 1, column: 22},
                            source: 'bucket: v.static',
                          },
                          properties: [
                            {
                              type: 'Property',
                              location: {
                                start: {line: 1, column: 6},
                                end: {line: 1, column: 22},
                                source: 'bucket: v.static',
                              },
                              key: {
                                type: 'Identifier',
                                location: {
                                  start: {line: 1, column: 6},
                                  end: {line: 1, column: 12},
                                  source: 'bucket',
                                },
                                name: 'bucket',
                              },
                              value: {
                                type: 'MemberExpression',
                                location: {
                                  start: {line: 1, column: 14},
                                  end: {line: 1, column: 22},
                                  source: 'v.static',
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
                                    end: {line: 1, column: 22},
                                    source: 'static',
                                  },
                                  name: 'static',
                                },
                              },
                            },
                          ],
                        },
                      ],
                    },
                    call: {
                      location: {
                        start: {line: 2, column: 10},
                        end: {line: 2, column: 63},
                        source:
                          'range(start: v.timeRangeStart, stop: v.timeRangeStop)',
                      },
                      callee: {
                        type: 'Identifier',
                        location: {
                          start: {line: 2, column: 10},
                          end: {line: 2, column: 15},
                          source: 'range',
                        },
                        name: 'range',
                      },
                      arguments: [
                        {
                          type: 'ObjectExpression',
                          location: {
                            start: {line: 2, column: 16},
                            end: {line: 2, column: 62},
                            source:
                              'start: v.timeRangeStart, stop: v.timeRangeStop',
                          },
                          properties: [
                            {
                              type: 'Property',
                              location: {
                                start: {line: 2, column: 16},
                                end: {line: 2, column: 39},
                                source: 'start: v.timeRangeStart',
                              },
                              key: {
                                type: 'Identifier',
                                location: {
                                  start: {line: 2, column: 16},
                                  end: {line: 2, column: 21},
                                  source: 'start',
                                },
                                name: 'start',
                              },
                              value: {
                                type: 'MemberExpression',
                                location: {
                                  start: {line: 2, column: 23},
                                  end: {line: 2, column: 39},
                                  source: 'v.timeRangeStart',
                                },
                                object: {
                                  type: 'Identifier',
                                  location: {
                                    start: {line: 2, column: 23},
                                    end: {line: 2, column: 24},
                                    source: 'v',
                                  },
                                  name: 'v',
                                },
                                property: {
                                  type: 'Identifier',
                                  location: {
                                    start: {line: 2, column: 25},
                                    end: {line: 2, column: 39},
                                    source: 'timeRangeStart',
                                  },
                                  name: 'timeRangeStart',
                                },
                              },
                            },
                            {
                              type: 'Property',
                              location: {
                                start: {line: 2, column: 41},
                                end: {line: 2, column: 62},
                                source: 'stop: v.timeRangeStop',
                              },
                              key: {
                                type: 'Identifier',
                                location: {
                                  start: {line: 2, column: 41},
                                  end: {line: 2, column: 45},
                                  source: 'stop',
                                },
                                name: 'stop',
                              },
                              value: {
                                type: 'MemberExpression',
                                location: {
                                  start: {line: 2, column: 47},
                                  end: {line: 2, column: 62},
                                  source: 'v.timeRangeStop',
                                },
                                object: {
                                  type: 'Identifier',
                                  location: {
                                    start: {line: 2, column: 47},
                                    end: {line: 2, column: 48},
                                    source: 'v',
                                  },
                                  name: 'v',
                                },
                                property: {
                                  type: 'Identifier',
                                  location: {
                                    start: {line: 2, column: 49},
                                    end: {line: 2, column: 62},
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
                      start: {line: 3, column: 10},
                      end: {line: 3, column: 56},
                      source: 'filter(fn: (r) => r["_measurement"] == "test")',
                    },
                    callee: {
                      type: 'Identifier',
                      location: {
                        start: {line: 3, column: 10},
                        end: {line: 3, column: 16},
                        source: 'filter',
                      },
                      name: 'filter',
                    },
                    arguments: [
                      {
                        type: 'ObjectExpression',
                        location: {
                          start: {line: 3, column: 17},
                          end: {line: 3, column: 55},
                          source: 'fn: (r) => r["_measurement"] == "test"',
                        },
                        properties: [
                          {
                            type: 'Property',
                            location: {
                              start: {line: 3, column: 17},
                              end: {line: 3, column: 55},
                              source: 'fn: (r) => r["_measurement"] == "test"',
                            },
                            key: {
                              type: 'Identifier',
                              location: {
                                start: {line: 3, column: 17},
                                end: {line: 3, column: 19},
                                source: 'fn',
                              },
                              name: 'fn',
                            },
                            value: {
                              type: 'FunctionExpression',
                              location: {
                                start: {line: 3, column: 21},
                                end: {line: 3, column: 55},
                                source: '(r) => r["_measurement"] == "test"',
                              },
                              params: [
                                {
                                  type: 'Property',
                                  location: {
                                    start: {line: 3, column: 22},
                                    end: {line: 3, column: 23},
                                    source: 'r',
                                  },
                                  key: {
                                    type: 'Identifier',
                                    location: {
                                      start: {line: 3, column: 22},
                                      end: {line: 3, column: 23},
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
                                  start: {line: 3, column: 28},
                                  end: {line: 3, column: 55},
                                  source: 'r["_measurement"] == "test"',
                                },
                                operator: '==',
                                left: {
                                  type: 'MemberExpression',
                                  location: {
                                    start: {line: 3, column: 28},
                                    end: {line: 3, column: 45},
                                    source: 'r["_measurement"]',
                                  },
                                  object: {
                                    type: 'Identifier',
                                    location: {
                                      start: {line: 3, column: 28},
                                      end: {line: 3, column: 29},
                                      source: 'r',
                                    },
                                    name: 'r',
                                  },
                                  property: {
                                    type: 'StringLiteral',
                                    location: {
                                      start: {line: 3, column: 30},
                                      end: {line: 3, column: 44},
                                      source: '"_measurement"',
                                    },
                                    value: '_measurement',
                                  },
                                },
                                right: {
                                  type: 'StringLiteral',
                                  location: {
                                    start: {line: 3, column: 49},
                                    end: {line: 3, column: 55},
                                    source: '"test"',
                                  },
                                  value: 'test',
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
                    start: {line: 4, column: 10},
                    end: {line: 4, column: 43},
                    source: 'keep(columns: ["container_name"])',
                  },
                  callee: {
                    type: 'Identifier',
                    location: {
                      start: {line: 4, column: 10},
                      end: {line: 4, column: 14},
                      source: 'keep',
                    },
                    name: 'keep',
                  },
                  arguments: [
                    {
                      type: 'ObjectExpression',
                      location: {
                        start: {line: 4, column: 15},
                        end: {line: 4, column: 42},
                        source: 'columns: ["container_name"]',
                      },
                      properties: [
                        {
                          type: 'Property',
                          location: {
                            start: {line: 4, column: 15},
                            end: {line: 4, column: 42},
                            source: 'columns: ["container_name"]',
                          },
                          key: {
                            type: 'Identifier',
                            location: {
                              start: {line: 4, column: 15},
                              end: {line: 4, column: 22},
                              source: 'columns',
                            },
                            name: 'columns',
                          },
                          value: {
                            type: 'ArrayExpression',
                            location: {
                              start: {line: 4, column: 24},
                              end: {line: 4, column: 42},
                              source: '["container_name"]',
                            },
                            elements: [
                              {
                                type: 'StringLiteral',
                                location: {
                                  start: {line: 4, column: 25},
                                  end: {line: 4, column: 41},
                                  source: '"container_name"',
                                },
                                value: 'container_name',
                              },
                            ],
                          },
                        },
                      ],
                    },
                  ],
                },
              },
              call: {
                location: {
                  start: {line: 5, column: 10},
                  end: {line: 5, column: 55},
                  source: 'rename(columns: {"container_name": "_value"})',
                },
                callee: {
                  type: 'Identifier',
                  location: {
                    start: {line: 5, column: 10},
                    end: {line: 5, column: 16},
                    source: 'rename',
                  },
                  name: 'rename',
                },
                arguments: [
                  {
                    type: 'ObjectExpression',
                    location: {
                      start: {line: 5, column: 17},
                      end: {line: 5, column: 54},
                      source: 'columns: {"container_name": "_value"}',
                    },
                    properties: [
                      {
                        type: 'Property',
                        location: {
                          start: {line: 5, column: 17},
                          end: {line: 5, column: 54},
                          source: 'columns: {"container_name": "_value"}',
                        },
                        key: {
                          type: 'Identifier',
                          location: {
                            start: {line: 5, column: 17},
                            end: {line: 5, column: 24},
                            source: 'columns',
                          },
                          name: 'columns',
                        },
                        value: {
                          type: 'ObjectExpression',
                          location: {
                            start: {line: 5, column: 26},
                            end: {line: 5, column: 54},
                            source: '{"container_name": "_value"}',
                          },
                          properties: [
                            {
                              type: 'Property',
                              location: {
                                start: {line: 5, column: 27},
                                end: {line: 5, column: 53},
                                source: '"container_name": "_value"',
                              },
                              key: {
                                type: 'StringLiteral',
                                location: {
                                  start: {line: 5, column: 27},
                                  end: {line: 5, column: 43},
                                  source: '"container_name"',
                                },
                                value: 'container_name',
                              },
                              value: {
                                type: 'StringLiteral',
                                location: {
                                  start: {line: 5, column: 45},
                                  end: {line: 5, column: 53},
                                  source: '"_value"',
                                },
                                value: '_value',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                ],
              },
            },
            call: {
              location: {
                start: {line: 6, column: 10},
                end: {line: 6, column: 16},
                source: 'last()',
              },
              callee: {
                type: 'Identifier',
                location: {
                  start: {line: 6, column: 10},
                  end: {line: 6, column: 14},
                  source: 'last',
                },
                name: 'last',
              },
            },
          },
          call: {
            location: {
              start: {line: 7, column: 10},
              end: {line: 7, column: 17},
              source: 'group()',
            },
            callee: {
              type: 'Identifier',
              location: {
                start: {line: 7, column: 10},
                end: {line: 7, column: 15},
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

export const exportVariablesAdditionalMappings = {
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
}
