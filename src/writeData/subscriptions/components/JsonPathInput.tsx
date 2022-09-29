// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  Grid,
  Form,
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
  ComponentStatus,
} from '@influxdata/clockface'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {
  handleJsonPathValidation,
  handleValidation,
  JSON_TOOLTIP,
  sanitizeType,
  dataTypeList,
  handleAvroValidation,
} from 'src/writeData/subscriptions/utils/form'
import {event} from 'src/cloud/utils/reporting'
import ValidationInputWithTooltip from './ValidationInputWithTooltip'

interface Props {
  name: string
  updateForm: (any) => void
  formContent: Subscription
  itemNum: number
  edit: boolean
}

const JsonPathInput: FC<Props> = ({
  name,
  formContent,
  updateForm,
  itemNum,
  edit,
}) => {
  const [dataType, setDataType] = useState(dataTypeList[0])
  const tagType = name === 'Tag'
  return (
    <div>
      <Grid.Column>
        <Heading
          element={HeadingElement.H3}
          weight={FontWeight.Bold}
          className="json-parsing-form__header"
        >
          {name}
        </Heading>
        {(tagType
          ? !(formContent.jsonTagKeys.length === 0)
          : !(formContent.jsonFieldKeys.length === 1)) && (
          <ConfirmationButton
            color={ComponentColor.Colorless}
            icon={IconFont.Trash_New}
            shape={ButtonShape.Square}
            size={ComponentSize.ExtraSmall}
            confirmationLabel={`Yes, delete this ${name}`}
            onConfirm={() => {
              event(
                'removed json parsing rule',
                {
                  ruleType: tagType ? 'tag' : 'field',
                },
                {feature: 'subscriptions'}
              )
              if (tagType) {
                formContent.jsonTagKeys.splice(itemNum, 1)
              } else {
                formContent.jsonFieldKeys.splice(itemNum, 1)
              }
              updateForm({...formContent})
            }}
            confirmationButtonText="Confirm"
            testID={`${tagType}-json-delete-label`}
          />
        )}
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Row}
          margin={ComponentSize.Large}
          className="json-parsing-form__container"
        >
          <ValidationInputWithTooltip
            label="Name"
            value={
              tagType
                ? formContent.jsonTagKeys[itemNum].name
                : formContent.jsonFieldKeys[itemNum].name
            }
            required={true}
            validationFunc={() => {
              const value = tagType
                ? formContent.jsonTagKeys[itemNum].name
                : formContent.jsonFieldKeys[itemNum].name
              return (
                handleValidation(name, value) ??
                handleAvroValidation(name, value)
              )
            }}
            placeholder={`${name}_name`.toLowerCase()}
            name={`${name}=name`}
            onChange={e => {
              let newArr
              if (tagType) {
                newArr = Object.assign([...formContent.jsonTagKeys], {
                  [itemNum]: {
                    ...formContent.jsonTagKeys[itemNum],
                    name: e.target.value,
                  },
                })
                updateForm({...formContent, jsonTagKeys: newArr})
              } else {
                newArr = Object.assign([...formContent.jsonFieldKeys], {
                  [itemNum]: {
                    ...formContent.jsonFieldKeys[itemNum],
                    name: e.target.value,
                  },
                })
                updateForm({...formContent, jsonFieldKeys: newArr})
              }
            }}
            onBlur={() =>
              event(
                'completed form field',
                {
                  formField: `${
                    tagType ? 'jsonTagKeys' : 'jsonFieldKeys'
                  }.name`,
                },
                {feature: 'subscriptions'}
              )
            }
            edit={edit}
            testID={`${tagType}-json-parsing-name`}
            tooltip={`This will become the the ${
              tagType ? 'tag' : 'field'
            }'s key`}
            width="75%"
          />
          <div className="json-parsing-form__container__dropdown">
            <Form.Label label="Data Type" />
            <Dropdown
              button={(active, onClick) => (
                <Dropdown.Button
                  active={active}
                  onClick={onClick}
                  testID={`${tagType}-json-parsing-type`}
                  status={
                    edit ? ComponentStatus.Default : ComponentStatus.Disabled
                  }
                >
                  {tagType
                    ? sanitizeType(formContent.jsonTagKeys[itemNum].type) ??
                      dataType
                    : sanitizeType(formContent.jsonFieldKeys[itemNum].type) ??
                      dataType}
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
                        event(
                          'completed form field',
                          {
                            formField: `${
                              tagType ? 'jsonTagKeys' : 'jsonFieldKeys'
                            }.type`,
                            selected: d,
                          },
                          {feature: 'subscriptions'}
                        )
                        setDataType(d)
                        tagType
                          ? (formContent.jsonTagKeys[itemNum].type =
                              d.toLowerCase())
                          : (formContent.jsonFieldKeys[itemNum].type =
                              d.toLowerCase())
                      }}
                      selected={dataType === d}
                      testID={`${tagType}-json-parsing-type-${key}`}
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
        <ValidationInputWithTooltip
          label="JSON Path"
          value={
            tagType
              ? formContent.jsonTagKeys[itemNum].path
              : formContent.jsonFieldKeys[itemNum].path
          }
          required={true}
          validationFunc={() => {
            const path = tagType
              ? formContent.jsonTagKeys[itemNum].path
              : formContent.jsonFieldKeys[itemNum].path
            return (
              handleValidation(`${name} Path`, path) ??
              handleJsonPathValidation(path)
            )
          }}
          placeholder="eg. $.myJSON.myObject[0].myKey"
          name="jsonpath"
          onChange={e => {
            let newArr
            if (tagType) {
              newArr = Object.assign([...formContent.jsonTagKeys], {
                [itemNum]: {
                  ...formContent.jsonTagKeys[itemNum],
                  path: e.target.value,
                },
              })
              updateForm({...formContent, jsonTagKeys: newArr})
            } else {
              newArr = Object.assign([...formContent.jsonFieldKeys], {
                [itemNum]: {
                  ...formContent.jsonFieldKeys[itemNum],
                  path: e.target.value,
                },
              })
              updateForm({...formContent, jsonFieldKeys: newArr})
            }
          }}
          onBlur={() =>
            event(
              'completed form field',
              {
                formField: `${tagType ? 'jsonTagKeys' : 'jsonFieldKeys'}.path`,
              },
              {feature: 'subscriptions'}
            )
          }
          edit={edit}
          testID={`${tagType}-json-parsing-path`}
          tooltip={JSON_TOOLTIP}
        />
        <div className="line"></div>
      </Grid.Column>
    </div>
  )
}

export default JsonPathInput
