// Libraries
import React, {FC, useState, useEffect} from 'react'

// Components
import {
  Input,
  Grid,
  Form,
  InputType,
  ButtonShape,
  IconFont,
  ComponentColor,
  ComponentSize,
  ConfirmationButton,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

interface Props {
  name: string
  firstRender: boolean
  setRender: (any) => void
  setForm: (any) => void
  form: Subscription
  itemNum: number
}

const StringPatternInput: FC<Props> = ({
  name,
  form,
  firstRender,
  setRender,
  setForm,
  itemNum,
}) => {
  const tagType = name === 'Tag'
  return (
    <div>
      <Grid.Column>
        <div className="section">
          <div className="header-wrap">
            <h2 className="form-header">{name}</h2>
            {(tagType
              ? !(form.stringTags.length == 1)
              : !(form.stringFields.length == 1)) && (
              <ConfirmationButton
                color={ComponentColor.Colorless}
                icon={IconFont.Trash_New}
                shape={ButtonShape.Square}
                size={ComponentSize.ExtraSmall}
                confirmationLabel={`Yes, delete this ${name}`}
                onConfirm={() => {
                  if (tagType) {
                    form.stringTags.splice(itemNum, 1)
                  } else {
                    form.stringFields.splice(itemNum, 1)
                  }
                  setForm({...form})
                }}
                confirmationButtonText="Confirm"
                testID={`json-delete-label`}
              />
            )}
          </div>
          <Form.ValidationElement
            label="Name"
            value={
              tagType
                ? form.stringTags[itemNum].name
                : form.stringFields[itemNum].name
            }
            required={true}
            validationFunc={() =>
              !firstRender &&
              handleValidation(
                `${name}`,
                tagType
                  ? form.stringTags[itemNum].name
                  : form.stringFields[itemNum].name
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
                    ? form.stringTags[itemNum].name
                    : form.stringFields[itemNum].name
                }
                onChange={e => {
                  setRender(false)
                  tagType
                    ? (form.stringTags[itemNum].name = e.target.value)
                    : (form.stringFields[itemNum].name = e.target.value)
                  setForm({...form})
                }}
                status={status}
                maxLength={16}
                testID="json-parsing--name"
              />
            )}
          </Form.ValidationElement>
        </div>
      </Grid.Column>
      <Grid.Column>
        <Form.ValidationElement
          label="Regex pattern"
          value={
            tagType
              ? form.stringTags[itemNum].pattern
              : form.stringFields[itemNum].pattern
          }
          required={true}
          validationFunc={() =>
            !firstRender &&
            handleValidation(
              'Pattern',
              tagType
                ? form.stringTags[itemNum].pattern
                : form.stringFields[itemNum].pattern
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
                  ? form.stringTags[itemNum].pattern
                  : form.stringFields[itemNum].pattern
              }
              onChange={e => {
                setRender(false)
                tagType
                  ? (form.stringTags[itemNum].pattern = e.target.value)
                  : (form.stringFields[itemNum].pattern = e.target.value)
                setForm({...form})
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
