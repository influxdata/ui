import React, {FC} from 'react'
import {useParams, useHistory} from 'react-router-dom'

// Components
import {ResourceCard} from '@influxdata/clockface'
import FlowContextMenu from 'src/flows/components/FlowContextMenu'

interface Props {
  id: string
  name: string
}

const FlowCard: FC<Props> = ({id, name}) => {
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const handleClick = () => {
    history.push(`/orgs/${orgID}/flows/${id}`)
  }

  const contextMenu = <FlowContextMenu id={id} name={name} />

  return (
    <ResourceCard
      key={`flow-card--${id}`}
      contextMenu={contextMenu}
      testID={`flow-card--${name}`}
    >
      <ResourceCard.Name
        name={name || 'Name this flow'}
        onClick={handleClick}
      />
    </ResourceCard>
  )
}

export default FlowCard
