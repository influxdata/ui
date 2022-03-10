// Libraries
import React, {FC, useState, useEffect} from 'react'

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

const JsonPathInput: FC<Props> = ({
  name,
  form,
  firstRender,
  setRender,
  setForm,
  itemNum,
}) => {
  const dataTypeList = ['String', 'Number']
  const [dataType, setDataType] = useState(dataTypeList[0])
  const tagType = name === 'Tag'
  return (
    <div>
      <Grid.Column>
        <div className="section">
          <div className="header-wrap">
            <h2 className="form-header">{name}</h2>
            {(tagType
              ? !(form.jsonTagKeys.length == 1)
              : !(form.jsonFieldKeys.length == 1)) && (
              <ConfirmationButton
                color={ComponentColor.Colorless}
                icon={IconFont.Trash_New}
                shape={ButtonShape.Square}
                size={ComponentSize.ExtraSmall}
                confirmationLabel={`Yes, delete this ${name}`}
                onConfirm={() => {
                  if (tagType) {
                    form.jsonTagKeys.splice(itemNum, 1)
                  } else {
                    form.jsonFieldKeys.splice(itemNum, 1)
                  }
                  setForm({...form})
                }}
                confirmationButtonText="Confirm"
                testID={`json-delete-label`}
              />
            )}
          </div>
          <div className="container">
            <Form.ValidationElement
              label={'Name'}
              value={
                tagType
                  ? form.jsonTagKeys[itemNum].name
                  : form.jsonFieldKeys[itemNum].name
              }
              required={true}
              validationFunc={() =>
                !firstRender &&
                handleValidation(
                  `${name}`,
                  tagType
                    ? form.jsonTagKeys[itemNum].name
                    : form.jsonFieldKeys[itemNum].name
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
                      ? form.jsonTagKeys[itemNum].name
                      : form.jsonFieldKeys[itemNum].name
                  }
                  onChange={e => {
                    setRender(false)
                    tagType
                      ? (form.jsonTagKeys[itemNum].name = e.target.value)
                      : (form.jsonFieldKeys[itemNum].name = e.target.value)
                    setForm({...form})
                  }}
                  status={status}
                  maxLength={16}
                  testID="json-parsing--name"
                />
              )}
            </Form.ValidationElement>
            <div className="dropdown-container">
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
                            ? (form.jsonTagKeys[itemNum].name = d)
                            : (form.jsonFieldKeys[itemNum].name = d)
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
          </div>
        </div>
      </Grid.Column>
      <Grid.Column>
        <Form.ValidationElement
          label="JSON Path"
          value={
            tagType
              ? form.jsonTagKeys[itemNum].path
              : form.jsonFieldKeys[itemNum].path
          }
          required={true}
          validationFunc={() =>
            !firstRender &&
            handleValidation(
              `${name} Path`,
              tagType
                ? form.jsonTagKeys[itemNum].path
                : form.jsonFieldKeys[itemNum].path
            )
          }
        >
          {status => (
            <Input
              type={InputType.Text}
              placeholder="eg. myJSON.myObject[0].myKey"
              name="jsonpath"
              autoFocus={true}
              value={
                tagType
                  ? form.jsonTagKeys[itemNum].path
                  : form.jsonFieldKeys[itemNum].path
              }
              onChange={e => {
                setRender(false)
                tagType
                  ? (form.jsonTagKeys[itemNum].path = e.target.value)
                  : (form.jsonFieldKeys[itemNum].path = e.target.value)
                setForm({...form})
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
