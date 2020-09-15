// Libraries
import React, {FC, useContext, useState, useRef, KeyboardEvent} from 'react'

// Components
import {
  Input,
  InputRef,
  IconFont,
  ComponentSize,
  ClickOutside,
} from '@influxdata/clockface'
import FieldsList from 'src/notebooks/pipes/Data/FieldsList'

// Contexts
import {SchemaContext} from 'src/notebooks/context/schemaProvider'

// Utils
import {event} from 'src/cloud/utils/reporting'

const SearchBar: FC = () => {
  const inputRef = useRef<InputRef>(null)
  const [isFocused, setFocused] = useState<boolean>(false)
  const {searchTerm, setSearchTerm} = useContext(SchemaContext)

  const handleSetSearch = (text: string): void => {
    event('Searching in Flow Query Builder')
    setSearchTerm(text)
  }

  const handleShowSuggestions = (): void => {
    setFocused(true)
  }

  const handleHideSuggestions = (): void => {
    setFocused(false)
  }

  const handleRefocusInput = (): void => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleInputKey = (e: KeyboardEvent<InputRef>): void => {
    if (e.key === 'Escape') {
      if (inputRef.current) {
        inputRef.current.blur()
      }
      handleHideSuggestions()
    }
  }

  return (
    <ClickOutside onClickOutside={handleHideSuggestions}>
      <div className="tag-selector--search" onClick={handleRefocusInput}>
        <Input
          ref={inputRef}
          icon={IconFont.Search}
          size={ComponentSize.Medium}
          value={searchTerm}
          placeholder="Filter data by Measurement, Field, or Tag ..."
          onChange={e => handleSetSearch(e.target.value)}
          onFocus={handleShowSuggestions}
          autoFocus={true}
          onKeyDown={handleInputKey}
        />
        {isFocused && <FieldsList />}
      </div>
    </ClickOutside>
  )
}

export default SearchBar
