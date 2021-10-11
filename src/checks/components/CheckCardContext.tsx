// Libraries
import React, {createRef, FunctionComponent, RefObject} from 'react'

// Components
import {Appearance, ButtonShape, ComponentColor, ComponentSize, ConfirmationButton, FlexBox, IconFont, List, Popover, SquareButton} from '@influxdata/clockface'

interface Props {
  onView: () => void
  onDelete: () => void
  onClone: () => void
  onEditTask: () => void
}

const CheckCardContext: FunctionComponent<Props> = ({
  onDelete,
  onClone,
  onView,
  onEditTask,
}) => {

  const settingsRef: RefObject<HTMLButtonElement> = createRef(null);
  return (
/*     <Context>
      <Context.Menu icon={IconFont.CogSolid_New} testID="context-history-menu">
        <Context.Item
          label="View History"
          action={onView}
          testID="context-history-task"
        />
        <Context.Item
          label="Edit Task"
          action={onEditTask}
          testID="context-edit-task"
        />
      </Context.Menu>
      <Context.Menu icon={IconFont.Duplicate} color={ComponentColor.Secondary}>
        <Context.Item label="Clone" action={onClone} />
      </Context.Menu>
      <Context.Menu
        icon={IconFont.Trash_New}
        color={ComponentColor.Danger}
        testID="context-delete-menu"
      >
        <Context.Item
          label="Delete"
          action={onDelete}
          testID="context-delete-task"
        />
      </Context.Menu>
    </Context> */
    <FlexBox margin={ComponentSize.ExtraSmall}>
        <ConfirmationButton
          color={ComponentColor.Colorless}
          icon={IconFont.Trash_New}
          shape={ButtonShape.Square}
          size={ComponentSize.ExtraSmall}
          confirmationLabel="Yes, Delete this check"
          onConfirm={onDelete}
          confirmationButtonText="Confirm"
          testID="context-delete-task"
        />
        <SquareButton
          ref={settingsRef}
          size={ComponentSize.ExtraSmall}
          icon={IconFont.CogSolid_New}
          color={ComponentColor.Colorless}
          testID="context-menu-task"
        />
        <Popover
          appearance={Appearance.Outline}
          enableDefaultStyles={false}
          style={{minWidth: '160px'}}
          contents={() => (
            <List>
              <List.Item
                onClick={onView}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-history-task"
              >
                View History
              </List.Item>
              <List.Item
                onClick={onEditTask}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-edit-task"
              >
                Edit
              </List.Item>
              <List.Item
                onClick={onClone}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-clone-task"
              >
                Clone
              </List.Item>
            </List>
          )}
          triggerRef={settingsRef}
        />
      </FlexBox>
  )
}

export default CheckCardContext
