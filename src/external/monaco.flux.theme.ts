import {MonacoType} from 'src/types'
import {InfluxColors} from '@influxdata/clockface'

const THEME_NAME = 'baseTheme'

const rules = [
  {
    token: 'support.function',
    foreground: '#9394FF',
  },
  {
    token: 'keyword.operator.new',
    foreground: '#9394FF',
  },
  {
    token: 'keyword.control.flux',
    foreground: '#9394FF',
  },
  {
    token: 'comment.line.double-slash',
    foreground: '#676978',
  },
  {
    token: 'string.quoted.double.flux',
    foreground: '#7CE490',
  },
  {
    token: 'string.regexp',
    foreground: '#FFB6A0',
  },
  {
    token: 'constant.time',
    foreground: '#6BDFFF',
  },
  {
    token: 'constant.numeric',
    foreground: '#6BDFFF',
  },
  {
    token: 'constant.language',
    foreground: '#32B08C',
  },
  {
    token: 'keyword.operator',
    foreground: '#ff4d96',
  },
  {
    token: '',
    foreground: '#f8f8f8',
    background: '#202028',
  },
]

function addTheme(monaco: MonacoType, theme: string = THEME_NAME) {
  let colors = {
    'editor.foreground': '#F8F8F8',
    'editor.background': InfluxColors.Grey15,
    'editorGutter.background': InfluxColors.Grey15,
    'editor.selectionBackground': '#353640',
    'editorLineNumber.foreground': '#666978',
    'editor.lineHighlightBackground': '#353640',
    'editorCursor.foreground': '#ffffff',
    'editorActiveLineNumber.foreground': '#bec2cc',
    'minimap.background': InfluxColors.Grey15,
  }
  if (theme === 'light') {
    colors = {
      'editor.foreground': InfluxColors.Grey5,
      'editor.background': InfluxColors.Grey95,
      'editorGutter.background': InfluxColors.Grey95,
      'editor.selectionBackground': InfluxColors.Grey85,
      'editorLineNumber.foreground': InfluxColors.Grey5,
      'editor.lineHighlightBackground': InfluxColors.Grey75,
      'editorCursor.foreground': InfluxColors.Grey5,
      'editorActiveLineNumber.foreground': InfluxColors.Grey5,
      'minimap.background': InfluxColors.Grey95,
    }
  }
  monaco.editor.defineTheme(theme, {
    base: 'vs-dark',
    inherit: false,
    rules,
    colors,
  })
}

addTheme(window.monaco)

export default THEME_NAME
