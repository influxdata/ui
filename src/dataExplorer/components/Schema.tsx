import React, {FC} from 'react'

// Components
import {IconFont, Icon, FlexBox} from '@influxdata/clockface'
import BucketSelector from 'src/dataExplorer/components/BucketSelector'

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
  return (
    <div>
      <div>Data Selection</div>
      <div>
        <SelectorTitle title="Bucket" />
        <BucketSelector />
      </div>
      <div>
        <SelectorTitle title="Measurement" />
        <div>[Measurement dropdown]</div>
      </div>
      <div>
        <div>[Search bar for fields and tags]</div>
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
