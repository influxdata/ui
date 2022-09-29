import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import WaitingText from 'src/shared/components/WaitingText'
import SelectorList from 'src/timeMachine/components/SelectorList'

// Contexts
import {FieldsContext} from 'src/dataExplorer/context/fields'
import {FluxQueryBuilderContext} from 'src/dataExplorer/context/fluxQueryBuilder'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Types
import {RemoteDataState} from 'src/types'

// Syles
import './Schema.scss'

// Utils
import {
  LOAD_MORE_LIMIT_INITIAL,
  LOAD_MORE_LIMIT,
} from 'src/dataExplorer/shared/utils'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const FIELD_TOOLTIP = `Fields and Field Values are non-indexed \
key values pairs within a measurement. For SQL users, this is \
conceptually similar to a non-indexed column and value.`

const FieldSelector: FC = () => {
  const {fields, loading} = useContext(FieldsContext)
  const {selectField, searchTerm} = useContext(FluxQueryBuilderContext)
  const {selection} = useContext(PersistanceContext)
  const [fieldsToShow, setFieldsToShow] = useState([])

  const handleSelectField = (field: string) => {
    event('handleSelectField', {searchTerm: searchTerm.length})
    selectField(field)
  }

  useEffect(() => {
    // Reset
    setFieldsToShow(fields.slice(0, LOAD_MORE_LIMIT_INITIAL))
  }, [fields])

  let list: JSX.Element | JSX.Element[] = (
    <div
      className="field-selector--list-item"
      data-testid="field-selector--list-item"
    >
      No Fields Found
    </div>
  )

  if (loading === RemoteDataState.Error) {
    list = (
      <div
        className="field-selector--list-item"
        data-testid="field-selector--list-item"
      >
        Failed to load fields
      </div>
    )
  } else if (
    loading === RemoteDataState.Loading ||
    loading === RemoteDataState.NotStarted
  ) {
    list = (
      <div
        className="field-selector--list-item"
        data-testid="field-selector--list-item"
      >
        <WaitingText text="Loading fields" />
      </div>
    )
  } else if (loading === RemoteDataState.Done && fieldsToShow.length) {
    if (isFlagEnabled('schemaComposition')) {
      list = (
        <SelectorList
          items={fieldsToShow}
          selectedItems={selection.fields}
          onSelectItem={handleSelectField}
          multiSelect={true}
        />
      )
    } else {
      list = fieldsToShow.map(field => (
        <dd
          key={field}
          className="field-selector--list-item--selectable"
          data-testid="field-selector--list-item--selectable"
          onClick={() => handleSelectField(field)}
        >
          <code>{field}</code>
        </dd>
      ))
    }
  }

  const handleLoadMore = useCallback(() => {
    const newIndex = fieldsToShow.length + LOAD_MORE_LIMIT
    setFieldsToShow(fields.slice(0, newIndex))
  }, [fieldsToShow, fields, setFieldsToShow])

  return useMemo(() => {
    const shouldLoadMore =
      fieldsToShow.length < fields.length && loading === RemoteDataState.Done

    const loadMoreButton = shouldLoadMore && (
      <button
        className="field-selector--load-more-button"
        data-testid="field-selector--load-more-button"
        onClick={handleLoadMore}
      >
        + Load more
      </button>
    )

    return (
      <Accordion
        className="field-selector"
        expanded={true}
        testID="field-selector"
      >
        <Accordion.AccordionHeader className="field-selector--header">
          <SelectorTitle label="Fields" tooltipContents={FIELD_TOOLTIP} />
        </Accordion.AccordionHeader>
        <div
          className="container-side-bar--fields"
          data-testid="container-side-bar--fields"
        >
          {list}
          {loadMoreButton}
        </div>
      </Accordion>
    )
  }, [fields, list, handleLoadMore])
}

export default FieldSelector
