import React, {FC, useContext, useEffect, useState} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import WaitingText from 'src/shared/components/WaitingText'

// Contexts
import {
  LOCAL_LIMIT,
  NewDataExplorerContext,
} from 'src/dataExplorer/context/newDataExplorer'

// Types
import {RemoteDataState} from 'src/types'

interface Prop {
  loading: RemoteDataState
  tagKey: string
  tagValues: string[]
  onSelectTagKey: (key: string) => void
  onSelectTagValue: (value: string) => void
}

const TagValues: FC<Prop> = ({
  loading,
  tagKey,
  tagValues,
  onSelectTagKey,
  onSelectTagValue,
}) => {
  const [valuesToShow, setValuesToShow] = useState([])
  const [loadMore, setLoadMore] = useState(false)
  const [index, setIndex] = useState(LOCAL_LIMIT)

  useEffect(() => {
    if (tagValues.length === 0) {
      // Reset
      setValuesToShow([])
      setLoadMore(false)
      setIndex(LOCAL_LIMIT)
    } else {
      const newValuesToShow = tagValues.slice(0, index)
      const newLoadMore = tagValues.length > LOCAL_LIMIT
      setValuesToShow(newValuesToShow)
      setLoadMore(newLoadMore)
    }
  }, [tagValues])

  let list: JSX.Element | JSX.Element[] = []

  if (loading === RemoteDataState.Error) {
    list = (
      <div className="tag-selector-value--list-item">
        Failed to load tag values
      </div>
    )
  } else if (
    loading === RemoteDataState.Loading ||
    loading === RemoteDataState.NotStarted
  ) {
    list = <WaitingText text="Loading tag values" />
  } else if (loading === RemoteDataState.Done && tagValues.length) {
    list = valuesToShow.map(value => (
      <div
        className="tag-selector-value--list-item"
        key={value}
        onClick={() => onSelectTagValue(value)}
      >
        {value}
      </div>
    ))
  }

  const handleLoadMore = () => {
    const newIndex = index + LOCAL_LIMIT
    if (loadMore) {
      // Add more tag values to show
      const newValuesToShow = tagValues.slice(0, newIndex)
      setValuesToShow(newValuesToShow)
    }
    const newLoadMore = newIndex < tagValues.length
    setLoadMore(newLoadMore)
    setIndex(newIndex)
  }

  const loadMoreButton = loadMore && (
    <div className="load-more-button" onClick={handleLoadMore}>
      + Load more
    </div>
  )

  return (
    <Accordion className="tag-selector-value">
      <Accordion.AccordionHeader className="tag-selector-value--header">
        <div onClick={() => onSelectTagKey(tagKey)}>
          <SelectorTitle title={tagKey} />
        </div>
      </Accordion.AccordionHeader>
      <div className="container-side-bar">
        {list}
        {loadMoreButton}
      </div>
    </Accordion>
  )
}

const TagSelector: FC = () => {
  const {tags, loadingTagKeys, loadingTagValues, selectTagKey} = useContext(
    NewDataExplorerContext
  )

  const tagKeys: string[] = Object.keys(tags)

  const handleSelectTagKey = (key: string) => {
    if (tags[key].length === 0) {
      // Only need to get tag values if currently no values
      selectTagKey(key)
    }
  }

  const handleSelectTagValue = (value: string) => {
    // TODO
    /* eslint-disable no-console */
    console.log(value)
    /* eslint-disable no-console */
  }

  let list: JSX.Element | JSX.Element[] = (
    <div className="tag-selector-key--list-item">No Tags Found</div>
  )

  if (loadingTagKeys === RemoteDataState.Error) {
    list = (
      <div className="tag-selector-key--list-item">Failed to load tags</div>
    )
  } else if (
    loadingTagKeys === RemoteDataState.Loading ||
    loadingTagKeys === RemoteDataState.NotStarted
  ) {
    list = <WaitingText text="Loading tags" />
  } else if (loadingTagKeys === RemoteDataState.Done && tagKeys.length) {
    list = tagKeys.map(key => {
      return (
        <div key={key} className="tag-selector-key--list-item">
          <TagValues
            tagKey={key}
            tagValues={tags[key]}
            onSelectTagKey={handleSelectTagKey}
            onSelectTagValue={handleSelectTagValue}
            loading={loadingTagValues[key]}
          />
        </div>
      )
    })
  }

  return (
    <Accordion className="tag-selector-key" expanded={true}>
      <Accordion.AccordionHeader className="tag-selector-key--header">
        <SelectorTitle title="Tag Keys" info="Test info" />
      </Accordion.AccordionHeader>
      <div className="container-side-bar">{list}</div>
    </Accordion>
  )
}

export default TagSelector
