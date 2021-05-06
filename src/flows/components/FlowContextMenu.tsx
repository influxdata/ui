// Libraries
import React, {FC, useContext} from 'react'
import {useParams, useHistory} from 'react-router-dom'

// Components
import {Context} from 'src/clockface'
import {
  Button,
  ButtonShape,
  ComponentColor,
  IconFont,
} from '@influxdata/clockface'
import {FlowListContext} from 'src/flows/context/flow.list'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface Props {
  id: string
  name: string
}

const FlowContextMenu: FC<Props> = ({id, name}) => {
  const {remove, clone} = useContext(FlowListContext)
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const handleDelete = () => {
    event('delete_notebook')
    remove(id)
  }

  const handleClone = async () => {
    event('clone_notebook')
    const clonedId = await clone(id)
    history.push(
      `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${clonedId}`
    )
  }

  return (
    <Context>
      <Button
        text="Clone"
        icon={IconFont.Duplicate}
        color={ComponentColor.Secondary}
        titleText="Clone"
        testID="flow-button--clone"
        onClick={handleClone}
      />
      <Context.Menu
        icon={IconFont.Trash}
        color={ComponentColor.Danger}
        shape={ButtonShape.Default}
        text={`Delete ${PROJECT_NAME}`}
        testID={`context-delete-menu ${name}`}
      >
        <Context.Item
          label="Confirm"
          action={handleDelete}
          testID={`context-delete-flow ${name}`}
        />
      </Context.Menu>
    </Context>
  )
}

export default FlowContextMenu
