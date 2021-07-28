import React, {FC} from 'react'
import {useParams, useHistory} from 'react-router-dom'

// Components
import {ResourceCard} from '@influxdata/clockface'
import FlowContextMenu from 'src/flows/components/FlowContextMenu'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'
import {Flow} from 'src/types'

interface Props {
  id: string
  flow: Flow
}

const FlowCard: FC<Props> = ({id, flow}) => {
  const {name} = flow
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const handleClick = () => {
    history.push(`/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`)
  }

  const contextMenu = <FlowContextMenu id={id} name={name} />

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
      <ResourceCard.Meta>
        {flow?.createdAt ? <>Created at {flow.createdAt}</> : null}
        {flow?.updatedAt ? <>Last Modified at {flow.updatedAt}</> : null}
      </ResourceCard.Meta>
    </ResourceCard>
  )
}

export default FlowCard
