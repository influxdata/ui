import React, {FC, useState, ChangeEvent} from 'react'
import {
  SelectGroup,
  ButtonShape,
  Form,
  FlexBox,
  FlexDirection,
  Input,
  InputToggleType,
  InputLabel,
  Toggle,
  Button,
  Accordion,
  Overlay,
  ComponentColor,
  ComponentStatus,
  ComponentSize,
  AlignItems,
  ButtonType,
} from '@influxdata/clockface'
import {ExtendedBucket} from 'src/shared/contexts/buckets'
import {CLOUD} from 'src/shared/constants'
import DurationSelector, {
  DurationOption,
} from 'src/shared/components/DurationSelector'

import {parseDuration, durationToMilliseconds} from 'src/shared/utils/duration'
import ExplicitPanel from 'src/flows/pipes/QueryBuilder/ExplicitPanel'

interface Props {
  onCreate: (bucket: ExtendedBucket) => void
  onCancel: () => void
}

export const DURATION_OPTIONS: DurationOption[] = [
  {duration: '1h', displayText: '1 hour'},
  {duration: '6h', displayText: '6 hours'},
  {duration: '12h', displayText: '12 hours'},
  {duration: '24h', displayText: '24 hours'},
  {duration: '48h', displayText: '48 hours'},
  {duration: '72h', displayText: '72 hours'},
  {duration: '7d', displayText: '7 days'},
  {duration: '14d', displayText: '14 days'},
  {duration: '30d', displayText: '30 days'},
  {duration: '90d', displayText: '90 days'},
  {duration: '1y', displayText: '1 year'},
]

const validateName = (input: string): string => {
  const _input = input.trim()

  if (!_input) {
    return 'This bucket needs a name'
  }
  if (_input[0] === '_') {
    return 'Only system bucket names can begin with _'
  }
  if (_input.length < 1) {
    return `Please enter a name with at least 1 letters or numbers`
  }

  return null
}

const DEFAULT_RETENTION_RULE = {
  type: 'expire' as 'expire',
  everySeconds: 30 * 24 * 60 * 60,
}

