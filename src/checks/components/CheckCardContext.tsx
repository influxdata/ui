// Libraries
import React, {FunctionComponent, useRef} from 'react'

// Components
import {
  Popover,
  List,
  ConfirmationButton,
  ButtonShape,
  ComponentColor,
  FlexBox,
  ComponentSize,
  IconFont,
  SquareButton,
  SquareButtonRef,
  Appearance,
} from '@influxdata/clockface'

interface Props {
  onView: () => void
  onDelete: () => void
  onClone: () => void
}

const CheckCardContext: FunctionComponent<Props> = ({
  onDelete,
  onClone,
  onView,
}) => {
  const triggerRef = useRef<SquareButtonRef>(null)

  const handleCloneAndHide = (onHide: () => void) => (): void => {
    onHide()
    onClone()
  }

  const handleViewAndHide = (onHide: () => void) => (): void => {
    onHide()
    onView()
  }

  return (
    <FlexBox margin={ComponentSize.Small}>
      <SquareButton
        icon={IconFont.CogThick}
        size={ComponentSize.ExtraSmall}
        ref={triggerRef}
        testID="context-check-options"
      />
      <Popover
        triggerRef={triggerRef}
        appearance={Appearance.Outline}
        enableDefaultStyles={false}
        contents={onHide => (
          <List style={{width: '122px'}}>
            <List.Item
              size={ComponentSize.ExtraSmall}
              testID="context-check-history"
              onClick={handleViewAndHide(onHide)}
            >
              <List.Icon glyph={IconFont.EyeOpen} />
              View History
            </List.Item>
            <List.Item
              size={ComponentSize.ExtraSmall}
              testID="context-clone-check"
              onClick={handleCloneAndHide(onHide)}
            >
              <List.Icon glyph={IconFont.Duplicate} />
              Clone
            </List.Item>
          </List>
        )}
      />
      <ConfirmationButton
        onConfirm={onDelete}
        shape={ButtonShape.Square}
        icon={IconFont.Trash}
        color={ComponentColor.Danger}
        size={ComponentSize.ExtraSmall}
        confirmationLabel="Really delete Check?"
        confirmationButtonText="Confirm Delete"
        testID="context-delete-check"
      />
    </FlexBox>
  )
}

export default CheckCardContext
