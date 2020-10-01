// Libraries
import React, {FC, useContext} from 'react'

// Components
import {SquareButton, IconFont} from '@influxdata/clockface'
import {FlowContext} from 'src/flows/context/flow.current'

// Utils
import {event} from 'src/cloud/utils/reporting'

export interface Props {
  id: string
}

const PanelVisibilityToggle: FC<Props> = ({id}) => {
  const {flow} = useContext(FlowContext)
  const meta = flow.meta.get(id)

  const icon = meta.visible ? IconFont.EyeOpen : IconFont.EyeClosed
  const title = meta.visible ? 'Collapse cell' : 'Expand cell'

  const handleClick = (): void => {
    event('Panel Visibility Toggled', {
      state: !meta.visible ? 'true' : 'false',
    })

    flow.meta.update(id, {
      visible: !meta.visible,
    })
  }

  return <SquareButton icon={icon} onClick={handleClick} titleText={title} />
}

export default PanelVisibilityToggle
