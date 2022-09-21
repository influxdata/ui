// Libraries
import React, {createRef, FC, RefObject, useContext} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import 'src/flows/components/FlowContextMenu.scss'

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
import {CLOUD} from 'src/shared/constants'

interface Props {
  id: string
  name: string
}

const FlowContextMenu: FC<Props> = ({id}) => {
  const {remove, clone} = useContext(FlowListContext)
  const {orgID} = useParams<{orgID: string}>()
  const history = useHistory()

  const handleDelete = () => {
    event('delete_notebook', {
      context: 'list',
    })
    remove(id)
  }

  const handleClone = async () => {
    event('clone_notebook', {
      context: 'list',
    })
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
      {CLOUD && (
        <>
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
            contents={_ => (
              <List>
                <List.Item
                  onClick={handleClone}
                  size={ComponentSize.Small}
                  style={{fontWeight: 500}}
                  testID="context-clone-flow"
                >
                  Clone
                </List.Item>
              </List>
            )}
          />
        </>
      )}
    </FlexBox>
  )
}

export default FlowContextMenu
