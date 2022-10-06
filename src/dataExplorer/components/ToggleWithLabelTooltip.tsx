import React, {FC} from 'react'

// Components
import {FlexBox, InputLabel, SlideToggle} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Styles
import './Sidebar.scss'

interface ToggleWithLabelTooltipProps {
  label: string
  active: boolean
  onChange: () => void
  tooltipContents?: string | JSX.Element
}

const ToggleWithLabelTooltip: FC<ToggleWithLabelTooltipProps> = ({
  label,
  active,
  onChange,
  tooltipContents = '',
}) => {
  return (
    <FlexBox className="toggle-with-label-tooltip">
      <SlideToggle active={active} onChange={onChange} />
      <InputLabel className="toggle-with-label-tooltip--label">
        <SelectorTitle label={label} tooltipContents={tooltipContents} />
      </InputLabel>
    </FlexBox>
  )
}

export {ToggleWithLabelTooltip}
