import React, {FC} from 'react'
import {
  ComponentSize,
  ComponentStatus,
  Form,
  Input,
} from '@influxdata/clockface'

// Types
import {OrgOverlayValidationError} from 'src/identity/components/GlobalHeader/GlobalHeaderDropdown/CreateOrganization/CreateOrganizationOverlay'

// Style
import './CreateOrgInput.scss'

const formLabel = 'Organization Name'

interface Props {
  handleValidateOrgName: (orgName: string) => void
  orgName: string
  validationMsg: OrgOverlayValidationError
}

export const CreateOrgInput: FC<Props> = ({
  handleValidateOrgName,
  orgName,
  validationMsg,
}) => {
  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    handleValidateOrgName(evt.target.value)
  }

  const showError = validationMsg !== OrgOverlayValidationError.None

  return (
    <>
      <Form.Element
        htmlFor={formLabel}
        label={formLabel}
        required={true}
        errorMessage={validationMsg}
        className="create-org-overlay--createorg-input-element"
      >
        <Form.HelpText text="You may want to create separate organizations for each team, server region, or dev environment." />
        <Input
          onChange={handleInputChange}
          placeholder="Dev Team, US Eastern Region, Staging"
          required={true}
          status={showError ? ComponentStatus.Error : ComponentStatus.Default}
          size={ComponentSize.Medium}
          testID="create-org-overlay--createorg-input"
          value={orgName}
        />
      </Form.Element>
      {!showError && (
        <div className="create-org-overlay--validation-field-placeholder" />
      )}
    </>
  )
}
