import {FluxToolbarFunction} from 'src/types/shared'

export const DOCS_URL_VERSION = !!process.env.CLOUD_URL ? 'cloud' : 'latest'

export const FROM: FluxToolbarFunction = {
  name: 'from',
  args: [
    {
      name: 'bucket',
      desc: 'Name of the bucket to query.',
      type: 'String',
    },
    {
      name: 'bucketID',
      desc: 'String-encoded ID of the bucket to query.',
      type: 'String',
    },
    {
      name: 'host',
      desc:
        'URL of the InfluxDB instance to query (only required when querying a different organization or remote InfluxDB instance).',
      type: 'String',
    },
    {
      name: 'org',
      desc:
        'Organization name (only required when querying a different organization or remote InfluxDB instance).',
      type: 'String',
    },
    {
      name: 'orgID',
      desc:
        'String-encoded organization ID (only required when querying a different organization or remote InfluxDB instance).',
      type: 'String',
    },
    {
      name: 'token',
      desc:
        'InfluxDB authentication token (only required when querying a different organization or remote InfluxDB instance).',
      type: 'String',
    },
  ],
  package: '',
  desc:
    'Used to retrieve data from an InfluxDB data source. It returns a stream of tables from the specified bucket. Each unique series is contained within its own table. Each record in the table represents a single point in the series.',
  example: 'from(bucket: "example-bucket")',
  category: 'Inputs',
  link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/inputs/from/`,
}

export const RANGE: FluxToolbarFunction = {
  name: 'range',
  args: [
    {
      name: 'start',
      desc: 'The earliest time to include in results.',
      type: 'Duration | Time | Integer',
    },
    {
      name: 'stop',
      desc: 'The latest time to include in results. Defaults to `now()`.',
      type: 'Duration | Time | Integer',
    },
  ],
  package: '',
  desc:
    "Filters records based on time bounds. Each input table's records are filtered to contain only records that exist within the time bounds. Each input table's group key value is modified to fit within the time bounds. Tables where all records exists outside the time bounds are filtered entirely.",
  example: 'range(start: -15m, stop: now())',
  category: 'Transformations',
  link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/range/`,
}

export const MEAN: FluxToolbarFunction = {
  name: 'mean',
  args: [
    {
      name: 'column',
      desc: 'The column on which to compute the mean. Defaults to `"_value"`',
      type: 'String',
    },
  ],
  package: '',
  desc: 'Computes the mean or average of non-null records in the input table.',
  example: 'mean(column: "_value")',
  category: 'Aggregates',
  link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/mean/`,
}

export const UNION: FluxToolbarFunction = {
  name: 'union',
  args: [
    {
      name: 'tables',
      desc:
        'Specifies the streams to union together. There must be at least two streams.',
      type: 'Array of Strings',
    },
  ],
  package: '',
  desc:
    'Concatenates two or more input streams into a single output stream. The output schemas of the `union()` function is the union of all input schemas. A sort operation may be added if a specific sort order is needed.',
  example: 'union(tables: [table1, table2])',
  category: 'Transformations',
  link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/union/`,
}

export const MATH_ABS: FluxToolbarFunction = {
  name: 'math.abs',
  args: [
    {
      name: 'x',
      desc: 'The value used in the operation.',
      type: 'Float',
    },
  ],
  package: 'math',
  desc: 'Returns the absolute value of x.',
  example: 'math.abs(x: r._value)',
  category: 'Transformations',
  link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/abs/`,
}

export const MATH_FLOOR: FluxToolbarFunction = {
  name: 'math.floor',
  args: [
    {
      name: 'x',
      desc: 'The value used in the operation.',
      type: 'Float',
    },
  ],
  package: 'math',
  desc: 'Returns the greatest integer value less than or equal to x.',
  example: 'math.floor(x: r._value)',
  category: 'Transformations',
  link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/floor/`,
}

export const STRINGS_TITLE: FluxToolbarFunction = {
  name: 'strings.title',
  args: [
    {
      name: 'v',
      desc: 'The string value to convert.',
      type: 'String',
    },
  ],
  package: 'strings',
  desc: 'Converts a string to title case.',
  example: 'strings.title(v: r._value)',
  category: 'Transformations',
  link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/title/`,
}

export const STRINGS_TRIM: FluxToolbarFunction = {
  name: 'strings.trim',
  args: [
    {
      name: 'v',
      desc: 'The string value to trim.',
      type: 'String',
    },
    {
      name: 'cutset',
      desc:
        'The leading and trailing characters to trim from the string value. Only characters that match exactly are trimmed.',
      type: 'String',
    },
  ],
  package: 'strings',
  desc: 'Removes specified leading and trailing characters from a string.',
  example: 'strings.trim(v: r._value, cutset: "_")',
  category: 'Transformations',
  link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/trim/`,
}

