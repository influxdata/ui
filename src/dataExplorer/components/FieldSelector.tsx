import React, {FC, useContext, useEffect, useState} from 'react'
import {concat, slice} from 'lodash'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'

// Contexts
import {
  NewDataExplorerContext,
  LOCAL_LIMIT,
} from 'src/dataExplorer/context/newDataExplorer'
import WaitingText from 'src/shared/components/WaitingText'

// Types
import {RemoteDataState} from 'src/types'

// Syles
import './Schema.scss'

const FieldSelector: FC = () => {
  const {fields, loadingFields} = useContext(NewDataExplorerContext)
  const [fieldsToShow, setFieldsToShow] = useState([])
  const [loadMore, setLoadMore] = useState(false)
  const [index, setIndex] = useState(LOCAL_LIMIT)

  useEffect(() => {
    if (fields.length === 0) {
      setFieldsToShow([])
      setLoadMore(false)
      setIndex(LOCAL_LIMIT)
    } else {
      const newFieldsToShow = slice(fields, 0, index)
      const newLoadMore = fields.length > LOCAL_LIMIT
      setFieldsToShow(newFieldsToShow)
      setLoadMore(newLoadMore)
    }
  }, [fields])

  let list: JSX.Element | JSX.Element[] = (
    <div className="field-selector--list-item">No Fields Found</div>
  )

  if (loadingFields === RemoteDataState.Error) {
    list = (
      <div className="field-selector--list-item">Failed to load fields</div>
    )
  } else if (
    loadingFields === RemoteDataState.Loading ||
    loadingFields === RemoteDataState.NotStarted
  ) {
    list = <WaitingText text="Loading fields" />
  } else if (loadingFields === RemoteDataState.Done && fields.length) {
    list = fieldsToShow.map(field => (
      <div key={field} className="field-selector--list-item">
        {field}
      </div>
    ))
  }

  const handleLoadMore = () => {
    const newIndex = index + LOCAL_LIMIT
    if (loadMore) {
      // Add more field values to show
      const newFieldsToShow = concat(
        fieldsToShow,
        slice(fields, index, newIndex)
      )
      setFieldsToShow(newFieldsToShow)
    }
    const newLoadMore = newIndex < fields.length
    setLoadMore(newLoadMore)
    setIndex(newIndex)
  }

  const loadMoreButton = loadMore && (
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
}

export default FieldSelector
