// Libraries
import React, {PureComponent, ChangeEvent, FormEvent} from 'react'

// Components
import {Form, Input, Button, Grid, Accordion} from '@influxdata/clockface'
import Retention from 'src/buckets/components/Retention'

// Constants
import {isSystemBucket} from 'src/buckets/constants'

// Types
import {
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import {RuleType} from 'src/buckets/reducers/createBucket'
import {SchemaToggle} from './SchemaToggle'

interface Props {
  name: string
  retentionSeconds: number
  ruleType: 'expire'
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onChangeRetentionRule: (seconds: number) => void
  onChangeRuleType: (t: RuleType) => void
  onChangeInput: (e: ChangeEvent<HTMLInputElement>) => void
  onChangeSchemaType: (schemaType: 'implicit' | 'explicit') => void
  disableRenaming: boolean
  buttonText: string
  onClickRename?: () => void
  testID?: string
}

interface State {
  showAdvanced: boolean
  schemaType: 'implicit' | 'explicit'
}

export default class BucketOverlayForm extends PureComponent<Props> {
  constructor(props) {
    super(props)

    this.onChangeSchemaTypeInternal = this.onChangeSchemaTypeInternal.bind(this)
  }

  public state: State = {showAdvanced: false, schemaType: 'implicit'}

  public onChangeSchemaTypeInternal = function(newSchemaType) {
    console.log('in on change schema type', newSchemaType)
    this.setState({schemaType: newSchemaType})
    this.props.onChangeSchemaType(newSchemaType)
  }

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

    const {showAdvanced, schemaType} = this.state

    const nameInputStatus = disableRenaming && ComponentStatus.Disabled

    return (
      <Form onSubmit={onSubmit} testID={testID}>
        <Grid>
          <Grid.Row>
            <Grid.Column>
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
              <Accordion expanded={showAdvanced}>
                <Accordion.AccordionHeader>
                  <span>Advanced Configuration (Optional)</span>
                </Accordion.AccordionHeader>
                <Accordion.AccordionBodyItem>
                  <div>
                    <SchemaToggle
                      onChangeSchemaType={this.onChangeSchemaTypeInternal}
                    />
                  </div>
                </Accordion.AccordionBodyItem>
              </Accordion>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Form.Footer>
                <Button
                  text="Cancel"
                  onClick={onClose}
                  type={ButtonType.Button}
                />
                {buttonText === 'Save Changes' && (
                  <Button
                    text="Rename"
                    color={ComponentColor.Danger}
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
              </Form.Footer>
            </Grid.Column>
          </Grid.Row>
        </Grid>
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
