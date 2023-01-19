// Libraries
import React, {FC} from 'react'
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

// Components
import {CancelServiceReasonsForm} from 'src/billing/components/PayAsYouGo/CancelServiceReasonsForm'

interface Props {
  hasAgreedToTerms: boolean
  onAgreedToTerms: () => void
}

export const TermsCancellationOverlay: FC<Props> = ({
  hasAgreedToTerms,
  onAgreedToTerms,
}) => (
  <div className="cancellation-overlay--content">
    <p>
      This action serves as notice to InfluxData that you wish to cancel your
      subscription and terminate your account. Upon confirmation, the following
      actions will be performed:
    </p>
    <ul>
      <li>
        All your writes, queries and tasks will be suspended immediately. This
        action is irreversible and cannot be undone.
      </li>
      <li>
        Your final billing statement will be calculated for any usage incurred
        prior to the termination of your account and your credit card will be
        charged for the amount.
      </li>
      <li>
        You will be responsible for exporting all your content including
        dashboards, tasks, variables from the user interface.
      </li>
    </ul>
    <span onClick={onAgreedToTerms} data-testid="agree-terms--input">
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
          testID="agree-terms--checkbox"
        />
        <InputLabel active={hasAgreedToTerms} size={ComponentSize.Small}>
          I understand and agree to these conditions
        </InputLabel>
      </FlexBox>
    </span>
    <FlexBox
      alignItems={AlignItems.Center}
      direction={FlexDirection.Column}
      justifyContent={JustifyContent.Center}
      margin={ComponentSize.Large}
    >
      <CancelServiceReasonsForm />
    </FlexBox>
  </div>
)
