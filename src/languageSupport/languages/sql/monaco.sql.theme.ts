import {MonacoType} from 'src/types'
import {InfluxColors} from '@influxdata/clockface'

const THEME_NAME = 'sqlTheme'

function addTheme(monaco: MonacoType) {
  // Using monaco-editor pgsql tokenizer.
  // Example tokens: https://github.com/microsoft/monaco-editor/blob/136ce723f73b8bd284565c0b7d6d851b52161015/src/basic-languages/pgsql/pgsql.test.ts
  monaco.editor.defineTheme(THEME_NAME, {
    base: 'vs-dark',
    inherit: false,
    rules: [
      {
        token: 'delimiter.square.sql',
        foreground: '#6BDFFF',
      },
      {
        token: 'delimiter.parenthesis.sql',
        foreground: '#6BDFFF',
      },
      {
        token: 'delimiter.sql',
        foreground: '#6BDFFF',
      },
      {
        token: 'identifier.sql',
        foreground: '#7CE490',
      },
      {
        token: 'comment.quote.sql',
        foreground: '#676978',
      },
      {
        token: 'comment.sql',
        foreground: '#676978',
      },
      {
        token: 'keyword.sql',
        foreground: '#9394FF',
      },
      {
        token: 'operator.sql',
        foreground: '#FFB6A0',
      },
      {
        token: 'number.sql',
        foreground: '#6BDFFF',
      },
      {
        token: 'string.sql',
        foreground: '#7CE490',
      },
      {
        token: 'identifier.quote.sql',
        foreground: '#7CE490',
      },
    ],
    colors: {
      'editor.foreground': '#F8F8F8',
      'editor.background': InfluxColors.Grey15,
      'editorGutter.background': InfluxColors.Grey15,
      'editor.selectionBackground': '#353640',
      'editorLineNumber.foreground': '#666978',
      'editor.lineHighlightBackground': '#353640',
      'editorCursor.foreground': '#ffffff',
      'editorActiveLineNumber.foreground': '#bec2cc',
      'minimap.background': InfluxColors.Grey15,
    },
  })
}

addTheme(monaco)

export default THEME_NAME
