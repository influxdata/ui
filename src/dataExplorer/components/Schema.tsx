import React, {FC, useState} from 'react'

// Components
import {IconFont, Icon, FlexBox} from '@influxdata/clockface'
import BucketSelector from 'src/dataExplorer/components/BucketSelector'
import MeasurementSelector from 'src/dataExplorer/components/MeasurementSelector'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'

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
        <div style={{padding: '8px 0'}}>
          <SearchWidget
            placeholderText="Search fields and tags"
            onSearch={handleSearchFieldsTags}
            searchTerm={searchTerm}
          />
        </div>
        <div>
          <SelectorTitle title="Fields" />
          <div>[Fields list]</div>
          <div>Load More</div>
        </div>
        <div>
          <SelectorTitle title="Tag Keys" />
          <div>[Tag List]</div>
          <div>Lode More</div>
        </div>
      </div>
    </div>
  )
}

export default Schema
