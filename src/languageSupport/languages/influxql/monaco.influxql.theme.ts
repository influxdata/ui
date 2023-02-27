import {MonacoType} from 'src/types'
import {InfluxColors} from '@influxdata/clockface'

const THEME_NAME = 'influxQLTheme'

function addTheme(monaco: MonacoType) {
  // Using the tokenizer defined in
  // src/languageSupport/languages/influxql/influxql.ts
  monaco.editor.defineTheme(THEME_NAME, {
    base: 'vs-dark',
    inherit: false,
    rules: [
      // ordered by token name
      {
        token: 'builtin.function.influxql',
        foreground: InfluxColors.Galaxy,
      },
      {
        token: 'comment.influxql',
        foreground: InfluxColors.Grey45,
      },
      {
        token: 'comment.quote.influxql',
        foreground: InfluxColors.Grey45,
      },
      {
        token: 'delimiter.influxql',
        foreground: InfluxColors.White,
      },
      {
        token: 'delimiter.parenthesis.influxql',
        foreground: InfluxColors.White,
      },
      {
        token: 'delimiter.square.influxql',
        foreground: InfluxColors.White,
      },
      {
        token: 'identifier.influxql',
        foreground: InfluxColors.White,
      },
      {
        token: 'identifier.quote.influxql',
        foreground: InfluxColors.White,
      },
      {
        token: 'illegal.influxql',
        foreground: InfluxColors.Fire,
      },
      {
        token: 'keyword.influxql',
        foreground: InfluxColors.Galaxy,
      },
      {
        token: 'literal.boolean.influxql',
        foreground: InfluxColors.Tungsten,
      },
      {
        token: 'literal.duration.influxql',
        foreground: InfluxColors.Hydrogen,
      },
      {
        token: 'literal.number.influxql',
        foreground: InfluxColors.Hydrogen,
      },
      {
        token: 'literal.string.influxql',
        foreground: '#7CE490',
      },
      {
        token: 'operator.influxql',
        foreground: InfluxColors.Tungsten,
      },
    ],
    colors: {
      'editor.foreground': '#F8F8F8',
      'editor.background': InfluxColors.Grey15,
      'editorGutter.background': InfluxColors.Grey15,
      'editor.selectionBackground': '#353640',
      'editorLineNumber.foreground': '#666978',
      'editor.lineHighlightBackground': '#353640',
      'editorCursor.foreground': InfluxColors.White,
      'editorActiveLineNumber.foreground': '#bec2cc',
      'minimap.background': InfluxColors.Grey15,
    },
  })
}

addTheme(monaco)

export {THEME_NAME}
