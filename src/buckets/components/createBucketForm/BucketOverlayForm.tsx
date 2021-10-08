// Libraries
import React, {PureComponent, ChangeEvent, FormEvent} from 'react'

// Components
import {Form, Input, Button, Grid, Accordion} from '@influxdata/clockface'
import Retention from 'src/buckets/components/Retention'
import {SchemaToggle} from 'src/buckets/components/createBucketForm/SchemaToggle'

// Constants
import {
  isSystemBucket,
  BUCKET_NAME_MINIMUM_CHARACTERS,
} from 'src/buckets/constants'

// Types
import {
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import {RuleType} from 'src/buckets/reducers/createBucket'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

import {MeasurementSchemaSection} from 'src/buckets/components/createBucketForm/MeasurementSchemaSection'

let MeasurementSchemaList = null,
  MeasurementSchemaCreateRequest = null,
  SchemaType = null

if (CLOUD) {
  SchemaType = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaCreateRequest = require('src/client/generatedRoutes')
    .MeasurementSchemaCreateRequest
  MeasurementSchemaList = require('src/client/generatedRoutes')
    .MeasurementSchemaList
}
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
  onAddNewMeasurementSchemas?: (
    schemas: any[],
    resetValidation?: boolean
  ) => void
  onUpdateMeasurementSchemas?: (schemaInfo: any[]) => void
  isEditing: boolean
  buttonText: string
  onClickRename?: () => void
  testID?: string
  onChangeSchemaType?: (schemaType: typeof SchemaType) => void
  schemaType?: typeof SchemaType
  measurementSchemaList?: typeof MeasurementSchemaList
  showSchemaValidation?: boolean
}
// todo: determine exact real type of updates?  or don't bother
// bc the specified return type is not exactly what we get back
// (also get back bucketID and orgID, both of which I am using)
interface State {
  showAdvanced: boolean
  schemaType: 'implicit' | 'explicit'
  newMeasurementSchemas: typeof MeasurementSchemaCreateRequest[]
  measurementSchemaUpdates: any[]
}

export default class BucketOverlayForm extends PureComponent<Props> {
  public state: State = {
    showAdvanced: false,
    schemaType: 'implicit',
    newMeasurementSchemas: [],
    measurementSchemaUpdates: [],
  }

  onChangeSchemaTypeInternal = (newSchemaType: typeof SchemaType) => {
    this.setState({schemaType: newSchemaType})
    this.props.onChangeSchemaType(newSchemaType)
  }

  onAddSchemasInternal = (schemas, resetValidation) => {
    this.props.onAddNewMeasurementSchemas(schemas, resetValidation)
    this.setState({newMeasurementSchemas: schemas})
  }

  onUpdateSchemasInternal = schemas => {
    this.props.onUpdateMeasurementSchemas(schemas)
    this.setState({measurementSchemaUpdates: schemas})
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
      schemaType: readOnlySchemaType,
      measurementSchemaList,
      showSchemaValidation,
    } = this.props

    const {showAdvanced, schemaType} = this.state

    const nameInputStatus = isEditing && ComponentStatus.Disabled

    const measurementSchemaComponent = (
      <MeasurementSchemaSection
        measurementSchemaList={measurementSchemaList}
        key="measurementSchemaSection"
        onAddSchemas={this.onAddSchemasInternal}
        showSchemaValidation={showSchemaValidation}
        onUpdateSchemas={this.onUpdateSchemasInternal}
      />
    )

    const showMeasurementSchemaSection =
      (isEditing && readOnlySchemaType === 'explicit') ||
      schemaType === 'explicit'

    const measurementSchemaSection = showMeasurementSchemaSection
      ? measurementSchemaComponent
      : null

    const makeAdvancedSection = () => {
      if (isFlagEnabled('measurementSchema') && CLOUD) {
        let schemaToggle = (
          <SchemaToggle onChangeSchemaType={this.onChangeSchemaTypeInternal} />
        )

        if (isEditing) {
          schemaToggle = (
            <SchemaToggle
              key="schemaToggleSection"
              readOnlySchemaType={readOnlySchemaType}
            />
          )
        }

        const contents = (
          <>
            {schemaToggle}
            {measurementSchemaSection}
          </>
        )

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

    if (
      name.trim().length === 0 ||
      name.length < BUCKET_NAME_MINIMUM_CHARACTERS
    ) {
      return `Please enter a name with at least ${BUCKET_NAME_MINIMUM_CHARACTERS} letters or numbers`
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
