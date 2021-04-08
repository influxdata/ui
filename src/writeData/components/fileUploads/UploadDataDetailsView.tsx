// Libraries
import React, {FC, ReactNode} from 'react'
import {useParams} from 'react-router-dom'
import {Renderer} from 'react-markdown'

// Components
import {Page} from '@influxdata/clockface'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import GetResources from 'src/resources/components/GetResources'
import CsvMethod from 'src/writeData/components/fileUploads/CsvMethod'
import WriteDataCodeSnippet from 'src/writeData/components/WriteDataCodeSnippet'
import LineProtocolTabs from 'src/buckets/components/lineProtocol/configure/LineProtocolTabs'
import {MarkdownRenderer} from 'src/shared/components/views/MarkdownRenderer'

// Types
import {WriteDataSection} from 'src/writeData/constants'
import {ResourceType} from 'src/types'

// Graphics
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'

interface Props {
  section: WriteDataSection
  children?: ReactNode
}

const codeRenderer: Renderer<HTMLPreElement> = (props: any): any => {
  return <WriteDataCodeSnippet code={props.value} language={props.language} />
}

const UploadDataDetailsView: FC<Props> = ({section, children}) => {
  const {contentID} = useParams()
  const {name, markdown, image} = section.items.find(
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
      <MarkdownRenderer text={markdown} cloudRenderers={{code: codeRenderer}} />
    )
  }

  const isLP = contentID === 'lp'

  return (
    <GetResources
      resources={[ResourceType.Authorizations, ResourceType.Buckets]}
    >
      <WriteDataDetailsContextProvider>
        <Page
          titleTag={pageTitleSuffixer([section.name, 'Sources', 'Load Data'])}
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
                {children}
                {pageContent}
                {isLP ? <LineProtocolTabs /> : <CsvMethod />}
              </div>
            </div>
          </Page.Contents>
        </Page>
      </WriteDataDetailsContextProvider>
    </GetResources>
  )
}

export default UploadDataDetailsView
