import React, {FC} from 'react'
import {useParams, useHistory} from 'react-router-dom'

// Components
import {ResourceCard} from '@influxdata/clockface'
import FlowContextMenu from 'src/flows/components/FlowContextMenu'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'

interface Props {
  id: string
  name: string
  isPinned: boolean
}

const FlowCard: FC<Props> = ({id, name, isPinned}) => {
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const handleClick = () => {
    history.push(`/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`)
  }

  const contextMenu = (
    <FlowContextMenu id={id} name={name} isPinned={isPinned} />
  )

  return (
    <ResourceCard
      key={`flow-card--${id}`}
      contextMenu={contextMenu}
      testID={`flow-card--${name}`}
    >
      <ResourceCard.Name
        name={name || `Name this ${PROJECT_NAME}`}
        onClick={handleClick}
      />
    </ResourceCard>
  )
}

export default FlowCard
