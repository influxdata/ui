// Libraries
import React, {FC, useContext} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import 'src/flows/components/FlowContextMenu.scss'

// Selector
import {getMe} from 'src/me/selectors'
import {useSelector} from 'react-redux'

// Components
import {Context} from 'src/clockface'
import {
  Button,
  ButtonShape,
  ComponentColor,
  ComponentSize,
  IconFont,
} from '@influxdata/clockface'
import {FlowListContext} from 'src/flows/context/flow.list'
import {PROJECT_NAME_PLURAL} from 'src/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'

import {
  pushPinnedItem,
  deletePinnedItemByParam,
  PinnedItemTypes,
} from 'src/shared/contexts/pinneditems'

interface Props {
  id: string
  name: string
  isPinned: boolean
}

const FlowContextMenu: FC<Props> = ({id, name, isPinned}) => {
  const {remove, clone} = useContext(FlowListContext)
  const {orgID} = useParams<{orgID: string}>()
  const me = useSelector(getMe)
  const history = useHistory()

  const handlePinFlow = async () => {
    await pushPinnedItem({
      orgID: orgID,
      userID: me.id,
      metadata: [
        {
          flowID: id,
          name,
        },
      ],
      type: PinnedItemTypes.Notebook,
    })
  }

  const handleDelete = async () => {
    event('delete_notebook')
    await deletePinnedItemByParam(id)
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
    <div className="flow-context--wrapper">
      <Context>
        <Button
          text="Clone"
          icon={IconFont.Duplicate}
          color={ComponentColor.Secondary}
          size={ComponentSize.ExtraSmall}
          titleText="Clone"
          testID="flow-button--clone"
          onClick={handleClone}
          className="flow-menu--clone"
        />
        <Context.Menu
          icon={IconFont.Star}
          color={ComponentColor.Success}
          testID="context-pin-menu"
        >
          <Context.Item
            label="Pin to Homepage"
            action={async () => await handlePinFlow()}
            testID="context-delete-task"
            disabled={isPinned}
          />
        </Context.Menu>
        <Context.Menu
          icon={IconFont.Trash}
          color={ComponentColor.Danger}
          shape={ButtonShape.Default}
          text="Delete"
          testID={`context-delete-menu ${name}`}
        >
          <Context.Item
            label="Confirm"
            action={handleDelete}
            testID={`context-delete-flow ${name}`}
          />
        </Context.Menu>
      </Context>
    </div>
  )
}

export default FlowContextMenu
