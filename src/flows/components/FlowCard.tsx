import React, {FC, useContext} from 'react'
import {useParams, useHistory} from 'react-router-dom'

// Components
import {ResourceCard} from '@influxdata/clockface'
import FlowContextMenu from 'src/flows/components/FlowContextMenu'
import {DEFAULT_PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'
import {FlowListContext} from 'src/flows/context/flow.list'

// Utils
import {shouldOpenLinkInNewTab} from 'src/utils/crossPlatform'
import {safeBlankLinkOpen} from 'src/utils/safeBlankLinkOpen'

interface Props {
  id: string
}

const FlowCard: FC<Props> = ({id}) => {
  const {update, flows} = useContext(FlowListContext)
  const flow = flows[id]
  const {orgID} = useParams<{orgID: string}>()

  const history = useHistory()

  const flowUrl = `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`

  const handleClick = event => {
    if (shouldOpenLinkInNewTab(event)) {
      safeBlankLinkOpen(flowUrl)
    } else {
      history.push(flowUrl)
    }
  }

  const contextMenu = <FlowContextMenu id={id} name={flow.name} />

  const handleRenameNotebook = async (name: string) => {
    flow.name = name
    await update(id, flow)
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
        href={flowUrl}
      />
      <ResourceCard.Meta>{meta}</ResourceCard.Meta>
    </ResourceCard>
  )
}

export default FlowCard
