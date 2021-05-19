// Libraries
import React, {FC, useEffect, useContext} from 'react'
import {format_from_js_file} from '@influxdata/flux'

// Utils
import {parse} from 'src/external/parser'
import {getBucketsFromAST, updateBucketInAST} from 'src/flows/context/query'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

// Constants
import {CLIENT_DEFINITIONS} from 'src/writeData'
import {Bucket} from 'src/types'

interface Props {
  clientQuery?: string
  contentID: string
}

const ClientCodeQueryHelper: FC<Props> = ({clientQuery, contentID}) => {
  const def = CLIENT_DEFINITIONS[contentID]
  const {changeBucket, changeQuery} = useContext(WriteDataDetailsContext)

  useEffect(() => {
    if (!clientQuery) {
      changeQuery(def.query)
      return
    }

    const ast = parse(clientQuery)
    const queryBucket = getBucketsFromAST(ast)[0]

    changeBucket({name: queryBucket} as Bucket)
    updateBucketInAST(ast, '<%= bucket %>')
    changeQuery(format_from_js_file(ast))
  }, [clientQuery, def.query, changeBucket, changeQuery])

  return null
}

export default ClientCodeQueryHelper
