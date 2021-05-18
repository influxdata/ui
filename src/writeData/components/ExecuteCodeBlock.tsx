// Libraries
import React, {FC, createContext, useState, useEffect, useContext} from 'react'
import {CLIENT_DEFINITIONS} from '..'
import {WriteDataDetailsContext} from './WriteDataDetailsContext'
import {getBucketsFromAST, updateBucketInAST} from 'src/flows/context/query'
import {parse} from 'src/external/parser'
import {format_from_js_file} from '@influxdata/flux'
import {Bucket} from 'src/types'

// Utils

// Types

interface ExecuteCodeBlockContextType {
  query?: string
  changeQuery: (query: string) => void
  executeCodeBlock: string
}

export const EXECUTE_CODE_BLOCK_CONTEXT: ExecuteCodeBlockContextType = {
  query: null,
  changeQuery: () => {},
  executeCodeBlock: '',
}

export const ExecuteCodeBlockContext = createContext<
  ExecuteCodeBlockContextType
>(EXECUTE_CODE_BLOCK_CONTEXT)

interface Props {
  query?: string
  contentID: string
}

const getBucketFromQuery = (query: string): string => {
  const ast = parse(query)

  return getBucketsFromAST(ast)[0]
}

const QUERY_PLACEHOLDER = '<%= query %>'

const ExecuteCodeBlockProvider: FC<Props> = ({query, contentID, children}) => {
  const def = CLIENT_DEFINITIONS[contentID]
  const [currentQuery, setQuery] = useState(query ?? def.query)
  const [executeCodeBlock, setExecuteCodeBlock] = useState('')
  const {bucket, changeBucket} = useContext(WriteDataDetailsContext)
  const [selectedBucket, setSelectedBucket] = useState(
    query ? getBucketFromQuery(query) : bucket?.name
  )

  useEffect(() => {
    if (bucket && selectedBucket !== bucket?.name) {
      setSelectedBucket(bucket?.name)
    }
  }, [bucket, selectedBucket, currentQuery, bucket?.name, query])

  useEffect(() => {
    const executeCode = def.execute.toString()
    if (!query) {
      setExecuteCodeBlock(executeCode.replace(QUERY_PLACEHOLDER, def.query))
      return
    }

    const ast = parse(currentQuery)

    updateBucketInAST(ast, selectedBucket)
    setExecuteCodeBlock(
      executeCode.replace(QUERY_PLACEHOLDER, format_from_js_file(ast))
    )
  }, [contentID, selectedBucket, currentQuery, def, query])

  return (
    <ExecuteCodeBlockContext.Provider
      value={{
        query,
        changeQuery: (toChangeQuery: string) => setQuery(toChangeQuery),
        executeCodeBlock,
      }}
    >
      {children}
    </ExecuteCodeBlockContext.Provider>
  )
}

export default ExecuteCodeBlockProvider
