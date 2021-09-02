import React, {useState, FC} from 'react'

import {
  AlignItems,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  InputLabel,
  InputToggleType,
  Toggle,
} from '@influxdata/clockface'
import {capitalize} from 'lodash'

import 'src/buckets/components/createBucketForm/MeasurementSchema.scss'
import {SchemaType} from 'src/client/generatedRoutes'

interface SchemaToggleProps {
  onChangeSchemaType?: (selectedSchemaType: 'explicit' | 'implicit') => void
  readOnlySchemaType?: SchemaType
}

export const SchemaToggle: FC<SchemaToggleProps> = ({
  onChangeSchemaType,
  readOnlySchemaType,
}) => {
  const [schemaType, setSchemaType] = useState('implicit')

  const handleSchemaChange = newValue => {
    onChangeSchemaType(newValue)
    setSchemaType(newValue)
  }

  // this is the documentation link for explicit schemas for buckets
  const link =
    'https://docs.influxdata.com/influxdb/cloud/organizations/buckets/bucket-schema/'

  // show the toggles if we are creating a new bucket, else we are editing
  // so show the read-only label instead.
  // either way, the explanatory text is needed.
  const toggles = (
    <React.Fragment>
      <Toggle
        tabIndex={1}
        value="implicit"
        id="implicit-bucket-schema-choice"
        name="implicit-bucket-schema-choice"
        className="option"
        checked={schemaType === 'implicit'}
        onChange={handleSchemaChange}
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
        onChange={handleSchemaChange}
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
    </React.Fragment>
  )

  const readOnly = (
    <span className="value-text" data-testID="bucket-readonly-schema-label">
      : {capitalize(readOnlySchemaType)}
    </span>
  )
  const contents = readOnlySchemaType ? null : toggles
  const readOnlyText = readOnlySchemaType ? readOnly : null

  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      testID="create-bucket-schema-type-toggle-box"
      className="schema-section"
    >
      <div className="header">
        <div className="title-text">Bucket Schema Type {readOnlyText}</div>
        <div className="subtext">
          By default, buckets have an implicit schema that conforms to your
          data. Use explicit schemas to enforce specific data types and columns.
          Bucket Schema type cannot be changed after creation.{' '}
          <a href={link} target="_blank" rel="noopener noreferrer">
            {' '}
            Learn more
          </a>
        </div>
      </div>
      {contents}
    </FlexBox>
  )
}
