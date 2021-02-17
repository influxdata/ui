// Libraries
import React, {FC} from 'react'

// Components
import {Page, Button, ComponentColor} from '@influxdata/clockface'

interface Props {
  name: string
  saveFunction: () => void
  cancelFunction: () => void
}

const FunctionHeader: FC<Props> = ({name, saveFunction, cancelFunction}) => {
  return (
    <>
      <Page.Header fullWidth={false} testID="functions-edit-page--header">
        <Page.Title title={name} />
      </Page.Header>
      <Page.ControlBar fullWidth={true}>
        <Page.ControlBarRight>
          <Button
            color={ComponentColor.Default}
            text="Cancel"
            onClick={cancelFunction}
            testID="task-cancel-btn"
          />
          <Button
            color={ComponentColor.Success}
            text="Save"
            onClick={saveFunction}
            testID="task-save-btn"
          />
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

export default FunctionHeader
