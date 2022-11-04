import React, {FC} from 'react'

// Components
import {
  FlexBox,
  InputLabel,
  SlideToggle,
  ComponentStatus,
} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Styles
import './Sidebar.scss'

interface ToggleWithLabelTooltipProps {
  label: string
  active: boolean
  onChange: () => void
  tooltipContents?: string | JSX.Element
  status?: ComponentStatus
}

const ToggleWithLabelTooltip: FC<ToggleWithLabelTooltipProps> = ({
  label,
  active,
  onChange,
  tooltipContents = '',
  status = ComponentStatus.Default,
}) => {
  return (
    <FlexBox className="toggle-with-label-tooltip">
      <SlideToggle
        active={active}
        onChange={onChange}
        disabled={status === ComponentStatus.Disabled}
      />
      <InputLabel className="toggle-with-label-tooltip--label">
        <SelectorTitle label={label} tooltipContents={tooltipContents} />
      </InputLabel>
    </FlexBox>
  )
}

export {ToggleWithLabelTooltip}
