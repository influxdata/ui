import React, {FC} from 'react'

import {
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  FlexBox,
  FlexDirection,
  IconFont,
  Panel,
} from '@influxdata/clockface'

import 'src/buckets/components/createBucketForm/MeasurementSchema.scss'
import {CLOUD} from 'src/shared/constants'

let MeasurementSchemaList = null,
  MeasurementSchema = null

if (CLOUD) {
  MeasurementSchema = require('src/client/generatedRoutes').MeasurementSchema
  MeasurementSchemaList = require('src/client/generatedRoutes')
    .MeasurementSchemaList
}

import {downloadTextFile} from 'src/shared/utils/download'

interface Props {
  measurementSchemaList?: typeof MeasurementSchemaList
  isEditing?: boolean
}
interface PanelProps {
  measurementSchema: typeof MeasurementSchema
  index?: number
}

export const EditingPanel: FC<PanelProps> = ({measurementSchema, index}) => {
  const handleDownloadSchema = () => {
    const {name} = measurementSchema
    const contents = JSON.stringify(measurementSchema.columns)
    downloadTextFile(contents, name || 'schema', '.json')
  }

  return (
    <Panel className="measurement-schema-panel-container">
      <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.Large}
        alignItems={AlignItems.FlexStart}
        testID={`measurement-schema-readOnly-panel-${index}`}
        className="measurement-schema-panel"
        key={`romsp-${index}`}
      >
        <div> name</div>
        <FlexBox direction={FlexDirection.Row} className="schema-row">
          <div className="value-text">{measurementSchema.name}</div>
          <Button
            icon={IconFont.Download}
            color={ComponentColor.Secondary}
            text="Download Schema"
            onClick={handleDownloadSchema}
          />
        </FlexBox>
      </FlexBox>
    </Panel>
  )
}

export const MeasurementSchemaSection: FC<Props> = ({
  measurementSchemaList,
}) => {
  // this is the documentation link for explicit schemas for buckets
  const link =
    'https://docs.influxdata.com/influxdb/cloud/organizations/buckets/bucket-schema/'

  const schemas = measurementSchemaList.measurementSchemas
  let contents = null
  if (schemas) {
    contents = schemas.map((oneSchema, index) => (
      <EditingPanel measurementSchema={oneSchema} index={index} />
    ))
  }

  return (
    <FlexBox
      direction={FlexDirection.Column}
      margin={ComponentSize.Large}
      alignItems={AlignItems.FlexStart}
      testID="measurement-schema-section-parent"
      className="schema-section measurement"
    >
      <div className="header">
        <div className="title-text">Measurement Schema</div>
        <div className="subtext">
          Measurement Schemas provide non-conforming validation for data in the
          bucket. once a measurement schema is saved you cannot delete or modify
          existing columns. You may only add new columns.{' '}
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
