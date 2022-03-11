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

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Styles
import 'src/flows/components/panel/InsertCellButton.scss'

interface Props {
  id?: string
}

const InsertCellButton: FC<Props> = ({id}) => {
  const {flow} = useContext(FlowContext)
  const dividerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const popoverVisible = useRef<boolean>(false)
  const index = flow.data.allIDs.indexOf(id)

  const handlePopoverShow = () => {
    event('Insert Cell Clicked')
    popoverVisible.current = true
    dividerRef.current &&
      dividerRef.current.classList.add('flow-divider__popped')
  }

  const handlePopoverHide = () => {
    if (popoverVisible.current === false) {
      return
    }
    event('Insert Cell Dismissed')
    popoverVisible.current = false
    dividerRef.current &&
      dividerRef.current.classList.remove('flow-divider__popped')
  }

  if (index === flow.data.allIDs.length - 1) {
    return (
      <FlexBox
        direction={FlexDirection.Column}
        alignItems={AlignItems.Stretch}
        margin={ComponentSize.Small}
        className="insert-cell-menu always-on"
      >
        <p className="insert-cell-menu--title">Add Another Panel</p>
        <AddButtons index={index} />
      </FlexBox>
    )
  }

  if (isFlagEnabled('smallInsert')) {
    let button
    if (index === -1) {
      button = (
        <div className="insert-wrap">
          <span>Insert Panel Here</span>
          <SquareButton
            icon={IconFont.Plus_New}
            size={ComponentSize.ExtraSmall}
            ref={buttonRef}
            color={ComponentColor.Secondary}
            testID={`panel-add-btn-${index}`}
            className="flow-divider--button"
            active={popoverVisible.current}
          />
        </div>
      )
    } else {
      button = (
        <div className="insert-wrap">
          <span>Insert Panel Below</span>
          <SquareButton
            icon={IconFont.ArrowDown_New}
            size={ComponentSize.ExtraSmall}
            ref={buttonRef}
            color={ComponentColor.Secondary}
            testID={`panel-add-btn-${index}`}
            className="flow-divider--button"
            active={popoverVisible.current}
          />
        </div>
      )
    }
    return (
      <div className="small-flow-divider" ref={dividerRef}>
        {button}

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
              <p className="insert-cell-menu--title">Insert Panel Here</p>
              <AddButtons index={index} onInsert={onHide} />
            </FlexBox>
          )}
        />
      </div>
    )
  }

  return (
    <div className="flow-divider" ref={dividerRef}>
      <SquareButton
        icon={IconFont.Plus_New}
        size={ComponentSize.ExtraSmall}
        ref={buttonRef}
        testID={`panel-add-btn-${index}`}
        className="flow-divider--button"
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
            <p className="insert-cell-menu--title">Insert Panel Here</p>
            <AddButtons index={index} onInsert={onHide} />
          </FlexBox>
        )}
      />
    </div>
  )
}

export default InsertCellButton
