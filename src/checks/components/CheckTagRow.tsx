// Libraries
import React, {FC} from 'react'

// Components
import {
  ComponentColor,
  ComponentSize,
  DismissButton,
  FlexBox,
  FlexDirection,
  InfluxColors,
  Input,
  Panel,
  TextBlock,
} from '@influxdata/clockface'

// Types
import {CheckTagSet} from 'src/types'

interface Props {
  index: number
  tagSet: CheckTagSet
  handleChangeTagRow: (i: number, tags: CheckTagSet) => void
  handleRemoveTagRow: (i: number) => void
}

const CheckTagRow: FC<Props> = ({
  tagSet,
  index,
  handleChangeTagRow,
  handleRemoveTagRow,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChangeTagRow(index, {...tagSet, [e.target.name]: e.target.value})
  }

  return (
    <Panel
      testID="tag-rule"
      className="alert-builder--tag-row"
      style={{backgroundColor: 'rgba(51,51,70, .3)'}}
    >
      <DismissButton
        onClick={() => {
          handleRemoveTagRow(index)
        }}
        color={ComponentColor.Default}
      />
      <Panel.Body size={ComponentSize.ExtraSmall}>
        <FlexBox direction={FlexDirection.Row} margin={ComponentSize.Small}>
          <FlexBox.Child grow={1}>
            <Input
              testID="tag-rule-key--input"
              placeholder="Tag"
              value={tagSet.key}
              name="key"
              onChange={handleChange}
            />
          </FlexBox.Child>
          <FlexBox.Child grow={0} basis={20}>
            <TextBlock
              backgroundColor="#00000000"
              textColor={InfluxColors.Pool}
              text="="
            />
          </FlexBox.Child>
          <FlexBox.Child grow={1}>
            <Input
              testID="tag-rule-value--input"
              placeholder="Value"
              value={tagSet.value}
              name="value"
              onChange={handleChange}
            />
          </FlexBox.Child>
        </FlexBox>
      </Panel.Body>
    </Panel>
  )
}

export default CheckTagRow
