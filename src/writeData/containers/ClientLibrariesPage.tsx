// Libraries
import React, {FC} from 'react'
import {useParams} from 'react-router-dom'

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

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'
import ClientCodeQueryHelper from '../components/ClientCodeQueryHelper'

const codeRenderer: any = (props: any): any => (
  <CodeSnippet text={props.value} label={props.language} />
)

interface SampleProps {
  name: string
  sample: string | CodeSampleOption[]
  onCopy?: () => void
}

export const CodeSampleBlock: FC<SampleProps> = ({name, sample, onCopy}) => {
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
            <CodeSnippet text={option.code} onCopy={onCopy} />
          </div>
        ))}
      </>
    )
  }

  return (
    <>
      <h4>{name}</h4>
      <CodeSnippet text={sample} onCopy={onCopy} />
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
        escapeHtml={false}
      />
    )
  }

  let dispose

  if (def.dispose) {
    dispose = <CodeSampleBlock name="Dispose the Client" sample={def.dispose} />
  }

  return (
    <GetResources
      resources={[ResourceType.Authorizations, ResourceType.Buckets]}
    >
      <TemplateProvider>
        <WriteDataDetailsContextProvider>
          <ClientCodeQueryHelper contentID={contentID} />
          <Page
            titleTag={pageTitleSuffixer([
              'Client Library',
              'Sources',
              'Load Data',
            ])}
          >
            <Page.Header fullWidth={true}>
              <Page.Title title={name} />
            </Page.Header>
            <Page.Contents fullWidth={true} scrollable={true}>
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
                  />
                  {dispose}
                </div>
              </div>
            </Page.Contents>
          </Page>
        </WriteDataDetailsContextProvider>
      </TemplateProvider>
    </GetResources>
  )
}

export default ClientLibrariesPage
