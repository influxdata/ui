import * as pgsql from 'monaco-editor/esm/vs/basic-languages/pgsql/pgsql'

import {MonacoBasicLanguage} from 'src/types'

const LANGID = 'pgsql'

function addSyntax() {
  monaco.languages.register({
    id: LANGID,
  })
  monaco.languages.setMonarchTokensProvider(
    LANGID,
    (pgsql as MonacoBasicLanguage).language
  )
  monaco.languages.setLanguageConfiguration(
    LANGID,
    (pgsql as MonacoBasicLanguage).conf
  )
}

addSyntax()

export {LANGID}
