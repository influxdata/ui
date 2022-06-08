// Libraries
import {FC, useEffect, useContext} from 'react'
import {format_from_js_file} from '@influxdata/flux-lsp-browser'

// Utils
import {parse} from 'src/languageSupport/languages/flux/parser'
import {find} from 'src/shared/contexts/query'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

// Constants
import {CLIENT_DEFINITIONS} from 'src/writeData'
import {Bucket, File} from 'src/types'

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

const getBucketsFromAST = (ast: File) => {
  return find(
    ast,
    node =>
      node?.type === 'CallExpression' &&
      node?.callee?.type === 'Identifier' &&
      node?.callee?.name === 'from' &&
      node?.arguments[0]?.properties[0]?.key?.name === 'bucket'
  ).map(node => node?.arguments[0]?.properties[0]?.value.value)
}

const ClientCodeQueryHelper: FC<Props> = ({clientQuery, contentID}) => {
  const def = CLIENT_DEFINITIONS[contentID]
  const {changeBucket, changeQuery} = useContext(WriteDataDetailsContext)

  useEffect(() => {
    if (!clientQuery) {
      changeQuery(def.query)
      return
    }
    try {
      const ast = parse(clientQuery)
      const queryBucket = getBucketsFromAST(ast)[0]
      if (queryBucket) {
        changeBucket({name: queryBucket} as Bucket)
      }
      updateBucketInAST(ast, '<%= bucket %>')
      let query = format_from_js_file(ast)
      if (def.querySanitize) {
        query = def.querySanitize(query)
      }
      changeQuery(query)
    } catch (e) {
      console.error(e)
    }
  }, [clientQuery, def.query, changeBucket, changeQuery])

  return null
}

export default ClientCodeQueryHelper
