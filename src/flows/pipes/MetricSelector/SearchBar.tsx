// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Input, IconFont, ComponentSize} from '@influxdata/clockface'

// Contexts
import {SchemaContext} from 'src/flows/pipes/MetricSelector/context'

const SearchBar: FC = () => {
  const {searchTerm, setSearchTerm} = useContext(SchemaContext)

  const handleSetSearch = (text: string): void => {
    setSearchTerm(text)
  }

  return (
    <Input
      className="data-source--search"
      icon={IconFont.Search_New}
      size={ComponentSize.Medium}
      value={searchTerm}
      placeholder="Filter data by measurement, field, or tag ..."
      onChange={evt => handleSetSearch(evt.target.value)}
    />
  )
}

export default SearchBar
