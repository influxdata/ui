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
  name: string
}

const FlowCard: FC<Props> = ({id, name}) => {
  const {orgID} = useParams<{orgID: string}>()
  const {update} = useContext(FlowListContext)

  const history = useHistory()
  const user = useSelector(getMe)

  const handleClick = () => {
    history.push(`/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`)
  }

  const contextMenu = <FlowContextMenu id={id} name={name} />

  let userName = user.name

  if (name.includes('@')) {
    userName = userName.split('@')[0]
  }
  userName = `${userName}-${PROJECT_NAME.toLowerCase()}-${new Date().toISOString()}`

  const handleRenameNotebook = (name: string) => {
    // TODO(ariel): once we get the flows PR up and running integrate this
    update(id, {...flow, name})
  }
  // TODO(ariel): set the default different than NAME this PROJECT
  return (
    <ResourceCard
      key={`flow-card--${id}`}
      contextMenu={contextMenu}
      testID={`flow-card--${name}`}
    >
      <ResourceCard.EditableName
        name={name || userName}
        onClick={handleClick}
        onUpdate={handleRenameTask}
      />
    </ResourceCard>
  )
}

export default FlowCard
