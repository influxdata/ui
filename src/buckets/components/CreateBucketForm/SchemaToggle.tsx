import React, {useState, FC} from 'react'


import {
    AlignItems, Appearance, ComponentColor,
    ComponentSize,
    FlexBox,
    FlexDirection,
    InputLabel,
    InputToggleType,
    Toggle
} from "@influxdata/clockface";

interface Props {
    onChangeSchemaType: (selectedSchemaType: 'explicit' | 'implicit') => void
}

export const SchemaToggle: FC<Props> = ({onChangeSchemaType}) => {

    const [schemaType, setSchemaType] = useState('implicit')

    const handleSchemaChange = (newValue) => {
        console.log('ack! change!',newValue)
        onChangeSchemaType(newValue)
        setSchemaType(newValue)
    }
    return (
        <FlexBox
            direction={FlexDirection.Column}
    margin={ComponentSize.Large}
    alignItems={AlignItems.FlexStart}
    testID='create-bucket-schema-type-toggle-box'
    >
    <InputLabel>Schema Type</InputLabel>
        <Toggle
    tabIndex={1}
    value="implicit"
    id='implicit-bucket-schema-choice'
    name='implicit-bucket-schema-choice'
    checked={schemaType === 'implicit'}
    onChange={handleSchemaChange}
    type={InputToggleType.Radio}
    size={ComponentSize.ExtraSmall}
    color={ComponentColor.Primary}
    appearance={Appearance.Outline}
    >
    <InputLabel
    htmlFor='implicit-bucket-schema-choice'
    active={schemaType === 'implicit'}
    >
    Implicit
    </InputLabel>
    </Toggle>
    <Toggle
    tabIndex={2}
    value="explicit"
    id='explicit-bucket-schema-choice'
    name='explicit-bucket-schema-choice'
    checked={schemaType === 'explicit'}
    onChange={handleSchemaChange}
    type={InputToggleType.Radio}
    size={ComponentSize.ExtraSmall}
    color={ComponentColor.Primary}
    appearance={Appearance.Outline}
    >
        <InputLabel
            htmlFor='explicit-bucket-schema-choice'
            active={schemaType === 'explicit'}
        >
            Explicit
        </InputLabel>
    </Toggle>
    </FlexBox>
)
}