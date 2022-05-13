import React, {FC, useState} from 'react'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import BucketSelector from 'src/dataExplorer/components/BucketSelector'
import MeasurementSelector from 'src/dataExplorer/components/MeasurementSelector'
import FieldsSelector from 'src/dataExplorer/components/FieldsSelector'
import TagKeysSelector from 'src/dataExplorer/components/TagKeysSelector'

// Style
import './Schema.scss'

const Schema: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchFieldsTags = (searchTerm: string): void => {
    // TODO
    /* eslint-disable no-console */
    console.log('Search: ', searchTerm)
    /* eslint-disable no-console */
    setSearchTerm(searchTerm)
  }

  return (
    <div>
      <div className="data-selection--title">Data Selection</div>
      <div className="scroll--container">
        <DapperScrollbars>
          <div className="data-schema">
            <BucketSelector />
            <div className="container-side-bar">
              <MeasurementSelector />
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
            </div>
          </div>
        </DapperScrollbars>
      </div>
    </div>
  )
}

export default Schema
