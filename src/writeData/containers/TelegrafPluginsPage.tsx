// Libraries
import React, {FC, useEffect} from 'react'
import {useParams} from 'react-router-dom'
import {Renderer} from 'react-markdown'

// Components
import {Page} from '@influxdata/clockface'
import CodeSnippet, {
  Provider as TemplateProvider,
} from 'src/shared/components/CodeSnippet'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import GetResources from 'src/resources/components/GetResources'

// Constants
import {WRITE_DATA_TELEGRAF_PLUGINS} from 'src/writeData/constants/contentTelegrafPlugins'

// Types
import {ResourceType} from 'src/types'

// Graphics
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {event, normalizeEventName} from 'src/cloud/utils/reporting'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

const TelegrafPluginsPage: FC = () => {
  const {contentID} = useParams()
  const {name, markdown, image} = WRITE_DATA_TELEGRAF_PLUGINS.find(
    item => item.id === contentID
  )

  const eventName = normalizeEventName(name)
  useEffect(() => {
    event(`telegraf_tile.${eventName}.config_viewed`, {id: contentID, name})
  }, [eventName, contentID, name])

  const onCopy = () => {
    event(`telegraf_tile.${eventName}.config_copied`, {id: contentID, name})
  }
  const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => (
    <CodeSnippet text={props.value} label={props.language} onCopy={onCopy} />
  )

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
              <div className="write-data--details">
                <div className="write-data--details-thumbnail">{thumbnail}</div>
                <div
                  className="write-data--details-content markdown-format"
                  data-testid="load-data-details-content"
                >
                  {pageContent}
                </div>
              </div>
            </Page.Contents>
          </Page>
        </WriteDataDetailsContextProvider>
      </TemplateProvider>
    </GetResources>
  )
}

export default TelegrafPluginsPage
