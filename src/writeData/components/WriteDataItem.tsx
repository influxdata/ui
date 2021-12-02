// Libraries
import React, {CSSProperties, FC, Suspense} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {SelectableCard, SquareGrid, ComponentSize} from '@influxdata/clockface'
// import LazySVG from 'src/perf/components/LazySVG'
const LazySVG = React.lazy(() => import('src/perf/components/LazySVG'))

// Utils
import {getOrg} from 'src/organizations/selectors'

// Graphics
import placeholderLogo from 'src/writeData/graphics/placeholderLogo.svg'

// Constants
import {ORGS} from 'src/shared/constants/routes'

// Styles
import 'src/writeData/components/WriteDataItem.scss'

interface Props {
  id: string
  name: string
  url: string
  image?: string
  style?: CSSProperties
  selected?: boolean
  onClick?: any
  testID?: string
}

const WriteDataItem: FC<Props> = ({
  id,
  name,
  url,
  image,
  style,
  selected,
  onClick,
  testID,
}) => {
  const history = useHistory()
  const org = useSelector(getOrg)

  const handleClick = (): void => {
    history.push(`/${ORGS}/${org.id}/load-data/${url}`)
  }

  let thumb = <img src={placeholderLogo} />
  const svgStyle = style ? style : ({} as CSSProperties)

  if (image) {
    thumb = (
      <Suspense fallback="Loading...">
        <LazySVG image={image} style={svgStyle} alt={name} />
      </Suspense>
    )
  }

  if (onClick) {
    return (
      <SquareGrid.Card key={id}>
        <SelectableCard
          id={id}
          formName="load-data-cards"
          label={name}
          selected={selected}
          onClick={onClick}
          testID={testID}
          fontSize={ComponentSize.ExtraSmall}
          className="write-data--item"
        >
          <div className="write-data--item-thumb">{thumb}</div>
        </SelectableCard>
      </SquareGrid.Card>
    )
  }

  return (
    <SquareGrid.Card key={id}>
      <SelectableCard
        id={id}
        formName="load-data-cards"
        label={name}
        testID={`load-data-item ${id}`}
        selected={false}
        onClick={handleClick}
        fontSize={ComponentSize.ExtraSmall}
        className="write-data--item"
      >
        <div className="write-data--item-thumb">{thumb}</div>
      </SelectableCard>
    </SquareGrid.Card>
  )
}

export default WriteDataItem
