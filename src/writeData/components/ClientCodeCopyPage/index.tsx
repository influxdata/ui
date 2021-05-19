// Libraries
import React, {FC} from 'react'
import {Renderer} from 'react-markdown'

// Components
import CodeSnippet from 'src/shared/components/CodeSnippet'
import {CodeSampleBlock} from 'src/writeData/containers/ClientLibrariesPage'
import InstallPackageHelper from 'src/writeData/components/ClientCodeCopyPage/InstallPackageHelper'

// Constants
import {CLIENT_DEFINITIONS} from 'src/writeData'

// Types
import {ResourceType} from 'src/types'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'

// Utils
import WriteDataHelper from '../WriteDataHelper'
import GetResources from 'src/resources/components/GetResources'

const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => {
  return <CodeSnippet text={props.value} label={props.language} />
}

interface Props {
  contentID: string
}

const ClientCodeCopyPage: FC<Props> = ({contentID}) => {
  const def = CLIENT_DEFINITIONS[contentID]

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
          {!!def.description && (
            <InstallPackageHelper
              text={def.description}
              codeRenderer={codeRenderer}
            />
          )}
          <CodeSampleBlock
            name="Initialize and Execute Flux"
            sample={`${def.initialize}${def.execute}`}
          />
        </div>
      </div>
    </GetResources>
  )
}

export default ClientCodeCopyPage
