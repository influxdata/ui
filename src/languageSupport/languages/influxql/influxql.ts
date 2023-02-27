import * as allMonaco from 'monaco-editor/esm/vs/editor/editor.api'

// This file is a modified version of
// https://github.com/microsoft/monaco-editor/blob/136ce723f73b8bd284565c0b7d6d851b52161015/src/basic-languages/pgsql/pgsql.ts

// The rules are referenced from the InfluxQL doc
// https://docs.influxdata.com/influxdb/v2.6/reference/syntax/influxql/spec/

export const conf: allMonaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '--',
    blockComment: ['/*', '*/'],
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
  ],
  autoClosingPairs: [
    {open: '{', close: '}'},
    {open: '[', close: ']'},
    {open: '(', close: ')'},
    {open: '"', close: '"'},
    {open: "'", close: "'"},
  ],
  surroundingPairs: [
    {open: '{', close: '}'},
    {open: '[', close: ']'},
    {open: '(', close: ')'},
    {open: '"', close: '"'},
    {open: "'", close: "'"},
  ],
}

export const language = <allMonaco.languages.IMonarchLanguage>{
  defaultToken: '',
  tokenPostfix: '.influxql',
  ignoreCase: true,

  brackets: [
    {open: '[', close: ']', token: 'delimiter.square'},
    {open: '(', close: ')', token: 'delimiter.parenthesis'},
  ],

  keywords: [
    // InfluxQL Keywords
    // https://github.com/influxdata/influxql/blob/c87e0d6a754823381b1fc1016f40a40c86b23090/token.go#L68-L143
    'ALL',
    'ALTER',
    'ANALYZE',
    'ANY',
    'AS',
    'ASC',
    'BEGIN',
    'BY',
    'CARDINALITY',
    'CREATE',
    'CONTINUOUS',
    'DATABASE',
    'DATABASES',
    'DEFAULT',
    'DELETE',
    'DESC',
    'DESTINATIONS',
    'DIAGNOSTICS',
    'DISTINCT',
    'DROP',
    'DURATION',
    'END',
    'EVERY',
    'EXACT',
    'EXPLAIN',
    'FIELD',
    'FOR',
    'FROM',
    'GRANT',
    'GRANTS',
    'GROUP',
    'GROUPS',
    'IN',
    'INF',
    'INSERT',
    'INTO',
    'KEY',
    'KEYS',
    'KILL',
    'LIMIT',
    'MEASUREMENT',
    'MEASUREMENTS',
    'NAME',
    'OFFSET',
    'ON',
    'ORDER',
    'PASSWORD',
    'POLICY',
    'POLICIES',
    'PRIVILEGES',
    'QUERIES',
    'QUERY',
    'READ',
    'REPLICATION',
    'RESAMPLE',
    'RETENTION',
    'REVOKE',
    'SELECT',
    'SERIES',
    'SET',
    'SHOW',
    'SHARD',
    'SHARDS',
    'SLIMIT',
    'SOFFSET',
    'STATS',
    'SUBSCRIPTION',
    'SUBSCRIPTIONS',
    'TAG',
    'TO',
    'USER',
    'USERS',
    'VALUES',
    'WHERE',
    'WITH',
    'WRITE',
  ],
  operators: [
    // InfluxQL Operators
    // https://github.com/influxdata/influxql/blob/c87e0d6a754823381b1fc1016f40a40c86b23090/token.go#L36-L55
    'ADD', // +
    'SUB', // -
    'MUL', // *
    'DIV', // /
    'MOD', // %
    'BITWISE_AND', // &
    'BITWISE_OR', // |
    'BITWISE_XOR', // ^
    'AND', // AND
    'OR', // OR
    'EQ', // =
    'NEQ', // !=
    'EQREGEX', // =~
    'NEQREGEX', // !~
    'LT', // <
    'LTE', // <=
    'GT', // >
    'GTE', // >=
  ],
  illegal: [
    // ILLEGAL Token, EOF, WS are Special InfluxQL tokens
    // https://github.com/influxdata/influxql/blob/c87e0d6a754823381b1fc1016f40a40c86b23090/token.go#L13-L16
    'ILLEGAL',
    'EOF',
    'WS',
    'COMMENT',
  ],
  literals: [
    // InfluxQL literal tokens
    // https://github.com/influxdata/influxql/blob/c87e0d6a754823381b1fc1016f40a40c86b23090/token.go#L20-L31
    'IDENT', // main
    'BOUNDPARAM', // $param
    'NUMBER', // 12345.67
    'INTEGER', // 12345
    'DURATIONVAL', // 13h
    'STRING', // "abc"
    'BADSTRING', // "abc
    'BADESCAPE', // \q
    'TRUE', // true
    'FALSE', // false
    'REGEX', // Regular expressions
    'BADREGEX', // `.*
  ],
  builtinFunctions: [
    // InfluxQL functions
    // https://docs.influxdata.com/influxdb/v2.6/query-data/influxql/functions/

    // Aggregates
    'COUNT',
    'DISTINCT',
    'INTEGRAL',
    'MEAN',
    'MEDIAN',
    'MODE',
    'SPREAD',
    'STDDEV',
    'SUM',
    // Selectors
    'BOTTOM',
    'FIRST',
    'LAST',
    'MAX',
    'MIN',
    'PERCENTILE',
    'SAMPLE',
    'TOP',
    // Transformations
    'ABS',
    'ACOS',
    'ASIN',
    'ATAN',
    'ATAN2',
    'CEIL',
    'COS',
    'CUMULATIVE_SUM',
    'DERIVATIVE',
    'DIFFERENCE',
    'ELAPSED',
    'EXP',
    'FLOOR',
    'HISTOGRAM',
    'LN',
    'LOG',
    'LOG2',
    'LOG10',
    'MOVING_AVERAGE',
    'NON_NEGATIVE_DERIVATIVE',
    'NON_NEGATIVE_DIFFERENCE',
    'POW',
    'ROUND',
    'SIN',
    'SQRT',
    'TAN',
    // Technical analysis
    'HOLT_WINTERS',
    'CHANDE_MOMENTUM_OSCILLATOR',
    'EXPONENTIAL_MOVING_AVERAGE',
    'DOUBLE_EXPONENTIAL_MOVING_AVERAGE',
    'KAUFMANS_EFFICIENCY_RATIO',
    'KAUFMANS_ADAPTIVE_MOVING_AVERAGE',
    'TRIPLE_EXPONENTIAL_MOVING_AVERAGE',
    'TRIPLE_EXPONENTIAL_DERIVATIVE',
    'RELATIVE_STRENGTH_INDEX',
  ],
  tokenizer: {
    root: [
      // the order of the following operators in increasing precedence
      {include: '@comments'},
      {include: '@whitespace'},
      [/([0-9]+(y|mo|w|d|h|m|s|ms|us|µs|ns))+/, 'literal.duration'],
      {include: '@numbers'},
      {include: '@strings'},
      {include: '@complexIdentifiers'},
      {include: '@delimiters'},
      [/(TRUE|FALSE)/, 'literal.boolean'],
      [
        /[\w@#$]+/,
        {
          cases: {
            '@keywords': 'keyword',
            '@operators': 'operator',
            '@illegal': 'illegal',
            '@literals': 'predefined',
            '@builtinFunctions': 'builtin.function',
            '@default': 'identifier',
          },
        },
      ],
      [/[<>=!%&+\-*/|~^]/, 'operator'],
    ],
    comments: [
      [/--+.*/, 'comment'],
      [/\/\*/, {token: 'comment.quote', next: '@comment'}],
    ],
    comment: [
      [/[^*/]+/, 'comment'],
      // InfluxQL does not support nested multi-line comments
      // https://docs.influxdata.com/influxdb/v2.6/reference/syntax/influxql/spec/#comments
      // [/\/\*/, { token: 'comment.quote', next: '@push' }],    // nested comment not allowed :-(
      [/\*\//, {token: 'comment.quote', next: '@pop'}],
      [/./, 'comment'],
    ],
    whitespace: [[/\s+/, 'white']],
    numbers: [
      [/0[xX][0-9a-fA-F]*/, 'literal.number'],
      [/[$][+-]*\d*(\.\d*)?/, 'literal.number'],
      [/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'literal.number'],
    ],
    strings: [
      // can contain escaped ' (i.e. \')
      // https://docs.influxdata.com/influxdb/v2.6/reference/syntax/influxql/spec/#strings
      [/'((.*)[\\](.*))+'$/, 'literal.string'],
      [/'/, {token: 'literal.string', next: '@string'}],
    ],
    string: [
      [/[^']+/, 'literal.string'],
      [/''/, 'literal.string'],
      [/'/, {token: 'literal.string', next: '@pop'}],
    ],
    complexIdentifiers: [
      // can contain escaped " (i.e. \")
      // https://docs.influxdata.com/influxdb/v2.6/reference/syntax/influxql/spec/#identifiers
      [/"((.*)[\\](.*))+"$/, 'identifier.quote'],
      [/"/, {token: 'identifier.quote', next: '@quotedIdentifier'}],
    ],
    quotedIdentifier: [
      [/[^"]+/, 'identifier.quote'],
      [/""/, 'identifier.quote'],
      [/"/, {token: 'identifier.quote', next: '@pop'}],
    ],
    delimiters: [
      [/[,:;.]/, 'delimiter'],
      [/[\[\]]/, 'delimiter.square'],
      [/[()]/, 'delimiter.parenthesis'],
    ],
  },
}
