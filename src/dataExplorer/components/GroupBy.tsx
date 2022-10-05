import React, {FC, useState} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'

// Styles
import './Sidebar.scss'

const GROUP_TOOLTIP = `test`

const GroupBy: FC = () => {
  const [group, setGroup] = useState(false)

  return (
    <ToggleWithLabelTooltip
      label="Group"
      active={group}
      onChange={() => setGroup(current => !current)}
      tooltipContents={GROUP_TOOLTIP}
    />
  )
}

export {GroupBy}
