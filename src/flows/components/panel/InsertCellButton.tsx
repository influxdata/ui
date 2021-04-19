// Libraries
import React, {FC, useRef, useContext, useState} from 'react'
import classnames from 'classnames'

// Components
import {
  Popover,
  Appearance,
  ComponentColor,
  ComponentSize,
  SquareButton,
  Icon,
  IconFont,
  FlexBox,
  FlexDirection,
  AlignItems,
  PopoverPosition,
  ClickOutside,
} from '@influxdata/clockface'
import AddButtons from 'src/flows/components/AddButtons'
import {FeatureFlag} from 'src/shared/utils/featureFlag'
import {PIPE_DEFINITIONS} from 'src/flows'
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowQueryContext} from 'src/flows/context/flow.query'

// Styles
import 'src/flows/components/panel/InsertCellButton.scss'

interface Props {
  id: string
}

const InsertCellButton: FC<Props> = ({id}) => {
  const {flow, add} = useContext(FlowContext)
  const {generateMap} = useContext(FlowQueryContext)
  const [confirming, setConfirming] = useState(false)
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

  const clickOutside = () => {
    if (!confirming) {
      return
    }

    setConfirming(false)
  }

  const collapse = () => {
    if (!confirming) {
      setConfirming(true)
      return
    }

    const stages = generateMap(true)
    const query =
      stages.filter(stage => stage.instances.map(i => i.id).includes(id))[0]
        ?.text || ''

    flow.data.allIDs.slice(0, index + 1).forEach(_id => {
      flow.meta.remove(_id)
      flow.data.remove(_id)
    })

    const data = {
      ...JSON.parse(JSON.stringify(PIPE_DEFINITIONS['rawFluxEditor'].initial)),
      type: 'rawFluxEditor',
    }
    data.queries[0].text = query

    add(data, -1)
  }

  const collapseClassnames = classnames({
    [`flow-divider--collapse`]: true,
    [`flow-divider--collapse-caution`]: confirming,
  })

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
      <FeatureFlag name="collapseotron">
        <ClickOutside onClickOutside={clickOutside}>
          <div className={collapseClassnames}>
            {confirming && (
              <div className="flow-divider--collapse-notice">
                this will merge all previous notebook panels into a single flux
                panel.
                <span>there is no undo button.</span>
                <br />
                click again to confirm
              </div>
            )}
            <div className="flow-divider--collapse-button">
              <div onClick={collapse}>
                <Icon
                  glyph={IconFont.Wood}
                  testID={`panel-collapse-btn-${index}`}
                />
              </div>
            </div>
          </div>
        </ClickOutside>
      </FeatureFlag>
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
