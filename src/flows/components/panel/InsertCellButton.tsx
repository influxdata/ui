// Libraries
import React, {FC, useRef, useContext} from 'react'

// Components
import {
  Popover,
  Appearance,
  ComponentColor,
  ComponentSize,
  SquareButton,
  IconFont,
  FlexBox,
  FlexDirection,
  AlignItems,
  PopoverPosition,
} from '@influxdata/clockface'
import AddButtons from 'src/flows/components/AddButtons'
import {FlowContext} from 'src/flows/context/flow.current'

// Styles
import 'src/flows/components/panel/InsertCellButton.scss'

interface Props {
  id: string
}

const InsertCellButton: FC<Props> = ({id}) => {
  const {flow} = useContext(FlowContext)
  const dividerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverVisible = useRef<boolean>(false)
  const index = flow.data.indexOf(id)

  const handlePopoverShow = () => {
    popoverVisible.current = true
    dividerRef.current &&
      dividerRef.current.classList.add('flow-divider__popped')
  }

  const handlePopoverHide = () => {
    popoverVisible.current = false
    dividerRef.current &&
      dividerRef.current.classList.remove('flow-divider__popped')
  }

  return (
    <div className="flow-divider" ref={dividerRef}>
      <SquareButton
        icon={IconFont.Plus}
        ref={buttonRef}
        testID={`panel-add-btn-${index}`}
        className="flow-divider--button"
        color={ComponentColor.Secondary}
        active={popoverVisible.current}
      />
      <Popover
        enableDefaultStyles={false}
        appearance={Appearance.Outline}
        color={ComponentColor.Secondary}
        triggerRef={buttonRef}
        position={PopoverPosition.ToTheRight}
        onShow={handlePopoverShow}
        onHide={handlePopoverHide}
        contents={onHide => (
          <FlexBox
            direction={FlexDirection.Column}
            alignItems={AlignItems.Stretch}
            margin={ComponentSize.Small}
            className="insert-cell-menu"
          >
            <p className="insert-cell-menu--title">Insert Cell Here</p>
            <AddButtons index={index} onInsert={onHide} />
          </FlexBox>
        )}
      />
    </div>
  )
}

export default InsertCellButton
