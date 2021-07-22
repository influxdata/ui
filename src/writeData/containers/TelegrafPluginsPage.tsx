// Libraries
import React, {FC} from 'react'
import {RouteComponentProps, useParams} from 'react-router-dom'
import {Renderer} from 'react-markdown'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {Page} from '@influxdata/clockface'
import CodeSnippet, {
  Provider as TemplateProvider,
} from 'src/shared/components/CodeSnippet'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import {AddPluginToConfigurationCTA} from 'src/writeData/components/AddPluginToConfiguration'
import GetResources from 'src/resources/components/GetResources'

// Constants
import {WRITE_DATA_TELEGRAF_PLUGINS} from 'src/writeData/constants/contentTelegrafPlugins'

// Types
import {ResourceType} from 'src/types'

// Graphics
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => (
  <CodeSnippet text={props.value} label={props.language} />
)

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{orgID: string}>
type ParamsType = {
  [param: string]: string
}

const TelegrafPluginsPage: FC<Props> = props => {
  const {
    history,
    match: {
      params: {orgID},
    },
  } = props
  const {contentID} = useParams<ParamsType>()
  const {name = '', markdown = '', image = ''} =
    WRITE_DATA_TELEGRAF_PLUGINS.find(item => item.id === contentID) || {}

  let thumbnail = (
    <img data-testid="load-data-details-thumb" src={image || placeholderLogo} />
  )
  let pageContent = <></>

  if (image) {
    thumbnail = <img data-testid="load-data-details-thumb" src={image} />
  }

  if (markdown) {
    pageContent = (
      <MarkdownRenderer
        text={markdown}
        cloudRenderers={{code: codeRenderer}}
        escapeHtml={false}
      />
    )
  }

  return (
    <GetResources
      resources={[ResourceType.Authorizations, ResourceType.Buckets]}
    >
      <TemplateProvider>
        <WriteDataDetailsContextProvider>
          <Page
            titleTag={pageTitleSuffixer([
              'Telegraf Plugin',
              'Sources',
              'Load Data',
            ])}
          >
            <Page.Header fullWidth={false}>
              <Page.Title title={name} />
            </Page.Header>
            <Page.Contents fullWidth={false} scrollable={true}>
              {isFlagEnabled('telegrafUiRefresh') ? (
                <AddPluginToConfigurationCTA
                  contentID={contentID}
                  history={history}
                  orgID={orgID}
                  thumbnail={thumbnail}
                  pageContent={pageContent}
                />
              ) : (
                <div className="write-data--details">
                  <div className="write-data--details-thumbnail">
                    {thumbnail}
                  </div>
                  <div
                    className="write-data--details-content markdown-format"
                    data-testid="load-data-details-content"
                  >
                    {pageContent}
                  </div>
                </div>
              )}
            </Page.Contents>
          </Page>
        </WriteDataDetailsContextProvider>
      </TemplateProvider>
    </GetResources>
  )
}

const connector = connect()
export default TelegrafPluginsPage
