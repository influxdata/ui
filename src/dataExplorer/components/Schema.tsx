import React, {FC, useState, useContext, useMemo, useEffect} from 'react'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import BucketSelector from 'src/dataExplorer/components/BucketSelector'
import MeasurementSelector from 'src/dataExplorer/components/MeasurementSelector'
import FieldsSelector from 'src/dataExplorer/components/FieldsSelector'
import TagKeysSelector from 'src/dataExplorer/components/TagKeysSelector'
import {NewDataExplorerProvider} from 'src/dataExplorer/components/SchemaSelector'

// Context
import {NewDataExplorerContext} from 'src/dataExplorer/components/SchemaSelector'

// Style
import './Schema.scss'

const FieldsTags: FC = () => {
  const {data} = useContext(NewDataExplorerContext)

  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchFieldsTags = (searchTerm: string): void => {
    // TODO
    /* eslint-disable no-console */
    console.log('Search: ', searchTerm)
    /* eslint-disable no-console */
    setSearchTerm(searchTerm)
  }

  return useMemo(() => {
    if (!data?.measurement) {
      return null
    }

    return (
      <div>
        <div className="fields-tags-search-bar">
          <SearchWidget
            placeholderText="Search fields and tags"
            onSearch={handleSearchFieldsTags}
            searchTerm={searchTerm}
          />
        </div>
        <FieldsSelector />
        <TagKeysSelector />
      </div>
    )
  }, [data])
}

const Schema: FC = () => {
  return (
    <NewDataExplorerProvider>
      <div>
        <div className="data-selection--title">Data Selection</div>
        <div className="scroll--container">
          <DapperScrollbars>
            <div className="data-schema">
              <BucketSelector />
              <div className="container-side-bar">
                <MeasurementSelector />
                <FieldsTags />
              </div>
            </div>
          </DapperScrollbars>
        </div>
      </div>
    </NewDataExplorerProvider>
  )
}

export default Schema
