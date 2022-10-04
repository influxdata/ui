// Libraries
import React, {FC} from 'react'

// Components
import {
  Grid,
  ButtonShape,
  IconFont,
  ComponentColor,
  ConfirmationButton,
  Heading,
  HeadingElement,
  FontWeight,
  ComponentSize,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {
  handleRegexValidation,
  handleValidation,
  REGEX_TOOLTIP,
} from 'src/writeData/subscriptions/utils/form'
import {event} from 'src/cloud/utils/reporting'
import {ValidationInputWithTooltip} from './ValidationInputWithTooltip'

interface Props {
  name: string
  updateForm: (any) => void
  formContent: Subscription
  itemNum: number
  edit: boolean
}

export const StringPatternInput: FC<Props> = ({
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
        <Heading
          element={HeadingElement.H3}
          weight={FontWeight.Bold}
          className="string-parsing-form__header"
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
        <ValidationInputWithTooltip
          label="Name"
          name="name"
          value={
            tagType
              ? formContent.stringTags[itemNum].name
              : formContent.stringFields[itemNum].name
          }
          required={true}
          tooltip={`This will become the the ${
            tagType ? 'tag' : 'field'
          }'s key`}
          validationFunc={() =>
            handleValidation(
              `${name}`,
              tagType
                ? formContent.stringTags[itemNum].name
                : formContent.stringFields[itemNum].name
            )
          }
          placeholder={`${name}_name`.toLowerCase()}
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
                formField: `${tagType ? 'stringTags' : 'stringFields'}.name`,
              },
              {feature: 'subscriptions'}
            )
          }
          edit={edit}
          maxLength={56}
          testID={`${name}-string-parsing-name`}
        />
      </Grid.Column>
      <Grid.Column>
        <ValidationInputWithTooltip
          label="Regex pattern"
          name="regex"
          value={
            tagType
              ? formContent.stringTags[itemNum].pattern
              : formContent.stringFields[itemNum].pattern
          }
          required={true}
          tooltip={REGEX_TOOLTIP}
          placeholder="eg. a=(\d)"
          validationFunc={() => {
            const pattern = tagType
              ? formContent.stringTags[itemNum].pattern
              : formContent.stringFields[itemNum].pattern
            return (
              handleValidation('Pattern', pattern) ??
              handleRegexValidation(pattern)
            )
          }}
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
                formField: `${tagType ? 'stringTags' : 'stringFields'}.pattern`,
              },
              {feature: 'subscriptions'}
            )
          }
          edit={edit}
          maxLength={255}
          testID={`${name}-string-parsing-pattern`}
        />
        <div className="line"></div>
      </Grid.Column>
    </div>
  )
}
