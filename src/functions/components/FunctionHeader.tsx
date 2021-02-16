// Libraries
import React, {FC} from 'react'

// Components
import {Page, Button, ComponentColor} from '@influxdata/clockface'

interface Props {
  name: string
}

const FunctionHeader: FC<Props> = ({name}) => {
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
            onClick={() => console.log('cancel')}
            testID="task-cancel-btn"
          />
          <Button
            color={ComponentColor.Success}
            text="Save"
            onClick={() => console.log('save')}
            testID="task-save-btn"
          />
        </Page.ControlBarRight>
      </Page.ControlBar>
    </>
  )
}

export default FunctionHeader
