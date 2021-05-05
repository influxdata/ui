// Libraries
import React, {FC} from 'react'
import {useParams} from 'react-router-dom'
import {Renderer} from 'react-markdown'

// Components
import {Page} from '@influxdata/clockface'
import WriteDataHelper from 'src/writeData/components/WriteDataHelper'
import WriteDataCodeSnippet from 'src/writeData/components/WriteDataCodeSnippet'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import GetResources from 'src/resources/components/GetResources'

// Constants
import {CodeSampleOption, CLIENT_DEFINITIONS} from 'src/writeData'

// Types
import {ResourceType} from 'src/types'

// Graphics
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => {
  return <WriteDataCodeSnippet code={props.value} language={props.language} />
}

interface SampleProps {
  name: string
  sample: string | CodeSampleOption[]
  query?: string
}

export const CodeSampleBlock: FC<SampleProps> = ({name, sample, query}) => {
  if (!sample) {
    return null
  }

  if (Array.isArray(sample)) {
    return (
      <>
        <h4>{name}</h4>
        {sample.map((option, idx) => (
          <div key={idx}>
            <h6>{`Option ${idx + 1}: ${option.title}`}</h6>
            <WriteDataCodeSnippet code={option.code} language="" />
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <h4>{name}</h4>
      <WriteDataCodeSnippet code={sample} language="" query={query} />
    </>
  )
}

const ClientLibrariesPage: FC = () => {
  const {contentID} = useParams()
  const def = CLIENT_DEFINITIONS[contentID]

  const thumbnail = (
    <img
      data-testid="load-data-details-thumb"
      src={def.logo || placeholderLogo}
    />
  )
  let description

  if (def.description) {
    description = (
      <MarkdownRenderer
        text={def.description}
        cloudRenderers={{code: codeRenderer}}
      />
    )
  }

  return (
    <GetResources
      resources={[ResourceType.Authorizations, ResourceType.Buckets]}
    >
      <WriteDataDetailsContextProvider>
        <Page
          titleTag={pageTitleSuffixer([
            'Client Library',
            'Sources',
            'Load Data',
          ])}
        >
          <Page.Header fullWidth={false}>
            <Page.Title title={name} />
          </Page.Header>
          <Page.Contents fullWidth={false} scrollable={true}>
            <div className="write-data--details">
              <div className="write-data--details-thumbnail">{thumbnail}</div>
              <div
                className="write-data--details-content markdown-format"
                data-testid="load-data-details-content"
              >
                <WriteDataHelper />
                {description}
                <CodeSampleBlock
                  name="Initialize the Client"
                  sample={def.initialize}
                />
                <CodeSampleBlock name="Write Data" sample={def.write} />
                <CodeSampleBlock
                  name="Execute a Flux query"
                  sample={def.execute}
                  query={def.query}
                />
              </div>
            </div>
          </Page.Contents>
        </Page>
      </WriteDataDetailsContextProvider>
    </GetResources>
  )
}

export default ClientLibrariesPage
