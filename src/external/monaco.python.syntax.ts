import register from 'src/external/monaco.onigasm'

const LANGID = 'python'

register(LANGID, async () => ({
  format: 'json',
  content: await import(
    /* webpackPrefetch: 0 */ 'src/external/python.tmLanguage.json'
  ).then(data => {
    return JSON.stringify(data)
  }),
}))

export default LANGID
