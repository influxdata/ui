// Libraries
import React, {useContext} from 'react'
import {CLIENT_LIBS} from 'src/shared/constants/routes'
import {searchClients} from 'src/writeData'

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

const ClientLibrarySection = () => {
  const {searchTerm} = useContext(WriteDataSearchContext)
  const items = searchClients(searchTerm)

  if (!items.length) {
    return
  }

  return (
    <div
      className="write-data--section"
      data-testid="write-data--section client-libraries"
    >
      <Heading
        element={HeadingElement.H2}
        weight={FontWeight.Regular}
        style={{marginTop: '24px', marginBottom: '4px'}}
      >
        Client Libraries
      </Heading>
      <Heading
        element={HeadingElement.H5}
        weight={FontWeight.Regular}
        style={{marginBottom: '12px'}}
      >
        Back-end, front-end, and mobile applications
      </Heading>
      <SquareGrid cardSize="170px" gutter={ComponentSize.Small}>
        {items.map(item => (
          <WriteDataItem
            key={item.id}
            id={item.id}
            name={item.name}
            image={item.logo}
            url={`${CLIENT_LIBS}/${item.id}`}
          />
        ))}
      </SquareGrid>
    </div>
  )
}

export default ClientLibrarySection
