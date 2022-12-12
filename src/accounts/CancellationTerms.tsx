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
import CancelServiceReasonsForm from 'src/billing/components/PayAsYouGo/CancelServiceReasonsForm'

interface Props {
  hasAgreedToTerms: boolean
  onAgreedToTerms: () => void
}

const cancellationReasonsStyles = {marginTop: '20px'}

const CancellationTerms: FC<Props> = ({hasAgreedToTerms, onAgreedToTerms}) => (
  <div className="cancellation-overlay--content">
    <ul>
      <li>
        The account and associated organizations will be deleted. This is
        irreversible and immediate action that cannot be undone.
      </li>
      <li>
        Before continuing, you are responsible for exporting any data or content
        (including dashboards, tasks, and variables) you wish to keep. (edited)
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
          titleText="I have read the warnings above and would like to deactivate this account."
          type={InputType.Checkbox}
          testID="agree-terms--checkbox"
        />
        <InputLabel active={hasAgreedToTerms} size={ComponentSize.Small}>
          I have read the warnings above and would like to deactivate this
          account.
        </InputLabel>
      </FlexBox>
    </span>
    <FlexBox
      alignItems={AlignItems.Center}
      direction={FlexDirection.Column}
      justifyContent={JustifyContent.Center}
      margin={ComponentSize.Large}
      style={cancellationReasonsStyles}
    >
      <CancelServiceReasonsForm />
    </FlexBox>
  </div>
)

export default CancellationTerms
