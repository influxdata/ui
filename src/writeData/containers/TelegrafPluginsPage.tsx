// Libraries
import React, {FC} from 'react'
import {useParams} from 'react-router-dom'
import {Renderer} from 'react-markdown'

// Components
import {
  Button,
  Columns,
  Dropdown,
  Grid,
  List,
  Page,
} from '@influxdata/clockface'
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
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

const DropdownButton = () => (
  <Button text="Use this plugin" style={{width: '100%'}} />
)

const DropdownMenu = (onCollapse: () => void) => (
  <Dropdown.Menu onCollapse={onCollapse}>
    <List.Item
      key="Create-new-configuration-telegraf-plugin"
      value="Create a new configuration"
      onClick={() => {}}
      selected={false}
    >
      <span>Create a new configuration</span>
    </List.Item>
    <List.Item
      key="Add-to-existing-configuration-telegraf-plugin"
      value="Add to an existing configuration"
      onClick={() => {}}
      selected={false}
    >
      <span>Add to an existing configuration</span>
    </List.Item>
  </Dropdown.Menu>
)

interface PluginToConfigurationCTAProps {
  thumbnail: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >
  pageContent: React.ReactElement
}

const PluginToConfigurationCTA: FC<PluginToConfigurationCTAProps> = ({
  pageContent,
  thumbnail,
}) => (
  <div className="write-data--details">
    <Grid>
      <Grid.Row>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Three}
        >
          <div className="write-data--details-thumbnail">{thumbnail}</div>
          <Dropdown
            button={DropdownButton}
            className="use-plugin--telegraf-configuration"
            menu={DropdownMenu}
            style={{width: 'auto'}}
          />
        </Grid.Column>
        <Grid.Column
          widthXS={Columns.Twelve}
          widthMD={Columns.Six}
          widthLG={Columns.Nine}
        >
          <div
            className="write-data--details-content markdown-format"
            data-testid="load-data-details-content"
          >
            {pageContent}
          </div>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
)

const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => (
  <CodeSnippet text={props.value} label={props.language} />
)

const TelegrafPluginsPage: FC = () => {
  const {contentID} = useParams()
  const {name, markdown, image} = WRITE_DATA_TELEGRAF_PLUGINS.find(
    item => item.id === contentID
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
              {isFlagEnabled('telegrafUiRefresh') ? (
                <PluginToConfigurationCTA
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

export default TelegrafPluginsPage
