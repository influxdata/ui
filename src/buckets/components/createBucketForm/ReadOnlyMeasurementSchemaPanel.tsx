import React, {FC} from "react";

import {downloadTextFile} from 'src/shared/utils/download'
import {
    AlignItems,
    Button,
    ComponentColor,
    ComponentSize,
    FlexBox,
    FlexDirection,
    IconFont
} from "@influxdata/clockface";
import {MeasurementSchema} from 'src/client/generatedRoutes'

interface PanelProps {
    measurementSchema: MeasurementSchema
    index?: number
}

export const ReadOnlyMeasurementSchemaPanel : FC<PanelProps> = ({measurementSchema, index  }) => {

    if (!index) { index = 0}

    const handleDownloadSchema = () => {
        const {name} = measurementSchema
        const contents = JSON.stringify(measurementSchema.columns)
        downloadTextFile(contents, name || 'schema', '.json')
    }

    return (
        <FlexBox
            direction={FlexDirection.Column}
            margin={ComponentSize.Large}
            alignItems={AlignItems.FlexStart}
            testID={`measurement-schema-readOnly-panel-${index}`}
            className="measurement-schema-panel"
        >
            <div className="header">
                <div>Name</div>
                <div className="schema-line">
                    <div>{measurementSchema.name}</div>
                    <Button
                        icon={IconFont.Download}
                        color={ComponentColor.Secondary}
                        text="Download Schema"
                        onClick={handleDownloadSchema}
                    />
                </div>
            </div>
        </FlexBox>
    )
}