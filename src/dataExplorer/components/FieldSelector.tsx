import React, {FC, useContext, useEffect, useMemo, useState} from 'react'

// Components
import {Accordion, ComponentSize, TextBlock} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import WaitingText from 'src/shared/components/WaitingText'

// Contexts
import {FieldsContext} from 'src/dataExplorer/context/fields'

// Types
import {RemoteDataState} from 'src/types'

// Syles
import './Schema.scss'

// Utils
import {
  LOAD_MORE_LIMIT_INITIAL,
  LOAD_MORE_LIMIT,
} from 'src/dataExplorer/shared/utils'

const FIELD_TOOLTIP = `Fields and Field Values are non-indexed \
key values pairs within a measurement. For SQL users, this is \
conceptually similar to a non-indexed column and value.`

const FieldSelector: FC = () => {
  const {fields, loading} = useContext(FieldsContext)
  const [fieldsToShow, setFieldsToShow] = useState([])

  useEffect(() => {
    // Reset
    setFieldsToShow(fields.slice(0, LOAD_MORE_LIMIT_INITIAL))
  }, [fields])

  let list: JSX.Element | JSX.Element[] = (
    <div className="field-selector--list-item">No Fields Found</div>
  )

  if (loading === RemoteDataState.Error) {
    list = (
      <div className="field-selector--list-item">Failed to load fields</div>
    )
  } else if (
    loading === RemoteDataState.Loading ||
    loading === RemoteDataState.NotStarted
  ) {
    list = <WaitingText text="Loading fields" />
  } else if (loading === RemoteDataState.Done && fieldsToShow.length) {
    list = fieldsToShow.map(field => (
      <div key={field} className="field-selector--list-item--selectable">
        <TextBlock text={field} size={ComponentSize.ExtraSmall} />
      </div>
    ))
  }

  const handleLoadMore = () => {
    const newIndex = fieldsToShow.length + LOAD_MORE_LIMIT
    setFieldsToShow(fields.slice(0, newIndex))
  }

  return useMemo(() => {
    const shouldLoadMore = fieldsToShow.length < fields.length
    const loadMoreButton = shouldLoadMore && (
      <div className="load-more-button" onClick={handleLoadMore}>
        + Load more
      </div>
    )

    return (
      <Accordion
        className="field-selector"
        expanded={true}
        testID="field-selector"
      >
        <Accordion.AccordionHeader className="field-selector--header">
          <SelectorTitle title="Fields" info={FIELD_TOOLTIP} />
        </Accordion.AccordionHeader>
        <div className="container-side-bar">
          {list}
          {loadMoreButton}
        </div>
      </Accordion>
    )
  }, [fields, list])
}

export default FieldSelector
