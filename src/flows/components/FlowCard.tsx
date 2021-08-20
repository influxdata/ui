import React, {FC, useContext} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

// Components
import {ResourceCard} from '@influxdata/clockface'
import FlowContextMenu from 'src/flows/components/FlowContextMenu'
import {DEFAULT_PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'
import {FlowListContext} from 'src/flows/context/flow.list'

// Utils
import {updatePinnedItemByParam} from 'src/shared/contexts/pinneditems'

import {
  pinnedItemFailure,
  pinnedItemSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

interface Props {
  id: string
  isPinned: boolean
}

const FlowCard: FC<Props> = ({id, isPinned}) => {
  const {update, flows} = useContext(FlowListContext)
  const flow = flows[id]
  const {orgID} = useParams<{orgID: string}>()

  const history = useHistory()
  const dispatch = useDispatch()

  const handleClick = () => {
    history.push(`/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`)
  }

  const contextMenu = (
    <FlowContextMenu id={id} name={flow.name} isPinned={isPinned} />
  )

  const handleRenameNotebook = (name: string) => {
    update(id, {...flow, name})
    try {
      updatePinnedItemByParam(id, {name})
      dispatch(notify(pinnedItemSuccess('notebook', 'updated')))
    } catch (err) {
      dispatch(notify(pinnedItemFailure(err.message, 'update')))
    }
  }

  return (
    <ResourceCard
      key={`flow-card--${id}`}
      contextMenu={contextMenu}
      testID={`flow-card--${flow.name}`}
    >
      <ResourceCard.EditableName
        name={flow.name || DEFAULT_PROJECT_NAME}
        onClick={handleClick}
        onUpdate={handleRenameNotebook}
        buttonTestID="flow-card--name-button"
      />
      <ResourceCard.Meta>
        {flow?.createdAt ? <>Created at {flow.createdAt}</> : null}
        {flow?.updatedAt ? <>Last Modified at {flow.updatedAt}</> : null}
      </ResourceCard.Meta>
    </ResourceCard>
  )
}

export default FlowCard
