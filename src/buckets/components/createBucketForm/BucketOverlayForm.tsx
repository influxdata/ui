// Libraries
import React, {PureComponent, ChangeEvent, FormEvent} from 'react'

// Components
import {Form, Input, Button, Grid, Accordion} from '@influxdata/clockface'
import Retention from 'src/buckets/components/Retention'
import {SchemaToggle} from 'src/buckets/components/createBucketForm/SchemaToggle'

// Constants
import {isSystemBucket} from 'src/buckets/constants'

// Types
import {
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import {RuleType} from 'src/buckets/reducers/createBucket'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'
import {SchemaType} from 'src/client/generatedRoutes'

/** for schemas, if (isEditing) is true, then
 * need the schemaType that is already set;
 * if !isEditing (it is false)
 * then need the 'onChangeSchemaType' method*/
interface Props {
  name: string
  retentionSeconds: number
  ruleType: 'expire'
  onSubmit: (e: FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onChangeRetentionRule: (seconds: number) => void
  onChangeRuleType: (t: RuleType) => void
  onChangeInput: (e: ChangeEvent<HTMLInputElement>) => void
  isEditing: boolean
  buttonText: string
  onClickRename?: () => void
  testID?: string
  onChangeSchemaType?: (schemaType: SchemaType) => void
  schemaType?: SchemaType
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
      isEditing,
      onClose,
      onChangeInput,
      onChangeRuleType,
      onChangeRetentionRule,
      onClickRename,
      testID = 'bucket-form',
    } = this.props

    const {showAdvanced} = this.state

    const nameInputStatus = isEditing && ComponentStatus.Disabled

    const makeAdvancedSection = () => {
      if (isFlagEnabled('measurementSchema') && CLOUD) {
        let contents = null
        if (isEditing) {
          contents = <SchemaToggle readOnlySchemaType={this.props.schemaType} />
        } else {
          contents = (
            <SchemaToggle
              onChangeSchemaType={this.onChangeSchemaTypeInternal}
            />
          )
        }

        return (
          <Accordion expanded={showAdvanced} testID="schemaBucketToggle">
            <Accordion.AccordionHeader>
              <span>Advanced Configuration (Optional)</span>
            </Accordion.AccordionHeader>
            <Accordion.AccordionBodyItem>
              <div>{contents}</div>
            </Accordion.AccordionBodyItem>
          </Accordion>
        )
      }
    }

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
              {makeAdvancedSection()}
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
    if (this.props.isEditing) {
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
