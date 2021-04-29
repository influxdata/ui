// Libraries
import React, {useContext} from 'react'
import {FILE_UPLOAD} from 'src/shared/constants/routes'
import {search} from 'src/writeData/constants/contentFileUploads'

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

  if (!items.length) {
    return
  }

  return (
    <div
      className="write-data--section"
      data-testid={`write-data--section file-upload`}
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
        style={{marginBottom: '12px'}}
      >
        Upload line protocol or Annotated CSVs with the click of a button
      </Heading>
      <SquareGrid cardSize="170px" gutter={ComponentSize.Small}>
        {items.map(item => (
          <WriteDataItem
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.image}
            url={`${FILE_UPLOAD}/${item.id}`}
          />
        ))}
      </SquareGrid>
    </div>
  )
}

export default FileUploadSection
