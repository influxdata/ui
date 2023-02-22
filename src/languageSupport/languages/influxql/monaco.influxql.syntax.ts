import * as influxql from 'src/languageSupport/languages/influxql/influxql'
import {MonacoBasicLanguage} from 'src/types'

const LANGID = 'influxql'

function addSyntax() {
  monaco.languages.register({
    id: LANGID,
  })
  monaco.languages.setMonarchTokensProvider(
    LANGID,
    (influxql as MonacoBasicLanguage).language
  )
  monaco.languages.setLanguageConfiguration(
    LANGID,
    (influxql as MonacoBasicLanguage).conf
  )
}

addSyntax()

export {LANGID}
