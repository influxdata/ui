// Libraries
import React, {PureComponent, ChangeEvent, FormEvent} from 'react'

// Components
import {Form, Input, Button, Accordion, Overlay} from '@influxdata/clockface'
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
import {CLOUD} from 'src/shared/constants'

import {
  MeasurementSchemaSection,
  SchemaUpdateInfo,
} from 'src/buckets/components/createBucketForm/MeasurementSchemaSection'

let MeasurementSchemaList = null,
  MeasurementSchemaCreateRequest = null,
  SchemaType = null

if (CLOUD) {
  SchemaType = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaCreateRequest =
    require('src/client/generatedRoutes').MeasurementSchemaCreateRequest
  MeasurementSchemaList =
    require('src/client/generatedRoutes').MeasurementSchemaList
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
  onUpdateMeasurementSchemas?: (schemaInfo: SchemaUpdateInfo[]) => void
  isEditing: boolean
  buttonText: string
  onClickRename?: () => void
  testID?: string
  onChangeSchemaType?: (schemaType: typeof SchemaType) => void
  schemaType?: typeof SchemaType
  measurementSchemaList?: typeof MeasurementSchemaList
  showSchemaValidation?: boolean
  useSimplifiedBucketForm?: boolean
}

interface State {
  showAdvanced: boolean
  schemaType: 'implicit' | 'explicit'
  newMeasurementSchemas: typeof MeasurementSchemaCreateRequest[]
  measurementSchemaUpdates: SchemaUpdateInfo[]
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
    if (this.props.onAddNewMeasurementSchemas) {
      this.props.onAddNewMeasurementSchemas(schemas, resetValidation)
    }
    this.setState({newMeasurementSchemas: schemas})
  }

  onUpdateSchemasInternal = (schemas: SchemaUpdateInfo[]) => {
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
      useSimplifiedBucketForm = false,
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
      if (CLOUD) {
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
            <Accordion.AccordionBodyItem testID="accordion--advanced-section">
              <div>{contents}</div>
            </Accordion.AccordionBodyItem>
          </Accordion>
        )
      }
    }

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
          <Form.Element
            label={
              useSimplifiedBucketForm
                ? 'Data Retention Preferences'
                : 'Delete Data'
            }
          >
            <Retention
              type={ruleType}
              retentionSeconds={retentionSeconds}
              onChangeRuleType={onChangeRuleType}
              onChangeRetentionRule={onChangeRetentionRule}
              useSimplifiedForm={useSimplifiedBucketForm}
            />
          </Form.Element>
          {useSimplifiedBucketForm ? null : makeAdvancedSection()}
        </Overlay.Body>
        <Overlay.Footer>
          <Button
            text="Cancel"
            color={ComponentColor.Tertiary}
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
