// Libraries
import React, {PureComponent} from 'react'

// Components
import {
  ComponentColor,
  Button,
  ComponentStatus,
  Page,
} from '@influxdata/clockface'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import {isFlagEnabled} from '../../shared/utils/featureFlag'

interface Props {
  title: string
  canSubmit: boolean
  onCancel: () => void
  onSave: () => void
}

export default class TaskHeader extends PureComponent<Props> {
  public render() {
    const {onCancel, onSave, title} = this.props
    return (
      <>
        <Page.Header fullWidth={true}>
          <Page.Title title={title} />
          {!isFlagEnabled('multiOrg') && <RateLimitAlert location="tasks" />}
        </Page.Header>
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
      </>
    )
  }

  private get status() {
    return this.props.canSubmit
      ? ComponentStatus.Default
      : ComponentStatus.Disabled
  }
}
