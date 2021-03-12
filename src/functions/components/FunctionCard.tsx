import React, {FC, useContext} from 'react'
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
import {FunctionListContext} from 'src/functions/context/function.list'

// utils
import {getOrg} from 'src/organizations/selectors'

interface Props {
  id: string
}

const FunctionCard: FC<Props> = ({id}) => {
  const {functionsList} = useContext(FunctionListContext)
  const {id: orgID} = useSelector(getOrg)
  const history = useHistory()

  const {name, url, updatedAt} = functionsList[id]

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
          {url && 'Endpoint: ' + url}
          {`Last updated: ${updatedAt}`}
        </ResourceCard.Meta>
      </FlexBox>
    </ResourceCard>
  )
}

export default FunctionCard