const CreateBucketOverlay: FC<Props> = ({onCreate, onCancel}) => {
  const [name, setName] = useState('')
  const [retention, setRetention] = useState([])
  const [newSchemas, setNewSchemas] = useState([])

  const [schemaType, setSchemaType] = useState('implicit')

  const validForm = !validateName(name)
  const retentionType = retention[0]?.type ?? null
  const setRetentionType = (ret: string) => {
    if (ret === 'never') {
      setRetention([])
    } else if (ret === 'expire') {
      setRetention([{...DEFAULT_RETENTION_RULE}])
    }
  }
  const setRetentionDuration = (duration: string) => {
    const durationSeconds =
      durationToMilliseconds(parseDuration(duration)) / 1000
    setRetention([{...DEFAULT_RETENTION_RULE, everySeconds: durationSeconds}])
  }

  const onSubmit = () => {
    const out: ExtendedBucket = {
      name: name,
      readableRetention: 'forever',
      retentionRules: retention,
      schemas: newSchemas,
    }

    if (onCreate) {
      onCreate(out)
    }
  }

  const addSchemaLine = () => {
    setNewSchemas([...newSchemas, {valid: false}])
  }

  const schemaPanels = newSchemas.map((schema, index) => (
    <ExplicitPanel
      key={`panel-${index}`}
      schema={schema}
      onUpdate={update => {
        newSchemas[index] = update
        setNewSchemas([...newSchemas])
      }}
      onDelete={() => {
        newSchemas.splice(index, 1)
        setNewSchemas([...newSchemas])
      }}
    />
  ))

  return (
    <Form onSubmit={onSubmit} testID="bucket-form">
      <Overlay.Body>
        <Form.ValidationElement
          value={name}
          label="Name"
          validationFunc={validateName}
          required={true}
        >
          {status => (
            <Input
              status={status}
              placeholder="Give your bucket a name"
              name="name"
              autoFocus={true}
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value)
              }}
              testID="bucket-form-name"
            />
          )}
        </Form.ValidationElement>
        <Form.Element label="Delete Data">
          <SelectGroup
            shape={ButtonShape.StretchToFit}
            className="retention--radio"
          >
            <SelectGroup.Option
              name="bucket-retention"
              id="never"
              testID="retention-never--button"
              active={retentionType === null}
              onClick={setRetentionType}
              value="never"
              titleText="Never delete data"
            >
              Never
            </SelectGroup.Option>
            <SelectGroup.Option
              name="bucket-retention"
              id="intervals"
              active={retentionType === 'expire'}
              onClick={setRetentionType}
              value="expire"
              testID="retention-intervals--button"
              titleText="Delete data older than a duration"
            >
              Older Than
            </SelectGroup.Option>
          </SelectGroup>
          {retentionType === 'expire' && (
            <DurationSelector
              selectedDurationInSeconds={`${retention[0].everySeconds}s`}
              onSelectDuration={setRetentionDuration}
              durations={DURATION_OPTIONS}
            />
          )}
        </Form.Element>
        {CLOUD && (
          <Accordion testID="schemaBucketToggle">
            <Accordion.AccordionHeader>
              <span>Advanced Configuration (Optional)</span>
            </Accordion.AccordionHeader>
            <Accordion.AccordionBodyItem testID="accordion--advanced-section">
              <div>
                <FlexBox
                  direction={FlexDirection.Column}
                  margin={ComponentSize.Large}
                  alignItems={AlignItems.FlexStart}
                  testID="create-bucket-schema-type-toggle-box"
                  className="schema-section"
                >
                  <div className="header">
                    <div className="title-text">Bucket Schema Type</div>
                    <div className="subtext">
                      By default, buckets have an implicit schema that conforms
                      to your data. Use explicit schemas to enforce specific
                      data types and columns. Bucket Schema type cannot be
                      changed after creation.{' '}
                      <a
                        href="https://docs.influxdata.com/influxdb/cloud/organizations/buckets/bucket-schema/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {' '}
                        Learn more
                      </a>
                    </div>
                  </div>
                  <Toggle
                    tabIndex={1}
                    value="implicit"
                    id="implicit-bucket-schema-choice"
                    name="implicit-bucket-schema-choice"
                    className="option"
                    checked={schemaType === 'implicit'}
                    onChange={setSchemaType}
                    type={InputToggleType.Radio}
                    size={ComponentSize.ExtraSmall}
                    color={ComponentColor.Primary}
                    testID="implicit-bucket-schema-choice-ID"
                  >
                    <InputLabel
                      htmlFor="implicit-bucket-schema-choice"
                      active={schemaType === 'implicit'}
                    >
                      Implicit
                    </InputLabel>
                  </Toggle>
                  <Toggle
                    tabIndex={2}
                    value="explicit"
                    id="explicit-bucket-schema-choice"
                    name="explicit-bucket-schema-choice"
                    testID="explicit-bucket-schema-choice-ID"
                    checked={schemaType === 'explicit'}
                    className="option"
                    onChange={setSchemaType}
                    type={InputToggleType.Radio}
                    size={ComponentSize.ExtraSmall}
                    color={ComponentColor.Primary}
                  >
                    <InputLabel
                      htmlFor="explicit-bucket-schema-choice"
                      active={schemaType === 'explicit'}
                    >
                      Explicit
                    </InputLabel>
                  </Toggle>
                </FlexBox>
                {schemaType === 'explicit' && (
                  <FlexBox
                    direction={FlexDirection.Column}
                    margin={ComponentSize.Large}
                    alignItems={AlignItems.FlexStart}
                    testID="measurement-schema-section-parent"
                    className="measurement-section measurement"
                  >
                    <div className="header">
                      <div className="title-text">Measurement Schema</div>
                      <div className="subtext">
                        Measurement Schemas provide non-conforming validation
                        for data in the bucket. once a measurement schema is
                        saved you cannot delete or modify existing columns. You
                        may only add new columns.{' '}
                        <a
                          href="https://docs.influxdata.com/influxdb/cloud/organizations/buckets/bucket-schema/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {' '}
                          Learn more
                        </a>
                      </div>
                    </div>
                    <Button
                      onClick={addSchemaLine}
                      testID="measurement-schema-add-file-button"
                      text="Add New Measurement Schema"
                    />
                    {schemaPanels}
                  </FlexBox>
                )}
              </div>
            </Accordion.AccordionBodyItem>
          </Accordion>
        )}
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Cancel"
          color={ComponentColor.Tertiary}
          onClick={onCancel}
          type={ButtonType.Button}
        />
        <Button
          text="Create"
          testID="bucket-form-submit"
          color={ComponentColor.Primary}
          status={
            validForm ? ComponentStatus.Default : ComponentStatus.Disabled
          }
          type={ButtonType.Submit}
        />
      </Overlay.Footer>
    </Form>
  )
}

export default CreateBucketOverlay
