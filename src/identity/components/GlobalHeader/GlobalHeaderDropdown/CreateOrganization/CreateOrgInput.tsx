import React, {FC, useState} from 'react'
import {
  ComponentSize,
  ComponentStatus,
  Form,
  Input,
} from '@influxdata/clockface'

// Types
import {OrgOverlayValidationError} from 'src/identity/components/GlobalHeader/GlobalheaderDropdown/CreateOrganization/CreateOrganizationOverlay'

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
  const [userTouchedFormInput, setUserTouchedFormInput] = useState(false)

  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (!userTouchedFormInput) {
      setUserTouchedFormInput(true)
    }
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
          size={ComponentSize.Medium}
          onChange={handleInputChange}
          value={orgName}
          required={true}
          status={showError ? ComponentStatus.Error : ComponentStatus.Default}
          placeholder="Dev Team, US Eastern Region, Staging"
        />
      </Form.Element>
      {!showError && (
        <div className="create-org-overlay--validation-field-placeholder" />
      )}
    </>
  )
}
