// Libraries
import React, {FC, useCallback, useContext, useMemo} from 'react'
import {Renderer} from 'react-markdown'
import {get, set} from 'lodash'

// Components
import WriteDataHelper from 'src/writeData/components/WriteDataHelper'
import WriteDataCodeSnippet from 'src/writeData/components/WriteDataCodeSnippet'
import WriteDataDetailsContextProvider, {
  WriteDataDetailsContext,
} from 'src/writeData/components/WriteDataDetailsContext'
import GetResources from 'src/resources/components/GetResources'
import {CodeSampleBlock} from 'src/writeData/containers/ClientLibrariesPage'

// Constants
import {CLIENT_DEFINITIONS} from 'src/writeData'

// Types
import {Bucket, ResourceType} from 'src/types'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'
import InstallPackageHelper from './InstallPackageHelper/index'

// Utils
import {parse} from 'src/external/parser'
import {format_from_js_file} from '@influxdata/flux'
import {updateBucketInAST, _walk} from 'src/flows/context/query'

const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => {
  return <WriteDataCodeSnippet code={props.value} language={props.language} />
}

interface Props {
  contentID: string
  query: string
}

const changeQuery = (query: string, bucket: Bucket): string => {
  const ast = parse(query)
  updateBucketInAST(ast, bucket.name)

  return format_from_js_file(ast)
}

const ClientCodeCopyPage: FC<Props> = ({contentID, query}) => {
  const {bucket} = useContext(WriteDataDetailsContext)
  const def = CLIENT_DEFINITIONS[contentID]
  const updatedQuery = changeQuery(query, bucket)

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
          <WriteDataHelper />
          {description}
          <CodeSampleBlock
            name="Initialize and Execute Flux"
            sample={`${def.initialize}${def.execute}`}
            query={updatedQuery}
          />
        </div>
      </div>
    </GetResources>
  )
}

export default ClientCodeCopyPage
