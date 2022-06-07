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
  ComponentStatus,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {
  handleRegexValidation,
  handleValidation,
} from 'src/writeData/subscriptions/utils/form'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  name: string
  updateForm: (any) => void
  formContent: Subscription
  itemNum: number
  edit: boolean
}

const StringPatternInput: FC<Props> = ({
  name,
  formContent,
  updateForm,
  itemNum,
  edit,
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
            ? !(formContent.stringTags.length === 0)
            : !(formContent.stringFields.length === 1)) && (
            <ConfirmationButton
              color={ComponentColor.Colorless}
              icon={IconFont.Trash_New}
              shape={ButtonShape.Square}
              size={ComponentSize.ExtraSmall}
              confirmationLabel={`Yes, delete this ${name}`}
              onConfirm={() => {
                event(
                  'removed string parsing rule',
                  {ruleType: tagType ? 'tag' : 'field'},
                  {feature: 'subscriptions'}
                )
                if (tagType) {
                  formContent.stringTags.splice(itemNum, 1)
                } else {
                  formContent.stringFields.splice(itemNum, 1)
                }
                updateForm({...formContent})
              }}
              confirmationButtonText="Confirm"
              testID={`${name}-string-delete-label`}
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
                let newArr
                if (tagType) {
                  newArr = Object.assign([...formContent.stringTags], {
                    [itemNum]: {
                      ...formContent.stringTags[itemNum],
                      name: e.target.value,
                    },
                  })
                  updateForm({...formContent, stringTags: newArr})
                } else {
                  newArr = Object.assign([...formContent.stringFields], {
                    [itemNum]: {
                      ...formContent.stringFields[itemNum],
                      name: e.target.value,
                    },
                  })
                  updateForm({...formContent, stringFields: newArr})
                }
              }}
              onBlur={() =>
                event(
                  'completed form field',
                  {
                    formField: `${
                      tagType ? 'stringTags' : 'stringFields'
                    }.name`,
                  },
                  {feature: 'subscriptions'}
                )
              }
              status={edit ? status : ComponentStatus.Disabled}
              maxLength={56}
              testID={`${name}-string-parsing-name`}
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
          validationFunc={() => {
            const pattern = tagType
              ? formContent.stringTags[itemNum].pattern
              : formContent.stringFields[itemNum].pattern
            return (
              handleValidation('Pattern', pattern) ??
              handleRegexValidation(pattern)
            )
          }}
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
                let newArr
                if (tagType) {
                  newArr = Object.assign([...formContent.stringTags], {
                    [itemNum]: {
                      ...formContent.stringTags[itemNum],
                      pattern: e.target.value,
                    },
                  })
                  updateForm({...formContent, stringTags: newArr})
                } else {
                  newArr = Object.assign([...formContent.stringFields], {
                    [itemNum]: {
                      ...formContent.stringFields[itemNum],
                      pattern: e.target.value,
                    },
                  })
                  updateForm({...formContent, stringFields: newArr})
                }
              }}
              onBlur={() =>
                event(
                  'completed form field',
                  {
                    formField: `${
                      tagType ? 'stringTags' : 'stringFields'
                    }.pattern`,
                  },
                  {feature: 'subscriptions'}
                )
              }
              status={edit ? status : ComponentStatus.Disabled}
              maxLength={255}
              testID={`${name}-string-parsing-pattern`}
            />
          )}
        </Form.ValidationElement>
        <div className="line"></div>
      </Grid.Column>
    </div>
  )
}

export default StringPatternInput
