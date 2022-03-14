// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  Input,
  Grid,
  Form,
  InputType,
  Dropdown,
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

const JsonPathInput: FC<Props> = ({name, formContent, updateForm, itemNum}) => {
  const dataTypeList = ['String', 'Number']
  const [dataType, setDataType] = useState(dataTypeList[0])
  const tagType = name === 'Tag'
  return (
    <div>
      <Grid.Column>
        <div className="json-parsing-form__header-wrap">
          <Heading
            element={HeadingElement.H3}
            weight={FontWeight.Bold}
            className="json-parsing-form__header-wrap__header"
          >
            {name}
          </Heading>
          {(tagType
            ? !(formContent.jsonTagKeys.length === 1)
            : !(formContent.jsonFieldKeys.length === 1)) && (
            <ConfirmationButton
              color={ComponentColor.Colorless}
              icon={IconFont.Trash_New}
              shape={ButtonShape.Square}
              size={ComponentSize.ExtraSmall}
              confirmationLabel={`Yes, delete this ${name}`}
              onConfirm={() => {
                if (tagType) {
                  formContent.jsonTagKeys.splice(itemNum, 1)
                } else {
                  formContent.jsonFieldKeys.splice(itemNum, 1)
                }
                updateForm({...formContent})
              }}
              confirmationButtonText="Confirm"
              testID={`json-delete-label`}
            />
          )}
        </div>
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Row}
          margin={ComponentSize.Large}
          className="json-parsing-form__container"
        >
          <Form.ValidationElement
            label={'Name'}
            value={
              tagType
                ? formContent.jsonTagKeys[itemNum].name
                : formContent.jsonFieldKeys[itemNum].name
            }
            required={true}
            validationFunc={() =>
              handleValidation(
                `${name}`,
                tagType
                  ? formContent.jsonTagKeys[itemNum].name
                  : formContent.jsonFieldKeys[itemNum].name
              )
            }
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="nonDescriptName"
                name={`${name}=name`}
                autoFocus={true}
                value={
                  tagType
                    ? formContent.jsonTagKeys[itemNum].name
                    : formContent.jsonFieldKeys[itemNum].name
                }
                onChange={e => {
                  tagType
                    ? (formContent.jsonTagKeys[itemNum].name = e.target.value)
                    : (formContent.jsonFieldKeys[itemNum].name = e.target.value)
                  updateForm({...formContent})
                }}
                status={status}
                maxLength={16}
                testID="json-parsing--name"
              />
            )}
          </Form.ValidationElement>
          <div className="json-parsing-form__container__dropdown">
            <Form.Label label="Data Type" />
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button
                  active={active}
                  onClick={onClick}
                  testID="variable-type-dropdown--button"
                >
                  {dataType}
                </Dropdown.Button>
              )}
              menu={onCollapse => (
                <Dropdown.Menu onCollapse={onCollapse}>
                  {dataTypeList.map((d, key) => (
                    <Dropdown.Item
                      key={key}
                      id={d}
                      value={d}
                      onClick={() => {
                        setDataType(d)
                        tagType
                          ? (formContent.jsonTagKeys[itemNum].type = d)
                          : (formContent.jsonFieldKeys[itemNum].type = d)
                      }}
                      selected={dataType === d}
                      testID={`variable-type-dropdown-${1}`}
                    >
                      {d}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              )}
            />
          </div>
        </FlexBox>
      </Grid.Column>
      <Grid.Column>
        <Form.ValidationElement
          label="JSON Path"
          value={
            tagType
              ? formContent.jsonTagKeys[itemNum].path
              : formContent.jsonFieldKeys[itemNum].path
          }
          required={true}
          validationFunc={() =>
            handleValidation(
              `${name} Path`,
              tagType
                ? formContent.jsonTagKeys[itemNum].path
                : formContent.jsonFieldKeys[itemNum].path
            )
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. $.myJSON.myObject[0].myKey"
              name="jsonpath"
              autoFocus={true}
              value={
                tagType
                  ? formContent.jsonTagKeys[itemNum].path
                  : formContent.jsonFieldKeys[itemNum].path
              }
              onChange={e => {
                tagType
                  ? (formContent.jsonTagKeys[itemNum].path = e.target.value)
                  : (formContent.jsonFieldKeys[itemNum].path = e.target.value)
                updateForm({...formContent})
              }}
              status={status}
              maxLength={16}
              testID="json-parsing--jsonpath"
            />
          )}
        </Form.ValidationElement>
        <div className="line"></div>
      </Grid.Column>
    </div>
  )
}

export default JsonPathInput
