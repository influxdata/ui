// Libraries
import React, {FC, useContext} from 'react'

// Contexts
import {WriteDataSearchContext} from 'src/writeData/containers/WriteDataPage'

// Components
import {ComponentSize} from '@influxdata/clockface'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'

const WriteDataSearchBar: FC = () => {
  const {searchTerm, setSearchTerm} = useContext(WriteDataSearchContext)

  return (
    <SearchWidget
      placeholderText="Search data writing methods..."
      searchTerm={searchTerm}
      size={ComponentSize.Large}
      onSearch={setSearchTerm}
      autoFocus={true}
      testID="write-data--search"
    />
  )
}

export default WriteDataSearchBar
