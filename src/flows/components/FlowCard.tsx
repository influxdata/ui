import React, {FC, useContext} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {ResourceCard} from '@influxdata/clockface'
import FlowContextMenu from 'src/flows/components/FlowContextMenu'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'
import {FlowListContext} from 'src/flows/context/flow.list'

// Utils
import {getMe} from 'src/me/selectors'
interface Props {
  id: string
}

const FlowCard: FC<Props> = ({id}) => {
  const {update, flows} = useContext(FlowListContext)
  const flow = flows[id]
  const {orgID} = useParams<{orgID: string}>()

  const history = useHistory()
  const user = useSelector(getMe)

  const handleClick = () => {
    history.push(`/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`)
  }

  const contextMenu = <FlowContextMenu id={id} name={flow.name} />

  let name = user.name

  if (name.includes('@')) {
    name = name.split('@')[0]
  }
  name = `${name}-${PROJECT_NAME.toLowerCase()}-${new Date().toISOString()}`

  const handleRenameNotebook = (name: string) => {
    update(id, {...flow, name})
  }

  return (
    <ResourceCard
      key={`flow-card--${id}`}
      contextMenu={contextMenu}
      testID={`flow-card--${flow.name}`}
    >
      <ResourceCard.EditableName
        name={flow.name || name}
        onClick={handleClick}
        onUpdate={handleRenameNotebook}
      />
      <ResourceCard.Meta>
        {flow?.createdAt ? <>Created at {flow.createdAt}</> : null}
        {flow?.updatedAt ? <>Last Modified at {flow.updatedAt}</> : null}
      </ResourceCard.Meta>
    </ResourceCard>
  )
}

export default FlowCard
