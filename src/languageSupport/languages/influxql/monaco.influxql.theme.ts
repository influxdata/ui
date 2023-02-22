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
      {
        token: 'delimiter.square.influxql',
        foreground: InfluxColors.Hydrogen,
      },
      {
        token: 'delimiter.parenthesis.influxql',
        foreground: InfluxColors.Hydrogen,
      },
      {
        token: 'delimiter.influxql',
        foreground: InfluxColors.Hydrogen,
      },
      {
        token: 'comment.quote.influxql',
        foreground: '#676978',
      },
      {
        token: 'comment.influxql',
        foreground: '#676978',
      },
      {
        token: 'keyword.influxql',
        foreground: InfluxColors.Galaxy,
      },
      {
        token: 'operator.influxql',
        foreground: InfluxColors.Tungsten,
      },
      {
        token: 'number.influxql',
        foreground: InfluxColors.Hydrogen,
      },
      {
        token: 'string.influxql',
        foreground: '#7CE490',
      },
      {
        token: 'identifier.quote.influxql',
        foreground: InfluxColors.White,
      },
      {
        token: 'identifier.influxql',
        foreground: InfluxColors.White,
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
