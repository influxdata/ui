// Libraries
import React, {FC, useContext} from 'react'

// Components
import {Dropdown, Form, Input, InputType, TextArea} from '@influxdata/clockface'

// Context
import {
  DeleteFreeAccountContext,
  VariableItems,
} from 'src/accounts/context/DeleteFreeAccountContext'

// Types

export const DeleteFreeAccountReasonsForm: FC = () => {
  const {
    shortSuggestion,
    isShortSuggestionEnabled,
    suggestions,
    setShortSuggestionFlag,
    setShortSuggestion,
    setSuggestions,
    reason,
    setReason,
  } = useContext(DeleteFreeAccountContext)

  const onChange = (selected: string) => {
    const isAlternateProductSelected =
      VariableItems[selected] === VariableItems.ALTERNATIVE_PRODUCT
    if (!isAlternateProductSelected) {
      setShortSuggestion('')
    }

    setShortSuggestionFlag(isAlternateProductSelected)
    setReason(selected)
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
              {VariableItems[reason]}
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
        />
      </Form.Element>
    </div>
  )
}
