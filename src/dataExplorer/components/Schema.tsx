import React, {FC, useState} from 'react'

// Components
import {DapperScrollbars} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import BucketSelector from './BucketSelector'
import MeasurementSelector from './MeasurementSelector'
import FieldsSelector from './FieldsSelector'
import TagKeysSelector from './TagKeysSelector'

// Style
import './Schema.scss'

const Schema: FC = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchFieldsTags = (searchTerm: string): void => {
    console.log('Search: ', searchTerm)
    setSearchTerm(searchTerm)
  }

  return (
    <div>
      <div>Data Selection</div>
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
