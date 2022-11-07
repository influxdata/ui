// Libraries
import React, {PureComponent} from 'react'

// Components
import {
  ComponentColor,
  Button,
  ComponentStatus,
  Page,
} from '@influxdata/clockface'

interface Props {
  canSubmit: boolean
  onCancel: () => void
  onSave: () => void
  showControlBar?: boolean
  title: string
}

export default class TaskHeader extends PureComponent<Props> {
  public render() {
    const {onCancel, onSave, showControlBar = true, title} = this.props
    return (
      <>
        <Page.Header fullWidth={true}>
          <Page.Title title={title} />
        </Page.Header>
        {showControlBar && (
          <Page.ControlBar fullWidth={true}>
            <Page.ControlBarRight>
              <Button
                color={ComponentColor.Tertiary}
                text="Cancel"
                onClick={onCancel}
                testID="task-cancel-btn"
              />
              <Button
                color={ComponentColor.Success}
                text="Save"
                status={this.status}
                onClick={onSave}
                testID="task-save-btn"
              />
            </Page.ControlBarRight>
          </Page.ControlBar>
        )}
      </>
    )
  }

  private get status() {
    return this.props.canSubmit
      ? ComponentStatus.Default
      : ComponentStatus.Disabled
  }
}
