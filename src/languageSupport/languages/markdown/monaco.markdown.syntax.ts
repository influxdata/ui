import register from 'src/languageSupport/monaco.onigasm'

const LANGID = 'markdown'

register(LANGID, async () => ({
  format: 'json',
  content: await import(
    /* webpackPrefetch: 0 */ 'src/languageSupport/languages/markdown/markdown.tmLanguage.json'
  ).then(data => {
    return JSON.stringify(data)
  }),
}))

export default LANGID
