// Libraries
import React, {useContext, useMemo} from 'react'

// Components
import {
  AlignItems,
  ComponentSize,
  Dropdown,
  FlexBox,
  FlexDirection,
  Form,
  Input,
  InputLabel,
  InputType,
  JustifyContent,
  TextArea,
} from '@influxdata/clockface'

// Utilities
import {CancelServiceContext, VariableItems} from './CancelServiceContext'

// Types

function CancelServiceReasonsForm() {
  const {
    shortSuggestion,
    isShortSuggestionEnabled,
    suggestions,
    setShortSuggestionFlag,
    setShortSuggestion,
    setSuggestions,
    reason,
    setReason,
    canContactForFeedback,
    toggleCanContactForFeedback,
  } = useContext(CancelServiceContext)

  const isDropdownOptionValid = useMemo(() => {
    return VariableItems[reason] !== VariableItems.NO_OPTION
  }, [reason])

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
    <div className="service-cancellation-reasons-form">
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
      {isDropdownOptionValid && (
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
      )}
      {isDropdownOptionValid && (
        <span onClick={toggleCanContactForFeedback}>
          <FlexBox
            alignItems={AlignItems.Center}
            direction={FlexDirection.Row}
            justifyContent={JustifyContent.FlexStart}
            margin={ComponentSize.Medium}
          >
            <Input
              className="agree-terms-input"
              checked={canContactForFeedback}
              onChange={toggleCanContactForFeedback}
              size={ComponentSize.Small}
              titleText="I am open to talking further with the Influx product &amp; design"
              type={InputType.Checkbox}
              testID="agree-terms--checkbox"
            />
            <InputLabel
              active={canContactForFeedback}
              size={ComponentSize.Small}
            >
              I am open to talking further with the Influx product &amp; design
              team about my experience
            </InputLabel>
          </FlexBox>
        </span>
      )}
    </div>
  )
}

export default CancelServiceReasonsForm
