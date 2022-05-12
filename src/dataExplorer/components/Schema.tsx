import React, {FC, useState} from 'react'

// Components
import {IconFont, Icon, FlexBox} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import BucketSelector from './BucketSelector'
import MeasurementSelector from './MeasurementSelector'
import FieldsSelector from './FieldsSelector'
import TagKeysSelector from './TagKeysSelector'

// Style
import './Schema.scss'
interface TitleProps {
  title: string
  info?: string // TODO: markdon? since there might be link
}

const SelectorTitle: FC<TitleProps> = ({title, info = ''}) => {
  return (
    <FlexBox className="selector-title">
      <div>{title}</div>
      {info && (
        <div className="selector-title--icon">
          <Icon glyph={IconFont.Info_New} />
          {info}
        </div>
      )}
    </FlexBox>
  )
}

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
        <SelectorTitle title="Bucket" />
        <BucketSelector />
      </div>
      <div>
        <SelectorTitle title="Measurement" />
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
          <SelectorTitle title="Fields" />
          <FieldsSelector />
        </div>
        <div>
          <SelectorTitle title="Tag Keys" />
          <TagKeysSelector />
        </div>
      </div>
    </div>
  )
}

export default Schema
