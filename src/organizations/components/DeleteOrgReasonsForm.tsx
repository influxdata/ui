// Libraries
import React, {useContext, useEffect, useState} from 'react'

// Components
import {Dropdown, Form, Input, InputType, TextArea} from '@influxdata/clockface'

// Utilities
import {DeleteOrgContext} from 'src/organizations/components/DeleteOrgContext'

// Types

enum VariableItems {
  USE_CASE_DIFFERENT = "It doesn't work for my use case",
  SWITCHING_ORGANIZATION = 'I want to join my account to another organization',
  ALTERNATIVE_PRODUCT = 'I found an alternative product',
  RE_SIGNUP = 'I want to sign up for a new account using a marketplace option',
  OTHER_REASON = 'Other reason',
}

function DeleteOrgReasonsForm() {
  const [workingVariable, setWorkingVariable] = useState('USE_CASE_DIFFERENT')
  const {
    shortSuggestion,
    isShortSuggestionEnabled,
    suggestions,
    setShortSuggestionFlag,
    setShortSuggestion,
    setSuggestions,
    reason,
    setReason,
  } = useContext(DeleteOrgContext)

  useEffect(() => {
    if (reason !== VariableItems[workingVariable]) {
      setReason(VariableItems[workingVariable])
    }
  }, [reason, workingVariable])

  const onChange = (selected: string) => {
    const isAlternateProductSelected =
      VariableItems[selected] === VariableItems.ALTERNATIVE_PRODUCT
    if (!isAlternateProductSelected) {
      setShortSuggestion('')
    }

    setShortSuggestionFlag(isAlternateProductSelected)
    setReason(VariableItems[selected])
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
              {VariableItems[workingVariable]}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {Object.keys(VariableItems).map(key => (
                <Dropdown.Item
                  key={key}
                  id={key}
                  value={key}
                  onClick={onChange}
                  testID={`variable-type-dropdown-${key}`}
                >
                  {VariableItems[key]}
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
        >
          <Input
            type={InputType.Text}
            titleText="What is the alternative?"
            onChange={e => setShortSuggestion(e.target.value)}
            value={shortSuggestion}
          />
        </Form.Element>
      )}
      <Form.Element
        label="How can we improve?"
        className="element improvement-suggestion--input"
      >
        <TextArea
          className="improvement-suggestions-input"
          onChange={e => setSuggestions(e.target.value)}
          testID="improvement-suggestions-input"
          value={suggestions}
          placeholder="How can we improve?"
          style={{height: '120px'}}
        />
      </Form.Element>
    </div>
  )
}

export default DeleteOrgReasonsForm
