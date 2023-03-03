// Libraries
import React, {FC} from 'react'
import {useHistory, useLocation} from 'react-router-dom'

// Components
import {IconFont, Button, ComponentColor} from '@influxdata/clockface'

export const SaveAsButton: FC = () => {
  const history = useHistory()
  const {pathname} = useLocation()

  const handleShowOverlay = () => {
    history.push(`${pathname}/save`)
  }

  return (
    <Button
      icon={IconFont.Export_New}
      text="Save As"
      onClick={handleShowOverlay}
      color={ComponentColor.Primary}
      titleText="Save your query as a Dashboard Cell or a Task"
      testID="save-query-as"
    />
  )
}
