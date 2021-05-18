// Libraries
import React, {FC, Suspense} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {SelectableCard, SquareGrid, ComponentSize} from '@influxdata/clockface'
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
}

const WriteDataItem: FC<Props> = ({id, name, url, image}) => {
  const history = useHistory()
  const org = useSelector(getOrg)

  const handleClick = (): void => {
    history.push(`/${ORGS}/${org.id}/load-data/${url}`)
  }

  let thumb = <img src={placeholderLogo} />

  if (image) {
    thumb = (
      <Suspense fallback="Loading...">
        <LazySVG image={image} />
      </Suspense>
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
