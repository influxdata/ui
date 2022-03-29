import {MonacoType} from 'src/types'

const THEME_NAME = 'pythonTheme'

function addTheme(monaco: MonacoType) {
  monaco.editor.defineTheme(THEME_NAME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      {
        token: 'comment.line.number-sign.python',
        foreground: '#676978',
      },
      {
        token: 'punctuation.definition.comment.python',
        foreground: '#676978',
      },
      {
        token: 'punctuation.definition.string.begin.python',
        foreground: '#7CE490',
      },
      {
        token: 'punctuation.definition.string.end.python',
        foreground: '#7CE490',
      },
      {
        token: 'string.quoted.single.python',
        foreground: '#7CE490',
      },
      {
        token: 'entity.name.function.python',
        foreground: '#9394FF',
      },
      {
        token: 'support.function.builtin.python',
        foreground: '#9394FF',
      },
      {
        token: '',
        foreground: '#f8f8f8',
        background: '#202028',
      },
    ],
    colors: {
      'editor.foreground': '#F8F8F8',
      'editor.background': '#202028',
      'editorGutter.background': '#25252e',
      'editor.selectionBackground': '#353640',
      'editorLineNumber.foreground': '#666978',
      'editor.lineHighlightBackground': '#353640',
      'editorCursor.foreground': '#ffffff',
      'editorActiveLineNumber.foreground': '#bec2cc',
    },
  })
}

addTheme(window.monaco)

export default THEME_NAME
