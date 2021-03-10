// Libraries
import React, {ChangeEvent, FC, useState, useRef, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Components
import {
  IconFont,
  Input,
  InputRef,
  List,
  ClickOutside,
  Dropdown,
} from '@influxdata/clockface'
import {AnnotationsSearchBarItem} from 'src/annotations/components/controlBar/AnnotationsSearchBarItem'

// Actions
import {enableAnnotationStream} from 'src/annotations/actions/creators'
import {fetchAndSetAnnotationStreams} from 'src/annotations/actions/thunks'
// Selectors
import {
  getAnnotationStreams,
  getHiddenAnnotationStreams,
} from 'src/annotations/selectors'

// Styles
import 'src/annotations/components/controlBar/AnnotationsSearchBar.scss'

export const AnnotationsSearchBar: FC = () => {
  const dispatch = useDispatch()
  const inputRef = useRef<InputRef>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [suggestionsAreVisible, setSuggestionState] = useState<boolean>(false)

  useEffect(() => {
    dispatch(fetchAndSetAnnotationStreams)
  }, [dispatch])

  const annotationStreams = useSelector(getAnnotationStreams)
  const hiddenStreams = useSelector(getHiddenAnnotationStreams)

  const filteredSuggestions = annotationStreams.filter(annotationStream => {
    return (
      annotationStream.stream
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      hiddenStreams.includes(annotationStream.stream.toLowerCase())
    )
  })

  const handleInputChange = (e: ChangeEvent<InputRef>): void => {
    setSearchTerm(e.target.value)
  }

  const handleStartSuggesting = (): void => {
    setSuggestionState(true)
  }

  const handleStopSuggesting = (): void => {
    setSuggestionState(false)
  }

  const handleSuggestionClick = (id: string): void => {
    dispatch(enableAnnotationStream(id))
    inputRef.current?.focus()
  }

  let suggestionItems = (
    <List.EmptyState>No streams match your search</List.EmptyState>
  )

  if (filteredSuggestions.length) {
    suggestionItems = (
      <>
        {filteredSuggestions.map(item => (
          <AnnotationsSearchBarItem
            key={item.stream}
            name={item.stream}
            id={item.stream}
            description={item.description}
            color="#9078E4"
            onClick={handleSuggestionClick}
          />
        ))}
      </>
    )
  } else if (!searchTerm) {
    suggestionItems = <List.EmptyState>All streams are enabled</List.EmptyState>
  }

  return (
    <ClickOutside onClickOutside={handleStopSuggesting}>
      <div className="annotations-searchbar">
        <Input
          ref={inputRef}
          placeholder="Search to enable annotation streams.."
          icon={IconFont.Search}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleStartSuggesting}
          testID="annotations-search-input"
        />
        {suggestionsAreVisible && (
          <Dropdown.Menu className="annotations-searchbar--suggestions">
            <List style={{width: '100%'}}>{suggestionItems}</List>
          </Dropdown.Menu>
        )}
      </div>
    </ClickOutside>
  )
}
