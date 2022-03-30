import register from 'src/languageSupport/monaco.onigasm'

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
