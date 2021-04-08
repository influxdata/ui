// Libraries
import React, {FC, ReactNode} from 'react'
import {useParams} from 'react-router-dom'

// Components
import {Page} from '@influxdata/clockface'
import WriteDataDetailsContextProvider from 'src/writeData/components/WriteDataDetailsContext'
import GetResources from 'src/resources/components/GetResources'
import CsvMethod from 'src/writeData/components/fileUploads/CsvMethod'
import LpMethod from 'src/writeData/components/fileUploads/LpMethod'

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

const UploadDataDetailsView: FC<Props> = ({section, children}) => {
  const {contentID} = useParams()
  const {name, image} = section.items.find(item => item.id === contentID)

  let thumbnail = (
    <img data-testid="load-data-details-thumb" src={image || placeholderLogo} />
  )

  if (image) {
    thumbnail = <img data-testid="load-data-details-thumb" src={image} />
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
                {isLP ? <LpMethod /> : <CsvMethod />}
                {/* TODO(ariel): add some helper text in each of these to match the other pages and update the logos / images */}
              </div>
            </div>
          </Page.Contents>
        </Page>
      </WriteDataDetailsContextProvider>
    </GetResources>
  )
}

export default UploadDataDetailsView
