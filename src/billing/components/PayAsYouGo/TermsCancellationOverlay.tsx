import React, {PureComponent} from 'react'

import {
  ComponentSize,
  FlexBox,
  FlexDirection,
  JustifyContent,
  Input,
  InputType,
  InputLabel,
  AlignItems,
} from '@influxdata/clockface'

interface Props {
  hasAgreedToTerms: boolean
  onAgreedToTerms: () => void
}

class CancellationOverlay extends PureComponent<Props> {
  render() {
    const {hasAgreedToTerms, onAgreedToTerms} = this.props
    return (
      <div className="cancellation-overlay--content">
        <p>
          This action serves as notice to InfluxData that you wish to cancel
          your subscription and terminate your account. Upon confirmation, the
          following actions will be performed:
        </p>
        <ul>
          <li>
            All your writes, queries and tasks will be suspended immediately.
            This action is irreversible and cannot be undone.
          </li>
          <li>
            Your final billing statement will be calculated for any usage
            incurred prior to the termination of your account and your credit
            card will be charged for the amount.
          </li>
          <li>
            You will be responsible for exporting all your content including
            dashboards, tasks, variables from the user interface.
          </li>
          <li>
            You can request support@influxdata.com for an archive of your Time
            series data.
          </li>
        </ul>
        <span onClick={onAgreedToTerms}>
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Row}
            justifyContent={JustifyContent.FlexStart}
            margin={ComponentSize.Medium}
          >
            <Input
              className="agree-terms-input"
              checked={hasAgreedToTerms}
              onChange={onAgreedToTerms}
              size={ComponentSize.Small}
              titleText="I understand and agree to these conditions"
              type={InputType.Checkbox}
            />
            <InputLabel active={hasAgreedToTerms} size={ComponentSize.Small}>
              I understand and agree to these conditions
            </InputLabel>
          </FlexBox>
        </span>
      </div>
    )
  }
}

export default CancellationOverlay
