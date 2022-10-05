// Libraries
import React, {useContext} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'
import {ORGS, FILE_UPLOAD} from 'src/shared/constants/routes'
import {search} from 'src/writeData/constants/contentFileUploads'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

// Contexts
import {WriteDataSearchContext} from 'src/writeData/containers/WriteDataPage'

// Components
import {
  SquareGrid,
  ComponentSize,
  Heading,
  HeadingElement,
  FontWeight,
} from '@influxdata/clockface'
import WriteDataItem from 'src/writeData/components/WriteDataItem'

const FileUploadSection = () => {
  const {searchTerm} = useContext(WriteDataSearchContext)
  const items = search(searchTerm)

  const history = useHistory()
  const org = useSelector(getOrg)

  if (!items.length) {
    return null
  }

  return (
    <div
      className="write-data--section"
      data-testid="write-data--section file-upload"
    >
      <Heading
        element={HeadingElement.H2}
        weight={FontWeight.Regular}
        style={{marginTop: '24px', marginBottom: '4px'}}
      >
        File Upload
      </Heading>
      <Heading
        element={HeadingElement.H5}
        weight={FontWeight.Regular}
        style={{marginBottom: '24px'}}
      >
        Upload CSV or a line protocol file
      </Heading>
      <SquareGrid cardSize="170px" gutter={ComponentSize.Small}>
        {items.map(item => {
          const goto = () => {
            event('Load data file upload clicked', {type: item.name})
            history.push(
              `/${ORGS}/${org.id}/load-data/${FILE_UPLOAD}/${item.id}`
            )
          }

          return (
            <WriteDataItem
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              onClick={goto}
            />
          )
        })}
      </SquareGrid>
    </div>
  )
}

export default FileUploadSection
