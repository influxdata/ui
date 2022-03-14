// Libraries
import React, {FC} from 'react'

// Components
import {
  Input,
  Grid,
  Form,
  InputType,
  ButtonShape,
  IconFont,
  ComponentColor,
  ConfirmationButton,
  Heading,
  HeadingElement,
  FontWeight,
  AlignItems,
  ComponentSize,
  FlexDirection,
  FlexBox,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

interface Props {
  name: string
  updateForm: (any) => void
  formContent: Subscription
  itemNum: number
}

const StringPatternInput: FC<Props> = ({
  name,
  formContent,
  updateForm,
  itemNum,
}) => {
  const tagType = name === 'Tag'
  return (
    <div>
      <Grid.Column>
        <FlexBox
          alignItems={AlignItems.Center}
          direction={FlexDirection.Row}
          margin={ComponentSize.Medium}
          className="header-wrap"
        >
          <Heading
            element={HeadingElement.H3}
            weight={FontWeight.Bold}
            className="header-wrap__header"
          >
            {name}
          </Heading>
          {(tagType
            ? !(formContent.stringTags.length === 1)
            : !(formContent.stringFields.length === 1)) && (
            <ConfirmationButton
              color={ComponentColor.Colorless}
              icon={IconFont.Trash_New}
              shape={ButtonShape.Square}
              size={ComponentSize.ExtraSmall}
              confirmationLabel={`Yes, delete this ${name}`}
              onConfirm={() => {
                if (tagType) {
                  formContent.stringTags.splice(itemNum, 1)
                } else {
                  formContent.stringFields.splice(itemNum, 1)
                }
                updateForm({...formContent})
              }}
              confirmationButtonText="Confirm"
              testID={`json-delete-label`}
            />
          )}
        </FlexBox>
        <Form.ValidationElement
          label="Name"
          value={
            tagType
              ? formContent.stringTags[itemNum].name
              : formContent.stringFields[itemNum].name
          }
          required={true}
          validationFunc={() =>
            handleValidation(
              `${name}`,
              tagType
                ? formContent.stringTags[itemNum].name
                : formContent.stringFields[itemNum].name
            )
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="nonDescriptName"
              name="name"
              autoFocus={true}
              value={
                tagType
                  ? formContent.stringTags[itemNum].name
                  : formContent.stringFields[itemNum].name
              }
              onChange={e => {
                tagType
                  ? (formContent.stringTags[itemNum].name = e.target.value)
                  : (formContent.stringFields[itemNum].name = e.target.value)
                updateForm({...formContent})
              }}
              status={status}
              maxLength={16}
              testID="json-parsing--name"
            />
          )}
        </Form.ValidationElement>
      </Grid.Column>
      <Grid.Column>
        <Form.ValidationElement
          label="Regex pattern"
          value={
            tagType
              ? formContent.stringTags[itemNum].pattern
              : formContent.stringFields[itemNum].pattern
          }
          required={true}
          validationFunc={() =>
            handleValidation(
              'Pattern',
              tagType
                ? formContent.stringTags[itemNum].pattern
                : formContent.stringFields[itemNum].pattern
            )
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. a=(\\d)"
              name="regex"
              autoFocus={true}
              value={
                tagType
                  ? formContent.stringTags[itemNum].pattern
                  : formContent.stringFields[itemNum].pattern
              }
              onChange={e => {
                tagType
                  ? (formContent.stringTags[itemNum].pattern = e.target.value)
                  : (formContent.stringFields[itemNum].pattern = e.target.value)
                updateForm({...formContent})
              }}
              status={status}
              maxLength={56}
              testID="string-parsing--regex"
            />
          )}
        </Form.ValidationElement>
        <div className="line"></div>
      </Grid.Column>
    </div>
  )
}

export default StringPatternInput
