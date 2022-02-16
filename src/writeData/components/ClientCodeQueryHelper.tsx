// Libraries
import {FC, useEffect, useContext} from 'react'
import {format_from_js_file} from '@influxdata/flux-lsp-browser'

// Utils
import {parse} from 'src/external/parser'
import {find} from 'src/shared/contexts/query'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

// Constants
import {CLIENT_DEFINITIONS} from 'src/writeData'
import {File} from 'src/types'

interface Props {
  clientQuery?: string
  contentID: string
}

const updateBucketInAST = (ast: File, name: string) => {
  find(
    ast,
    node =>
      node?.type === 'CallExpression' &&
      node?.callee?.type === 'Identifier' &&
      node?.callee?.name === 'from' &&
      node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
  ).map(
    node =>
      (node.arguments[0].properties[0].value.location.source = `"${name}"`)
  )
}

const ClientCodeQueryHelper: FC<Props> = ({clientQuery, contentID}) => {
  const def = CLIENT_DEFINITIONS[contentID]
  const {changeQuery} = useContext(WriteDataDetailsContext)

  useEffect(() => {
    if (!clientQuery) {
      changeQuery(def.query)
      return
    }

    const ast = parse(clientQuery)
    updateBucketInAST(ast, '<%= bucket %>')
    let query = format_from_js_file(ast)
    if (def.querySanitize) {
      query = def.querySanitize(query)
    }
    changeQuery(query)
  }, [clientQuery, def.query, changeQuery])

  return null
}

export default ClientCodeQueryHelper
