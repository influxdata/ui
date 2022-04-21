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
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'
import {
  pinnedItemFailure,
  pinnedItemSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'
import {shouldOpenLinkInNewTab} from 'src/utils/crossPlatform'
import {safeBlankLinkOpen} from 'src/utils/safeBlankLinkOpen'

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

  const handleClick = event => {
    const url = `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`
    if (shouldOpenLinkInNewTab(event)) {
      safeBlankLinkOpen(url)
    } else {
      history.push(url)
    }
  }

  const contextMenu = (
    <FlowContextMenu id={id} name={flow.name} isPinned={isPinned} />
  )

  const handleRenameNotebook = async (name: string) => {
    flow.name = name
    await update(id, flow)
    if (isFlagEnabled('pinnedItems') && CLOUD && isPinned) {
      try {
        updatePinnedItemByParam(id, {name})
        dispatch(notify(pinnedItemSuccess('notebook', 'updated')))
      } catch (err) {
        dispatch(notify(pinnedItemFailure(err.message, 'update')))
      }
    }
  }

  const meta = []

  if (!!flow?.createdBy) {
    meta.push(
      <React.Fragment key={`${flow.id}--created-by`}>
        Created by {flow.createdBy}
      </React.Fragment>
    )
  }

  if (flow?.createdAt) {
    meta.push(
      <React.Fragment key={`${flow.id}--created-at`}>
        Created at {flow.createdAt}
      </React.Fragment>
    )
  }

  if (flow?.updatedAt) {
    meta.push(
      <React.Fragment key={`${flow.id}--updated-at`}>
        Last Modified at {flow.updatedAt}
      </React.Fragment>
    )
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
      <ResourceCard.Meta>{meta}</ResourceCard.Meta>
    </ResourceCard>
  )
}

export default FlowCard
