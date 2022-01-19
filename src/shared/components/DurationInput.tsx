// Libraries
import React, {useState, useEffect, FC} from 'react'
import {
  Input,
  DropdownMenu,
  DropdownDivider,
  DropdownItem,
  ClickOutside,
  ComponentStatus,
  Dropdown,
} from '@influxdata/clockface'
import {isDurationParseable} from 'src/shared/utils/duration'

const SUGGESTION_CLASS = 'duration-input--suggestion'

type Props = {
  suggestions: string[]
  onSubmit: (input: string) => void
  value: string
  placeholder?: string
  submitInvalid?: boolean
  showDivider?: boolean
  testID?: string
  validFunction?: (input: string) => boolean
  status?: ComponentStatus
  customClass?: string
  dividerText?: string
  dividerOnClick?: () => void
  menuMaxHeight?: number
}

const DurationInput: FC<Props> = ({
  suggestions,
  onSubmit,
  value,
  placeholder,
  status: controlledStatus,
  submitInvalid = true,
  showDivider = true,
  testID = 'duration-input',
  validFunction,
  customClass,
  dividerText,
  dividerOnClick,
  menuMaxHeight = 250,
}) => {
  const [isFocused, setIsFocused] = useState(false)

  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value, setInputValue])

  const handleClickSuggestion = (suggestion: string) => {
    setInputValue(suggestion)

    onSubmit(suggestion)
    setIsFocused(false)
  }

  const handleClickOutside = e => {
    const didClickSuggestion =
      e.target.classList.contains(SUGGESTION_CLASS) ||
      e.target.parentNode.classList.contains(SUGGESTION_CLASS)

    if (!didClickSuggestion) {
      setIsFocused(false)
    }
  }

  const isValid = (i: string): boolean =>
    validFunction ? validFunction(i) : isDurationParseable(i)

  let inputStatus = controlledStatus || ComponentStatus.Default

  if (inputStatus === ComponentStatus.Default && !isValid(inputValue)) {
    inputStatus = ComponentStatus.Error
  }

  const onChange = (i: string) => {
    setInputValue(i)
    if (submitInvalid || (!submitInvalid && isValid(i))) {
      onSubmit(i)
    }
  }

  return (
    <div className={`duration-input ${customClass}`}>
      <ClickOutside onClickOutside={handleClickOutside}>
        <Input
          placeholder={placeholder}
          value={inputValue}
          status={inputStatus}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyPress={evt => {
            if (evt.key === 'Enter') {
              setIsFocused(false)
            }
          }}
          testID={testID}
        />
      </ClickOutside>
      {isFocused && (
        <DropdownMenu
          className="duration-input--menu"
          noScrollX={true}
          maxHeight={menuMaxHeight}
        >
          {showDivider && dividerText && dividerOnClick && (
            <Dropdown.Item
              value="Customize"
              key="Customize"
              onClick={dividerOnClick}
              className={SUGGESTION_CLASS}
              testID="custom-duration-input-button"
            >
              {dividerText}
            </Dropdown.Item>
          )}
          <DropdownDivider text="" />
          {suggestions.map(s => (
            <DropdownItem
              key={s}
              value={s}
              className={SUGGESTION_CLASS}
              onClick={handleClickSuggestion}
            >
              {s}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </div>
  )
}

export default DurationInput
