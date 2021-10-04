// Libraries
import React, {useContext, useState} from 'react'

// Components
import {
  ComponentSize,
  Dropdown,
  Form,
  Input,
  InputType,
  TextArea,
} from '@influxdata/clockface'

// Utilities
import {DeleteOrgContext} from './DeleteOrgContext'

// Types


interface Errors {
  [_: string]: string
}
interface ComponentProps {
  errors?: Errors
}

export const variableItems = {
  USE_CASE_DIFFERENT: "It doesn't work for my use case",
  SWITCHING_ORGANIZATION: 'I want to join my account to another organization',
  ALTERNATIVE_PRODUCT: 'I found an alternative product',
  RE_SIGNUP: 'I want to sign up for a new account using a marketplace option',
  OTHER_REASON: 'Other reason',
}

function CancellationReasonsForm({errors = {}}: ComponentProps) {
  const [workingVariable, setWorkingVariable] = useState('')
  const {
    shortSuggestion,
    isShortSuggestionEnabled,
    suggestions,
    changeShortSuggestionFlag,
    changeShortSuggestion,
    changeSuggestions,
  } = useContext(DeleteOrgContext)

  const onChange = selected => {
    changeShortSuggestionFlag(selected === 'ALTERNATIVE_PRODUCT')
    setWorkingVariable(selected)
  }

  return (
    <div className="cancellation-reasons-form">
      <Form.Element
        label="What is your primary reason for leaving?"
        required={true}
      >
        <Dropdown
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              testID="variable-type-dropdown--button"
            >
              {variableItems[workingVariable]}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {Object.keys(variableItems).map(key => (
                <Dropdown.Item
                  key={key}
                  id={key}
                  value={key}
                  onClick={onChange}
                  testID={`variable-type-dropdown-${key}`}
                >
                  {variableItems[key]}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
      {isShortSuggestionEnabled && (
        <Form.Element
          label="What is the alternative?"
          className="element alternate-product--input"
          errorMessage={errors?.shortSuggestion ?? ''}
        >
          <Input
            type={InputType.Text}
            titleText="What is the alternative?"
            onChange={e => changeShortSuggestion(e.target.value)}
            value={shortSuggestion}
          />
        </Form.Element>
      )}
      <Form.Element
        label="How can we improve?"
        errorMessage={errors?.suggestions ?? ''}
        className="element improvement-suggestion--input"
      >
        <TextArea
          className="improvement-suggestions-input"
          onChange={e => changeSuggestions(e.target.value)}
          size={ComponentSize.Medium}
          testID="improvement-suggestions-input"
          value={suggestions}
          placeholder="How can we improve?"
        />
      </Form.Element>
    </div>
  )
}

export default CancellationReasonsForm
