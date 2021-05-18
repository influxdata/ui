// Libraries
import React, {FC, useContext} from 'react'
import {useParams} from 'react-router-dom'
import {Renderer} from 'react-markdown'

// Components
import {Page} from '@influxdata/clockface'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

// Constants
import {CodeSampleOption, CLIENT_DEFINITIONS} from 'src/writeData'

// Types
import {ResourceType} from 'src/types'

// Graphics
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import GetResources from 'src/resources/components/GetResources'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import WriteDataHelper from 'src/writeData/components/WriteDataHelper'
import CodeSnippet, {
  Provider as TemplateProvider,
} from 'src/shared/components/CodeSnippet'
import ExecuteCodeBlockProvider, {
  ExecuteCodeBlockContext,
} from '../components/ExecuteCodeBlock'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'

const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => (
  <CodeSnippet text={props.value} label={props.language} />
)

interface SampleProps {
  name: string
  sample: string | CodeSampleOption[]
}

interface ExecuteCodeSampleProps {
  name: string
}

export const ExecuteCodeSampleBlock: FC<ExecuteCodeSampleProps> = ({name}) => {
  const {executeCodeBlock} = useContext(ExecuteCodeBlockContext)

  return (
    <>
      <h4>{name}</h4>
      <CodeSnippet text={executeCodeBlock} />
    </>
  )
}

export const CodeSampleBlock: FC<SampleProps> = ({name, sample}) => {
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
            <CodeSnippet text={option.code} />
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <h4>{name}</h4>
      <CodeSnippet text={sample} />
    </>
  )
}

const TOKEN_PLACEHOLDER = '<INFLUXDB_TOKEN>'
const BUCKET_PLACEHOLDER = '<BUCKET>'

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
      <TemplateProvider
        variables={{token: TOKEN_PLACEHOLDER, bucket: BUCKET_PLACEHOLDER}}
      >
        <WriteDataDetailsContextProvider>
          <ExecuteCodeBlockProvider contentID={contentID}>
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
                  <div className="write-data--details-thumbnail">
                    {thumbnail}
                  </div>
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
                    <ExecuteCodeSampleBlock name="Execute a Flux query" />
                  </div>
                </div>
              </Page.Contents>
            </Page>
          </ExecuteCodeBlockProvider>
        </WriteDataDetailsContextProvider>
      </TemplateProvider>
    </GetResources>
  )
}

export default ClientLibrariesPage
