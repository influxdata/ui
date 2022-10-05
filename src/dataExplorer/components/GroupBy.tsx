import React, {FC, useState} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'

// Styles
import './Sidebar.scss'

const GROUP_TOOLTIP = `test`

const GroupBy: FC = () => {
  const [groupActive, setGroupActive] = useState(false)

  return (
    <ToggleWithLabelTooltip
      label="Group"
      active={groupActive}
      onChange={() => setGroupActive(current => !current)}
      tooltipContents={GROUP_TOOLTIP}
    />
  )
}

export {GroupBy}
