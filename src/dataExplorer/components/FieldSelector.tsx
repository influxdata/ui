import React, {FC, useContext, useEffect, useMemo, useState} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Contexts
import {LOCAL_LIMIT} from 'src/dataExplorer/context/newDataExplorer'
import {FieldContext} from 'src/dataExplorer/context/fields'
import WaitingText from 'src/shared/components/WaitingText'

// Types
import {RemoteDataState} from 'src/types'

// Syles
import './Schema.scss'

const FieldSelector: FC = () => {
  const {fields, loading} = useContext(FieldContext)
  const [fieldsToShow, setFieldsToShow] = useState([])

  useEffect(() => {
    // Reset
    setFieldsToShow(fields.slice(0, LOCAL_LIMIT))
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
      <div key={field} className="field-selector--list-item">
        {field}
      </div>
    ))
  }

  const handleLoadMore = () => {
    const newIndex = fieldsToShow.length + LOCAL_LIMIT
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
      <Accordion className="field-selector" expanded={true}>
        <Accordion.AccordionHeader className="field-selector--header">
          <SelectorTitle title="Fields" info="Test info" />
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
