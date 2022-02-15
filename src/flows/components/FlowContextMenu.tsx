// Libraries
import React, {createRef, FC, RefObject, useContext} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import 'src/flows/components/FlowContextMenu.scss'

// Selector
import {getMe} from 'src/me/selectors'
import {useSelector, useDispatch} from 'react-redux'

// Components
import {
  Appearance,
  ButtonShape,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
  FlexBox,
  IconFont,
  List,
  Popover,
  SquareButton,
} from '@influxdata/clockface'
import {FlowListContext} from 'src/flows/context/flow.list'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from 'src/flows'

// Utils
import {event} from 'src/cloud/utils/reporting'

import {
  addPinnedItem,
  deletePinnedItemByParam,
  PinnedItemTypes,
} from 'src/shared/contexts/pinneditems'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

import {
  pinnedItemFailure,
  pinnedItemSuccess,
} from 'src/shared/copy/notifications'
import {notify} from 'src/shared/actions/notifications'

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
  const dispatch = useDispatch()

  const handlePinFlow = () => {
    try {
      addPinnedItem({
        orgID: orgID,
        userID: me.id,
        metadata: {
          flowID: id,
          name,
        },
        type: PinnedItemTypes.Notebook,
      })
      dispatch(notify(pinnedItemSuccess('notebook', 'added')))
    } catch (err) {
      dispatch(notify(pinnedItemFailure(err.message, 'create')))
    }
  }

  const handleDelete = () => {
    event('delete_notebook')
    deletePinnedItemByParam(id)
    remove(id)
  }

  const handleClone = async () => {
    event('clone_notebook')
    const clonedId = await clone(id)
    history.push(
      `/orgs/${orgID}/${PROJECT_NAME_PLURAL.toLowerCase()}/${clonedId}`
    )
  }
  const settingsRef: RefObject<HTMLButtonElement> = createRef()

  return (
    <FlexBox margin={ComponentSize.ExtraSmall}>
      <ConfirmationButton
        color={ComponentColor.Colorless}
        icon={IconFont.Trash_New}
        shape={ButtonShape.Square}
        size={ComponentSize.ExtraSmall}
        confirmationLabel={`Yes, delete this ${PROJECT_NAME}`}
        onConfirm={handleDelete}
        confirmationButtonText="Confirm"
        testID="context-delete-menu"
      />
      <SquareButton
        ref={settingsRef}
        size={ComponentSize.ExtraSmall}
        icon={IconFont.CogSolid_New}
        color={ComponentColor.Colorless}
        testID="context-menu-flow"
      />
      <Popover
        appearance={Appearance.Outline}
        enableDefaultStyles={false}
        style={{minWidth: '112px'}}
        triggerRef={settingsRef}
        contents={onHide => (
          <List>
            <List.Item
              onClick={handleClone}
              size={ComponentSize.Small}
              style={{fontWeight: 500}}
              testID="context-clone-flow"
            >
              Clone
            </List.Item>
            {isFlagEnabled('pinnedItems') && CLOUD && (
              <List.Item
                onClick={() => {
                  handlePinFlow()
                  onHide()
                }}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-pin-flow"
                disabled={isPinned}
              >
                Pin
              </List.Item>
            )}
          </List>
        )}
      />
    </FlexBox>
  )
}

export default FlowContextMenu
