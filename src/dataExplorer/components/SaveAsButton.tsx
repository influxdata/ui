// Libraries
import React, {FC} from 'react'
import {useLocation, useHistory} from 'react-router-dom'

// Components
import {IconFont, Button, ComponentColor} from '@influxdata/clockface'

const SaveAsButton: FC = () => {
  const {pathname} = useLocation()
  const history = useHistory()
  const handleShowOverlay = () => {
    history.push(`${pathname}/save`)
  }
  return (
    <>
      <Button
        icon={IconFont.Export_New}
        text="Save As"
        onClick={handleShowOverlay}
        color={ComponentColor.Primary}
        titleText="Save your query as a Dashboard Cell or a Task"
        testID="save-query-as"
      />
    </>
  )
}

export default SaveAsButton
