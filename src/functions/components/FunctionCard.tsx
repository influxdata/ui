import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexDirection,
  ResourceCard,
  FlexBox,
} from '@influxdata/clockface'
import FunctionContextMenu from 'src/functions/components/FunctionContextMenu'

// utils
import {getOrg} from 'src/organizations/selectors'

interface Props {
  id: string
  name: string
  url?: string
  description?: string
}

const FunctionCard: FC<Props> = ({id, name, url, description}) => {
  const {id: orgID} = useSelector(getOrg)
  const history = useHistory()

  const handleClick = () => {
    history.push(`/orgs/${orgID}/functions/${id}/edit`)
  }

  return (
    <ResourceCard
      key={`function-card--${id}`}
      testID={`function-card--${name}`}
      alignItems={AlignItems.Center}
      margin={ComponentSize.Large}
      direction={FlexDirection.Row}
      contextMenu={<FunctionContextMenu id={id} name={name} />}
    >
      <FlexBox
        alignItems={AlignItems.FlexStart}
        direction={FlexDirection.Column}
        margin={ComponentSize.Medium}
      >
        <ResourceCard.Name name={name} onClick={handleClick} />
        <ResourceCard.Meta>
          <>{description && description}</>
          {url && 'Endpoint: ' + url}
        </ResourceCard.Meta>
      </FlexBox>
    </ResourceCard>
  )
}

export default FunctionCard
