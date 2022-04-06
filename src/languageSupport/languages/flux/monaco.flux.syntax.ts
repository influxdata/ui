import register from 'src/languageSupport/monaco.onigasm'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

const LANGID = 'flux'

async function addSyntax() {
  await register(LANGID, async () => ({
    format: 'json',
    content: await import(
      /* webpackPrefetch: 0 */ 'src/languageSupport/languages/flux/flux.tmLanguage.json'
    ).then(data => {
      return JSON.stringify(data)
    }),
  }))

  if (!self.monaco) {
    self.monaco = monaco
  }
  self.monaco.languages.setLanguageConfiguration(LANGID, {
    autoClosingPairs: [
      {open: '"', close: '"'},
      {open: '[', close: ']'},
      {open: "'", close: "'"},
      {open: '{', close: '}'},
      {open: '(', close: ')'},
    ],
  })
}

addSyntax()

export default LANGID