export const FLUX_FUNCTIONS: FluxToolbarFunction[] = [
  {
    name: 'aggregate.rate',
    args: [
      {
        name: 'every',
        desc: 'Duration of windows.',
        type: 'Duration',
      },
      {
        name: 'groupColumns',
        desc: 'List of columns to group by. Defaults to [].',
        type: 'Array of Strings',
      },
      {
        name: 'unit',
        desc:
          'Time duration to use when calculating the rate. Defaults to `1s`.',
        type: 'Duration',
      },
    ],
    package: 'experimental/aggregate',
    desc: 'Calculates the rate of change per windows of time.',
    example: 'aggregate.rate(every: 1m, unit: 1s)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/aggregate/rate/`,
  },
  {
    name: 'aggregateWindow',
    args: [
      {
        name: 'every',
        desc: 'The duration of windows.',
        type: 'Duration',
      },
      {
        name: 'fn',
        desc: 'The aggregate function used in the operation.',
        type: 'Unquoted String',
      },
      {
        name: 'column',
        desc: 'The column on which to operate. Defaults to `"_value"`.',
        type: 'String',
      },
      {
        name: 'timeSrc',
        desc:
          'The "time source" column from which time is copied for the aggregate record. Defaults to `"_stop"`.',
        type: 'String',
      },
      {
        name: 'timeDst',
        desc:
          'The "time destination" column to which time is copied for the aggregate record. Defaults to `"_time"`.',
        type: 'String',
      },
      {
        name: 'createEmpty',
        desc:
          'For windows without data, this will create an empty window and fill it with a `null` aggregate value.',
        type: 'Boolean',
      },
    ],
    package: '',
    desc: 'Applies an aggregate function to fixed windows of time.',
    example: 'aggregateWindow(every: v.windowPeriod, fn: mean)',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/aggregatewindow/`,
  },
  {
    name: 'alerta.alert',
    args: [
      {
        name: 'url',
        desc: 'Alerta URL.',
        type: 'String',
      },
      {
        name: 'apiKey',
        desc: 'Alerta API key.',
        type: 'String',
      },
      {
        name: 'resource',
        desc: 'Resource associated with the alert.',
        type: 'String',
      },
      {
        name: 'event',
        desc: 'Event name.',
        type: 'String',
      },
      {
        name: 'environment',
        desc:
          'Alert environment. Default is `""`. Valid values are `""`, `"Production"`, or `"Development"`.',
        type: 'String',
      },
      {
        name: 'severity',
        desc: 'Event severity.',
        type: 'String',
      },
      {
        name: 'service',
        desc: 'List of affected services. Default is `[]`.',
        type: 'Array of strings',
      },
      {
        name: 'group',
        desc: 'Alerta event group. Default is `""`.',
        type: 'String',
      },
      {
        name: 'value',
        desc: 'Event value. Default is `""`.',
        type: 'String',
      },
      {
        name: 'text',
        desc: 'Alert text description. Default is `""`.',
        type: 'String',
      },
      {
        name: 'tags',
        desc: 'List of event tags. Default is `[]`.',
        type: 'Array of strings',
      },
      {
        name: 'attributes',
        desc: 'Alert attributes.',
        type: 'Record',
      },
      {
        name: 'origin',
        desc: 'Alert origin. Default is `"InfluxDB"`.',
        type: 'String',
      },
      {
        name: 'type',
        desc: 'Event type. Default is `""`.',
        type: 'String',
      },
      {
        name: 'timestamp',
        desc: 'time alert was generated. Default is `now()`.',
        type: 'Time',
      },
    ],
    package: 'contrib/bonitoo-io/alerta',
    desc: 'Sends an alert to Alerta.',
    example: `alerta.alert(
    url: "https://alerta.io:8080/alert",
    apiKey: "0Xx00xxXx00Xxx0x0X",
    resource: "example-resource",
    event: "Example event",
    environment: "",
    severity: "critical",
    service: [],
    group: "",
    value: "",
    text: "",
    tags: [],
    attributes: {},
    origin: "InfluxDB",
    type: "",
    timestamp: now()
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/alerta/alert/`,
  },
  {
    name: 'alerta.endpoint',
    args: [
      {
        name: 'url',
        desc: 'Alerta URL.',
        type: 'String',
      },
      {
        name: 'apiKey',
        desc: 'Alerta API key.',
        type: 'String',
      },
      {
        name: 'environment',
        desc:
          'Alert environment. Default is `""`. Valid values are `""`, `"Production"`, or `"Development"`.',
        type: 'String',
      },
      {
        name: 'origin',
        desc: 'Alert origin. Default is `"InfluxDB"`.',
        type: 'String',
      },
    ],
    package: 'contrib/bonitoo-io/alerta',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = alerta.endpoint(
    url: "https://alerta.io:8080/alert",
    apiKey: apiKey,
    environment: "Production",
    origin: "InfluxDB"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/alerta/endpoint/`,
  },
  {
    name: 'array.from',
    args: [
      {
        name: 'rows',
        desc: 'Array of records to construct a table with.',
        type: 'Array of Objects',
      },
    ],
    package: 'array',
    desc: 'Constructs a table from an array of objects.',
    example:
      'array.from(rows: [{_time: 2020-01-01T00:00:00Z, _value: "foo"},{_time: 2020-01-02T00:00:00Z, _value: "bar"}])',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/array/from/`,
  },
  {
    name: 'bigpanda.endpoint',
    args: [
      {
        name: 'url',
        desc:
          'BigPanda alerts API URL. Default is the value of the `bigpanda.defaultURL` option.',
        type: 'String',
      },
      {
        name: 'token',
        desc: 'BigPanda API Authorization token (API key).',
        type: 'String',
      },
      {
        name: 'appKey',
        desc: 'BigPanda App Key.',
        type: 'String',
      },
    ],
    package: 'contrib/rhajek/bigpanda',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = bigpanda.endpoint(
    token: token,
    appKey: "example-app-key"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/bigpanda/endpoint/`,
  },
  {
    name: 'bigpanda.sendAlert',
    args: [
      {
        name: 'url',
        desc:
          'BigPanda alerts API URL. Default is the value of the `bigpanda.defaultURL` option.',
        type: 'String',
      },
      {
        name: 'token',
        desc: 'BigPanda API Authorization token (API key).',
        type: 'String',
      },
      {
        name: 'appKey',
        desc: 'BigPanda App Key.',
        type: 'String',
      },
      {
        name: 'status',
        desc:
          'BigPanda alert status. Supported statuses are `"ok"`, `"critical"`, `"warning"`, `"acknowledged"`.',
        type: 'String',
      },
      {
        name: 'rec',
        desc: 'Additional alert parameters to send to the BigPanda alert API.',
        type: 'Record',
      },
    ],
    package: 'contrib/rhajek/bigpanda',
    desc: 'Sends an alert to BigPanda.',
    example: `bigpanda.sendAlert(
    url: "https://api.bigpanda.io/data/v2/alerts",
    token: "my5uP3rS3cRe7t0k3n",
    appKey: "example-app-key",
    status: "critical",
    rec: {},
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/bigpanda/sendalert/`,
  },
  {
    name: 'bigpanda.statusFromLevel',
    args: [
      {
        name: 'level',
        desc: 'Alert level.',
        type: 'String',
      },
    ],
    package: 'contrib/rhajek/bigpanda',
    desc: 'Converts an alert level into a BigPanda status.',
    example: 'bigpanda.statusFromLevel(level: "crit")',
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/bigpanda/statusfromlevel/`,
  },
  {
    name: 'bigtable.from',
    args: [
      {
        name: 'token',
        desc:
          'The Google Cloud IAM token to use to access the Cloud Bigtable database.',
        type: 'String',
      },
      {
        name: 'project',
        desc:
          'The project ID of the Cloud Bigtable project to retrieve data from.',
        type: 'String',
      },
      {
        name: 'instance',
        desc:
          'The instance ID of the Cloud Bigtable instance to retrieve data from.',
        type: 'String',
      },
      {
        name: 'table',
        desc: 'The name of the Cloud Bigtable table to retrieve data from.',
        type: 'String',
      },
    ],
    package: 'experimental/bigtable',
    desc: 'Retrieves data from a Google Cloud Bigtable data source.',
    example:
      'bigtable.from(token: "mySuPeRseCretTokEn", project: "exampleProjectID", instance: "exampleInstanceID", table: "example-table")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/bigtable/from/`,
  },
  {
    name: 'bool',
    args: [
      {
        name: 'v',
        desc: 'The value to convert.',
        type: 'String | Integer | UInteger | Float',
      },
    ],
    package: '',
    desc: 'Converts a single value to a boolean.',
    example: 'bool(v: r._value)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/bool/`,
  },
  {
    name: 'bottom',
    args: [
      {
        name: 'n',
        desc: 'The number of rows to return.',
        type: 'Integer',
      },
      {
        name: 'columns',
        desc:
          'List of columns by which to sort. Sort precedence is determined by list order (left to right) .Default is `["_value"]`',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc: 'Sorts a table by columns and keeps only the bottom n rows.',
    example: 'bottom(n:10, columns: ["_value"])',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/bottom/`,
  },
  {
    name: 'buckets',
    args: [],
    package: '',
    desc: 'Returns a list of buckets in the organization.',
    example: 'buckets()',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/inputs/buckets/`,
  },
  {
    name: 'bytes',
    args: [
      {
        name: 'v',
        desc: 'The value to convert.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Converts a single value to bytes.',
    example: 'bytes(v: r._value)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/bytes/`,
  },
  {
    name: 'chandeMomentumOscillator',
    args: [
      {
        name: 'n',
        desc: 'The period or number of points to use in the calculation.',
        type: 'Integer',
      },
      {
        name: 'columns',
        desc: 'Columns to operate on. Defaults to `["_value"]`.',
        type: 'Array of Strings`',
      },
    ],
    package: '',
    desc:
      'Applies the technical momentum indicator developed by Tushar Chande.',
    example: 'chandeMomentumOscillator(n: 10)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/chandemomentumoscillator/`,
  },
  {
    name: 'columns',
    args: [
      {
        name: 'column',
        desc:
          'The name of the output column in which to store the column labels.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Lists the column labels of input tables.',
    example: 'columns(column: "_value")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/columns/`,
  },
  {
    name: 'contains',
    args: [
      {
        name: 'value',
        desc: 'The value to search for.',
        type: 'Boolean | Integer | UInteger | Float | String | Time',
      },
      {
        name: 'set',
        desc: 'The set of values in which to search.',
        type: 'Boolean | Integer | UInteger | Float | String | Time',
      },
    ],
    package: '',
    desc: 'Tests whether a value is a member of a set.',
    example: 'contains(value: 1, set: [1,2,3])',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/tests/contains/`,
  },
  {
    name: 'count',
    args: [
      {
        name: 'column',
        desc: 'The column on which to operate. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Outputs the number of records in the specified column.',
    example: 'count(column: "_value")',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/count/`,
  },
  {
    name: 'cov',
    args: [
      {
        name: 'x',
        desc: 'One input stream used to calculate the covariance.',
        type: 'Object',
      },
      {
        name: 'y',
        desc: 'The other input table used to calculate the covariance.',
        type: 'Object',
      },
      {
        name: 'on',
        desc: 'The list of columns on which to join.',
        type: 'Array of Strings',
      },
      {
        name: 'pearsonr',
        desc:
          'Indicates whether the result should be normalized to be the Pearson R coefficient',
        type: 'Boolean',
      },
    ],
    package: '',
    desc:
      'Computes the covariance between two streams by first joining the streams, then performing the covariance operation.',
    example:
      'cov(x: table1, y: table2, on: ["_time", "_field"], pearsonr: false)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/cov/`,
  },
  {
    name: 'covariance',
    args: [
      {
        name: 'columns',
        desc:
          'A list of columns on which to operate. Exactly two columns must be provided.',
        type: 'Array of Strings',
      },
      {
        name: 'pearsonr',
        desc:
          'Indicates whether the result should be normalized to be the Pearson R coefficient',
        type: 'Boolean',
      },
      {
        name: 'valueDst',
        desc:
          'The column into which the result will be placed. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Computes the covariance between two columns.',
    example:
      'covariance(columns: ["column_x", "column_y"], pearsonr: false, valueDst: "_value")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/covariance/`,
  },
  {
    name: 'csv.from',
    args: [
      {
        name: 'file',
        desc: 'The file path of the CSV file to query.',
        type: 'String',
      },
      {
        name: 'csv',
        desc:
          'Raw CSV-formatted text. CSV data must be in the CSV format produced by the Flux HTTP response standard.',
        type: 'String',
      },
    ],
    package: 'csv',
    desc: 'Retrieves data from a comma-separated value (CSV) data source.',
    example: 'csv.from(csv: csvData)',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/csv/from/`,
  },
  {
    name: 'csv.from',
    args: [
      {
        name: 'url',
        desc: 'The URL to retrieve annotated CSV from.',
        type: 'String',
      },
    ],
    package: 'experimental/csv',
    desc: 'Retrieves annotated CSV data from a URL.',
    example: 'csv.from(url: "http://example.com/data.csv")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/csv/from/`,
  },
  {
    name: 'cumulativeSum',
    args: [
      {
        name: 'columns',
        desc:
          'A list of columns on which to operate. Defaults to `["_value"]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Computes a running sum for non-null records in the table. The output table schema will be the same as the input table.',
    example: 'cumulativeSum(columns: ["_value"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/cumulativesum/`,
  },
  {
    name: 'date.hour',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc: 'Returns the hour of a specified time. Results range from `[0-23]`.',
    example: 'date.hour(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/hour/`,
  },
  {
    name: 'date.microsecond',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the microsecond of a specified time. Results range from `[1-999999]`.',
    example: 'date.microsecond(t: 2019-07-17T12:05:21.012934584Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/microsecond/`,
  },
  {
    name: 'date.millisecond',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the millisecond of a specified time. Results range from `[1-999]`.',
    example: 'date.millisecond(t: 2019-07-17T12:05:21.012934584Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/millisecond/`,
  },
  {
    name: 'date.minute',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the minute of a specified time. Results range from `[0-59]`.',
    example: 'date.minute(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/minute/`,
  },
  {
    name: 'date.month',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc: 'Returns the month of a specified time. Results range from `[1-12]`.',
    example: 'date.month(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/month/`,
  },
  {
    name: 'date.monthDay',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the day of the month for a specified time. Results range from `[1-31]`.',
    example: 'date.monthDay(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/monthday/`,
  },
  {
    name: 'date.nanosecond',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the nanosecond of a specified time. Results range from `[1-999999999]`.',
    example: 'date.nanosecond(t: 2019-07-17T12:05:21.012934584Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/nanosecond/`,
  },
  {
    name: 'date.quarter',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the quarter of the year for a specified time. Results range from `[1-4]`.',
    example: 'date.quarter(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/quarter/`,
  },
  {
    name: 'date.second',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the second of a specified time. Results range from `[0-59]`.',
    example: 'date.second(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/second/`,
  },
  {
    name: 'date.truncate',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
      {
        name: 'unit',
        desc:
          'The unit time to truncate to. Only use `1` and the unit of time to specify the `unit`. For example, `1s`, `1m`, `1h`.',
        type: 'Duration',
      },
    ],
    package: 'date',
    desc:
      'Truncates the time to a specified unit. Results range from `[0-59]`.',
    example: 'date.truncate(t: 2019-07-17T12:05:21.012Z, unit: 1s)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/truncate/`,
  },
  {
    name: 'date.week',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the ISO week of the year for a specified time. Results range from `[1-53]`.',
    example: 'date.week(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/week/`,
  },
  {
    name: 'date.weekDay',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the day of the week for a specified time. Results range from `[0-6]`.',
    example: 'date.weekDay(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/weekday/`,
  },
  {
    name: 'date.year',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc: 'Returns the year of a specified time.',
    example: 'date.year(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/year/`,
  },
  {
    name: 'date.yearDay',
    args: [
      {
        name: 't',
        desc: 'The time to operate on.',
        type: 'Time | Duration',
      },
    ],
    package: 'date',
    desc:
      'Returns the day of the year for a specified time. Results include leap days and range from `[1-366]`.',
    example: 'date.yearDay(t: 2019-07-17T12:05:21.012Z)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/date/yearday/`,
  },
  {
    name: 'derivative',
    args: [
      {
        name: 'unit',
        desc: 'The time duration used when creating the derivative.',
        type: 'Duration',
      },
      {
        name: 'nonNegative',
        desc:
          'Indicates if the derivative is allowed to be negative. When set to `true`, if a value is less than the previous value, it is assumed the previous value should have been a zero.',
        type: 'Boolean',
      },
      {
        name: 'columns',
        desc:
          'A list of columns on which to operate. Defaults to `["_value"]`.',
        type: 'Array of Strings',
      },
      {
        name: 'timeColumn',
        desc: 'The column name for the time values. Defaults to `"_time"`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Computes the rate of change per unit of time between subsequent non-null records. The output table schema will be the same as the input table.',
    example:
      'derivative(unit: 1s, nonNegative: true, columns: ["_value"], timeColumn: "_time")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/derivative/`,
  },
  {
    name: 'dict.fromList',
    args: [
      {
        name: 'pairs',
        desc: 'List of records, each containing `key` and `value` properties.',
        type: 'Array of records',
      },
    ],
    package: 'dict',
    desc:
      'Creates a dictionary from a list of records with `key` and `value` properties.',
    example: `dict.fromList(
    pairs: [
        {key: 1, value: "foo"},
        {key: 2, value: "bar"}
    ]
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/dict/fromlist/`,
  },
  {
    name: 'dict.get',
    args: [
      {
        name: 'dict',
        desc: 'Dictionary to return a value from.',
        type: 'Dictionary',
      },
      {
        name: 'key',
        desc: 'Key to return from the dictionary.',
        type: 'String | Boolean | Integer | Uinteger | Float | Time | Bytes',
      },
      {
        name: 'default',
        desc:
          'Default value to return if the key does not exist in the dictionary. Must be the same type as values in the dictionary.',
        type: 'String | Boolean | Integer | Uinteger | Float | Time | Bytes',
      },
    ],
    package: 'dict',
    desc:
      'Returns the value of a specified key in a dictionary or a default value if the key does not exist.',
    example: `dict.get(
    dict: [1: "foo", 2: "bar"],
    key: 1,
    default: ""
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/dict/get/`,
  },
  {
    name: 'dict.insert',
    args: [
      {
        name: 'dict',
        desc: 'Dictionary to update.',
        type: 'Dictionary',
      },
      {
        name: 'key',
        desc:
          'Key to insert into the dictionary. Must be the same type as existing keys in the dictionary.',
        type: 'String | Boolean | Integer | Uinteger | Float | Time | Bytes',
      },
      {
        name: 'default',
        desc:
          'Value to insert into the dictionary. Must be the same type as existing values in the dictionary.',
        type: 'String | Boolean | Integer | Uinteger | Float | Time | Bytes',
      },
    ],
    package: 'dict',
    desc:
      'Inserts a key value pair into a dictionary and returns a new, updated dictionary. If the key already exists in the dictionary, the function overwrites the existing value.',
    example: `dict.insert(
    dict: [1: "foo", 2: "bar"],
    key: 3,
    value: "baz"
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/dict/insert/`,
  },
  {
    name: 'dict.remove',
    args: [
      {
        name: 'dict',
        desc: 'Dictionary to remove a key-value pair from.',
        type: 'Dictionary',
      },
      {
        name: 'key',
        desc:
          'Key to remove from the dictionary. Must be the same type as existing keys in the dictionary.',
        type: 'String | Boolean | Integer | Uinteger | Float | Time | Bytes',
      },
    ],
    package: 'dict',
    desc:
      'Removes a key value pair from a dictionary and returns an updated dictionary.',
    example: `dict.remove(
    dict: [1: "foo", 2: "bar"],
    key: 1
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/dict/remove/`,
  },
  {
    name: 'difference',
    args: [
      {
        name: 'nonNegative',
        desc:
          'Indicates if the derivative is allowed to be negative. When set to `true`, if a value is less than the previous value, it is assumed the previous value should have been a zero.',
        type: 'Boolean',
      },
      {
        name: 'columns',
        desc:
          'The columns to use to compute the difference. Defaults to `"_value"`.',
        type: 'Array of Strings',
      },
      {
        name: 'keepFirst',
        desc:
          'Indicates the first row should be kept. If `true`, the difference will be `null`. Defaults to `false`.',
        type: 'Boolean',
      },
    ],
    package: '',
    desc:
      'Computes the difference between subsequent non-null records in the specified columns.',
    example: 'difference(nonNegative: false, columns: ["_value"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/difference/`,
  },
  {
    name: 'discord.endpoint',
    args: [
      {
        name: 'webhookToken',
        desc: 'Discord webhook token.',
        type: 'String',
      },
      {
        name: 'webhookID',
        desc: 'Discord webhook ID.',
        type: 'String',
      },
      {
        name: 'username',
        desc: 'Override the Discord webhook’s default username.',
        type: 'String',
      },
      {
        name: 'avatar_url',
        desc: 'Override the Discord webhook’s default avatar.',
        type: 'String',
      },
    ],
    package: 'contrib/chobbs/discord',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = telegram.endpoint(
    webhookToken: discordToken,
    webhookID: "123456789",
    username: "critBot"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/discord/endpoint/`,
  },
  {
    name: 'discord.send',
    args: [
      {
        name: 'webhookToken',
        desc: 'Discord webhook token.',
        type: 'String',
      },
      {
        name: 'webhookID',
        desc: 'Discord webhook ID.',
        type: 'String',
      },
      {
        name: 'username',
        desc: 'Override the Discord webhook’s default username.',
        type: 'String',
      },
      {
        name: 'content',
        desc: 'Message to send to Discord (2000 character limit).',
        type: 'String',
      },
      {
        name: 'avatar_url',
        desc: 'Override the Discord webhook’s default avatar.',
        type: 'String',
      },
    ],
    package: 'contrib/chobbs/discord',
    desc:
      'Sends a single message to a Discord channel using a Discord webhook.',
    example: `discord.send(
    webhookToken: "mySuPerSecRetTokEn",
    webhookID: "123456789",
    username: "username",
    content: "This is an example message",
    avatar_url: "https://example.com/avatar_pic.jpg"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/discord/send/`,
  },
  {
    name: 'distinct',
    args: [
      {
        name: 'column',
        desc: 'Column on which to track unique values.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Returns the unique values for a given column.',
    example: 'distinct(column: "host")',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/distinct/`,
  },
  {
    name: 'doubleEMA',
    args: [
      {
        name: 'n',
        desc: 'The number of points to average.',
        type: 'Integer',
      },
    ],
    package: '',
    desc:
      'Calculates the exponential moving average of values in the `_value` column grouped into `n` number of points, giving more weight to recent data at double the rate of `exponentialMovingAverage()`.',
    example: 'doubleEMA(n: 5)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/doubleema/`,
  },
  {
    name: 'drop',
    args: [
      {
        name: 'columns',
        desc:
          'A list of columns to be removed from the table. Cannot be used with `fn`.',
        type: 'Array of Strings',
      },
      {
        name: 'fn',
        desc:
          'A function which takes a column name as a parameter and returns a boolean indicating whether or not the column should be removed from the table. Cannot be used with `columns`.',
        type: 'Function',
      },
    ],
    package: '',
    desc:
      'Removes specified columns from a table. Columns can be specified either through a list or a predicate function. When a dropped column is part of the group key, it will be removed from the key.',
    example: 'drop(columns: ["col1", "col2"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/drop/`,
  },
  {
    name: 'duplicate',
    args: [
      {
        name: 'column',
        desc: 'The column name to duplicate.',
        type: 'String',
      },
      {
        name: 'as',
        desc: 'The name assigned to the duplicate column.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Duplicates a specified column in a table.',
    example: 'duplicate(column: "column-name", as: "duplicate-name")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/duplicate/`,
  },
  {
    name: 'duration',
    args: [
      {
        name: 'v',
        desc: 'The value to convert.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Converts a single value to a duration.',
    example: 'duration(v: r._value)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/duration/`,
  },
  {
    name: 'elapsed',
    args: [
      {
        name: 'unit',
        desc: 'The unit of time to return. Defaults to `1s`.',
        type: 'Duration',
      },
      {
        name: 'timeColumn',
        desc:
          'The column to use to compute the elapsed time. Defaults to `"_time"`.',
        type: 'String`',
      },
      {
        name: 'columnName',
        desc: 'The column to store elapsed times. Defaults to `"elapsed"`.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Returns the time between subsequent records.',
    example: 'elapsed(unit: 1s)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/elapsed/`,
  },
  {
    name: 'events.duration',
    args: [
      {
        name: 'unit',
        desc:
          'Duration unit of the calculated state duration. Default is `1ns`.',
        type: 'Duration',
      },
      {
        name: 'columnName',
        desc: 'Name of the result column. Default is `"duration"`.',
        type: 'String',
      },
      {
        name: 'timeColumn',
        desc: 'Name of the time column. Default is `"_time"`.',
        type: 'String',
      },
      {
        name: 'stopColumn',
        desc: 'Name of the stop column. Default is `"_stop"`.',
        type: 'String',
      },
      {
        name: 'stop',
        desc:
          'The latest time to use when calculating results. If provided, `stop` overrides the time value in the `stopColumn`.',
        type: 'Time',
      },
    ],
    package: 'contrib/tomhollingworth/events',
    desc:
      'Calculates the duration of events. The function determines the time between a record and the subsequent record and associates the duration with the first record (start of the event).',
    example: `events.duration(
    unit: 1ns,
    columnName: "duration",
    timeColumn: "_time",
    stopColumn: "_stop",
    stop: 2020-01-01T00:00:00Z
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/events/duration/`,
  },
  {
    name: 'experimental.addDuration',
    args: [
      {
        name: 'd',
        desc: 'The duration to add.',
        type: 'Duration',
      },
      {
        name: 'to',
        desc: 'The time to add the duration to.',
        type: 'Time',
      },
    ],
    package: 'experimental',
    desc:
      'Adds a duration to a time value and returns the resulting time value.',
    example: 'experimental.addDuration(d: 12h, to: now())',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/addduration/`,
  },
  {
    name: 'experimental.alignTime',
    args: [
      {
        name: 'alignTo',
        desc: 'UTC time to align tables to. Default is 1970-01-01T00:00:00Z.',
        type: 'Time',
      },
    ],
    package: 'experimental',
    desc: 'Aligns input tables to a common start time.',
    example: 'experimental.alignTime(alignTo: v.timeRangeStart)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/aligntime/`,
  },
  {
    name: 'experimental.chain',
    args: [
      {
        name: 'first',
        desc: 'The first query to execute.',
        type: 'Stream of Tables',
      },
      {
        name: 'second',
        desc: 'The second query to execute.',
        type: 'Stream of Tables',
      },
    ],
    package: 'experimental',
    desc:
      'Executes two queries sequentially rather than in parallel and outputs the results of the second query.',
    example: 'experimental.chain(first: query1, second: query2)',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/chain/`,
  },
  {
    name: 'experimental.count',
    args: [],
    package: 'experimental',
    desc:
      'Outputs the number of records in each input table and returns the count in the `_value` column. This function counts both null and non-null records.',
    example: 'experimental.count()',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/count/`,
  },
  {
    name: 'experimental.distinct',
    args: [],
    package: 'experimental',
    desc:
      'Returns unique values from the `_value` column. The `_value` of each output record is set to a distinct value in the specified column. `null` is considered a distinct value.',
    example: 'experimental.distinct()',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/distinct/`,
  },
  {
    name: 'experimental.fill',
    args: [
      {
        name: 'value',
        desc:
          'Value to replace null values with. Data type must match the type of the `_value` column.',
        type: 'Boolean | Integer | UInteger | Float | String | Time | Duration',
      },
      {
        name: 'usePrevious',
        desc:
          'When `true`, replaces null values with the value of the previous non-null row.',
        type: 'Boolean',
      },
    ],
    package: 'experimental',
    desc:
      'Replaces all null values in the `_value` column with a non-null value.',
    example: 'experimental.fill(value: 0.0)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/fill/`,
  },
  {
    name: 'experimental.first',
    args: [],
    package: 'experimental',
    desc:
      'Returns the first record with a non-null value in the `_value` column.',
    example: 'experimental.first()',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/first/`,
  },
  {
    name: 'experimental.group',
    args: [
      {
        name: 'columns',
        desc:
          'List of columns to use in the grouping operation. Defaults to `[]`.',
        type: 'Array of Strings',
      },
      {
        name: 'mode',
        desc:
          'The mode used to group columns. Only the `extend` mode is available with this function.',
        type: 'String',
      },
    ],
    package: 'experimental',
    desc: 'Introduces an extend mode to the existing `group()` function.',
    example:
      'experimental.group(columns: ["host", "_measurement"], mode: "extend")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/group/`,
  },
  {
    name: 'experimental.histogram',
    args: [
      {
        name: 'bins',
        desc:
          'A list of upper bounds to use when computing the histogram frequencies, including the maximum value of the data set. This value can be set to positive infinity if no maximum is known.',
        type: 'Array of floats',
      },
      {
        name: 'normalize',
        desc:
          'Convert count values into frequency values between 0 and 1. Default is `false`.',
        type: 'Boolean',
      },
    ],
    package: 'experimental',
    desc:
      'Approximates the cumulative distribution of a dataset by counting data frequencies for a list of bins.',
    example: `experimental.histogram(
    bins: [50.0, 75.0, 90.0],
    normalize: false
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/histogram/`,
  },
  {
    name: 'experimental.histogramQuantile',
    args: [
      {
        name: 'quantile',
        desc:
          'A value between 0 and 1 indicating the desired quantile to compute.',
        type: 'Float',
      },
      {
        name: 'minValue',
        desc: 'The assumed minimum value of the dataset.',
        type: 'Float',
      },
    ],
    package: 'experimental',
    desc:
      'Approximates a quantile given a histogram with the cumulative distribution of the dataset.',
    example: `experimental.histogramQuantile(
    quantile: 0.5,
    minValue: 0.0
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/histogramquantile/`,
  },
  {
    name: 'experimental.integral',
    args: [
      {
        name: 'unit',
        desc: 'Time duration used to compute the integral.',
        type: 'Duration',
      },
      {
        name: 'interpolate',
        desc: 'Type of interpolation to use. Defaults to `""`.',
        type: 'String',
      },
    ],
    package: 'experimental',
    desc:
      'Computes the area under the curve per `unit` of time of subsequent non-null records.',
    example: `integral(
    unit: 10s,
    interpolate: ""
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/integral/`,
  },
  {
    name: 'experimental.join',
    args: [
      {
        name: 'left',
        desc: 'First of two streams of tables to join.',
        type: 'Stream of tables',
      },
      {
        name: 'right',
        desc: 'Second of two streams of tables to join.',
        type: 'Stream of tables',
      },
      {
        name: 'fn',
        desc:
          'A function that maps new output rows using left and right input rows.',
        type: 'Function',
      },
    ],
    package: 'experimental',
    desc:
      'Joins two streams of tables on the group key and _time column. Use the fn parameter to map output tables.',
    example:
      'experimental.join(left: left, right: right, fn: (left, right) => ({left with lv: left._value, rv: right._value }))',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/join/`,
  },
  {
    name: 'experimental.kaufmansAMA',
    args: [
      {
        name: 'n',
        desc: 'The period or number of points to use in the calculation.',
        type: 'Integer',
      },
    ],
    package: 'experimental',
    desc:
      'Calculates the Kaufman’s Adaptive Moving Average (KAMA) of input tables using the `_value` column in each table.',
    example: 'experimental.kaufmansAMA(n: 10)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/kaufmansama/`,
  },
  {
    name: 'experimental.last',
    args: [],
    package: 'experimental',
    desc:
      'Returns the last record with a non-null value in the `_value` column.',
    example: 'experimental.last()',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/last/`,
  },
  {
    name: 'experimental.max',
    args: [],
    package: 'experimental',
    desc:
      'Returns the record with the highest value in the `_value` column for each input table.',
    example: 'experimental.max()',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/max/`,
  },
  {
    name: 'experimental.mean',
    args: [],
    package: 'experimental',
    desc:
      'Computes the mean or average of non-null values in the `_value` column of each input table.',
    example: 'experimental.mean()',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/mean/`,
  },
  {
    name: 'experimental.min',
    args: [],
    package: 'experimental',
    desc:
      'Returns the record with the lowest value in the `_value` column for each input table.',
    example: 'experimental.min()',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/min/`,
  },
  {
    name: 'experimental.mode',
    args: [],
    package: 'experimental',
    desc:
      'Computes the mode or value that occurs most often in the `_value` column in each input table.',
    example: 'experimental.mode()',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/mode/`,
  },
  {
    name: 'experimental.objectKeys',
    args: [
      {
        name: 'o',
        desc: 'The object to return keys from.',
        type: 'Object',
      },
    ],
    package: 'experimental',
    desc: 'Returns an array of keys in a specified object.',
    example: 'experimental.objectKeys(o: {key1: "value1", key2: "value2"})',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/objectkeys/`,
  },
  {
    name: 'experimental.quantile',
    args: [
      {
        name: 'q',
        desc: 'A value between 0 and 1 thats specifies the quantile.',
        type: 'Float',
      },
      {
        name: 'method',
        desc:
          'Computation method. Default is `estimate_tdigest`. Available options are `estimate_tdigest`, `exact_mean`, or `exact_selector`.',
        type: 'String',
      },
      {
        name: 'compression',
        desc:
          'Indicates how many centroids to use when compressing the dataset.',
        type: 'Float',
      },
    ],
    package: 'experimental',
    desc:
      'Outputs non-null records with values in the `_value` column that fall within the specified quantile or represent the specified quantile.',
    example: `experimental.quantile(
    q: 0.99,
    method: "estimate_tdigest",
    compression: 1000.0
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/quantile/`,
  },
  {
    name: 'experimental.set',
    args: [
      {
        name: 'o',
        desc: 'An object that defines the columns and values to set.',
        type: 'Object',
      },
    ],
    package: 'experimental',
    desc: 'Sets multiple static column values on all records.',
    example: 'experimental.set(o: {column1: "value1", column2: "value2"})',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/set/`,
  },
  {
    name: 'experimental.skew',
    args: [],
    package: 'experimental',
    desc:
      'Outputs the skew of non-null values in the `_value` column for each input table as a float.',
    example: 'experimental.skew()',
    category: 'Transformation',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/skew/`,
  },
  {
    name: 'experimental.spread',
    args: [],
    package: 'experimental',
    desc:
      'Outputs the difference between the minimum and maximum values in the `_value` column for each input table.',
    example: 'experimental.spread()',
    category: 'Transformation',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/spread/`,
  },
  {
    name: 'experimental.stddev',
    args: [
      {
        name: 'mode',
        desc:
          'The standard deviation mode or type of standard deviation to calculate. Defaults to `"sample"`. Available options are `sample` and `population`.',
        type: 'String',
      },
    ],
    package: 'experimental',
    desc:
      'Computes the standard deviation of non-null values in the `_value` column for each input table.',
    example: 'experimental.stddev(mode: "sample")',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/stddev/`,
  },
  {
    name: 'experimental.subDuration',
    args: [
      {
        name: 'd',
        desc: 'The duration to subtract.',
        type: 'Duration',
      },
      {
        name: 'from',
        desc: 'The time to subtract the duration from.',
        type: 'Time',
      },
    ],
    package: 'experimental',
    desc:
      'Subtracts a duration from a time value and returns the resulting time value.',
    example: 'experimental.subDuration(d: 12h, from: now())',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/subduration/`,
  },
  {
    name: 'experimental.sum',
    args: [],
    package: 'experimental',
    desc:
      'Computes the sum of non-null values in the `_value` column for each input table.',
    example: 'experimental.sum()',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/sum/`,
  },
  {
    name: 'experimental.to',
    args: [
      {
        name: 'bucket',
        desc:
          'The bucket to write data to. `bucket` and `bucketID` are mutually exclusive.',
        type: 'String',
      },
      {
        name: 'bucketID',
        desc:
          'The ID of the bucket to write data to. `bucketID` and `bucket` are mutually exclusive.',
        type: 'String',
      },
      {
        name: 'org',
        desc:
          'The organization name of the specified bucket. `org` and `orgID` are mutually exclusive.',
        type: 'String',
      },
      {
        name: 'orgID',
        desc:
          'The organization ID of the specified bucket. `orgID` and `org` are mutually exclusive.',
        type: 'String',
      },
    ],
    package: 'experimental',
    desc:
      'Writes data to an InfluxDB v2.0 bucket, but in a different structure than the built-in `to()` function.',
    example: 'experimental.to(bucket: "example-bucket", org: "example-org")',
    category: 'Outputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/to/`,
  },
  {
    name: 'exponentialMovingAverage',
    args: [
      {
        name: 'n',
        desc: 'The number of points to average.',
        type: 'Integer',
      },
    ],
    package: '',
    desc:
      'Calculates the exponential moving average of values in the `_value` column grouped into `n` number of points, giving more weight to recent data.',
    example: 'exponentialMovingAverage(n: 5)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/exponentialmovingaverage/`,
  },
  {
    name: 'fill',
    args: [
      {
        name: 'column',
        desc:
          'The column in which to replace null values. Defaults to `"_value"`.',
        type: 'String',
      },
      {
        name: 'value',
        desc: 'The constant value to use in place of nulls.',
        type: 'Value type of `column`',
      },
      {
        name: 'usePrevious',
        desc:
          'When `true`, assigns the value set in the previous non-null row.',
        type: 'Boolean',
      },
    ],
    package: '',
    desc:
      'Replaces all null values in an input stream and replace them with a non-null value.',
    example: 'fill(column: "_value", usePrevious: true)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/fill/`,
  },
  {
    name: 'filter',
    args: [
      {
        name: 'fn',
        desc:
          'A single argument function that evaluates true or false. Records are passed to the function. Those that evaluate to true are included in the output tables.',
        type: 'Function',
      },
      {
        name: 'onEmpty',
        desc:
          'Defines the behavior for empty tables. Potential values are `keep` and `drop`. Defaults to `drop`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Filters data based on conditions defined in the function. The output tables have the same schema as the corresponding input tables.',
    example: 'filter(fn: (r) => r._measurement == "cpu")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/filter/`,
  },
  {
    name: 'findColumn',
    args: [
      {
        name: 'fn',
        desc: 'Predicate function for matching keys in a table’s group key.',
        type: 'Function',
      },
      {
        name: 'column',
        desc: 'Name of the column to extract.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Returns an array of values in a specified column from the first table in a stream of tables where the group key values match the specified predicate.',
    example: 'findColumn(fn: (key) => key.host == "host1", column: "_value")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/stream-table/findcolumn/`,
  },
  {
    name: 'findRecord',
    args: [
      {
        name: 'fn',
        desc: 'Predicate function for matching keys in a table’s group key.',
        type: 'Function',
      },
      {
        name: 'idx',
        desc: 'Index of the record to extract.',
        type: 'Integer',
      },
    ],
    package: '',
    desc:
      'Returns a record at a specified index from the first table in a stream of tables where the group key values match the specified predicate.',
    example: 'findRecord(fn: (key) => key.host == "host1", idx: 0)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/stream-table/findrecord/`,
  },
  {
    name: 'first',
    args: [],
    package: '',
    desc: 'Selects the first non-null record from an input table.',
    example: 'first()',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/first/`,
  },
  {
    name: 'float',
    args: [
      {
        name: 'v',
        desc: 'The value to convert.',
        type: 'String | Integer | UInteger | Boolean',
      },
    ],
    package: '',
    desc: 'Converts a single value to a float.',
    example: 'float(v: r._value)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/float/`,
  },
  FROM,
  {
    name: 'geo.asTracks',
    args: [
      {
        name: 'groupBy',
        desc: 'Columns to group by. They should uniquely identify each track.',
        type: 'Array of Strings',
      },
      {
        name: 'orderBy',
        desc: 'Columns to order results by.',
        type: 'Array of Strings',
      },
    ],
    package: 'experimental/geo',
    desc:
      'Groups geo-temporal data into tracks (sequential, related data points).',
    example: 'geo.asTracks(groupBy: ["id","tid"], orderBy: ["_time"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/astracks/`,
  },
  {
    name: 'geo.filterRows',
    args: [
      {
        name: 'region',
        desc: 'Region containing the desired data points.',
        type: 'Object',
      },
      {
        name: 'minSize',
        desc:
          'Minimum number of cells that cover the specified region. Default is `24`',
        type: 'Integer',
      },
      {
        name: 'maxSize',
        desc:
          'Maximum number of cells that cover the specified region. Default is `-1`.',
        type: 'Object',
      },
      {
        name: 'level',
        desc: 'S2 cell level of grid cells. Default is `-1`',
        type: 'Integer',
      },
      {
        name: 's2CellIDLevel',
        desc: 'S2 Cell level used in `s2_cell_id` tag. Default is `-1`.',
        type: 'Integer',
      },
      {
        name: 'strict',
        desc: 'Enable strict geographic data filtering. Default is `true`',
        type: 'Boolean',
      },
    ],
    package: 'experimental/geo',
    desc:
      'Filters data by a specified geographic region with the option of strict filtering.',
    example:
      'geo.filterRows(region: {lat: 37.7858229, lon: -122.4058124, radius: 20.0}, strict: true)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/filterrows/`,
  },
  {
    name: 'geo.gridFilter',
    args: [
      {
        name: 'region',
        desc: 'Region containing the desired data points.',
        type: 'Object',
      },
      {
        name: 'minSize',
        desc:
          'Minimum number of cells that cover the specified region. Default is `24`',
        type: 'Integer',
      },
      {
        name: 'maxSize',
        desc:
          'Maximum number of cells that cover the specified region. Default is `-1`.',
        type: 'Object',
      },
      {
        name: 'level',
        desc: 'S2 cell level of grid cells. Default is `-1`',
        type: 'Integer',
      },
      {
        name: 's2CellIDLevel',
        desc: 'S2 Cell level used in `s2_cell_id` tag. Default is `-1`.',
        type: 'Integer',
      },
    ],
    package: 'experimental/geo',
    desc:
      'Filters data by a specified geographic region using S2 geometry grid cells.',
    example:
      'geo.gridFilter(region: {lat: 37.7858229, lon: -122.4058124, radius: 20.0})',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/gridfilter/`,
  },
  {
    name: 'geo.groupByArea',
    args: [
      {
        name: 'newColumn',
        desc:
          'Name of the new column that stores the unique identifier for a geographic area.',
        type: 'String',
      },
      {
        name: 'level',
        desc:
          'S2 Cell level used to determine the size of each geographic area.',
        type: 'Integer',
      },
      {
        name: 's2cellIDLevel',
        desc: 'S2 Cell level used in `s2_cell_id` tag. Default is `-1`.',
        type: 'Integer',
      },
    ],
    package: 'experimental/geo',
    desc: 'Groups rows by geographic area using S2 geometry grid cells.',
    example: 'geo.groupByArea(newColumn: "geoArea", level: 10)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/groupbyarea/`,
  },
  {
    name: 'geo.s2CellIDToken',
    args: [
      {
        name: 'point',
        desc:
          'Longitude and latitude in decimal degrees (WGS 84) to use when generating the S2 cell ID token. Object must contain `lat` and `lon` properties.',
        type: 'Object',
      },
      {
        name: 'token',
        desc: 'S2 cell ID token to update.',
        type: 'String',
      },
      {
        name: 'level',
        desc: 'S2 cell level to use when generating the S2 cell ID token.',
        type: 'Integer',
      },
    ],
    package: 'experimental/geo',
    desc: 'Returns an S2 cell ID token.',
    example:
      'geo.s2CellIDToken(point: {lat: 37.7858229, lon: -122.4058124}, level: 10)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/s2cellidtoken/`,
  },
  {
    name: 'geo.s2CellLatLon',
    args: [
      {
        name: 'token',
        desc: 'S2 cell ID token.',
        type: 'String',
      },
    ],
    package: 'experimental/geo',
    desc: 'Returns the latitude and longitude of the center of an S2 cell.',
    example: 'geo.s2CellLatLon(token: "89c284")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/s2celllatlon/`,
  },
  {
    name: 'geo.shapeData',
    args: [
      {
        name: 'latField',
        desc: 'Name of existing latitude field.',
        type: 'String',
      },
      {
        name: 'lonField',
        desc: 'Name of existing longitude field.',
        type: 'String',
      },
      {
        name: 'level',
        desc: 'S2 cell level to use when generating the S2 cell ID token.',
        type: 'Integer',
      },
    ],
    package: 'experimental/geo',
    desc:
      'Renames existing latitude and longitude fields to `lat` and `lon` and adds an `s2_cell_id` tag.',
    example:
      'geo.shapeData(latField: "latitude", lonField: "longitude", level: 10)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/shapedata/`,
  },
  {
    name: 'geo.ST_Contains',
    args: [
      {
        name: 'region',
        desc: 'Region to test.',
        type: 'Object',
      },
      {
        name: 'geometry',
        desc:
          'GIS geometry to test. Can be either point or linestring geometry.',
        type: 'Object',
      },
    ],
    package: 'experimental/geo',
    desc: 'Tests if the region contains the GIS geometry.',
    example:
      'geo.ST_Contains(region: {lat: 40.7, lon: -73.3, radius: 20.0}, geometry: {lon: 39.7515, lat: 15.08433})',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/st_contains/`,
  },
  {
    name: 'geo.ST_Distance',
    args: [
      {
        name: 'region',
        desc: 'Region to test.',
        type: 'Object',
      },
      {
        name: 'geometry',
        desc:
          'GIS geometry to test. Can be either point or linestring geometry.',
        type: 'Object',
      },
    ],
    package: 'experimental/geo',
    desc: 'Returns the distance between the region and GIS geometry.',
    example:
      'geo.ST_Distance(region: {lat: 40.7, lon: -73.3, radius: 20.0}, geometry: {lon: 39.7515, lat: 15.08433})',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/st_distance/`,
  },
  {
    name: 'geo.ST_DWithin',
    args: [
      {
        name: 'region',
        desc: 'Region to test.',
        type: 'Object',
      },
      {
        name: 'geometry',
        desc:
          'GIS geometry to test. Can be either point or linestring geometry.',
        type: 'Object',
      },
      {
        name: 'distance',
        desc: 'Maximum distance allowed between the region and geometry.',
        type: 'Float',
      },
    ],
    package: 'experimental/geo',
    desc: 'Tests if a region is within a specified distance from GIS geometry.',
    example:
      'geo.ST_DWithin(region: {lat: 40.7, lon: -73.3, radius: 20.0}, geometry: {lon: 39.7515, lat: 15.08433}, distance: 1000.0)',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/st_dwithin/`,
  },
  {
    name: 'geo.ST_Intersects',
    args: [
      {
        name: 'region',
        desc: 'Region to test.',
        type: 'Object',
      },
      {
        name: 'geometry',
        desc:
          'GIS geometry to test. Can be either point or linestring geometry.',
        type: 'Object',
      },
    ],
    package: 'experimental/geo',
    desc: 'Tests if a region intersects with GIS geometry.',
    example:
      'geo.ST_Intersects(region: {lat: 40.7, lon: -73.3, radius: 20.0}, geometry: {linestring: "39.7515 14.01433, 38.3527 13.9228, 36.9978 15.08433"})',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/st_intersects/`,
  },
  {
    name: 'geo.ST_Length',
    args: [
      {
        name: 'geometry',
        desc:
          'GIS geometry to test. Can be either point or linestring geometry.',
        type: 'Object',
      },
    ],
    package: 'experimental/geo',
    desc: 'Returns the spherical length of GIS geometry.',
    example:
      'geo.ST_Length(geometry: {linestring: "39.7515 14.01433, 38.3527 13.9228, 36.9978 15.08433"})',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/st_length/`,
  },
  {
    name: 'geo.ST_LineString',
    args: [],
    package: 'experimental/geo',
    desc: 'Converts a series of geographic points into linestring',
    example: 'geo.ST_LineString()',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/st_linestring/`,
  },
  {
    name: 'geo.strictFilter',
    args: [
      {
        name: 'region',
        desc: 'Region containing the desired data points.',
        type: 'Object',
      },
    ],
    package: 'experimental/geo',
    desc: 'Filters data by latitude and longitude in a specified region.',
    example:
      'geo.strictFilter(region: {lat: 37.7858229, lon: -122.4058124, radius: 20.0})',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/strictfilter/`,
  },
  {
    name: 'geo.toRows',
    args: [],
    package: 'experimental/geo',
    desc:
      'Pivots geo-temporal data into row-wise sets based on time and other correlation columns.',
    example: 'geo.toRows()',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/geo/torows/`,
  },
  {
    name: 'getColumn',
    args: [
      {
        name: 'column',
        desc: 'The name of the column to extract.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Extracts a column from a table given its label. If the label is not present in the set of columns, the function errors.',
    example: 'getColumn(column: "_value")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/stream-table/getcolumn/`,
  },
  {
    name: 'getRecord',
    args: [
      {
        name: 'idx',
        desc: 'The index of the record to extract.',
        type: 'Integer',
      },
    ],
    package: '',
    desc:
      'Extracts a record from a table given the record’s index. If the index is out of bounds, the function errors.',
    example: 'getRecord(idx: 0)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/stream-table/getrecord/`,
  },
  {
    name: 'group',
    args: [
      {
        name: 'columns',
        desc:
          'List of columns to use in the grouping operation. Defaults to `[]`.',
        type: 'Array of Strings',
      },
      {
        name: 'mode',
        desc:
          'The mode used to group columns. The following options are available: by, except. Defaults to `"by"`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Groups records based on their values for specific columns. It produces tables with new group keys based on provided properties.',
    example: 'group(columns: ["host", "_measurement"], mode:"by")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/group/`,
  },
  {
    name: 'highestAverage',
    args: [
      {
        name: 'n',
        desc: 'Number of records to return.',
        type: 'Integer',
      },
      {
        name: 'column',
        desc: 'Column by which to sort. Default is `"_value"`.',
        type: 'String',
      },
      {
        name: 'groupColumns',
        desc:
          'The columns on which to group before performing the aggregation. Default is `[]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Returns the top `n` records from all groups using the average of each group.',
    example: 'highestAverage(n:10, groupColumns: ["host"])',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/highestaverage/`,
  },
  {
    name: 'highestCurrent',
    args: [
      {
        name: 'n',
        desc: 'Number of records to return.',
        type: 'Integer',
      },
      {
        name: 'column',
        desc: 'Column by which to sort. Default is `"_value"`.',
        type: 'String',
      },
      {
        name: 'groupColumns',
        desc:
          'The columns on which to group before performing the aggregation. Default is `[]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Returns the top `n` records from all groups using the last value of each group.',
    example: 'highestCurrent(n:10, groupColumns: ["host"])',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/highestcurrent/`,
  },
  {
    name: 'highestMax',
    args: [
      {
        name: 'n',
        desc: 'Number of records to return.',
        type: 'Integer',
      },
      {
        name: 'column',
        desc: 'Column by which to sort. Default is `"_value"`.',
        type: 'String',
      },
      {
        name: 'groupColumns',
        desc:
          'The columns on which to group before performing the aggregation. Default is `[]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Returns the top `n` records from all groups using the maximum of each group.',
    example: 'highestMax(n:10, groupColumns: ["host"])',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/highestmax/`,
  },
  {
    name: 'histogram',
    args: [
      {
        name: 'column',
        desc:
          'The name of a column containing input data values. The column type must be float. Defaults to `"_value"`.',
        type: 'Strings',
      },
      {
        name: 'upperBoundColumn',
        desc:
          'The name of the column in which to store the histogram\'s upper bounds. Defaults to `"le"`.',
        type: 'String',
      },
      {
        name: 'countColumn',
        desc:
          'The name of the column in which to store the histogram counts. Defaults to `"_value"`.',
        type: 'String',
      },
      {
        name: 'bins',
        desc:
          'A list of upper bounds to use when computing the histogram frequencies. Each element in the array should contain a float value that represents the maximum value for a bin.',
        type: 'Array of Floats',
      },
      {
        name: 'normalize',
        desc:
          'When `true`, will convert the counts into frequency values between 0 and 1. Defaults to `false`.',
        type: 'Boolean',
      },
    ],
    package: '',
    desc:
      'Approximates the cumulative distribution function of a dataset by counting data frequencies for a list of buckets.',
    example:
      'histogram(column: "_value", upperBoundColumn: "le", countColumn: "_value", bins: [50.0, 75.0, 90.0], normalize: false)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/histogram/`,
  },
  {
    name: 'histogramQuantile',
    args: [
      {
        name: 'quantile',
        desc:
          'A value between 0 and 1 indicating the desired quantile to compute.',
        type: 'Float',
      },
      {
        name: 'countColumn',
        desc:
          'The name of the column in which to store the histogram counts. The count column type must be float. Defaults to `"_value"`.',
        type: 'String',
      },
      {
        name: 'upperBoundColumn',
        desc:
          'The name of the column in which to store the histogram\'s upper bounds. The count column type must be float. Defaults to `"le"`.',
        type: 'String',
      },
      {
        name: 'valueColumn',
        desc:
          'The name of the output column which will contain the computed quantile. Defaults to `"_value"`.',
        type: 'String',
      },
      {
        name: 'minValue',
        desc:
          'The assumed minimum value of the dataset. When the quantile falls below the lowest upper bound, interpolation is performed between `minValue` and the lowest upper bound. When `minValue` is equal to negative infinity, the lowest upper bound is used. Defaults to `0`.',
        type: 'Float',
      },
    ],
    package: '',
    desc:
      'Approximates a quantile given a histogram that approximates the cumulative distribution of the dataset.',
    example:
      'histogramQuantile(quantile: 0.5, countColumn: "_value", upperBoundColumn: "le", valueColumn: "_value", minValue: 0.0)',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/histogramquantile/`,
  },
  {
    name: 'holtWinters',
    args: [
      {
        name: 'n',
        desc: 'Number of values to predict.',
        type: 'Integer',
      },
      {
        name: 'seasonality',
        desc: 'Number of points in a season. Defaults to `0`.',
        type: 'Integer',
      },
      {
        name: 'interval',
        desc: 'The interval between two data points.',
        type: 'Duration',
      },
      {
        name: 'withFit',
        desc:
          'Returns "fitted" data points in results when `withFit` is set to `true`. Defaults to `false`.',
        type: 'Boolean',
      },
      {
        name: 'timeColumn',
        desc: 'The time column to use. Defaults to `"_time"`.',
        type: 'String',
      },
      {
        name: 'column',
        desc: 'The column to operate on. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Applies the Holt-Winters forecasting method to input tables. The Holt-Winters method predicts `n` seasonally-adjusted values for the specified `column` at the specified `interval`.',
    example: 'holtWinters(n: 10, interval: 1d)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/holtwinters/`,
  },
  {
    name: 'hourSelection',
    args: [
      {
        name: 'start',
        desc:
          'The first hour of the hour range (inclusive). Hours range from `[0-23]`',
        type: 'Integer',
      },
      {
        name: 'stop',
        desc:
          'The last hour of the hour range (inclusive). Hours range from `[0-23]`.',
        type: 'Integer`',
      },
      {
        name: 'timeColumn',
        desc: 'The column that contains the time value. Default is `"_time"`.',
        type: 'String`',
      },
    ],
    package: '',
    desc:
      'Retains all rows with time values in a specified hour range. Hours are specified in military time.',
    example: 'hourSelection(start: 9, stop: 17)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/hourselection/`,
  },
  {
    name: 'http.basicAuth',
    args: [
      {
        name: 'u',
        desc: 'The username to use in the basic authentication header.',
        type: 'String',
      },
      {
        name: 'p',
        desc: 'The password to use in the basic authentication header.',
        type: 'String',
      },
    ],
    package: 'http',
    desc:
      'Returns a Base64-encoded basic authentication header using a specified username and password combination.',
    example: `http.basicAuth(
    u: "username",
    p: "passw0rd"
)`,
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/http/basicauth/`,
  },
  {
    name: 'http.endpoint',
    args: [
      {
        name: 'url',
        desc: 'The URL to POST to.',
        type: 'String',
      },
    ],
    package: 'http',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = http.endpoint(
    url: "http://localhost:1234/"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/http/endpoint/`,
  },
  {
    name: 'http.get',
    args: [
      {
        name: 'url',
        desc: 'The URL to send the GET request to.',
        type: 'String',
      },
      {
        name: 'headers',
        desc: 'Headers to include with the GET request.',
        type: 'Object',
      },
      {
        name: 'timeout',
        desc: 'Timeout for the GET request. Default is `30s`.',
        type: 'Duration',
      },
    ],
    package: 'experimental/http',
    desc:
      'Submits an HTTP GET request to the specified URL and returns the HTTP status code, response body, and response headers.',
    example:
      'http.get(url: "https://docs.influxdata.com/influxdb/v2.0/", headers: {foo: "bar"})',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/http/get/`,
  },
  {
    name: 'http.pathEscape',
    args: [
      {
        name: 'inputString',
        desc: 'The string to escape.',
        type: 'String',
      },
    ],
    package: 'http',
    desc:
      'Escapes special characters in a string and replaces non-ASCII characters with hexadecimal representations (%XX).',
    example: 'http.pathEscape(inputString: "/this/is/an/example-path.html")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/http/pathescape/`,
  },
  {
    name: 'http.post',
    args: [
      {
        name: 'url',
        desc: 'The URL to POST to.',
        type: 'String',
      },
      {
        name: 'headers',
        desc: 'Headers to include with the POST request.',
        type: 'Object',
      },
      {
        name: 'data',
        desc: 'The data body to include with the POST request.',
        type: 'Bytes',
      },
    ],
    package: 'http',
    desc:
      'Submits an HTTP POST request to the specified URL with headers and data and returns the HTTP status code.',
    example:
      'http.post(url: "http://localhost:8086/", headers: {x:"a", y:"b"}, data: bytes(v: "body"))',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/http/post/`,
  },
  {
    name: 'increase',
    args: [
      {
        name: 'columns',
        desc:
          'List of columns to use in the operation. Defaults to `["_value"]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Computes the total non-negative difference between values in a table.',
    example: 'increase(columns: ["_value"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/increase/`,
  },
  {
    name: 'influxdb.api',
    args: [
      {
        name: 'method',
        desc: 'HTTP request method.',
        type: 'String',
      },
      {
        name: 'path',
        desc: 'InfluxDB API path.',
        type: 'String',
      },
      {
        name: 'host',
        desc:
          'InfluxDB host URL (Required when executed outside of InfluxDB). Default is `""`.',
        type: 'String',
      },
      {
        name: 'token',
        desc:
          'InfluxDB host URL (Required when executed outside of InfluxDB). Default is `""`.',
        type: 'String',
      },
      {
        name: 'headers',
        desc: 'HTTP request headers.',
        type: 'Dictionary',
      },
      {
        name: 'query',
        desc: 'URL query parameters.',
        type: 'Dictionary',
      },
      {
        name: 'timeout',
        desc: 'HTTP request timeout. Default is `30s`.',
        type: 'Duration',
      },
      {
        name: 'body',
        desc: 'HTTP request body as bytes.',
        type: 'Bytes',
      },
    ],
    package: 'experimental/influxdb',
    desc:
      'Submits an HTTP request to the specified InfluxDB API path and returns a record containing the HTTP status code, response headers, and response body as a byte array.',
    example: `influxdb.api(
    method: "get",
    path: "/example",
    host: "http://localhost:8086",
    token: "mySupeR53cre7t0k3n",
    headers: ["header1": "header1Value", "header2": "header2Value"],
    query: ["ex1": "example1", "ex2": "example2"],
    timeout: 30s,
    body: bytes(v: "Example body")
)`,
    category: 'Outputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/influxdb/api/`,
  },
  {
    name: 'influxdb.cardinality',
    args: [
      {
        name: 'bucket',
        desc: 'Bucket to query cardinality from.',
        type: 'String',
      },
      {
        name: 'bucketID',
        desc: 'Bucket ID to query cardinality from.',
        type: 'String',
      },
      {
        name: 'org',
        desc: 'InfluxDB organization.',
        type: 'String',
      },
      {
        name: 'orgID',
        desc: 'InfluxDB organization ID.',
        type: 'String',
      },
      {
        name: 'host',
        desc: 'URL of the InfluxDB instance to query.',
        type: 'String',
      },
      {
        name: 'token',
        desc: 'InfluxDB authorization token.',
        type: 'String',
      },
      {
        name: 'start',
        desc: 'The earliest time to include when calculating cardinality.',
        type: 'Duration | Time',
      },
      {
        name: 'stop',
        desc: 'The latest time to include when calculating cardinality.',
        type: 'Duration | Time',
      },
      {
        name: 'predicate',
        desc:
          'Predicate function that filters records. Default is `(r) => true.`',
        type: 'Function',
      },
    ],
    package: 'influxdata/influxdb',
    desc: 'Returns the series cardinality of data in InfluxDB.',
    example: 'influxdb.cardinality(bucket: "example-bucket", start: -1h)',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb/cardinality/`,
  },
  {
    name: 'influxdb.select',
    args: [
      {
        name: 'from',
        desc: 'Name of the bucket to query.',
        type: 'String',
      },
      {
        name: 'start',
        desc:
          'Earliest time to include in results. Results include points that match the specified start time.',
        type: 'Duration | Time | Integer',
      },
      {
        name: 'stop',
        desc:
          'Latest time to include in results. Results exclude points that match the specified stop time.',
        type: 'Duration | Time | Integer',
      },
      {
        name: 'm',
        desc: 'Name of the measurement to query.',
        type: 'String',
      },
      {
        name: 'fields',
        desc:
          'List of fields to query. Returns all fields when list is empty or unspecified. Defaults to `[]`.',
        type: 'Array of Strings',
      },
      {
        name: 'where',
        desc:
          'A single argument predicate function that evaluates true or false and filters results based on tag values. Defaults to `(r) => true`.',
        type: 'Function',
      },
      {
        name: 'host',
        desc: 'URL of the InfluxDB instance to query. See InfluxDB URLs.',
        type: 'String',
      },
      {
        name: 'org',
        desc: 'Organization name.',
        type: 'String',
      },
      {
        name: 'token',
        desc: 'InfluxDB authentication token.',
        type: 'String',
      },
    ],
    package: 'contrib/jsternberg/influxdb',
    desc:
      'an alternate implementation of `from()`, `range()`, `filter()` and `pivot()` that returns pivoted query results and masks the `_measurement`, `_start`, and `_stop` columns.',
    example: `influxdb.select(
    from: "example-bucket",
    start: -1d,
    stop: now(),
    m: "example-measurement",
    fields: [],
    where: (r) => true,
    host: "https://example.com",
    org: "example-org",
    token: "MySuP3rSecr3Tt0k3n"
)`,
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/influxdb/select/`,
  },
  {
    name: 'int',
    args: [
      {
        name: 'v',
        desc: 'The value to convert.',
        type: 'Boolean | Duration | Float | Numeric String | Time | Uinteger',
      },
    ],
    package: '',
    desc: 'Converts a single value to a integer.',
    example: 'int(v: r._value)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/int/`,
  },
  {
    name: 'integral',
    args: [
      {
        name: 'unit',
        desc: 'The time duration used when computing the integral.',
        type: 'Duration',
      },
      {
        name: 'column',
        desc: 'The column on which to operate. Defaults to `"_value"`.',
        type: 'String',
      },
      {
        name: 'timeColumn',
        desc:
          'Column that contains time values to use in the operation. Defaults to `"_time"`.',
        type: 'String',
      },
      {
        name: 'interpolate',
        desc: 'Type of interpolation to use. Defaults to `""`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Computes the area under the curve per unit of time of subsequent non-null records. The curve is defined using `_time` as the domain and record values as the range.',
    example: 'integral(unit: 10s, column: "_value")',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/integral/`,
  },
  {
    name: 'interpolate.linear',
    args: [
      {
        name: 'every',
        desc: 'Duration of time between interpolated points.',
        type: 'Duration',
      },
    ],
    package: 'interpolate',
    desc:
      'Inserts rows at regular intervals using linear interpolation to determine values for inserted rows.',
    example: 'interpolate.linear(every: 1m)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/interpolate/linear/`,
  },
  {
    name: 'join',
    args: [
      {
        name: 'tables',
        desc: 'The map of streams to be joined.',
        type: 'Object',
      },
      {
        name: 'on',
        desc: 'The list of columns on which to join.',
        type: 'Array of Strings',
      },
      {
        name: 'method',
        desc:
          'The method used to join. Possible values are: `inner`, `cross`, `left`, `right`, or `full`. Defaults to `"inner"`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Merges two or more input streams, whose values are equal on a set of common columns, into a single output stream. The resulting schema is the union of the input schemas. The resulting group key is the union of the input group keys.',
    example:
      'join(tables: {key1: table1, key2: table2}, on: ["_time", "_field"], method: "inner")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/join/`,
  },
  {
    name: 'json.encode',
    args: [
      {
        name: 'v',
        desc: 'The value to encode.',
        type: 'Boolean | Duration | Float | Integer | String | Time | UInteger',
      },
    ],
    package: 'json',
    desc: 'Converts a value into JSON bytes.',
    example: 'json.encode(v: r._value)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/json/encode/`,
  },
  {
    name: 'json.parse',
    args: [
      {
        name: 'data',
        desc: 'JSON data to parse.',
        type: 'Bytes',
      },
    ],
    package: 'experimental/json',
    desc: 'Takes JSON data as bytes and returns a value.',
    example: 'json.parse(data: bytes(v: "{"a":1,"b":2,"c":3}"))',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/json/parse/`,
  },
  {
    name: 'kaufmansAMA',
    args: [
      {
        name: 'n',
        desc: 'The period or number of points to use in the calculation.',
        type: 'Integer',
      },
      {
        name: 'column',
        desc: 'The column to operate on. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Calculates Kaufman’s Adaptive Moving Average (KAMA) using values in an input table.',
    example: 'kaufmansAMA(n: 5)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/kaufmansama/`,
  },
  {
    name: 'kaufmansER',
    args: [
      {
        name: 'n',
        desc: 'The period or number of points to use in the calculation.',
        type: 'Integer',
      },
    ],
    package: '',
    desc:
      'Calculates the Kaufman’s Efficiency Ratio (KER) using values in an input table.',
    example: 'kaufmansER(n: 5)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/kaufmanser/`,
  },
  {
    name: 'keep',
    args: [
      {
        name: 'columns',
        desc:
          'Columns that should be included in the resulting table. Cannot be used with `fn`.',
        type: 'Array of Strings',
      },
      {
        name: 'fn',
        desc:
          'A predicate function which takes a column name as a parameter and returns a boolean indicating whether or not the column should be removed from the table. Cannot be used with `columns`.',
        type: 'Function',
      },
    ],
    package: '',
    desc:
      'Returns a table containing only the specified columns, ignoring all others. Only columns in the group key that are also specified in the `keep()` function will be kept in the resulting group key. It is the inverse of `drop`.',
    example: 'keep(columns: ["col1", "col2"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/keep/`,
  },
  {
    name: 'keys',
    args: [
      {
        name: 'column',
        desc:
          'Column is the name of the output column to store the group key labels. Defaults to `_value`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      "Outputs the group key of input tables. For each input table, it outputs a table with the same group key columns, plus a _value column containing the labels of the input table's group key.",
    example: 'keys(column: "_value")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/keys/`,
  },
  {
    name: 'keyValues',
    args: [
      {
        name: 'keyColumns',
        desc:
          'A list of columns from which values are extracted. All columns indicated must be of the same type.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      "Returns a table with the input table's group key plus two columns, `_key` and `_value`, that correspond to unique column + value pairs from the input table.",
    example: 'keyValues(keyColumns: ["usage_idle", "usage_user"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/keyvalues/`,
  },
  {
    name: 'last',
    args: [],
    package: '',
    desc: 'Selects the last non-null record from an input table.',
    example: 'last()',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/last/`,
  },
  {
    name: 'length',
    args: [
      {
        name: 'arr',
        desc: 'The array to evaluate.',
        type: 'Array',
      },
    ],
    package: '',
    desc: 'Returns the number of items in an array.',
    example: 'length(arr: ["john"])',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/misc/length/`,
  },
  {
    name: 'limit',
    args: [
      {
        name: 'n',
        desc: 'The maximum number of records to output.',
        type: 'Integer',
      },
      {
        name: 'offset',
        desc:
          'The number of records to skip at the beginning of a table before limiting to `n`. Defaults to `0`.',
        type: 'Integer',
      },
    ],
    package: '',
    desc:
      'Limits each output table to the first `n` records, excluding the offset.',
    example: 'limit(n:10, offset: 0)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/limit/`,
  },
  {
    name: 'linearBins',
    args: [
      {
        name: 'start',
        desc: 'The first value in the returned list.',
        type: 'Float',
      },
      {
        name: 'width',
        desc: 'The distance between subsequent bin values.',
        type: 'Float',
      },
      {
        name: 'count',
        desc: 'The number of bins to create.',
        type: 'Integer',
      },
      {
        name: 'infinity',
        desc:
          'When `true`, adds an additional bin with a value of positive infinity. Defaults to `true`.',
        type: 'Boolean',
      },
    ],
    package: '',
    desc: 'Generates a list of linearly separated floats.',
    example: 'linearBins(start: 0.0, width: 5.0, count: 20, infinity: true)',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/misc/linearbins/`,
  },
  {
    name: 'logarithmicBins',
    args: [
      {
        name: 'start',
        desc: 'The first value in the returned list.',
        type: 'Float',
      },
      {
        name: 'factor',
        desc: 'The multiplier applied to each subsequent bin.',
        type: 'Float',
      },
      {
        name: 'count',
        desc: 'The number of bins to create.',
        type: 'Integer',
      },
      {
        name: 'infinity',
        desc:
          'When `true`, adds an additional bin with a value of positive infinity. Defaults to `true`.',
        type: 'Boolean',
      },
    ],
    package: '',
    desc: 'Generates a list of exponentially separated floats.',
    example:
      'logarithmicBins(start: 1.0, factor: 2.0, count: 10, infinity: true)',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/misc/logarithmicbins/`,
  },
  {
    name: 'lowestAverage',
    args: [
      {
        name: 'n',
        desc: 'Number of records to return.',
        type: 'Integer',
      },
      {
        name: 'column',
        desc: 'Column by which to sort. Default is `"_value"`.',
        type: 'String',
      },
      {
        name: 'groupColumns',
        desc:
          'The columns on which to group before performing the aggregation. Default is `[]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Returns the bottom `n` records from all groups using the average of each group.',
    example: 'lowestAverage(n:10, groupColumns: ["host"])',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/lowestaverage/`,
  },
  {
    name: 'lowestCurrent',
    args: [
      {
        name: 'n',
        desc: 'Number of records to return.',
        type: 'Integer',
      },
      {
        name: 'column',
        desc: 'Column by which to sort. Default is `"_value"`.',
        type: 'String',
      },
      {
        name: 'groupColumns',
        desc:
          'The columns on which to group before performing the aggregation. Default is `[]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Returns the bottom `n` records from all groups using the last value of each group.',
    example: 'lowestCurrent(n:10, groupColumns: ["host"])',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/lowestcurrent/`,
  },
  {
    name: 'lowestMin',
    args: [
      {
        name: 'n',
        desc: 'Number of records to return.',
        type: 'Integer',
      },
      {
        name: 'column',
        desc: 'Column by which to sort. Default is `"_value"`.',
        type: 'String',
      },
      {
        name: 'groupColumns',
        desc:
          'The columns on which to group before performing the aggregation. Default is `[]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Returns the bottom `n` records from all groups using the maximum of each group.',
    example: 'lowestMin(n:10, groupColumns: ["host"])',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/lowestmin/`,
  },
  {
    name: 'map',
    args: [
      {
        name: 'fn',
        desc:
          'A single argument function that to apply to each record. The return value must be an object.',
        type: 'Function',
      },
    ],
    package: '',
    desc: 'Applies a function to each record in the input tables.',
    example: 'map(fn: (r) => ({ r with _value: r._value * r._value }))',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/map/`,
  },
  MATH_ABS,
  {
    name: 'math.acos',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the arccosine of x in radians.',
    example: 'math.acos(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/acos/`,
  },
  {
    name: 'math.acosh',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation. Should be greater than 1.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the inverse hyperbolic cosine of x.',
    example: 'math.acosh(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/acosh/`,
  },
  {
    name: 'math.asin',
    args: [
      {
        name: 'x',
        desc:
          'The value used in the operation. Should be greater than -1 and less than 1.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the arcsine of x in radians.',
    example: 'math.asin(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/asin/`,
  },
  {
    name: 'math.asinh',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the inverse hyperbolic sine of x.',
    example: 'math.asinh(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/asinh/`,
  },
  {
    name: 'math.atan',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the arctangent of x in radians.',
    example: 'math.atan(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/atan/`,
  },
  {
    name: 'math.atan2',
    args: [
      {
        name: 'y',
        desc: 'The y coordinate used in the operation.',
        type: 'Float',
      },
      {
        name: 'x',
        desc: 'The x coordinate used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc:
      'Returns the arc tangent of y/x, using the signs of the two to determine the quadrant of the return value.',
    example: 'math.atan2(y: r.y_coord, x: r.x_coord)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/atan2/`,
  },
  {
    name: 'math.atanh',
    args: [
      {
        name: 'x',
        desc:
          'The value used in the operation. Should be greater than -1 and less than 1.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the inverse hyperbolic tangent of x.',
    example: 'math.atanh(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/atanh/`,
  },
  {
    name: 'math.cbrt',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the cube root of x.',
    example: 'math.cbrt(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/cbrt/`,
  },
  {
    name: 'math.ceil',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the least integer value greater than or equal to x.',
    example: 'math.ceil(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/ceil/`,
  },
  {
    name: 'math.copysign',
    args: [
      {
        name: 'x',
        desc: 'The magnitude used in the operation.',
        type: 'Float',
      },
      {
        name: 'y',
        desc: 'The sign used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns a value with the magnitude of x and the sign of y.',
    example: 'math.copysign(x: r._magnitude, r._sign)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/copysign/`,
  },
  {
    name: 'math.cos',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the cosine of the radian argument x.',
    example: 'math.cos(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/cos/`,
  },
  {
    name: 'math.cosh',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the hyperbolic cosine of x.',
    example: 'math.cosh(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/cosh/`,
  },
  {
    name: 'math.dim',
    args: [
      {
        name: 'x',
        desc: 'The X value used in the operation.',
        type: 'Float',
      },
      {
        name: 'y',
        desc: 'The Y value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the maximum of (x - y) or 0.',
    example: 'math.dim(x: r._value1, y: r._value2)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/dim/`,
  },
  {
    name: 'math.erf',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the error function of x.',
    example: 'math.erf(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/erf/`,
  },
  {
    name: 'math.erfc',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the complementary error function of x.',
    example: 'math.erfc(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/erfc/`,
  },
  {
    name: 'math.erfcinv',
    args: [
      {
        name: 'x',
        desc:
          'The value used in the operation. Should be greater than 0 and less than 2.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the inverse of `math.erfc()`.',
    example: 'math.erfcinv(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/erfcinv/`,
  },
  {
    name: 'math.erfinv',
    args: [
      {
        name: 'x',
        desc:
          'The value used in the operation. Should be greater than -1 and less than 1.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the inverse error function of x.',
    example: 'math.erfinv(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/erfinv/`,
  },
  {
    name: 'math.exp',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the base-e exponential of x (`e**x`).',
    example: 'math.exp(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/exp/`,
  },
  {
    name: 'math.exp2',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the base-2 exponential of x (`2**x`).',
    example: 'math.exp2(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/exp2/`,
  },
  {
    name: 'math.expm1',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the base-e exponential of x minus 1 (`e**x - 1`).',
    example: 'math.expm1(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/expm1/`,
  },
  {
    name: 'math.float64bits',
    args: [
      {
        name: 'f',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc:
      'Returns the IEEE 754 binary representation of f, with the sign bit of f and the result in the same bit position.',
    example: 'math.float64bits(f: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/float64bits/`,
  },
  MATH_FLOOR,
  {
    name: 'math.frexp',
    args: [
      {
        name: 'f',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Breaks f into a normalized fraction and an integral power of two.',
    example: 'math.frexp(f: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/frexp/`,
  },
  {
    name: 'math.gamma',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the Gamma function of x.',
    example: 'math.gamma(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/gamma/`,
  },
  {
    name: 'math.hypot',
    args: [
      {
        name: 'p',
        desc: 'The p value used in the operation.',
        type: 'Float',
      },
      {
        name: 'q',
        desc: 'The q value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc:
      'Returns the square root of `p*p + q*q`, taking care to avoid overflow and underflow.',
    example: 'math.hypot(p: r.opp, p: r.adj)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/hypot/`,
  },
  {
    name: 'math.ilogb',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the binary exponent of x as an integer.',
    example: 'math.ilogb(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/ilogb/`,
  },
  {
    name: 'math.isInf',
    args: [
      {
        name: 'f',
        desc: 'The value used in the evaluation.',
        type: 'Float',
      },
      {
        name: 'sign',
        desc: 'The sign used in the evaluation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Reports whether f is an infinity, according to sign.',
    example: 'math.isInf(f: r._value, sign: r.sign)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/isinf/`,
  },
  {
    name: 'math.isNaN',
    args: [
      {
        name: 'f',
        desc: 'The value used in the evaluation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Reports whether f is an IEEE 754 NaN value.',
    example: 'math.isNaN(f: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/isnan/`,
  },
  {
    name: 'math.j0',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the order-zero Bessel function of the first kind.',
    example: 'math.j0(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/j0/`,
  },
  {
    name: 'math.j1',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the order-one Bessel function of the first kind.',
    example: 'math.j1(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/j1/`,
  },
  {
    name: 'math.jn',
    args: [
      {
        name: 'n',
        desc: 'The order number.',
        type: 'Float',
      },
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the order-n Bessel function of the first kind.',
    example: 'math.jn(n: 2, x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/jn/`,
  },
  {
    name: 'math.ldexp',
    args: [
      {
        name: 'frac',
        desc: 'The fraction used in the operation.',
        type: 'Float',
      },
      {
        name: 'exp',
        desc: 'The exponent used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns `frac × 2**exp`. It is the inverse of `math.frexp()`.',
    example: 'math.ldexp(frac: r.frac, exp: r.exp)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/ldexp/`,
  },
  {
    name: 'math.lgamma',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc:
      'Returns the natural logarithm and sign (-1 or +1) of `math.gamma(x:x)`.',
    example: 'math.lgamma(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/lgamma/`,
  },
  {
    name: 'math.log',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the natural logarithm of x.',
    example: 'math.log(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/log/`,
  },
  {
    name: 'math.log10',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the decimal logarithm of `x`.',
    example: 'math.log10(x: 3.14)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/log10/`,
  },
  {
    name: 'math.log1p',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the natural logarithm of 1 plus its argument x.',
    example: 'math.log1p(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/log1p/`,
  },
  {
    name: 'math.log2',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the binary logarithm of x.',
    example: 'math.log2(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/log2/`,
  },
  {
    name: 'math.logb',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the binary exponent of x.',
    example: 'math.logb(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/logb/`,
  },
  {
    name: 'math.mInf',
    args: [
      {
        name: 'sign',
        desc: 'The sign value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc:
      'Returns positive infinity if `sign >= 0`, negative infinity if `sign < 0`.',
    example: 'math.mInf(sign: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/minf/`,
  },
  {
    name: 'math.mMax',
    args: [
      {
        name: 'x',
        desc: 'The X value used in the operation.',
        type: 'Float',
      },
      {
        name: 'y',
        desc: 'The Y value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the larger of x or y.',
    example: 'math.mMax(x: r.x_value, y: r.y_value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/mmax/`,
  },
  {
    name: 'math.mMin',
    args: [
      {
        name: 'x',
        desc: 'The X value used in the operation.',
        type: 'Float',
      },
      {
        name: 'y',
        desc: 'The Y value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the smaller of x or y.',
    example: 'math.mMin(x: r.x_value, y: r.y_value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/mmin/`,
  },
  {
    name: 'math.mod',
    args: [
      {
        name: 'x',
        desc: 'The X value used in the operation.',
        type: 'Float',
      },
      {
        name: 'y',
        desc: 'The Y value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the floating-point remainder of x/y.',
    example: 'math.mod(x: r.x_value, y: r.y_value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/mod/`,
  },
  {
    name: 'math.modf',
    args: [
      {
        name: 'f',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc:
      'Returns integer and fractional floating-point numbers that sum to f. Both values have the same sign as f.',
    example: 'math.modf(f: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/modf/`,
  },
  {
    name: 'math.NaN',
    args: [],
    package: 'math',
    desc: 'Returns an IEEE 754 NaN value.',
    example: 'math.NaN()',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/nan/`,
  },
  {
    name: 'math.nextafter',
    args: [
      {
        name: 'x',
        desc: 'The X value used in the operation.',
        type: 'Float',
      },
      {
        name: 'y',
        desc: 'The Y value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the next representable float value after x towards y.',
    example: 'math.nextafter(x: r.x_value, y: r.y_value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/nextafter/`,
  },
  {
    name: 'math.pow',
    args: [
      {
        name: 'x',
        desc: 'The X value used in the operation.',
        type: 'Float',
      },
      {
        name: 'y',
        desc: 'The Y value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the base-x exponential of y, `x**y`.',
    example: 'math.pow(x: r.x_value, y: r.y_value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/pow/`,
  },
  {
    name: 'math.pow10',
    args: [
      {
        name: 'n',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the base-10 exponential of n, `10**n`.',
    example: 'math.pow10(n: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/pow10/`,
  },
  {
    name: 'math.remainder',
    args: [
      {
        name: 'x',
        desc: 'The numerator used in the operation.',
        type: 'Float',
      },
      {
        name: 'y',
        desc: 'The denominator used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the IEEE 754 floating-point remainder of `x / y`.',
    example: 'math.remainder(x: r.numerator, y: r.denominator)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/remainder/`,
  },
  {
    name: 'math.round',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the nearest integer, rounding half away from zero.',
    example: 'math.round(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/round/`,
  },
  {
    name: 'math.roundtoeven',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the nearest integer, rounding ties to even.',
    example: 'math.roundtoeven(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/roundtoeven/`,
  },
  {
    name: 'math.signbit',
    args: [
      {
        name: 'x',
        desc: 'The value used in the evaluation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Reports whether x is negative or negative zero.',
    example: 'math.signbit(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/signbit/`,
  },
  {
    name: 'math.sin',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the sine of the radian argument x.',
    example: 'math.sin(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/sin/`,
  },
  {
    name: 'math.sincos',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the values of `math.sin(x:x)` and `math.cos(x:x)`.',
    example: 'math.sincos(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/sincos/`,
  },
  {
    name: 'math.sinh',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the hyperbolic sine of x.',
    example: 'math.sinh(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/sinh/`,
  },
  {
    name: 'math.sqrt',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the square root of x.',
    example: 'math.sqrt(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/sqrt/`,
  },
  {
    name: 'math.tan',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the tangent of the radian argument x.',
    example: 'math.tan(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/tan/`,
  },
  {
    name: 'math.tanh',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the hyperbolic tangent of x.',
    example: 'math.tanh(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/tanh/`,
  },
  {
    name: 'math.trunc',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the integer value of x.',
    example: 'math.trunc(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/trunc/`,
  },
  {
    name: 'math.y0',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the order-zero Bessel function of the second kind.',
    example: 'math.y0(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/y0/`,
  },
  {
    name: 'math.y1',
    args: [
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the order-one Bessel function of the second kind.',
    example: 'math.y1(x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/y1/`,
  },
  {
    name: 'math.yn',
    args: [
      {
        name: 'n',
        desc: 'The order number used in the operation.',
        type: 'Float',
      },
      {
        name: 'x',
        desc: 'The value used in the operation.',
        type: 'Float',
      },
    ],
    package: 'math',
    desc: 'Returns the order-n Bessel function of the second kind.',
    example: 'math.yn(n: 3, x: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/math/yn/`,
  },
  {
    name: 'max',
    args: [
      {
        name: 'column',
        desc: 'The column to use to compute the max. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Selects record with the highest `_value` from the input table.',
    example: 'max()',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/max/`,
  },
  MEAN,
  {
    name: 'median',
    args: [
      {
        name: 'column',
        desc: 'The column on which to compute the mean. Defaults to `"_value"`',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Returns the median `_value` of an input table. The `median()` function can only be used with float value types.',
    example: 'median(column: "_value")',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/median/`,
  },
  {
    name: 'min',
    args: [
      {
        name: 'column',
        desc: 'The column to use to compute the min. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Selects record with the lowest `_value` from the input table.',
    example: 'min()',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/min/`,
  },
  {
    name: 'mode',
    args: [
      {
        name: 'column',
        desc: 'The column to use to compute the mode. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Computes the mode or value that occurs most often in a specified column.',
    example: 'mode(column: "_value")',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/mode/`,
  },
  {
    name: 'monitor.check',
    args: [
      {
        name: 'crit',
        desc:
          'Predicate function that determines `crit` status. Default is `(r) => false`.',
        type: 'Function',
      },
      {
        name: 'warn',
        desc:
          'Predicate function that determines `warn` status. Default is `(r) => false`.',
        type: 'Function',
      },
      {
        name: 'info',
        desc:
          'Predicate function that determines `info` status. Default is `(r) => false`.',
        type: 'Function',
      },
      {
        name: 'ok',
        desc:
          'Predicate function that determines `ok` status. Default is `(r) => false`.',
        type: 'Function',
      },
      {
        name: 'messageFn',
        desc:
          'A function that constructs a message to append to each row. The message is stored in the `_message` column.',
        type: 'Function',
      },
      {
        name: 'data',
        desc: 'Meta data used to identify this check.',
        type: 'Record',
      },
    ],
    package: 'influxdata/influxdb/monitor',
    desc:
      'Checks input data and assigns a level (`ok`, `info`, `warn`, or `crit`) to each row based on predicate functions.',
    example: `monitor.check(
    crit: (r) => r._value > 90.0,
    warn: (r) => r._value > 80.0,
    info: (r) => r._value > 60.0,
    ok:   (r) => r._value <= 20.0,
    messageFn: (r) => "The current level is \${r._level}",
    data: {}
)`,
    category: 'Transformation',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/monitor/check/`,
  },
  {
    name: 'monitor.deadman',
    args: [
      {
        name: 't',
        desc: 'The time threshold for the deadman check.',
        type: 'Time',
      },
    ],
    package: 'influxdata/influxdb/monitor',
    desc:
      'Detects when a group stops reporting data. It takes a stream of tables and reports if groups have been observed since time `t`.',
    example: `monitor.deadman(t: 2019-08-30T12:30:00Z)`,
    category: 'Transformation',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/monitor/deadman/`,
  },
  {
    name: 'monitor.from',
    args: [
      {
        name: 'start',
        desc: 'The earliest time to include in results.',
        type: 'Duration | Time | Integer',
      },
      {
        name: 'stop',
        desc: 'The latest time to include in results.',
        type: 'Duration | Time | Integer',
      },
      {
        name: 'fn',
        desc:
          'A single argument predicate function that evaluates `true` or `false`.',
        type: 'Function',
      },
    ],
    package: 'influxdata/influxdb/monitor',
    desc:
      'Detects when a group stops reporting data. It takes a stream of tables and reports if groups have been observed since time `t`.',
    example: `monitor.from(
    start: -1h,
    stop: now(),
    fn: (r) => true
)`,
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/monitor/from/`,
  },
  {
    name: 'monitor.logs',
    args: [
      {
        name: 'start',
        desc: 'The earliest time to include in results.',
        type: 'Duration | Time | Integer',
      },
      {
        name: 'stop',
        desc: 'The latest time to include in results.',
        type: 'Duration | Time | Integer',
      },
      {
        name: 'fn',
        desc:
          'A single argument predicate function that evaluates `true` or `false`.',
        type: 'Function',
      },
    ],
    package: 'influxdata/influxdb/monitor',
    desc:
      'Retrieves notification events stored in the notifications measurement in the `_monitoring` bucket.',
    example: `monitor.from(
    start: -1h,
    stop: now(),
    fn: (r) => true
)`,
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/monitor/logs/`,
  },
  {
    name: 'monitor.notify',
    args: [
      {
        name: 'endpoint',
        desc:
          'A function that constructs and sends the notification to an endpoint.',
        type: 'Function',
      },
      {
        name: 'data',
        desc: 'Notification data to append to the output.',
        type: 'Record',
      },
    ],
    package: 'influxdata/influxdb/monitor',
    desc:
      'Sends a notification to an endpoint and logs it in the notifications measurement in the `_monitoring` bucket.',
    example: `monitor.notify(
    endpoint: endpoint,
    data: {}
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/monitor/notify/`,
  },
  {
    name: 'monitor.stateChanges',
    args: [
      {
        name: 'fromLevel',
        desc: 'The level to detect a change from. Defaults to `"any"`.',
        type: 'String',
      },
      {
        name: 'toLevel',
        desc:
          'The level to detect a change to. The function output records that change to this level. Defaults to `"any"`.',
        type: 'String',
      },
    ],
    package: 'influxdata/influxdb/monitor',
    desc:
      'Detects state changes in a stream of data with a `_level` column and outputs records that change from `fromLevel` to `toLevel`.',
    example: `monitor.stateChanges(
    fromLevel: "any",
    toLevel: "any"
)`,
    category: 'Transformation',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/monitor/statechanges/`,
  },
  {
    name: 'monitor.stateChangesOnly',
    args: [],
    package: 'influxdata/influxdb/monitor',
    desc:
      'Takes a stream of tables that contains a `_level` column and returns a stream of tables where each record represents a state change.',
    example: `monitor.stateChangesOnly()`,
    category: 'Transformation',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/monitor/statechangesonly/`,
  },
  {
    name: 'movingAverage',
    args: [
      {
        name: 'n',
        desc: 'The frequency of time windows.',
        type: 'Duration',
      },
    ],
    package: '',
    desc: 'Calculates the mean of values grouped into `n` number of points.',
    example: 'movingAverage(n: 5)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/movingaverage/`,
  },
  {
    name: 'mqtt.to',
    args: [
      {
        name: 'broker',
        desc: 'The MQTT broker connection string.',
        type: 'String',
      },
      {
        name: 'topic',
        desc: 'The MQTT topic to send data to.',
        type: 'String',
      },
      {
        name: 'message',
        desc:
          'The message or payload to send to the MQTT broker. The default payload is an output table.',
        type: 'String',
      },
      {
        name: 'qos',
        desc:
          'The MQTT Quality of Service (QoS) level. Values range from 0-2. Default is 0.',
        type: 'Integer',
      },
      {
        name: 'clientid',
        desc: 'The MQTT client ID.',
        type: 'String',
      },
      {
        name: 'username',
        desc: 'The username to send to the MQTT broker.',
        type: 'String',
      },
      {
        name: 'password',
        desc: 'The password to send to the MQTT broker.',
        type: 'String',
      },
      {
        name: 'name',
        desc: 'The name for the MQTT message.',
        type: 'String',
      },
      {
        name: 'timeout',
        desc: 'The MQTT connection timeout. Default is 1s.',
        type: 'Duration',
      },
      {
        name: 'timeColumn',
        desc:
          'The column to use as time values in the output line protocol. Default is `"_time"`.',
        type: 'String',
      },
      {
        name: 'tagColumns',
        desc:
          'The columns to use as tag sets in the output line protocol. Default is `[]`.',
        type: 'Array of Strings',
      },
      {
        name: 'valueColumns',
        desc:
          'The columns to use as field values in the output line protocol. Default is `["_value"]`.',
        type: 'Array of Strings',
      },
    ],
    package: 'experimental/mqtt',
    desc: 'Outputs data to an MQTT broker using MQTT protocol.',
    example:
      'mqtt.to(broker: "tcp://localhost:8883", topic: "example-topic", clientid: "exampleID", tagColumns: ["exampleTagKey"], valueColumns: ["_value"])',
    category: 'Outputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/mqtt/to/`,
  },
  {
    name: 'now',
    args: [],
    package: '',
    desc:
      'Returns the current time (UTC) or the time defined in the `now` option.',
    example: 'now()',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/misc/now/`,
  },
  {
    name: 'oee.APQ',
    args: [
      {
        name: 'runningState',
        desc: 'State value that represents a running state.',
        type: 'String',
      },
      {
        name: 'plannedTime',
        desc: 'Total time that equipment is expected to produce parts.',
        type: 'Duration | Integer',
      },
      {
        name: 'idealCycleTime',
        desc: 'Ideal minimum time to produce one part.',
        type: 'Duration | Integer',
      },
    ],
    package: 'experimental/oee',
    desc:
      'Computes availability, performance, quality (APQ) and overall equipment effectiveness (OEE) in producing parts.',
    example: `oee.APQ(
    runningState: "running",
    plannedTime: 8h,
    idealCycleTime: 2m
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/oee/apq/`,
  },
  {
    name: 'oee.computeAPQ',
    args: [
      {
        name: 'productionEvents',
        desc:
          'Production events stream that contains the production state or start and stop events.',
        type: 'Stream of Tables',
      },
      {
        name: 'partEvents',
        desc:
          'Part events that contains the running totals of parts produced and parts that do not meet quality standards.',
        type: 'Stream of Tables',
      },
      {
        name: 'runningState',
        desc: 'State value that represents a running state.',
        type: 'String',
      },
      {
        name: 'plannedTime',
        desc: 'Total time that equipment is expected to produce parts.',
        type: 'Duration | Integer',
      },
      {
        name: 'idealCycleTime',
        desc: 'Ideal minimum time to produce one part.',
        type: 'Duration | Integer',
      },
    ],
    package: 'experimental/oee',
    desc:
      'Computes availability, performance, and quality (APQ) and overall equipment effectiveness (OEE) using two separate input streams—production events and part events.',
    example: `oee.computeAPQ(
    productionEvents: exampleProductionScheme,
    partEvents: examplePartsStream,
    runningState: "running",
    plannedTime: 8h,
    idealCycleTime: 2m,
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/oee/computeapq/`,
  },
  {
    name: 'opsgenie.endpoint',
    args: [
      {
        name: 'url',
        desc:
          'Opsgenie API URL. Defaults to `https://api.opsgenie.com/v2/alerts`.',
        type: 'String',
      },
      {
        name: 'apiKey',
        desc: 'Opsgenie API authorization key.',
        type: 'String',
      },
      {
        name: 'entity',
        desc: 'Alert entity used to specify the alert domain.',
        type: 'String',
      },
    ],
    package: 'contrib/sranka/opsgenie',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = opsgenie.endpoint(
    url: "https://api.opsgenie.com/v2/alerts",
    apiKey: "YoUrSup3R5ecR37AuThK3y",
    entity: "example-entity"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/opsgenie/endpoint/`,
  },
  {
    name: 'opsgenie.sendAlert',
    args: [
      {
        name: 'url',
        desc:
          'Opsgenie API URL. Defaults to `https://api.opsgenie.com/v2/alerts`.',
        type: 'String',
      },
      {
        name: 'apiKey',
        desc: 'Opsgenie API authorization key.',
        type: 'String',
      },
      {
        name: 'message',
        desc: 'Alert message text. 130 characters or less.',
        type: 'String',
      },
      {
        name: 'alias',
        desc:
          'Opsgenie alias usee to de-deduplicate alerts. 250 characters or less. Defaults to `message`.',
        type: 'String',
      },
      {
        name: 'description',
        desc: 'Alert description. 15,000 characters or less.',
        type: 'String',
      },
      {
        name: 'priority',
        desc:
          'Opsgenie alert priority. Valid values include: P1, P2, P3 (default), P4, and P5.',
        type: 'String',
      },
      {
        name: 'responders',
        desc:
          'List of responder teams or users. Use the `user:` prefix for users and `teams:` prefix for teams.',
        type: 'Array of Strings',
      },
      {
        name: 'tags',
        desc: 'Alert tags.',
        type: 'String',
      },
      {
        name: 'entity',
        desc: 'Alert entity used to specify the alert domain.',
        type: 'String',
      },
      {
        name: 'actions',
        desc: 'List of actions available for the alert.',
        type: 'Array of strings',
      },
      {
        name: 'details',
        desc:
          'Additional alert details. Must be a JSON-encoded map of key-value string pairs.',
        type: 'String',
      },
      {
        name: 'visibleTo',
        desc:
          'List of teams and users the alert will be visible to without sending notifications. Use the `user:` prefix for users and `teams:` prefix for teams.',
        type: 'Array of strings',
      },
    ],
    package: 'contrib/sranka/opsgenie',
    desc: 'Sends an alert to Opsgenie.',
    example: `opsgenie.sendAlert(
    url: "https://api.opsgenie.com/v2/alerts",
    apiKey: "YoUrSup3R5ecR37AuThK3y",
    message: "Example message",
    alias: "Example alias",
    description: "Example description",
    priority: "P3",
    responders: ["user:john@example.com", "team:itcrowd"],
    tags: ["tag1", "tag2"],
    entity: "example-entity",
    actions: ["action1", "action2"],
    details: "{}",
    visibleTo: []
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/opsgenie/sendalert/`,
  },
  {
    name: 'pagerduty.actionFromSeverity',
    args: [
      {
        name: 'severity',
        desc: 'The severity to convert to a PagerDuty action.',
        type: 'String',
      },
    ],
    package: 'pagerduty',
    desc:
      'Converts a severity to a PagerDuty action. `ok` converts to `resolve`. All other severities convert to `trigger`.',
    example: 'pagerduty.actionFromSeverity(severity: "ok")',
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/pagerduty/actionfromseverity/`,
  },
  {
    name: 'pagerduty.dedupKey',
    args: [],
    package: 'pagerduty',
    desc:
      'uses the group key of an input table to generate and store a deduplication key in the `_pagerdutyDedupKey` column.',
    example: 'pagerduty.dedupKey()',
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/pagerduty/dedupkey/`,
  },
  {
    name: 'pagerduty.endpoint',
    args: [
      {
        name: 'url',
        desc:
          'The PagerDuty v2 Events API URL. Defaults to `https://events.pagerduty.com/v2/enqueue`.',
        type: 'String',
      },
    ],
    package: 'pagerduty',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = pagerduty.endpoint(
    url: "https://events.pagerduty.com/v2/enqueue"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/pagerduty/endpoint/`,
  },
  {
    name: 'pagerduty.sendEvent',
    args: [
      {
        name: 'pagerdutyURL',
        desc:
          'The URL of the PagerDuty endpoint. Defaults to `https://events.pagerduty.com/v2/enqueue`.',
        type: 'String',
      },
      {
        name: 'routingKey',
        desc: 'The routing key generated from your PagerDuty integration.',
        type: 'String',
      },
      {
        name: 'client',
        desc: 'The name of the client sending the alert.',
        type: 'String',
      },
      {
        name: 'clientURL',
        desc: 'The URL of the client sending the alert.',
        type: 'String',
      },
      {
        name: 'dedupkey',
        desc:
          'A per-alert ID that acts as deduplication key and allows you to acknowledge or change the severity of previous messages. Supports a maximum of 255 characters.',
        type: 'String',
      },
      {
        name: 'class',
        desc: 'The class or type of the event. Classes are user-defined.',
        type: 'String',
      },
      {
        name: 'group',
        desc: 'A logical grouping used by PagerDuty. Groups are user-defined.',
        type: 'String',
      },
      {
        name: 'severity',
        desc:
          'The severity of the event. Supported severities are `"critical"`, `"error"`, `"warning"`, `"info"`.',
        type: 'String',
      },
      {
        name: 'eventAction',
        desc:
          'Event type to send to PagerDuty. Valid values include `"trigger"`, `"resolve"`, `"acknowledge"`.',
        type: 'String',
      },
      {
        name: 'source',
        desc:
          'The unique location of the affected system. For example, the hostname or fully qualified domain name (FQDN).',
        type: 'String',
      },
      {
        name: 'summary',
        desc:
          'A brief text summary of the event used as the summaries or titles of associated alerts. The maximum permitted length is 1024 characters.',
        type: 'String',
      },
      {
        name: 'timestamp',
        desc: 'The time the detected event occurred in RFC3339nano format.',
        type: 'String',
      },
    ],
    package: 'pagerduty',
    desc: 'Sends an alert to PagerDuty.',
    example: `pagerduty.sendEvent(
    pagerdutyURL: "https://events.pagerduty.com/v2/enqueue",
    routingKey: "ExampleRoutingKey",
    client: "ExampleClient",
    clientURL: "http://examplepagerdutyclient.com",
    dedupkey: "ExampleDedupKey",
    class: "cpu usage",
    group: "app-stack",
    severity: "ok",
    eventAction: "trigger",
    source: "monitoringtool:vendor:region",
    summary: "This is an example summary.",
    timestamp: "2016-07-17T08:42:58.315+0000"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/pagerduty/sendevent/`,
  },
  {
    name: 'pagerduty.severityFromLevel',
    args: [
      {
        name: 'level',
        desc: 'The level to convert to a PagerDuty severity.',
        type: 'String',
      },
    ],
    package: 'pagerduty',
    desc: 'Converts an InfluxDB status level to a PagerDuty severity.',
    example: 'pagerduty.severityFromLevel(level: "crit")',
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/pagerduty/severityfromlevel/`,
  },
  {
    name: 'pearsonr',
    args: [
      {
        name: 'x',
        desc: 'First input stream used in the operation.',
        type: 'Object',
      },
      {
        name: 'y',
        desc: 'Second input stream used in the operation.',
        type: 'Object',
      },
      {
        name: 'on',
        desc: 'List of columns on which to join.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Computes the Pearson R correlation coefficient between two streams by first joining the streams, then performing the covariance operation normalized to compute R.',
    example: 'pearsonr(x: table1, y: table2, on: ["_time", "_field"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/pearsonr/`,
  },
  {
    name: 'pivot',
    args: [
      {
        name: 'rowKey',
        desc: 'List of columns used to uniquely identify a row for the output.',
        type: 'Array of Strings',
      },
      {
        name: 'columnKey',
        desc:
          'List of columns used to pivot values onto each row identified by the rowKey.',
        type: 'Array of Strings',
      },
      {
        name: 'valueColumn',
        desc:
          'The single column that contains the value to be moved around the pivot.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Collects values stored vertically (column-wise) in a table and aligns them horizontally (row-wise) into logical sets.',
    example:
      'pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/pivot/`,
  },
  {
    name: 'prometheus.histogramQuantile',
    args: [
      {
        name: 'quantile',
        desc: 'A value between 0.0 and 1.0 indicating the desired quantile.',
        type: 'Float',
      },
    ],
    package: 'experimental/prometheus',
    desc:
      'Calculates quantiles on a set of values assuming the histogram data is scraped or read from a Prometheus data source.',
    example: 'prometheus.histogramQuantile(quantile: 0.99)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/prometheus/histogramquantile/`,
  },
  {
    name: 'prometheus.scrape',
    args: [
      {
        name: 'url',
        desc: 'The URL to scrape Prometheus-formatted metrics from.',
        type: 'String',
      },
    ],
    package: 'experimental/prometheus',
    desc: 'Retrieves Prometheus-formatted metrics from a specified URL.',
    example: 'prometheus.scrape(url: "http://localhost:9999/metrics")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/prometheus/scrape/`,
  },
  {
    name: 'pushbullet.endpoint',
    args: [
      {
        name: 'url',
        desc:
          'Pushbullet API URL. Defaults to `https://api.pushbullet.com/v2/pushes`.',
        type: 'String',
      },
      {
        name: 'token',
        desc:
          'Pushbullet API token to use when interacting with Pushbullet. Defaults to `""`.',
        type: 'String',
      },
    ],
    package: 'pushbullet',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = pushbullet.endpoint(
    url: "https://api.pushbullet.com/v2/pushes",
    token: ""
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/pushbullet/endpoint/`,
  },
  {
    name: 'pushbullet.pushData',
    args: [
      {
        name: 'url',
        desc:
          'Pushbullet API URL. Defaults to `https://api.pushbullet.com/v2/pushes`.',
        type: 'String',
      },
      {
        name: 'token',
        desc:
          'Pushbullet API token to use when interacting with Pushbullet. Defaults to `""`.',
        type: 'String',
      },
      {
        name: 'data',
        desc:
          'Data to send to the Pushbullet API. The function JSON-encodes data before sending it to Pushbullet.',
        type: 'Record',
      },
    ],
    package: 'pushbullet',
    desc: 'Sends a push notification to the Pushbullet API.',
    example: `pushbullet.pushData(
    url: "https://api.pushbullet.com/v2/pushes",
    token: "",
    data: {
        "type": "link",
        "title": "This is a notification!",
        "body": "This notification came from Flux.",
        "url": "http://example.com"
    }
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/pushbullet/pushdata/`,
  },
  {
    name: 'pushbullet.pushData',
    args: [
      {
        name: 'url',
        desc:
          'Pushbullet API URL. Defaults to `https://api.pushbullet.com/v2/pushes`.',
        type: 'String',
      },
      {
        name: 'token',
        desc:
          'Pushbullet API token to use when interacting with Pushbullet. Defaults to `""`.',
        type: 'String',
      },
      {
        name: 'title',
        desc: 'Title of the notification.',
        type: 'String',
      },
      {
        name: 'text',
        desc: 'Text to display in the notification.',
        type: 'String',
      },
    ],
    package: 'pushbullet',
    desc: 'Sends a push notification of type `note` to the Pushbullet API.',
    example: `pushbullet.pushNote(
    url: "https://api.pushbullet.com/v2/pushes",
    token: "",
    title: "This is a push notification!",
    text: "This push notification came from Flux."
)`,
    category: 'Outputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/pushbullet/pushnote/`,
  },
  {
    name: 'quantile',
    args: [
      {
        name: 'column',
        desc:
          'The column on which to compute the quantile. Defaults to `"_value"`.',
        type: 'String',
      },
      {
        name: 'q',
        desc: 'A value between 0 and 1 indicating the desired quantile.',
        type: 'Float',
      },
      {
        name: 'method',
        desc:
          'Defines the method of computation. The available options are: `estimate_tdigest`, `exact_mean`, or `exact_selector`.',
        type: 'String',
      },
      {
        name: 'compression',
        desc:
          'Indicates how many centroids to use when compressing the dataset. A larger number produces a more accurate result at the cost of increased memory requirements. Defaults to 1000.',
        type: 'Float',
      },
    ],
    package: '',
    desc:
      'This is both an aggregate and selector function depending on the `method` used. When using the `estimate_tdigest` or `exact_mean` methods, it outputs non-null records with values that fall within the specified quantile. When using the `exact_selector` method, it outputs the non-null record with the value that represents the specified quantile.',
    example:
      'quantile(column: "_value", q: 0.99, method: "estimate_tdigest", compression: 1000.0)',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/quantile/`,
  },
  {
    name: 'query.filterFields',
    args: [
      {
        name: 'fields',
        desc: 'Fields to filter by.',
        type: 'Array of Strings',
      },
    ],
    package: 'experimental/query',
    desc: 'Filters input data by field.',
    example: 'query.filterFields(fields: ["field_name"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/query/filterfields/`,
  },
  {
    name: 'query.filterMeasurement',
    args: [
      {
        name: 'measurement',
        desc: 'Measurement to filter by.',
        type: 'String',
      },
    ],
    package: 'experimental/query',
    desc: 'Filters input data by measurement.',
    example: 'query.filterMeasurement(measurement: "measurement_name")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/query/filtermeasurement/`,
  },
  {
    name: 'query.fromRange',
    args: [
      {
        name: 'bucket',
        desc: 'Name of the bucket to query.',
        type: 'String',
      },
      {
        name: 'start',
        desc: 'The earliest time to include in results.',
        type: 'Duration | Time | Integer',
      },
      {
        name: 'stop',
        desc: 'The latest time to include in results. Defaults to `now()`.',
        type: 'Duration | Time | Integer',
      },
    ],
    package: 'experimental/query',
    desc: 'Returns all data from a specified bucket within given time bounds.',
    example:
      'query.fromRange(bucket: "example-bucket", start: v.timeRangeStart)',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/query/fromrange/`,
  },
  {
    name: 'query.inBucket',
    args: [
      {
        name: 'bucket',
        desc: 'Name of the bucket to query.',
        type: 'String',
      },
      {
        name: 'start',
        desc: 'The earliest time to include in results.',
        type: 'Duration | Time | Integer',
      },
      {
        name: 'stop',
        desc: 'The latest time to include in results. Defaults to `now()`.',
        type: 'Duration | Time | Integer',
      },
      {
        name: 'measurement',
        desc: 'Measurement to filter by.',
        type: 'String',
      },
      {
        name: 'fields',
        desc: 'Fields to filter by.',
        type: 'Array of Strings',
      },
      {
        name: 'predicate',
        desc: 'A single argument function that evaluates true or false.',
        type: 'Function',
      },
    ],
    package: 'experimental/query',
    desc:
      'Queries data from a specified bucket within given time bounds, filters data by measurement, field, and optional predicate expressions.',
    example:
      'query.inBucket(bucket: "example-bucket", start: v.timeRangeStart, measurement: "measurement_name", fields: ["field_name"], predicate: (r) => r.host == "host1")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/query/inbucket/`,
  },
  RANGE,
  {
    name: 'reduce',
    args: [
      {
        name: 'fn',
        desc:
          'Function to apply to each record with a reducer object. The function expects two objects: `r` and `accumulator`.',
        type: 'Function',
      },
      {
        name: 'identity',
        desc:
          'Defines the reducer object and provides initial values to use when creating a reducer.',
        type: 'Object',
      },
    ],
    package: '',
    desc: 'Aggregates records in each table according to the reducer, `fn`',
    example:
      'reduce(fn: (r, accumulator) => ({ sum: r._value + accumulator.sum }), identity: {sum: 0.0})',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/reduce/`,
  },
  {
    name: 'regexp.compile',
    args: [
      {
        name: 'v',
        desc: 'The string value to parse into a regular expression.',
        type: 'String',
      },
    ],
    package: 'regexp',
    desc:
      'Parses a string into a regular expression and returns a regexp object.',
    example: 'regexp.compile(v: "[a-zA-Z]")',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/regexp/compile/`,
  },
  {
    name: 'regexp.findString',
    args: [
      {
        name: 'r',
        desc: 'The regular expression used to search `v`',
        type: 'Regexp',
      },
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
    ],
    package: 'regexp',
    desc: 'Returns the left-most regular expression match in a string.',
    example: 'regexp.findString(r: /foo.?/, v: "seafood fool")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/regexp/findstring/`,
  },
  {
    name: 'regexp.findStringIndex',
    args: [
      {
        name: 'r',
        desc: 'The regular expression used to search `v`',
        type: 'Regexp',
      },
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
    ],
    package: 'regexp',
    desc:
      'Returns a two-element array of integers defining the beginning and ending indexes of the left-most regular expression match in a string.',
    example: 'regexp.findStringIndex(r: /ab?/, v: "tablet")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/regexp/findstringindex/`,
  },
  {
    name: 'regexp.getString',
    args: [
      {
        name: 'r',
        desc: 'The regular expression object to convert to a string.',
        type: 'Regexp',
      },
    ],
    package: 'regexp',
    desc: 'Returns the source string used to compile a regular expression.',
    example: 'regexp.getString(r: /[a-zA-Z]/)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/regexp/getstring/`,
  },
  {
    name: 'regexp.matchRegexpString',
    args: [
      {
        name: 'r',
        desc: 'The regular expression used to search `v`',
        type: 'Regexp',
      },
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
    ],
    package: 'regexp',
    desc: 'Tests if a string contains any match to a regular expression.',
    example: 'regexp.matchRegexpString(r: /(go){2}/, v: "gogogopher")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/regexp/matchregexpstring/`,
  },
  {
    name: 'regexp.quoteMeta',
    args: [
      {
        name: 'v',
        desc:
          'String value containing regular expression metacharacters to escape.',
        type: 'String',
      },
    ],
    package: 'regexp',
    desc: 'Escapes all regular expression metacharacters inside of a string.',
    example: 'regexp.quoteMeta(v: ".+*?()|[]{}^$")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/regexp/quotemeta/`,
  },
  {
    name: 'regexp.replaceAllString',
    args: [
      {
        name: 'r',
        desc: 'The regular expression used to search `v`',
        type: 'Regexp',
      },
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 't',
        desc: 'The replacement for matches to `r`',
        type: 'String',
      },
    ],
    package: 'regexp',
    desc:
      'Replaces all regular expression matches in a string with a specified replacement.',
    example: 'regexp.replaceAllString(r: /a(x*)b/, v: "-ab-axxb-", t: "T")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/regexp/replaceallstring/`,
  },
  {
    name: 'regexp.splitRegexp',
    args: [
      {
        name: 'r',
        desc: 'The regular expression used to search `v`',
        type: 'Regexp',
      },
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'i',
        desc: 'The number of substrings to return.',
        type: 'Integer',
      },
    ],
    package: 'regexp',
    desc:
      'Splits a string into substrings separated by regular expression matches and returns an array of `i` substrings between matches.',
    example: 'regexp.splitRegexp(r: /a*/, v: "abaabaccadaaae", i: 5)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/regexp/splitregexp/`,
  },
  {
    name: 'relativeStrengthIndex',
    args: [
      {
        name: 'n',
        desc:
          'The number of values to use to calculate the relative strength index (RSI).',
        type: 'Integer',
      },
      {
        name: 'columns',
        desc: 'Columns to operate on. Defaults to `["_value"]`.',
        type: 'Array of Strings`',
      },
    ],
    package: '',
    desc: 'Measures the relative speed and change of values in an input table.',
    example: 'relativeStrengthIndex(n: 5)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/relativestrengthindex/`,
  },
  {
    name: 'rename',
    args: [
      {
        name: 'columns',
        desc:
          'A map of columns to rename and their corresponding new names. Cannot be used with `fn`.',
        type: 'Object',
      },
      {
        name: 'fn',
        desc:
          'A function mapping between old and new column names. Cannot be used with `columns`.',
        type: 'Function',
      },
    ],
    package: '',
    desc:
      'Renames specified columns in a table. If a column is renamed and is part of the group key, the column name in the group key will be updated.',
    example: 'rename(columns: {host: "server", _field: "my_field"})',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/rename/`,
  },
  {
    name: 'rows.map',
    args: [
      {
        name: 'fn',
        desc:
          'A single argument function to apply to each record. The return value must be a record.',
        type: 'Function',
      },
    ],
    package: 'contrib/jsternberg/rows',
    desc:
      'An alternate implementation of `map()` that is faster, but more limited than `map()`.',
    example: 'rows.map( fn: (r) => ({_value: r._value * 100.0}))',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/rows/map/`,
  },
  {
    name: 'runtime.version',
    args: [],
    package: 'runtime',
    desc: 'Returns the current Flux version.',
    example: 'runtime.version()',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/runtime/version/`,
  },
  {
    name: 'sample',
    args: [
      {
        name: 'n',
        desc: 'Sample every Nth element.',
        type: 'Integer',
      },
      {
        name: 'pos',
        desc:
          'The position offset from the start of results where sampling begins. `pos` must be less than `n`. If `pos` is less than 0, a random offset is used. Defaults to `-1` (random offset).',
        type: 'Integer',
      },
    ],
    package: '',
    desc: 'Selects a subset of the records from the input table.',
    example: 'sample(n:5, pos: -1)',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/sample/`,
  },
  {
    name: 'sample.data',
    args: [
      {
        name: 'set',
        desc: 'InfluxDB sample dataset to download and output.',
        type: 'String',
      },
    ],
    package: 'influxdata/influxdb/sample',
    desc: 'Downloads and outputs an InfluxDB sample dataset.',
    example: 'sample.data(set: "usgs")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-sample/data/`,
  },
  {
    name: 'sample.list',
    args: [],
    package: 'influxdata/influxdb/sample',
    desc: 'Outputs information about available InfluxDB sample datasets.',
    example: 'sample.list()',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-sample/list/`,
  },
  {
    name: 'schema.fieldKeys',
    args: [
      {
        name: 'bucket',
        desc: 'The bucket to list field keys from.',
        type: 'String',
      },
      {
        name: 'predicate',
        desc:
          'Predicate function that filters field keys. Defaults is (r) => true.',
        type: 'Function',
      },
      {
        name: 'start',
        desc: 'The oldest time to include in results. Defaults is `-30d`.',
        type: 'Duration | Time',
      },
    ],
    package: 'influxdata/influxdb/schema',
    desc: 'Returns a list of fields in a bucket.',
    example: 'schema.fieldKeys(bucket: "example-bucket")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-schema/measurementfieldkeys/`,
  },
  {
    name: 'schema.fieldsAsCols',
    args: [],
    package: 'influxdata/influxdb/schema',
    desc: 'Aligns fields within each input table that have the same timestamp.',
    example: 'schema.fieldsAsCols()',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-schema/fieldsascols/`,
  },
  {
    name: 'schema.measurementFieldKeys',
    args: [
      {
        name: 'bucket',
        desc: 'The bucket to list field keys from.',
        type: 'String',
      },
      {
        name: 'measurement',
        desc: 'The measurement to list field keys from.',
        type: 'String',
      },
      {
        name: 'start',
        desc: 'The oldest time to include in results. Defaults is `-30d`.',
        type: 'Duration | Time',
      },
    ],
    package: 'influxdata/influxdb/schema',
    desc: 'Returns a list of fields in a measurement.',
    example:
      'schema.measurementFieldKeys(bucket: "example-bucket", measurement: "example-measurement")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-schema/measurementfieldkeys/`,
  },
  {
    name: 'schema.measurements',
    args: [
      {
        name: 'bucket',
        desc: 'The bucket from which to list measurements.',
        type: 'String',
      },
    ],
    package: 'influxdata/influxdb/schema',
    desc: 'Returns a list of measurements in a specific bucket.',
    example: 'schema.measurements(bucket: "example-bucket")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-schema/measurements/`,
  },
  {
    name: 'schema.measurementTagKeys',
    args: [
      {
        name: 'bucket',
        desc:
          'The bucket from which to return tag keys for a specific measurement.',
        type: 'String',
      },
      {
        name: 'measurement',
        desc: 'The measurement from which to return tag keys.',
        type: 'String',
      },
    ],
    package: 'influxdata/influxdb/schema',
    desc: 'Returns a list of tag keys for a specific measurement.',
    example:
      'schema.measurementTagKeys(bucket: "example-bucket", measurement: "mem")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-schema/measurementtagkeys/`,
  },
  {
    name: 'schema.measurementTagValues',
    args: [
      {
        name: 'bucket',
        desc:
          'The bucket from which to return tag keys for a specific measurement.',
        type: 'String',
      },
      {
        name: 'measurement',
        desc: 'The measurement from which to return tag values.',
        type: 'String',
      },
      {
        name: 'tag',
        desc: 'The tag from which to return all unique values.',
        type: 'String',
      },
    ],
    package: 'influxdata/influxdb/schema',
    desc: 'Returns a list of tag values for a specific measurement.',
    example:
      'schema.measurementTagValues(bucket: "example-bucket", measurement: "mem", tag: "host")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-schema/measurementtagvalues/`,
  },
  {
    name: 'schema.tagKeys',
    args: [
      {
        name: 'bucket',
        desc: 'The bucket from which to list tag keys.',
        type: 'String',
      },
      {
        name: 'predicate',
        desc:
          'The predicate function that filters tag keys. Defaults to `(r) => true.`',
        type: 'Function',
      },
      {
        name: 'start',
        desc:
          'Specifies the oldest time to be included in the results. Defaults to `-30d`.',
        type: 'Duration | Time',
      },
    ],
    package: 'influxdata/influxdb/schema',
    desc: 'Returns a list of tag keys for all series that match the predicate.',
    example: 'schema.tagKeys(bucket: "example-bucket")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-schema/tagkeys/`,
  },
  {
    name: 'schema.tagValues',
    args: [
      {
        name: 'bucket',
        desc: 'The bucket from which to list tag values.',
        type: 'String',
      },
      {
        name: 'tag',
        desc: 'The tag for which to return unique values.',
        type: 'String',
      },
      {
        name: 'predicate',
        desc:
          'The predicate function that filters tag values. Defaults to `(r) => true.`',
        type: 'Function',
      },
      {
        name: 'start',
        desc:
          'Specifies the oldest time to be included in the results. Defaults to `-30d`.',
        type: 'Duration | Time',
      },
    ],
    package: 'influxdata/influxdb/schema',
    desc: 'Returns a list of unique values for a given tag.',
    example: 'schema.tagValues(bucket: "example-bucket", tag: "example-tag")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-schema/tagvalues/`,
  },
  {
    name: 'secrets.get',
    args: [
      {
        name: 'key',
        desc: 'The secret key to retrieve.',
        type: 'String',
      },
    ],
    package: 'influxdata/influxdb/secrets',
    desc: 'Retrieves a secret from the InfluxDB secret store.',
    example: 'secrets.get(key: "KEY_NAME")',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/secrets/get/`,
  },
  {
    name: 'sensu.endpoint',
    args: [
      {
        name: 'url',
        desc:
          'Base URL of Sensu API without a trailing slash. Example: `http://localhost:8080`.',
        type: 'String',
      },
      {
        name: 'apiKey',
        desc: 'Sensu API Key.',
        type: 'String',
      },
      {
        name: 'handlers',
        desc: 'Sensu handlers to execute. Default is `[]`.',
        type: 'Array of Strings',
      },
      {
        name: 'namespace',
        desc: 'Sensu namespace. Default is `default`.',
        type: 'String',
      },
      {
        name: 'entityName',
        desc:
          'Event source. Use alphanumeric characters, underscores (`_`), periods (`.`), and hyphens (`-`).',
        type: 'String',
      },
    ],
    package: 'contrib/sranka/sensu',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = sensu.endpoint(
    url: "http://localhost:8080",
    apiKey: "mYSuP3rs3cREtApIK3Y",
    handlers: [],
    namespace: "default",
    entityName: "influxdb"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/sensu/endpoint/`,
  },
  {
    name: 'sensu.event',
    args: [
      {
        name: 'url',
        desc:
          'Base URL of Sensu API without a trailing slash. Example: `http://localhost:8080`.',
        type: 'String',
      },
      {
        name: 'apiKey',
        desc: 'Sensu API Key.',
        type: 'String',
      },
      {
        name: 'checkName',
        desc:
          'Check name. Use alphanumeric characters, underscores (`_`), periods (`.`), and hyphens (`-`).',
        type: 'String',
      },
      {
        name: 'text',
        desc: 'Event text. Mapped to `output` in the Sensu Events API request.',
        type: 'String',
      },
      {
        name: 'handlers',
        desc: 'Sensu handlers to execute. Default is `[]`.',
        type: 'Array of Strings',
      },
      {
        name: 'status',
        desc: 'Event status code that indicates state. Default is `0`.',
        type: 'Integer',
      },
      {
        name: 'state',
        desc:
          'Event state. Default is "passing" for 0 status and "failing" for other statuses.',
        type: 'String',
      },
      {
        name: 'namespace',
        desc: 'Sensu namespace. Default is `default`.',
        type: 'String',
      },
      {
        name: 'entityName',
        desc:
          'Event source. Use alphanumeric characters, underscores (`_`), periods (`.`), and hyphens (`-`).',
        type: 'String',
      },
    ],
    package: 'contrib/sranka/sensu',
    desc: 'Sends a single event to the Sensu Events API.',
    example: `sensu.event(
    url: "http://localhost:8080",
    apiKey: "mYSuP3rs3cREtApIK3Y",
    checkName: "checkName",
    text: "Event output text",
    handlers: [],
    status: 0,
    state: "passing",
    namespace: "default",
    entityName: "influxdb"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/sensu/event/`,
  },
  {
    name: 'set',
    args: [
      {
        name: 'key',
        desc: 'The label of the column to modify or set.',
        type: 'String',
      },
      {
        name: 'value',
        desc: 'The string value to set.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Assigns a static value to each record in the input table. The key may modify an existing column or add a new column to the tables. If the modified column is part of the group key, the output tables are regrouped as needed.',
    example: 'set(key: "_field", value: "my_field")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/set/`,
  },
  {
    name: 'skew',
    args: [
      {
        name: 'column',
        desc: 'The column on which to operate. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Outputs the skew of non-null records as a float.',
    example: 'skew(column: "_value")',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/skew/`,
  },
  {
    name: 'slack.endpoint',
    args: [
      {
        name: 'url',
        desc:
          'The Slack API URL. Defaults to `https://slack.com/api/chat.postMessage`.',
        type: 'String',
      },
      {
        name: 'token',
        desc:
          'The Slack API token used to interact with Slack. Defaults to `""`.',
        type: 'String',
      },
    ],
    package: 'slack',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = slack.endpoint(
    url: "https://slack.com/api/chat.postMessage",
    token: "mySuPerSecRetTokEn"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/slack/endpoint/`,
  },
  {
    name: 'slack.message',
    args: [
      {
        name: 'url',
        desc:
          'The Slack API URL. Defaults to `https://slack.com/api/chat.postMessage`.',
        type: 'String',
      },
      {
        name: 'token',
        desc:
          'The Slack API token used to interact with Slack. Defaults to `""`.',
        type: 'String',
      },
      {
        name: 'channel',
        desc: 'The name of channel to post the message to.',
        type: 'String',
      },
      {
        name: 'text',
        desc: 'The text to display in the Slack message.',
        type: 'String',
      },
      {
        name: 'color',
        desc: 'The color to include with the message.',
        type: 'String',
      },
    ],
    package: 'slack',
    desc: 'Sends a single message to a Slack channel.',
    example: `slack.message(
    url: "https://slack.com/api/chat.postMessage",
    token: "mySuPerSecRetTokEn",
    channel: "#flux",
    text: "This is a message from the Flux slack.message() function.",
    color: "good"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/slack/message/`,
  },
  {
    name: 'sleep',
    args: [
      {
        name: 'v',
        desc: 'Defines input tables.',
        type: 'Object',
      },
      {
        name: 'duration',
        desc: 'The length of time to delay execution.',
        type: 'Duration',
      },
    ],
    package: '',
    desc: 'Delays execution by a specified duration.',
    example: 'sleep(duration: 5s)',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/misc/sleep/`,
  },
  {
    name: 'sort',
    args: [
      {
        name: 'columns',
        desc:
          'List of columns by which to sort. Sort precedence is determined by list order (left to right). Default is `["_value"]`.',
        type: 'Array of Strings',
      },
      {
        name: 'desc',
        desc: 'Sort results in descending order. Default is `false`.',
        type: 'Boolean',
      },
    ],
    package: '',
    desc:
      'Orders the records within each table. One output table is produced for each input table. The output tables will have the same schema as their corresponding input tables.',
    example: 'sort(columns: ["_value"], desc: false)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/sort/`,
  },
  {
    name: 'spread',
    args: [
      {
        name: 'column',
        desc: 'The column on which to operate. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Outputs the difference between the minimum and maximum values in the specified column. Only `uint`, `int`, and `float` column types can be used.',
    example: 'spread(column: "_value")',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/spread/`,
  },
  {
    name: 'sql.from',
    args: [
      {
        name: 'driverName',
        desc: 'The driver used to connect to the SQL database.',
        type: 'String',
      },
      {
        name: 'dataSourceName',
        desc:
          'The connection string used to connect to the SQL database. The string’s form and structure depend on the driver.',
        type: 'String',
      },
      {
        name: 'query',
        desc: 'The query to run against the SQL database.',
        type: 'String',
      },
    ],
    package: 'sql',
    desc: 'Retrieves data from a SQL data source.',
    example:
      'sql.from(driverName: "postgres", dataSourceName: "postgresql://user:password@localhost", query:"SELECT * FROM example_table")',
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/sql/from/`,
  },
  {
    name: 'sql.to',
    args: [
      {
        name: 'driverName',
        desc: 'The driver used to connect to the SQL database.',
        type: 'String',
      },
      {
        name: 'dataSourceName',
        desc:
          'The connection string used to connect to the SQL database. The string’s form and structure depend on the driver.',
        type: 'String',
      },
      {
        name: 'table',
        desc: 'The destination table.',
        type: 'String',
      },
      {
        name: 'batchSize',
        desc:
          'The number of parameters or columns that can be queued within each call to `Exec`. Defaults to `10000`.',
        type: 'Integer',
      },
    ],
    package: 'sql',
    desc: 'Writes data to a SQL database.',
    example:
      'sql.to(driverName: "postgres", dataSourceName: "postgresql://user:password@localhost", table: "example_table")',
    category: 'Outputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/sql/to/`,
  },
  {
    name: 'stateCount',
    args: [
      {
        name: 'fn',
        desc:
          'A single argument function that evaluates true or false to identify the state of the record.',
        type: 'Function',
      },
      {
        name: 'column',
        desc:
          'The name of the column added to each record that contains the incremented state count.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Computes the number of consecutive records in a given state and stores the increment in a new column.',
    example: 'stateCount(fn: (r) => r._field == "state", column: "stateCount")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/statecount/`,
  },
  {
    name: 'stateDuration',
    args: [
      {
        name: 'fn',
        desc:
          'A single argument function that evaluates true or false to identify the state of the record.',
        type: 'Function',
      },
      {
        name: 'column',
        desc:
          'Name of the column added to each record that contains the incremented state duration.',
        type: 'String',
      },
      {
        name: 'unit',
        desc: 'Unit of time in which the state duration is incremented.',
        type: 'Duration',
      },
    ],
    package: '',
    desc:
      'Computes the duration of a given state and stores the increment in a new column.',
    example:
      'stateDuration(fn: (r) => r._measurement == "state", column: "stateDuration", unit: 1s)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/stateduration/`,
  },
  {
    name: 'stddev',
    args: [
      {
        name: 'column',
        desc: 'The column on which to operate. Defaults to `"_value"`.',
        type: 'String',
      },
      {
        name: 'mode',
        desc:
          'The standard deviation mode (sample or population). Defaults to `"sample"`.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Computes the standard deviation of non-null records in specified column.',
    example: 'stddev(column: "_value", mode: "sample")',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/stddev/`,
  },
  {
    name: 'string',
    args: [
      {
        name: 'v',
        desc: 'The value to convert.',
        type: 'Integer | UInteger | Float | Boolean | Duration | Time',
      },
    ],
    package: '',
    desc: 'Converts a single value to a string.',
    example: 'string(v: r._value)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/string/`,
  },
  {
    name: 'strings.compare',
    args: [
      {
        name: 'v',
        desc: 'The string value to compare.',
        type: 'String',
      },
      {
        name: 't',
        desc: 'The string value to compare against.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Compares the lexicographical order of two strings.',
    example: 'strings.compare(v: "a", t: "b")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/compare/`,
  },
  {
    name: 'strings.containsAny',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'chars',
        desc: 'Characters to search for.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Reports whether a specified string contains characters from another string.',
    example: 'strings.containsAny(v: "abc", chars: "and")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/containsany/`,
  },
  {
    name: 'strings.containsStr',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'substr',
        desc: 'The substring to search for.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Reports whether a string contains a specified substring.',
    example: 'strings.containsStr(v: "This and that", substr: "and")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/containsstr/`,
  },
  {
    name: 'strings.countStr',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'substr',
        desc: 'The substring count.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Counts the number of non-overlapping instances of a substring appears in a string.',
    example: 'strings.countStr(v: "Hello mellow fellow", substr: "ello")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/countstr/`,
  },
  {
    name: 'strings.equalFold',
    args: [
      {
        name: 'v',
        desc: 'The string value to compare.',
        type: 'String',
      },
      {
        name: 't',
        desc: 'The string value to compare against.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Reports whether two UTF-8 strings are equal under Unicode case-folding.',
    example: 'strings.equalFold(v: "Go", t: "go")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/equalfold/`,
  },
  {
    name: 'strings.hasPrefix',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'prefix',
        desc: 'The prefix to search for.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Indicates if a string begins with a specified prefix.',
    example: 'strings.hasPrefix(v: "go gopher", prefix: "go")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/hasprefix/`,
  },
  {
    name: 'strings.hasSuffix',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'suffix',
        desc: 'The suffix to search for.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Indicates if a string ends with a specified suffix.',
    example: 'strings.hasSuffix(v: "gopher go", suffix: "go")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/hassuffix/`,
  },
  {
    name: 'strings.index',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'substr',
        desc: 'The substring to search for.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Returns the index of the first instance of a substring in a string. If the substring is not present, it returns `-1`.',
    example: 'strings.index(v: "go gopher", substr: "go")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/index-func/`,
  },
  {
    name: 'strings.indexAny',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'chars',
        desc: 'Characters to search for.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Returns the index of the first instance of specified characters in a string. If none of the specified characters are present, it returns -1.',
    example: 'strings.indexAny(v: "chicken", chars: "aeiouy")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/indexany/`,
  },
  {
    name: 'strings.isDigit',
    args: [
      {
        name: 'v',
        desc: 'The single-character string to test.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Tests if a single-character string is a digit (0-9).',
    example: 'strings.isDigit(v: "7")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/isdigit/`,
  },
  {
    name: 'strings.isLetter',
    args: [
      {
        name: 'v',
        desc: 'The single-character string to test.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Tests if a single-character string is a letter (a-z, A-Z).',
    example: 'strings.isLetter(v: "A")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/isletter/`,
  },
  {
    name: 'strings.isLower',
    args: [
      {
        name: 'v',
        desc: 'The single-character string to test.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Tests if a single-character string is lowercase.',
    example: 'strings.isLower(v: "a")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/islower/`,
  },
  {
    name: 'strings.isUpper',
    args: [
      {
        name: 'v',
        desc: 'The single-character string to test.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Tests if a single-character string is uppercase.',
    example: 'strings.isUpper(v: "A")',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/isupper/`,
  },
  {
    name: 'strings.joinStr',
    args: [
      {
        name: 'arr',
        desc: 'The array of strings to concatenate.',
        type: 'Array of Strings',
      },
      {
        name: 'v',
        desc: 'The separator to use in the concatenated value.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Concatenates elements of a string array into a single string using a specified separator.',
    example: 'strings.joinStr(arr: ["a", "b", "c"], v: ",")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/joinstr/`,
  },
  {
    name: 'strings.lastIndex',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'substr',
        desc: 'The substring to search for.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Returns the index of the last instance of a substring in a string. If the substring is not present, the function returns -1.',
    example: 'strings.lastIndex(v: "go gopher", substr: "go")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/lastindex/`,
  },
  {
    name: 'strings.lastIndexAny',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'chars',
        desc: 'Characters to search for.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Returns the index of the last instance of any specified characters in a string. If none of the specified characters are present, the function returns -1.',
    example: 'strings.lastIndexAny(v: "chicken", chars: "aeiouy")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/lastindexany/`,
  },
  {
    name: 'strings.repeat',
    args: [
      {
        name: 'v',
        desc: 'The string value to repeat.',
        type: 'String',
      },
      {
        name: 'i',
        desc: 'The number of times to repeat `v`.',
        type: 'Integer',
      },
    ],
    package: 'strings',
    desc: 'Returns a string consisting of `i` copies of a specified string.',
    example: 'strings.repeat(v: "ha", i: 3)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/repeat/`,
  },
  {
    name: 'strings.replace',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 't',
        desc: 'The substring to replace.',
        type: 'String',
      },
      {
        name: 'u',
        desc: 'The replacement for `i` instances of `t`.',
        type: 'String',
      },
      {
        name: 'i',
        desc: 'The number of non-overlapping `t` matches to replace.',
        type: 'Integer',
      },
    ],
    package: 'strings',
    desc:
      'Replaces the first `i` non-overlapping instances of a substring with a specified replacement.',
    example: 'strings.replace(v: "oink oink oink", t: "oink", u: "moo", i: 2)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/replace/`,
  },
  {
    name: 'strings.replaceAll',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 't',
        desc: 'The substring to replace.',
        type: 'String',
      },
      {
        name: 'u',
        desc: 'The replacement for all instances of `t`.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Replaces all non-overlapping instances of a substring with a specified replacement.',
    example: 'strings.replaceAll(v: "oink oink oink", t: "oink", u: "moo")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/replaceall/`,
  },
  {
    name: 'strings.split',
    args: [
      {
        name: 'v',
        desc: 'The string value to split.',
        type: 'String',
      },
      {
        name: 't',
        desc: 'The string value that acts as the separator.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Splits a string on a specified separator and returns an array of substrings.',
    example: 'strings.split(v: "a flux of foxes", t: " ")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/split/`,
  },
  {
    name: 'strings.splitAfter',
    args: [
      {
        name: 'v',
        desc: 'The string value to split.',
        type: 'String',
      },
      {
        name: 't',
        desc: 'The string value that acts as the separator.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Splits a string after a specified separator and returns an array of substrings.',
    example: 'strings.splitAfter(v: "a flux of foxes", t: " ")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/splitafter/`,
  },
  {
    name: 'strings.splitAfterN',
    args: [
      {
        name: 'v',
        desc: 'The string value to split.',
        type: 'String',
      },
      {
        name: 't',
        desc: 'The string value that acts as the separator.',
        type: 'String',
      },
      {
        name: 'i',
        desc: 'The number of substrings to return.',
        type: 'Integer',
      },
    ],
    package: 'strings',
    desc:
      'Splits a string after a specified separator and returns an array of `i` substrings.',
    example: 'strings.splitAfterN(v: "a flux of foxes", t: " ", i: 2)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/splitaftern/`,
  },
  {
    name: 'strings.splitN',
    args: [
      {
        name: 'v',
        desc: 'The string value to split.',
        type: 'String',
      },
      {
        name: 't',
        desc: 'The string value that acts as the separator.',
        type: 'String',
      },
      {
        name: 'i',
        desc: 'The number of substrings to return.',
        type: 'Integer',
      },
    ],
    package: 'strings',
    desc:
      'Splits a string on a specified separator and returns an array of `i` substrings.',
    example: 'strings.splitN(v: "a flux of foxes", t: " ", i: 2)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/splitn/`,
  },
  {
    name: 'strings.strlen',
    args: [
      {
        name: 'v',
        desc: 'The string value to measure.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Returns the length of a string.',
    example: 'strings.strlen(v: "a flux of foxes")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/strlen/`,
  },
  {
    name: 'strings.substring',
    args: [
      {
        name: 'v',
        desc: 'The string value to search.',
        type: 'String',
      },
      {
        name: 'start',
        desc: 'The starting index of the substring.',
        type: 'Integer',
      },
      {
        name: 'end',
        desc: 'The ending index of the substring.',
        type: 'Integer',
      },
    ],
    package: 'strings',
    desc: 'Returns a substring based on start and end parameters.',
    example: 'strings.substring(v: "influx", start: 0, end: 3)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/substring/`,
  },
  STRINGS_TITLE,
  {
    name: 'strings.toLower',
    args: [
      {
        name: 'v',
        desc: 'The string value to convert.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Converts a string to lower case.',
    example: 'strings.toLower(v: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/tolower/`,
  },
  {
    name: 'strings.toTitle',
    args: [
      {
        name: 'v',
        desc: 'The string value to convert.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Converts all characters in a string to title case.',
    example: 'strings.toTitle(v: "a flux of foxes")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/totitle/`,
  },
  {
    name: 'strings.toUpper',
    args: [
      {
        name: 'v',
        desc: 'The string value to convert.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Converts a string to upper case.',
    example: 'strings.toUpper(v: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/toupper/`,
  },
  STRINGS_TRIM,
  {
    name: 'strings.trimLeft',
    args: [
      {
        name: 'v',
        desc: 'The string to remove characters from.',
        type: 'String',
      },
      {
        name: 'cutset',
        desc: 'The leading characters to remove from the string.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Removes specified leading characters from a string.',
    example: 'strings.trimLeft(v: ".abc", cutset: ".")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/trimleft/`,
  },
  {
    name: 'strings.trimPrefix',
    args: [
      {
        name: 'v',
        desc: 'The string value to trim.',
        type: 'String',
      },
      {
        name: 'prefix',
        desc: 'The prefix to remove.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Removes a prefix from a string. Strings that do not start with the prefix are returned unchanged.',
    example: 'strings.trimPrefix(v: r._value, prefix: "abc_")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/trimprefix/`,
  },
  {
    name: 'strings.trimRight',
    args: [
      {
        name: 'v',
        desc: 'The string to remove characters from.',
        type: 'String',
      },
      {
        name: 'cutset',
        desc: 'The trailing characters to remove from the string.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Removes specified trailing characters from a string.',
    example: 'strings.trimRight(v: "abc.", cutset: ".")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/trimright/`,
  },
  {
    name: 'strings.trimSpace',
    args: [
      {
        name: 'v',
        desc: 'The string value to trim.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc: 'Removes leading and trailing spaces from a string.',
    example: 'strings.trimSpace(v: r._value)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/trimspace/`,
  },
  {
    name: 'strings.trimSuffix',
    args: [
      {
        name: 'v',
        desc: 'The string value to trim.',
        type: 'String',
      },
      {
        name: 'suffix',
        desc: 'The suffix to remove.',
        type: 'String',
      },
    ],
    package: 'strings',
    desc:
      'Removes a suffix from a string. Strings that do not end with the suffix are returned unchanged.',
    example: 'strings.trimSuffix(v: r._value, suffix: "_123")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/strings/trimsuffix/`,
  },
  {
    name: 'sum',
    args: [
      {
        name: 'column',
        desc: 'The column on which to operate. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Computes the sum of non-null records in the specified column.',
    example: 'sum(column: "_value")',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/sum/`,
  },
  {
    name: 'system.time',
    args: [],
    package: 'system',
    desc: 'Returns the current system time.',
    example: 'system.time()',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/system/time/`,
  },
  {
    name: 'table.fill',
    args: [],
    package: 'experimental/table',
    desc: 'Adds a single row to empty tables in a stream of tables.',
    example: 'table.fill()',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/table/fill/`,
  },
  {
    name: 'tableFind',
    args: [
      {
        name: 'fn',
        desc: 'A predicate function for matching keys in a table group key.',
        type: 'Function',
      },
    ],
    package: '',
    desc:
      'Extracts the first table in a stream of tables whose group key values match a predicate. If no table is found, the function errors.',
    example: 'tableFind(fn: (key) => key._field == "fieldName")',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/stream-table/tablefind/`,
  },
  {
    name: 'tail',
    args: [
      {
        name: 'n',
        desc: 'The maximum number of records to output.',
        type: 'Integer',
      },
      {
        name: 'offset',
        desc:
          'The number of records to skip at the end of a table before limiting to `n`. Defaults to `0`.',
        type: 'Integer',
      },
    ],
    package: '',
    desc:
      'Limits each output table to the last `n` records, excluding the offset.',
    example: 'tail(n: 10)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/tail/`,
  },
  {
    name: 'tasks.lastSuccess',
    args: [
      {
        name: 'orTime',
        desc:
          'Default time value returned if the task has never successfully run.',
        type: 'Time',
      },
    ],
    package: 'influxdata/influxdb/tasks',
    desc:
      'Returns the time of last successful run of an InfluxDB task or the value of the `orTime` parameter if the task has never successfully run.',
    example: 'tasks.lastSuccess(orTime: 2020-10-01T00:00:00Z)',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/influxdb-tasks/lastsuccess/`,
  },
  {
    name: 'teams.endpoint',
    args: [
      {
        name: 'url',
        desc: 'Incoming webhook URL.',
        type: 'String',
      },
    ],
    package: 'contrib/sranka/teams',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = teams.endpoint(
    url: "https://outlook.office.com/webhook/example-webhook"
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/teams/endpoint/`,
  },
  {
    name: 'teams.message',
    args: [
      {
        name: 'url',
        desc: 'Incoming webhook URL.',
        type: 'String',
      },
      {
        name: 'title',
        desc: 'Message card title.',
        type: 'String',
      },
      {
        name: 'text',
        desc: 'Message card text.',
        type: 'String',
      },
      {
        name: 'summary',
        desc:
          'Message card summary. Default is `""`. If no summary is provided, Flux generates the summary from the message text.',
        type: 'String',
      },
    ],
    package: 'contrib/sranka/teams',
    desc:
      'Sends a single message to a Microsoft Teams channel using an incoming webhook.',
    example: `teams.message(
    url: "https://outlook.office.com/webhook/example-webhook",
    title: "Example message title",
    text: "Example message text",
    summary: "",
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/teams/message/`,
  },
  {
    name: 'telegram.endpoint',
    args: [
      {
        name: 'url',
        desc:
          'URL of the Telegram bot endpoint. Default is `https://api.telegram.org/bot`.',
        type: 'String',
      },
      {
        name: 'token',
        desc: 'Telegram bot token.',
        type: 'String',
      },
      {
        name: 'parseMode',
        desc: 'Parse mode of the message text. Default is `"MarkdownV2"`.',
        type: 'String',
      },
      {
        name: 'disableWebPagePreview',
        desc:
          'Disable preview of web links in the sent message. Default is `false`.',
        type: 'Boolean',
      },
    ],
    package: 'contrib/sranka/telegram',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = telegram.endpoint(
    url: "https://api.telegram.org/bot",
    token: "S3crEtTel3gRamT0k3n",
    parseMode: "MarkdownV2",
    disableWebPagePreview: false,
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/telegram/endpoint/`,
  },
  {
    name: 'telegram.message',
    args: [
      {
        name: 'url',
        desc:
          'URL of the Telegram bot endpoint. Default is `https://api.telegram.org/bot`.',
        type: 'String',
      },
      {
        name: 'token',
        desc: 'Telegram bot token.',
        type: 'String',
      },
      {
        name: 'channel',
        desc: 'Telegram channel ID.',
        type: 'String',
      },
      {
        name: 'text',
        desc: 'Message text.',
        type: 'String',
      },
      {
        name: 'parseMode',
        desc: 'Parse mode of the message text. Default is `"MarkdownV2"`.',
        type: 'String',
      },
      {
        name: 'disableWebPagePreview',
        desc:
          'Disable preview of web links in the sent message. Default is `false`.',
        type: 'Boolean',
      },
      {
        name: 'silent',
        desc: 'Send message silently. Default is `true`.',
        type: 'Boolean',
      },
    ],
    package: 'contrib/sranka/telegram',
    desc:
      'Sends a single message to a Telegram channel using the sendMessage method of the Telegram Bot API.',
    example: `telegram.message(
    url: "https://api.telegram.org/bot",
    token: "S3crEtTel3gRamT0k3n",
    channel: "-12345",
    text: "Example message text",
    parseMode: "MarkdownV2",
    disableWebPagePreview: false,
    silent: true
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/telegram/message/`,
  },
  {
    name: 'testing.assertEmpty',
    args: [],
    package: 'testing',
    desc: 'Tests if an input stream is empty.',
    example: 'testing.assertEmpty()',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/testing/assertempty/`,
  },
  {
    name: 'testing.assertEquals',
    args: [
      {
        name: 'name',
        desc: 'Unique name given to the assertion.',
        type: 'String',
      },
      {
        name: 'got',
        desc: 'The stream containing data to test.',
        type: 'Stream of tables',
      },
      {
        name: 'want',
        desc: 'The stream that contains the expected data to test against.',
        type: 'Stream of tables',
      },
    ],
    package: 'testing',
    desc: 'Tests whether two streams have identical data.',
    example: 'testing.assertEquals(got: got, want: want)',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/testing/assertequals/`,
  },
  {
    name: 'testing.benchmark',
    args: [
      {
        name: 'case',
        desc: 'Test case to benchmark.',
        type: 'Function',
      },
    ],
    package: 'testing',
    desc:
      'Executes a test case without comparing test output with the expected test output.',
    example: 'testing.benchmark(case: exampleTestCase)',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/testing/benchmark/`,
  },
  {
    name: 'testing.diff',
    args: [
      {
        name: 'got',
        desc: 'The stream containing data to test.',
        type: 'Stream of tables',
      },
      {
        name: 'want',
        desc: 'The stream that contains the expected data to test against.',
        type: 'Stream of tables',
      },
      {
        name: 'epsilon',
        desc:
          'How far apart two float values can be, but still considered equal. Defaults to `0.000000001`.',
        type: 'Float',
      },
    ],
    package: 'testing',
    desc: 'Produces a diff between two streams.',
    example: 'testing.assertEquals(got: got, want: want)',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/testing/diff/`,
  },
  {
    name: 'testing.inspect',
    args: [
      {
        name: 'case',
        desc: 'Test case to inspect.',
        type: 'Function',
      },
    ],
    package: 'testing',
    desc: 'Returns information about a test case.',
    example: 'testing.inspect(case: exampleTestCase)',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/testing/inspect/`,
  },
  {
    name: 'testing.load',
    args: [],
    package: 'testing',
    desc: 'Loads tests data from a stream of tables.',
    example: 'testing.load()',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/testing/inspect/`,
  },
  {
    name: 'testing.loadMem',
    args: [
      {
        name: 'csv',
        desc: 'Annotated CSV data to load.',
        type: 'String',
      },
    ],
    package: 'testing',
    desc:
      'Loads annotated CSV test data from memory to emulate query results returned by Flux.',
    example: 'testing.loadMem(csv: csvData)',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/testing/loadmem/`,
  },
  {
    name: 'testing.loadStorage',
    args: [
      {
        name: 'csv',
        desc: 'Annotated CSV data to load.',
        type: 'String',
      },
    ],
    package: 'testing',
    desc: 'Loads annotated CSV test data as if it were queried from InfluxDB.',
    example: 'testing.loadStorage(csv: csvData)',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/testing/loadstorage/`,
  },
  {
    name: 'testing.run',
    args: [
      {
        name: 'case',
        desc: 'Test case to run.',
        type: 'Function',
      },
    ],
    package: 'testing',
    desc: 'Executes a specified test case.',
    example: 'testing.run(case: exampleTestCase)',
    category: 'Tests',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/testing/run/`,
  },
  {
    name: 'tickscript.alert',
    args: [
      {
        name: 'check',
        desc: 'InfluxDB check data. See `tickscript.defineCheck()`.',
        type: 'Record',
      },
      {
        name: 'id',
        desc:
          'Function that returns the InfluxDB check ID provided by the check record. Default is `(r) => "${r._check_id}"`.',
        type: 'Function',
      },
      {
        name: 'details',
        desc:
          'Function to return the InfluxDB check details using data from input rows. Default is `(r) => ""`.',
        type: 'Function',
      },
      {
        name: 'message',
        desc:
          'Function to return the InfluxDB check message using data from input rows. Default is `(r) => "Threshold Check: ${r._check_name} is: ${r._level}"`.',
        type: 'Function',
      },
      {
        name: 'crit',
        desc:
          'Predicate function to determine crit status. Default is `(r) => false`.',
        type: 'Function',
      },
      {
        name: 'warn',
        desc:
          'Predicate function to determine warn status. Default is `(r) => false`.',
        type: 'Function',
      },
      {
        name: 'info',
        desc:
          'Predicate function to determine info status. Default is `(r) => false`.',
        type: 'Function',
      },
      {
        name: 'ok',
        desc:
          'Predicate function to determine ok status. Default is `(r) => false`.',
        type: 'Function',
      },
      {
        name: 'topic',
        desc: 'Check topic. Default is `""`.',
        type: 'String',
      },
    ],
    package: 'contrib/bonitoo-io/tickscript',
    desc:
      'Identifies events of varying severity levels and writes them to the statuses measurement in the InfluxDB `_monitoring` system bucket.',
    example: `tickscript.alert(
    check,
    id: (r) => "\${r._check_id}",
    details: (r) => "",
    message: (r) => "Threshold Check: \${r._check_name} is: \${r._level}",
    crit: (r) => false,
    warn: (r) => false,
    info: (r) => false,
    ok: (r) => true,
    topic: ""
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/tickscript/alert/`,
  },
  {
    name: 'tickscript.compute',
    args: [
      {
        name: 'column',
        desc: 'Column to operate on. Default is `_value`.',
        type: 'String',
      },
      {
        name: 'fn',
        desc: 'Aggregate or selector function to apply.',
        type: 'Function',
      },
      {
        name: 'as',
        desc: 'New column name.',
        type: 'String',
      },
    ],
    package: 'contrib/bonitoo-io/tickscript',
    desc:
      'An alias for `tickscript.select()` that changes a column’s name and optionally applies an aggregate or selector function.',
    example: `tickscript.compute(
    column: "_value",
    fn: sum,
    as: "example-name"
)`,
    category: 'Outputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/tickscript/compute/`,
  },
  {
    name: 'tickscript.deadman',
    args: [
      {
        name: 'check',
        desc: 'InfluxDB check data. See `tickscript.defineCheck()`.',
        type: 'Record',
      },
      {
        name: 'measurement',
        desc: 'Measurement name. Should match the queried measurement.',
        type: 'String',
      },
      {
        name: 'threshold',
        desc:
          'Count threshold. The function assigns a `crit` status to input tables with a number of rows less than or equal to the threshold. Default is `0`.',
        type: 'Integer',
      },
      {
        name: 'id',
        desc:
          'Function that returns the InfluxDB check ID provided by the check record. Default is `(r) => "${r._check_id}"`.',
        type: 'Function',
      },
      {
        name: 'message',
        desc:
          'Function that returns the InfluxDB check message using data from input rows. Default is `(r) => "Deadman Check: ${r._check_name} is: " + (if r.dead then "dead" else "alive")`.',
        type: 'Function',
      },
      {
        name: 'topic',
        desc: 'Check topic. Default is `""`.',
        type: 'String',
      },
    ],
    package: 'contrib/bonitoo-io/tickscript',
    desc:
      'Detects low data throughput and writes a point with a critical status to the InfluxDB `_monitoring` system bucket.',
    example: `tickscript.deadman(
    check: {},
    measurement: "example-measurement",
    threshold: 0,
    id: (r)=>"\${r._check_id}",
    message: (r) => "Deadman Check: \${r._check_name} is: " + (if r.dead then "dead" else "alive"),
    topic: ""
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/tickscript/deadman/`,
  },
  {
    name: 'tickscript.defineCheck',
    args: [
      {
        name: 'id',
        desc: 'InfluxDB check ID.',
        type: 'String',
      },
      {
        name: 'name',
        desc: 'InfluxDB check name.',
        type: 'String',
      },
      {
        name: 'type',
        desc:
          'InfluxDB check type. Default is `custom`. Valid types are `thresold`, `deadman`, and `custom`.',
        type: 'String',
      },
    ],
    package: 'contrib/bonitoo-io/tickscript',
    desc:
      'Creates and returns a record with custom check data required by `tickscript.alert()` and `tickscript.deadman()`.',
    example: `tickscript.defineCheck(
    id: "000000000000",
    name: "Example check name",
    type: "custom"
)`,
    category: 'Outputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/tickscript/definecheck/`,
  },
  {
    name: 'tickscript.groupBy',
    args: [
      {
        name: 'columns',
        desc: 'List of columns to group by.',
        type: 'Array of Strings',
      },
    ],
    package: 'contrib/bonitoo-io/tickscript',
    desc:
      'Groups results by the _measurement column and other specified columns.',
    example: `tickscript.groupBy(
    columns: ["exampleColumn"]
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/tickscript/groupby/`,
  },
  {
    name: 'tickscript.join',
    args: [
      {
        name: 'tables',
        desc: 'Map of two streams to join.',
        type: 'Record',
      },
      {
        name: 'on',
        desc: 'List of columns to join on. Default is `["_time"]`.',
        type: 'Array of Strings',
      },
      {
        name: 'measurement',
        desc: 'Measurement name to use in results.',
        type: 'String',
      },
    ],
    package: 'contrib/bonitoo-io/tickscript',
    desc:
      'Merges two input streams into a single output stream based on specified columns with equal values and appends a new measurement name.',
    example: `tickscript.join(
    tables: {t1: example1, t2: example2},
    on: ["_time"],
    measurement: "example-measurement"
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/tickscript/join/`,
  },
  {
    name: 'tickscript.select',
    args: [
      {
        name: 'column',
        desc: 'Column to operate on. Default is `_value`.',
        type: 'String',
      },
      {
        name: 'fn',
        desc: 'Aggregate or selector function to apply.',
        type: 'Function',
      },
      {
        name: 'as',
        desc: 'New column name.',
        type: 'String',
      },
    ],
    package: 'contrib/bonitoo-io/tickscript',
    desc:
      'Changes a column’s name and optionally applies an aggregate or selector function to values in the column.',
    example: `tickscript.select(
    column: "_value",
    fn: sum,
    as: "example-name"
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/tickscript/select/`,
  },
  {
    name: 'tickscript.selectWindow',
    args: [
      {
        name: 'column',
        desc: 'Column to operate on. Default is `_value`.',
        type: 'String',
      },
      {
        name: 'fn',
        desc: 'Aggregate or selector function to apply.',
        type: 'Function',
      },
      {
        name: 'as',
        desc: 'New column name.',
        type: 'String',
      },
      {
        name: 'every',
        desc: 'Duration of windows.',
        type: 'Duration',
      },
      {
        name: 'defaultValue',
        desc:
          'Default fill value for null values in `column`. Must be the same data type as `column`.',
        type: 'String | Boolean | Float | Integer | Uinteger | Bytes',
      },
    ],
    package: 'contrib/bonitoo-io/tickscript',
    desc:
      'Changes a column’s name, windows rows by time, and applies an aggregate or selector function the specified column for each window of time.',
    example: `tickscript.selectWindow(
    column: "_value",
    fn: sum,
    as: "example-name",
    every: 1m,
    defaultValue: 0.0,
)`,
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/tickscript/selectwindow/`,
  },
  {
    name: 'time',
    args: [
      {
        name: 'v',
        desc: 'The value to convert.',
        type: 'String | Integer | UInteger',
      },
    ],
    package: '',
    desc: 'Converts a single value to a time.',
    example: 'time(v: r._value)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/time/`,
  },
  {
    name: 'timedMovingAverage',
    args: [
      {
        name: 'every',
        desc: 'The frequency of time windows.',
        type: 'Duration',
      },
      {
        name: 'period',
        desc: 'The length of each averaged time window.',
        type: 'Duration',
      },
      {
        name: 'column',
        desc:
          'The column on which to compute the moving average. Defaults to `"_value"`',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Calculates the mean of values in a defined time range at a specified frequency.',
    example: 'timedMovingAverage(every: 1d, period: 5d)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/timedmovingaverage/`,
  },
  {
    name: 'timeShift',
    args: [
      {
        name: 'duration',
        desc:
          'The amount of time to add to each time value. May be a negative duration.',
        type: 'String',
      },
      {
        name: 'columns',
        desc:
          'The list of all columns to be shifted. Defaults to `["_start", "_stop", "_time"]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc:
      'Adds a fixed duration to time columns. The output table schema is the same as the input table.',
    example: 'timeShift(duration: 10h, columns: ["_start", "_stop", "_time"])',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/timeshift/`,
  },
  {
    name: 'timeWeightedAvg',
    args: [
      {
        name: 'unit',
        desc:
          'The time duration used when computing the time-weighted average.',
        type: 'Duration',
      },
    ],
    package: '',
    desc:
      'Computes the time-weighted average of non-null records in a table using linear interpolation.',
    example: 'timeWeightedAvg(unit: 1m)',
    category: 'Aggregates',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/aggregates/timeweightedavg/`,
  },
  {
    name: 'to',
    args: [
      {
        name: 'bucket',
        desc:
          'The bucket to which data is written. Mutually exclusive with `bucketID`.',
        type: 'String',
      },
      {
        name: 'bucketID',
        desc:
          'The ID of the bucket to which data is written. Mutually exclusive with `bucket`.',
        type: 'String',
      },
      {
        name: 'org',
        desc:
          'The organization name of the specified `bucket`. Only required when writing to a remote host. Mutually exclusive with `orgID`.',
        type: 'String',
      },
      {
        name: 'orgID',
        desc:
          'The organization ID of the specified `bucket`. Only required when writing to a remote host. Mutually exclusive with `org`.',
        type: 'String',
      },
      {
        name: 'host',
        desc:
          'The remote InfluxDB host to which to write. If specified, a `token` is required.',
        type: 'String',
      },
      {
        name: 'token',
        desc:
          'The authorization token to use when writing to a remote host. Required when a `host` is specified.',
        type: 'String',
      },
      {
        name: 'timeColumn',
        desc: 'The time column of the output. Default is `"_time"`.',
        type: 'String',
      },
      {
        name: 'tagColumns',
        desc:
          'The tag columns of the output. Defaults to all columns with type `string`, excluding all value columns and the `_field` column if present.',
        type: 'Array of Strings',
      },
      {
        name: 'fieldFn',
        desc:
          'Function that takes a record from the input table and returns an object. For each record from the input table, `fieldFn` returns an object that maps output the field key to the output value. Default is `(r) => ({ [r._field]: r._value })`',
        type: 'Function',
      },
    ],
    package: '',
    desc: 'The `to()` function writes data to an InfluxDB v2.0 bucket.',
    example: 'to(bucket: "example-bucket", org: "example-org")',
    category: 'Outputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/outputs/to/`,
  },
  {
    name: 'toBool',
    args: [],
    package: '',
    desc: 'Converts all values in the `_value` column to a boolean.',
    example: 'toBool()',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/tobool/`,
  },
  {
    name: 'today',
    args: [],
    package: '',
    desc: 'Returns the `now()` timestamp truncated to the day unit.',
    example: 'today()',
    category: 'Miscellaneous',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/misc/today/`,
  },
  {
    name: 'toFloat',
    args: [],
    package: '',
    desc: 'Converts all values in the `_value` column to a float.',
    example: 'toFloat()',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/tofloat/`,
  },
  {
    name: 'toInt',
    args: [],
    package: '',
    desc: 'Converts all values in the `_value` column to a integer.',
    example: 'toInt()',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/toint/`,
  },
  {
    name: 'top',
    args: [
      {
        name: 'n',
        desc: 'Number of rows to return.',
        type: 'Integer',
      },
      {
        name: 'columns',
        desc:
          'List of columns by which to sort. Sort precedence is determined by list order (left to right). Default is `["_value"]`.',
        type: 'Array of Strings',
      },
    ],
    package: '',
    desc: 'Sorts a table by columns and keeps only the top n rows.',
    example: 'top(n:10, columns: ["_value"])',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/top/`,
  },
  {
    name: 'toString',
    args: [],
    package: '',
    desc: 'Converts a value to a string.',
    example: 'toString()',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/tostring/`,
  },
  {
    name: 'toTime',
    args: [],
    package: '',
    desc: 'Converts a value to a time.',
    example: 'toTime()',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/totime/`,
  },
  {
    name: 'toUInt',
    args: [],
    package: '',
    desc: 'Converts a value to an unsigned integer.',
    example: 'toUInt()',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/touint/`,
  },
  {
    name: 'tripleEMA',
    args: [
      {
        name: 'n',
        desc: 'The number of points to average.',
        type: 'Integer',
      },
    ],
    package: '',
    desc:
      'Calculates the exponential moving average of values in the `_value` column grouped into `n` number of points, giving more weight to recent data at triple the rate of `exponentialMovingAverage()`.',
    example: 'tripleEMA(n: 5)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/tripleema/`,
  },
  {
    name: 'tripleExponentialDerivative',
    args: [
      {
        name: 'n',
        desc: 'The number of points to use in the calculation.',
        type: 'Integer',
      },
    ],
    package: '',
    desc:
      'Calculates a triple exponential derivative (TRIX) of input tables using n points.',
    example: 'tripleExponentialDerivative(n: 5)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/tripleexponentialderivative/`,
  },
  {
    name: 'truncateTimeColumn',
    args: [
      {
        name: 'unit',
        desc: 'The unit of time to truncate to.',
        type: 'Duration',
      },
    ],
    package: '',
    desc: 'Truncates all `_time` values to a specified unit.',
    example: 'truncateTimeColumn(unit: 1m)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/truncatetimecolumn/`,
  },
  {
    name: 'uint',
    args: [
      {
        name: 'v',
        desc: 'The value to convert.',
        type: 'Boolean | Duration | Float | Integer | Numeric String | Time',
      },
    ],
    package: '',
    desc: 'Converts a single value to a uinteger.',
    example: 'uint(v: r._value)',
    category: 'Type Conversions',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/type-conversions/uint/`,
  },
  UNION,
  {
    name: 'unique',
    args: [
      {
        name: 'column',
        desc: 'The column searched for unique values. Defaults to `"_value"`.',
        type: 'String',
      },
    ],
    package: '',
    desc: 'Returns all rows containing unique values in a specified column.',
    example: 'unique(column: "_value")',
    category: 'Selectors',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/selectors/unique/`,
  },
  {
    name: 'usage.from',
    args: [
      {
        name: 'start',
        desc: 'Earliest time to include in results.',
        type: 'Time | Duration',
      },
      {
        name: 'stop',
        desc: 'Latest time to include in results.',
        type: 'Time | Duration',
      },
      {
        name: 'host',
        desc:
          'InfluxDB Cloud region URL (Required if executed outside of your InfluxDB Cloud organization or region). Default is `""`.',
        type: 'String',
      },
      {
        name: 'orgID',
        desc:
          'InfluxDB Cloud organization ID (Required if executed outside of your InfluxDB Cloud organization or region). Default is `""`.',
        type: 'String',
      },
      {
        name: 'token',
        desc:
          'InfluxDB Cloud authentication token (Required if executed outside of your InfluxDB Cloud organization or region). Default is `""`.',
        type: 'String',
      },
      {
        name: 'raw',
        desc:
          'Return raw, high resolution usage data instead of downsampled usage data. Default is `false`.',
        type: 'Boolean',
      },
    ],
    package: 'experimental/usage',
    desc: 'Returns usage data from an InfluxDB Cloud organization.',
    example: `usage.from(
    start: -30d,
    stop: now(),
    host: "",
    orgID: "",
    token: "",
    raw: false
)`,
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/usage/from/`,
  },
  {
    name: 'usage.limits',
    args: [
      {
        name: 'host',
        desc:
          'InfluxDB Cloud region URL (Required if executed outside of your InfluxDB Cloud organization or region). Default is `""`.',
        type: 'String',
      },
      {
        name: 'orgID',
        desc:
          'InfluxDB Cloud organization ID (Required if executed outside of your InfluxDB Cloud organization or region). Default is `""`.',
        type: 'String',
      },
      {
        name: 'token',
        desc:
          'InfluxDB Cloud authentication token (Required if executed outside of your InfluxDB Cloud organization or region). Default is `""`.',
        type: 'String',
      },
    ],
    package: 'experimental/usage',
    desc:
      'Returns a record containing usage limits for an InfluxDB Cloud organization.',
    example: `usage.limits(
    host: "",
    orgID: "",
    token: ""
)`,
    category: 'Inputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/experimental/usage/limits/`,
  },
  {
    name: 'victorops.endpoint',
    args: [
      {
        name: 'url',
        desc: 'VictorOps REST endpoint integration URL.',
        type: 'String',
      },
    ],
    package: 'contrib/bonitoo-io/victorops',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = victorops.endpoint(
    url: "https://alert.victorops.com/integrations/generic/00000000/alert\${apiKey}/\${routingKey}",
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/victorops/endpoint/`,
  },
  {
    name: 'victorops.event',
    args: [
      {
        name: 'url',
        desc: 'VictorOps REST endpoint integration URL.',
        type: 'String',
      },
      {
        name: 'monitoringTool',
        desc: 'Monitoring agent name. Default is `""`.',
        type: 'String',
      },
      {
        name: 'messageType',
        desc:
          'VictorOps message type (alert behavior). Valid values are `CRITICAL`, `WARNING`, and `INFO`.',
        type: 'String',
      },
      {
        name: 'entityID',
        desc: 'Incident ID. Default is `""`.',
        type: 'String',
      },
      {
        name: 'entityDisplayName',
        desc: 'Incident display name or summary. Default is `""`.',
        type: 'String',
      },
      {
        name: 'stateMessage',
        desc: 'Verbose incident message. Default is `""`.',
        type: 'String',
      },
      {
        name: 'timestamp',
        desc: 'Incident start time. Default is `now()`.',
        type: 'Time',
      },
    ],
    package: 'contrib/bonitoo-io/victorops',
    desc: 'Sends an alert to VictorOps (Now Splunk On-Call).',
    example: `victorops.event(
    url: "https://alert.victorops.com/integrations/generic/00000000/alert/\${api_key}/\${routing_key}",
    monitoringTool: "",
    messageType: "CRITICAL",
    entityID: "",
    entityDisplayName: "",
    stateMessage: "",
    timestamp: now()
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/victorops/event/`,
  },
  {
    name: 'window',
    args: [
      {
        name: 'every',
        desc: 'Duration of time between windows. Defaults to `period` value.',
        type: 'Duration',
      },
      {
        name: 'period',
        desc:
          'Duration of the window. Period is the length of each interval. It can be negative, indicating the start and stop boundaries are reversed. Defaults to `every` value.',
        type: 'Duration',
      },
      {
        name: 'offset',
        desc:
          'The offset duration relative to the `location` offset. It can be negative, indicating that the offset goes backwards in time. The default aligns the window boundaries with `now`.',
        type: 'Duration',
      },
      {
        name: 'timeColumn',
        desc: 'The column containing time. Defaults to `"_time"`.',
        type: 'String',
      },
      {
        name: 'startColumn',
        desc:
          'The column containing the window start time. Defaults to `"_start"`.',
        type: 'String',
      },
      {
        name: 'stopColumn',
        desc:
          'The column containing the window stop time. Defaults to `"_stop"`.',
        type: 'String',
      },
      {
        name: 'createEmpty',
        desc:
          'Specifies whether empty tables should be created. Defaults to `false`.',
        type: 'Boolean',
      },
    ],
    package: '',
    desc:
      'Groups records based on a time value. New columns are added to uniquely identify each window. Those columns are added to the group key of the output tables. A single input record will be placed into zero or more output tables, depending on the specific windowing function.',
    example: 'window(every: v.windowPeriod)',
    category: 'Transformations',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/transformations/window/`,
  },
  {
    name: 'yield',
    args: [
      {
        name: 'name',
        desc: 'A unique name for the yielded results.',
        type: 'String',
      },
    ],
    package: '',
    desc:
      'Indicates the input tables received should be delivered as a result of the query. Yield outputs the input stream unmodified. A query may have multiple results, each identified by the name provided to the `yield()` function.',
    example: 'yield(name: "custom-name")',
    category: 'Outputs',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/built-in/outputs/yield/`,
  },
  {
    name: 'zenoss.endpoint',
    args: [
      {
        name: 'url',
        desc: 'Zenoss router endpoint URL.',
        type: 'String',
      },
      {
        name: 'username',
        desc:
          'Zenoss username to use for HTTP BASIC authentication. Default is "" (no authentication).',
        type: 'String',
      },
      {
        name: 'password',
        desc:
          'Zenoss password to use for HTTP BASIC authentication. Default is "" (no authentication).',
        type: 'String',
      },
      {
        name: 'action',
        desc: 'Zenoss router name. Default is `"EventsRouter"`.',
        type: 'String',
      },
      {
        name: 'method',
        desc: 'EventsRouter method. Default is `"add_event"`.',
        type: 'String',
      },
      {
        name: 'type',
        desc: 'Event type. Default is `"rpc"`.',
        type: 'String',
      },
      {
        name: 'tid',
        desc: 'Temporary request transaction ID. Default is `1`.',
        type: 'Integer',
      },
    ],
    package: 'contrib/bonitoo-io/zenoss',
    desc:
      'A factory function that outputs another function. The output function requires a `mapFn` parameter. See the documentation link for a full example.',
    example: `endpoint = zenoss.endpoint(
    url: "https://example.zenoss.io:8080/zport/dmd/evconsole_router",
    username: "example-user",
    password: "example-password",
    action: "EventsRouter",
    method: "add_event",
    type: "rpc",
    tid: 1
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/zenoss/endpoint/`,
  },
  {
    name: 'zenoss.event',
    args: [
      {
        name: 'url',
        desc: 'Zenoss router endpoint URL.',
        type: 'String',
      },
      {
        name: 'username',
        desc:
          'Zenoss username to use for HTTP BASIC authentication. Default is "" (no authentication).',
        type: 'String',
      },
      {
        name: 'password',
        desc:
          'Zenoss password to use for HTTP BASIC authentication. Default is "" (no authentication).',
        type: 'String',
      },
      {
        name: 'action',
        desc: 'Zenoss router name. Default is `"EventsRouter"`.',
        type: 'String',
      },
      {
        name: 'method',
        desc: 'EventsRouter method. Default is `"add_event"`.',
        type: 'String',
      },
      {
        name: 'type',
        desc: 'Event type. Default is `"rpc"`.',
        type: 'String',
      },
      {
        name: 'tid',
        desc: 'Temporary request transaction ID. Default is `1`.',
        type: 'Integer',
      },
      {
        name: 'summary',
        desc: 'Event summary. Default is `""`.',
        type: 'String',
      },
      {
        name: 'device',
        desc: 'Related device. Default is `""`.',
        type: 'String',
      },
      {
        name: 'component',
        desc: 'Related component. Default is `""`.',
        type: 'String',
      },
      {
        name: 'severity',
        desc:
          'Event severity level. Supported values are `Critical`, `Warning`, `Info`, and `Clear`.',
        type: 'String',
      },
      {
        name: 'eventClass',
        desc: 'Event class. Default is `""`.',
        type: 'String',
      },
      {
        name: 'eventClassKey',
        desc: 'Event class key. Default is `""`.',
        type: 'String',
      },
      {
        name: 'collector',
        desc: 'Zenoss collector. Default is `""`.',
        type: 'String',
      },
      {
        name: 'message',
        desc: 'Related message. Default is `""`.',
        type: 'String',
      },
    ],
    package: 'contrib/bonitoo-io/zenoss',
    desc: 'Sends an alert to Zenoss.',
    example: `zenoss.event(
    url: "https://example.zenoss.io:8080/zport/dmd/evconsole_router",
    username: "example-user",
    password: "example-password",
    action: "EventsRouter",
    method: "add_event",
    type: "rpc",
    tid: 1,
    summary: "",
    device: "",
    component: "",
    severity: "Critical",
    eventClass: "",
    eventClassKey: "",
    collector: "",
    message: ""
)`,
    category: 'Alerting',
    link: `https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/reference/flux/stdlib/contrib/zenoss/event/`,
  },
]
