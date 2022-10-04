// Libraries
import React, {ChangeEvent, FormEvent, PureComponent} from 'react'

// Components
// Types
import {
  Accordion,
  BannerPanel,
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  FlexBox,
  Form,
  Gradients,
  InfluxColors,
  Input,
  JustifyContent,
  Overlay,
} from '@influxdata/clockface'
import Retention from 'src/buckets/components/Retention'
import {SchemaToggle} from 'src/buckets/components/createBucketForm/SchemaToggle'

// Constants
import {
  BUCKET_NAME_MINIMUM_CHARACTERS,
  isSystemBucket,
} from 'src/buckets/constants'
import {RuleType} from 'src/buckets/reducers/createBucket'
import {CLOUD} from 'src/shared/constants'

import {
  MeasurementSchemaSection,
  SchemaUpdateInfo,
} from 'src/buckets/components/createBucketForm/MeasurementSchemaSection'
import {extractBucketMaxRetentionSeconds} from 'src/cloud/utils/limits'
import {AppState} from 'src/types'
import {connect} from 'react-redux'
import CloudUpgradeButton from 'src/shared/components/CloudUpgradeButton'

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
interface OwnProps {
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

interface StateProps {
  maxRetentionSeconds: number
}

type Props = OwnProps & StateProps

interface State {
  showAdvanced: boolean
  schemaType: 'implicit' | 'explicit'
  newMeasurementSchemas: typeof MeasurementSchemaCreateRequest[]
  measurementSchemaUpdates: SchemaUpdateInfo[]
  retentionPeriodMaxReached: boolean
}

class BucketOverlayForm extends PureComponent<Props> {
  public state: State = {
    showAdvanced: false,
    schemaType: 'implicit',
    newMeasurementSchemas: [],
    measurementSchemaUpdates: [],
    retentionPeriodMaxReached: false,
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
  private upgradeBannerStyle = {marginBottom: '28px'}

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
          <Form.ValidationElement
            label={
              useSimplifiedBucketForm
                ? 'Data Retention Preferences'
                : 'Delete Data'
            }
            value={retentionSeconds.toString()}
            validationFunc={this.handleRetentionSecondsValidation}
          >
            {status => (
              <Retention
                type={ruleType}
                retentionSeconds={retentionSeconds}
                onChangeRuleType={onChangeRuleType}
                onChangeRetentionRule={onChangeRetentionRule}
                useSimplifiedForm={useSimplifiedBucketForm}
                status={status}
              />
            )}
          </Form.ValidationElement>
          {this.state.retentionPeriodMaxReached && (
            <BannerPanel
              size={ComponentSize.ExtraSmall}
              gradient={Gradients.PolarExpress}
              hideMobileIcon={true}
              textColor={InfluxColors.Yeti}
              style={this.upgradeBannerStyle}
            >
              <FlexBox
                justifyContent={JustifyContent.SpaceBetween}
                stretchToFitWidth={true}
              >
                <h6>Need retention period more than 30 days?</h6>
                <CloudUpgradeButton size={ComponentSize.ExtraSmall} />
              </FlexBox>
            </BannerPanel>
          )}
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

  private handleRetentionSecondsValidation = (value: string): string | null => {
    const {maxRetentionSeconds} = this.props
    if (Number(value) <= 0) {
      return ` `
    }

    if (maxRetentionSeconds && Number(value) > maxRetentionSeconds) {
      this.setState({retentionPeriodMaxReached: true})
      return ' '
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
    const {name, retentionSeconds} = this.props
    const nameHasErrors = this.handleNameValidation(name)
    const durationHasErrors = this.handleRetentionSecondsValidation(
      retentionSeconds.toString()
    )

    if (nameHasErrors || durationHasErrors) {
      return ComponentStatus.Disabled
    }

    return ComponentStatus.Default
  }
}
const mstp = (state: AppState) => ({
  maxRetentionSeconds: extractBucketMaxRetentionSeconds(state),
})

export default connect<StateProps, {}, OwnProps>(mstp)(BucketOverlayForm)
