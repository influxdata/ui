// Libraries
import React, {PureComponent, ChangeEvent, FormEvent} from 'react'

// Components
import {Form, Input, Button, Overlay} from '@influxdata/clockface'
import Retention from 'src/buckets/components/Retention'

// Constants
import {isSystemBucket} from 'src/buckets/constants/index'

// Types
import {
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import {RuleType} from 'src/buckets/reducers/createBucket'

interface Props {
  name: string
  retentionSeconds: number
  ruleType: 'expire'
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onChangeRetentionRule: (seconds: number) => void
  onChangeRuleType: (t: RuleType) => void
  onChangeInput: (e: ChangeEvent<HTMLInputElement>) => void
  disableRenaming: boolean
  buttonText: string
  onClickRename?: () => void
  testID?: string
}

export default class BucketOverlayForm extends PureComponent<Props> {
  public render() {
    const {
      name,
      onSubmit,
      ruleType,
      buttonText,
      retentionSeconds,
      disableRenaming,
      onClose,
      onChangeInput,
      onChangeRuleType,
      onChangeRetentionRule,
      onClickRename,
      testID = 'bucket-form',
    } = this.props

    const nameInputStatus = disableRenaming && ComponentStatus.Disabled

    return (
      <Form onSubmit={onSubmit} testID={testID}>
        <Overlay.Body>
          <Form.ValidationElement
            value={name}
            label="Name"
            helpText={this.nameHelpText}
            validationFunc={this.handleNameValidation}
            required={true}
          >
            {status => (
              <Input
                status={nameInputStatus || status}
                placeholder="Give your bucket a name"
                name="name"
                autoFocus={true}
                value={name}
                onChange={onChangeInput}
                testID="bucket-form-name"
              />
            )}
          </Form.ValidationElement>
          <Form.Element label="Delete Data">
            <Retention
              type={ruleType}
              retentionSeconds={retentionSeconds}
              onChangeRuleType={onChangeRuleType}
              onChangeRetentionRule={onChangeRetentionRule}
            />
          </Form.Element>
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            text="Cancel"
            onClick={onClose}
            type={ButtonType.Button}
            color={ComponentColor.Tertiary}
          />
          {buttonText === 'Save Changes' && (
            <Button
              text="Rename"
              color={ComponentColor.Secondary}
              onClick={onClickRename}
            />
          )}
          <Button
            text={buttonText}
            testID="bucket-form-submit"
            color={this.submitButtonColor}
            status={this.submitButtonStatus}
            type={ButtonType.Submit}
          />
        </Overlay.Footer>
      </Form>
    )
  }

  private handleNameValidation = (name: string): string | null => {
    if (isSystemBucket(name)) {
      return 'Only system bucket names can begin with _'
    }

    if (!name) {
      return 'This bucket needs a name'
    }

    return null
  }

  private get nameHelpText(): string {
    if (this.props.disableRenaming) {
      return 'To rename bucket use the RENAME button below'
    }

    return ''
  }

  private get submitButtonColor(): ComponentColor {
    const {buttonText} = this.props

    if (buttonText === 'Save Changes') {
      return ComponentColor.Success
    }

    return ComponentColor.Primary
  }

  private get submitButtonStatus(): ComponentStatus {
    const {name} = this.props
    const nameHasErrors = this.handleNameValidation(name)

    if (nameHasErrors) {
      return ComponentStatus.Disabled
    }

    return ComponentStatus.Default
  }
}
