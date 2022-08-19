// Libraries
import React, {FC} from 'react'
import {useParams} from 'react-router-dom'
import {Panel, InfluxColors, ComponentSize} from '@influxdata/clockface'

// Components
import {Page} from '@influxdata/clockface'
import WriteDataHelperBuckets from 'src/writeData/components/WriteDataHelperBuckets'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import CodeSnippet, {
  Provider as TemplateProvider,
} from 'src/shared/components/CodeSnippet'
import GetResources from 'src/resources/components/GetResources'
import CsvMethod from 'src/writeData/components/fileUploads/CsvMethod'
import LineProtocolTabs from 'src/buckets/components/lineProtocol/configure/LineProtocolTabs'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

// Constants
import {WRITE_DATA_FILE_UPLOADS} from 'src/writeData/constants/contentFileUploads'

// Types
import {ResourceType} from 'src/types'

// Graphics
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'
import LineProtocolFooterButtons from 'src/buckets/components/lineProtocol/LineProtocolFooterButtons'

const codeRenderer: any = (props: any): any => (
  <CodeSnippet text={props.value} label={props.language} />
)

const UploadDataDetailsView: FC = () => {
  const {contentID} = useParams<{contentID: string}>()
  const {name, markdown, image} = WRITE_DATA_FILE_UPLOADS.find(
    item => item.id === contentID
  )

  let thumbnail = (
    <img data-testid="load-data-details-thumb" src={image || placeholderLogo} />
  )

  if (image) {
    thumbnail = <img data-testid="load-data-details-thumb" src={image} />
  }

  let pageContent = <></>

  if (markdown) {
    pageContent = (
      <MarkdownRenderer
        text={markdown}
        cloudRenderers={{code: codeRenderer}}
        escapeHtml={false}
      />
    )
  }

  const isLP = contentID === 'lp'
  const isNonannotatedCSV = contentID === 'csv'

  return (
    <GetResources
      resources={[ResourceType.Authorizations, ResourceType.Buckets]}
    >
      <TemplateProvider>
        <WriteDataDetailsContextProvider>
          <Page
            titleTag={pageTitleSuffixer([
              'File Upload',
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
                  {contentID !== 'csv' && (
                    <Panel backgroundColor={InfluxColors.Grey15}>
                      <Panel.Body size={ComponentSize.ExtraSmall}>
                        <WriteDataHelperBuckets />
                      </Panel.Body>
                    </Panel>
                  )}
                  <div className="write-data--uploader-wrapper">
                    {!isNonannotatedCSV &&
                      (isLP ? <LineProtocolTabs /> : <CsvMethod />)}
                  </div>
                  <div className="write-data--uploader-wrapper">
                    {!isNonannotatedCSV && isLP && (
                      <LineProtocolFooterButtons />
                    )}
                  </div>
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

export default UploadDataDetailsView
