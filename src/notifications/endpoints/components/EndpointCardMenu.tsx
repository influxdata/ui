// Libraries
import React, {createRef, FC, RefObject} from 'react'

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

interface Props {
  onDelete: () => void
  onClone: () => void
  onView: () => void
}

const EndpointCardContext: FC<Props> = ({onDelete, onView}) => {
  const settingsRef: RefObject<HTMLButtonElement> = createRef()

  return (
    <FlexBox margin={ComponentSize.ExtraSmall}>
      <ConfirmationButton
        color={ComponentColor.Colorless}
        icon={IconFont.Trash_New}
        shape={ButtonShape.Square}
        size={ComponentSize.ExtraSmall}
        confirmationLabel="Yes, delete this endpoint"
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
          </List>
        )}
        triggerRef={settingsRef}
      />
    </FlexBox>
  )
}

export default EndpointCardContext
