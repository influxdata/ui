// Libraries
import React, {FC, useContext, useMemo} from 'react'
import {useSelector} from 'react-redux'

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
import {
  CancelServiceContext,
  CancelationReasons,
} from 'src/billing/components/PayAsYouGo/CancelServiceContext'

// Selectors
import {isOrgIOx} from 'src/organizations/selectors'

export const CancelServiceReasonsForm: FC = () => {
  const {
    canContactForFeedback,
    isShortSuggestionEnabled,
    reason,
    shortSuggestion,
    suggestions,
    setReason,
    setShortSuggestion,
    setShortSuggestionFlag,
    setSuggestions,
    toggleCanContactForFeedback,
  } = useContext(CancelServiceContext)

  const orgIsIOx = useSelector(isOrgIOx)

  const generateCancelationReasons = () => {
    if (orgIsIOx) {
      return Object.keys(CancelationReasons).filter(
        reason =>
          CancelationReasons[reason] !==
          CancelationReasons.UNSUPPORTED_HIGH_CARDINALITY
      )
    }

    return Object.keys(CancelationReasons)
  }

  const isDropdownOptionValid = useMemo(() => {
    return CancelationReasons[reason] !== CancelationReasons.NONE
  }, [reason])

  const onSelectReason = (selected: string) => {
    const isAlternateProductSelected =
      CancelationReasons[selected] === CancelationReasons.ALTERNATIVE_PRODUCT
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
              {CancelationReasons[reason]}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {generateCancelationReasons().map(reason => (
                <Dropdown.Item
                  key={reason}
                  id={reason}
                  value={reason}
                  onClick={onSelectReason}
                  testID={`variable-type-dropdown-${reason}`}
                >
                  {CancelationReasons[reason]}
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
