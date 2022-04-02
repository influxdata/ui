import register from 'src/languageSupport/monaco.onigasm'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

if (!window.monaco) {
  window.monaco = monaco
}

const LANGID = 'python'

register(LANGID, async () => ({
  format: 'json',
  content: await import(
    /* webpackPrefetch: 0 */ 'src/languageSupport/languages/python/python.tmLanguage.json'
  ).then(data => {
    return JSON.stringify(data)
  }),
}))

export default LANGID
