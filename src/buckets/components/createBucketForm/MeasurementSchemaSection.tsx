import React, {useState, FC} from 'react'

import {
    AlignItems, Button,
    ComponentColor,
    ComponentSize,
    FlexBox,
    FlexDirection, IconFont,
    InputLabel,
    InputToggleType, Panel,
    Toggle,
} from '@influxdata/clockface'
import {capitalize} from 'lodash'

import 'src/buckets/components/createBucketForm/MeasurementSchema.scss'
import {MeasurementSchema, MeasurementSchemaList} from 'src/client/generatedRoutes'
import {ReadOnlyMeasurementSchemaPanel} from "./ReadOnlyMeasurementSchemaPanel";
import {downloadTextFile} from "src/shared/utils/download";


interface Props {
    measurementSchemaList ?: MeasurementSchemaList
    isEditing ?: boolean = false
}
interface PanelProps {
    measurementSchema: MeasurementSchema
    index?: number
}

export const Foo: FC<PanelProps>   = ({measurementSchema, index  }) => {

    const handleDownloadSchema = () => {
        const {name} = measurementSchema
        const contents = JSON.stringify(measurementSchema.columns)
        downloadTextFile(contents, name || 'schema', '.json')
    }

    return  <FlexBox
        direction={FlexDirection.Column}
        margin={ComponentSize.Large}
        alignItems={AlignItems.FlexStart}
        testID={`measurement-schema-readOnly-panel-${index}`}
        className="measurement-schema-panel"
        key={`romsp-${index}`}
    >
        <div> name</div>
        <FlexBox direction={FlexDirection.Row} className='schema-row'>
            <div>{measurementSchema.name}</div>
            <Button
                icon={IconFont.Download}
                color={ComponentColor.Secondary}
                text="Download Schema"
                onClick={handleDownloadSchema}
            />
        </FlexBox>

    </FlexBox>
}

export const MeasurementSchemaSection: FC<Props> = ({measurementSchemaList,
                                                    }) => {

// this is the documentation link for explicit schemas for buckets
    const link =
        'https://docs.influxdata.com/influxdb/cloud/organizations/buckets/bucket-schema/'
console.log('got ', measurementSchemaList)
const schemas  = measurementSchemaList.measurementSchemas
    let contents = null;
    if (schemas) {
       contents = schemas.map((oneSchema, index) => (
         <Foo measurementSchema={oneSchema} index={index}/>
        ))
    }


    return (
        <FlexBox
            direction={FlexDirection.Column}
            margin={ComponentSize.Large}
            alignItems={AlignItems.FlexStart}
            testID="measurement-schema-section-parent"
            className="schema-section"
        >
            <div className="header">
                <InputLabel>Measurement Schema</InputLabel>
                <div className="subtext">
                    Measurement Schemas provide non-conforming validation for data in the bucket.
                    once a measurement schema is saved you cannot delete or modify existing columns.
                    You may only add new columns.{' '}
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
