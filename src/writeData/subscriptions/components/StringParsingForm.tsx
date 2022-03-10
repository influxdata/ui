// Libraries
import React, {FC, useState, useEffect} from 'react'

// Components
import {
  Input,
  Grid,
  Form,
  InputType,
  Dropdown,
  // TextArea,
  IconFont,
  Icon,
} from '@influxdata/clockface'
import StringPatternInput from 'src/writeData/subscriptions/components/StringPatternInput'

// Styles
import 'src/writeData/subscriptions/components/StringParsingForm.scss'

// Types
import {Subscription} from 'src/types/subscriptions'

// Utils
import {handleValidation} from 'src/writeData/subscriptions/utils/form'

interface Props {
  formContent: Subscription
  updateForm: (any) => void
}

const StringParsingForm: FC<Props> = ({formContent, updateForm}) => {
  const [form, setForm] = useState(formContent)
  const [firstRender, setRender] = useState(false)
  useEffect(() => {
    updateForm(form)
  }, [form])
  useEffect(() => {
    setRender(true)
  }, [])
  const ruleList = ['field', 'tag']
  const [rule, setRule] = useState('')
  useEffect(() => {
    if (rule === 'field') {
      form.stringFields = [
        ...form.stringFields,
        {
          name: '',
          pattern: '',
        },
      ]
    }
    if (rule === 'tag') {
      form.stringTags = [
        ...form.stringTags,
        {
          name: '',
          pattern: '',
        },
      ]
    }
    setForm({...form})
    setRule('')
  }, [rule])
  useEffect(() => {
    if (rule === 'field') {
      form.jsonFieldKeys = [
        ...form.jsonFieldKeys,
        {
          name: '',
          path: '',
          type: 'string',
        },
      ]
    }
    if (rule === 'tag') {
      form.jsonTagKeys = [
        ...form.jsonTagKeys,
        {
          name: '',
          path: '',
          type: 'string',
        },
      ]
    }
    setForm({...form})
    setRule('')
  }, [rule])
  return (
    <div className="string-parsing-form">
      <Grid.Column>
        <Form.Label label="Regex to find Timestamp" />
        <Input
          type={InputType.Text}
          placeholder="eg. regexExample"
          name="timestamp"
          autoFocus={true}
          value={form.stringTimestamp.pattern}
          onChange={e => {
            form.stringTimestamp.pattern = e.target.value
            setForm({...formContent})
          }}
          maxLength={56}
          testID="string-parsing--timestamp"
        />
      </Grid.Column>
      <Grid.Column>
        <div className="section">
          <div className="header-wrap">
            <h2 className="form-header">Measurement</h2>
          </div>
          <Form.ValidationElement
            label="Regex Pattern to find Measurement"
            value={form.stringMeasurement.pattern}
            required={true}
            validationFunc={() =>
              !firstRender &&
              handleValidation('Pattern', form.stringMeasurement.pattern)
            }
          >
            {status => (
              <Input
                type={InputType.Text}
                placeholder="eg. a=(\\d)"
                name="regex"
                autoFocus={true}
                value={form.stringMeasurement.pattern}
                onChange={e => {
                  setRender(false)
                  form.stringMeasurement.pattern = e.target.value
                  setForm({...formContent})
                }}
                status={status}
                maxLength={56}
                testID="string-parsing--regex"
              />
            )}
          </Form.ValidationElement>
        </div>
        <div className="line"></div>
      </Grid.Column>
      {form.stringTags.map((_, key) => (
        <StringPatternInput
          key={key}
          setForm={setForm}
          form={form}
          name="Tag"
          firstRender={firstRender}
          setRender={setRender}
          itemNum={key}
        />
      ))}
      {form.stringFields.map((_, key) => (
        <StringPatternInput
          key={key}
          setForm={setForm}
          form={form}
          name="Field"
          firstRender={firstRender}
          setRender={setRender}
          itemNum={key}
        />
      ))}
      <Grid.Column>
        <Dropdown
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              testID="variable-type-dropdown--button"
            >
              <Icon glyph={IconFont.Plus} /> Add Rule
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {ruleList.map((r, key) => (
                <Dropdown.Item
                  key={key}
                  id={r}
                  value={r}
                  onClick={() => {
                    setRule(r)
                  }}
                  selected={rule === r}
                  testID={`variable-type-dropdown-${1}`}
                >
                  {r}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Grid.Column>
      {/* For a later iteration */}
      {/* <Grid.Column>
        <h2 className="form-header">Validate your Parsing Rules</h2>
        <TextArea
          name="validate"
          value={string}
          placeholder={
            'Enter a string snippet of your data to verify that your regex parsing rules correctly apply.'
          }
          onChange={e => {
            setString(e.target.value)
          }}
          style={{height: '146px', minHeight: '146px'}}
          ref={null}
          maxLength={255}
          testID="json-validate"
        />
      </Grid.Column> */}
    </div>
  )
}

export default StringParsingForm
