// Libraries
import React, {CSSProperties, FC, Suspense} from 'react'

// Components
import {SelectableCard, SquareGrid, ComponentSize} from '@influxdata/clockface'
const LazySVG = React.lazy(() => import('src/perf/components/LazySVG'))

// Graphics
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'

// Styles
import 'src/writeData/components/WriteDataItem.scss'

interface Props {
  id: string
  name: string
  image?: string
  style?: CSSProperties
  selected?: boolean
  onClick: any
  testID?: string
  tag?: string
}

const WriteDataItem: FC<Props> = ({
  id,
  name,
  image,
  tag,
  style,
  selected,
  onClick,
  testID,
}) => {
  let thumb = <img src={placeholderLogo} />
  const svgStyle = style ? style : ({} as CSSProperties)

  if (image) {
    thumb = (
      <Suspense fallback="Loading...">
        <LazySVG image={image} style={svgStyle} alt={name} />
      </Suspense>
    )
  }

  return (
    <SquareGrid.Card key={id}>
      <SelectableCard
        id={id}
        formName="load-data-cards"
        label={name}
        selected={selected}
        onClick={onClick}
        testID={testID || `load-data-item ${id}`}
        fontSize={ComponentSize.ExtraSmall}
        className="write-data--item"
      >
        <div className="write-data--item-thumb">{thumb}</div>
        {tag && <div className='load-data-cards--tag'>{tag}</div>}
      </SelectableCard>
    </SquareGrid.Card>
  )
}

export default WriteDataItem
