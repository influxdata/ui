// Libraries
import React, {FC, ReactNode} from 'react'
import {useParams} from 'react-router-dom'
import ReactMarkdown, {Renderer} from 'react-markdown'

// Components
import {Page} from '@influxdata/clockface'
import WriteDataCodeSnippet from 'src/writeData/components/WriteDataCodeSnippet'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import GetResources from 'src/resources/components/GetResources'

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

const WriteDataDetailsView: FC<Props> = ({section, children}) => {
  const {contentID} = useParams()
  const {name, markdown, image} = section.items.find(
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
      <ReactMarkdown source={markdown} renderers={{code: codeRenderer}} />
    )
  }

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
              </div>
            </div>
          </Page.Contents>
        </Page>
      </WriteDataDetailsContextProvider>
    </GetResources>
  )
}

export default WriteDataDetailsView
