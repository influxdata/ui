// Libraries
import React, {PureComponent} from 'react'
import {Link} from 'react-router-dom'

// Components
import {
  ComponentColor,
  Button,
  ComponentStatus,
  Page,
} from '@influxdata/clockface'
import RateLimitAlert from 'src/cloud/components/RateLimitAlert'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

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
          <RateLimitAlert />
        </Page.Header>
        <Page.ControlBar fullWidth={true}>
          <FeatureFlag name="flowsCTA">
            <Page.ControlBarLeft className="task-header--cta">
              <span>Need something more?</span>
              <Link to="/notebook/from/task">Create a Notebook</Link>
            </Page.ControlBarLeft>
          </FeatureFlag>
          <Page.ControlBarRight>
            <Button
              color={ComponentColor.Default}
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
