import React, {FC, useState} from 'react'

// Components
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
      <div>
        <BucketSelector />
      </div>
      <div>
        <MeasurementSelector />
      </div>
      <div>
        <div className="fields-tags-search-bar">
          <SearchWidget
            placeholderText="Search fields and tags"
            onSearch={handleSearchFieldsTags}
            searchTerm={searchTerm}
          />
        </div>
        <div>
          <FieldsSelector />
        </div>
        <div>
          <TagKeysSelector />
        </div>
      </div>
    </div>
  )
}

export default Schema
