// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'
import {Renderer} from 'react-markdown'

// Components
// import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import GetResources from 'src/resources/components/GetResources'
import {CodeSampleBlock} from 'src/writeData/containers/ClientLibrariesPage'
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Constants
import {CLIENT_DEFINITIONS} from 'src/writeData'

// Types
import {Bucket, ResourceType} from 'src/types'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'
import InstallPackageHelper from 'src/writeData/components/ClientCodeCopyPage/InstallPackageHelper/index'

// Utils
import {parse} from 'src/external/parser'
import {getBucketsFromAST} from 'src/flows/context/query'
import WriteDataHelper from '../WriteDataHelper'
import {WriteDataDetailsContext} from '../WriteDataDetailsContext'
import {ExecuteCodeBlockContext} from '../ExecuteCodeBlock'

const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => {
  return <CodeSnippet text={props.value} label={props.language} />
}

interface Props {
  contentID: string
  query: string
}

const ClientCodeCopyPage: FC<Props> = ({contentID, query}) => {
  const {changeBucket} = useContext(WriteDataDetailsContext)
  const {executeCodeBlock} = useContext(ExecuteCodeBlockContext)
  const [initialBucket, setInitialBucket] = useState(null)

  useEffect(() => {
    if (!initialBucket) {
      const queryBucket = getBucketsFromAST(parse(query))[0]
      setInitialBucket(queryBucket)
      changeBucket({name: queryBucket} as Bucket)
    }
  }, [changeBucket, query, initialBucket, setInitialBucket])

  const def = CLIENT_DEFINITIONS[contentID]
  let description

  if (def.description) {
    description = (
      <InstallPackageHelper
        text={def.description}
        codeRenderer={codeRenderer}
      />
    )
  }

  return (
    <GetResources
      resources={[ResourceType.Authorizations, ResourceType.Buckets]}
    >
      <div className="write-data--details">
        <div
          className="write-data--details-content markdown-format"
          data-testid="load-data-details-content"
        >
          <WriteDataHelper collapsed={true} />
          {description}
          <CodeSampleBlock
            name="Initialize and Execute Flux"
            sample={`${def.initialize}${executeCodeBlock}`}
          />
        </div>
      </div>
    </GetResources>
  )
}

export default ClientCodeCopyPage
