import React, {FC, useContext, useEffect, useMemo, useState} from 'react'

// Components
import {Accordion, ComponentSize, TextBlock} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import WaitingText from 'src/shared/components/WaitingText'

// Contexts
import {FluxQueryBuilderContext} from 'src/dataExplorer/context/fluxQueryBuilder'
import {TagsContext} from 'src/dataExplorer/context/tags'

// Types
import {RemoteDataState} from 'src/types'

// Utils
import {
  LOAD_MORE_LIMIT_INITIAL,
  LOAD_MORE_LIMIT,
} from 'src/dataExplorer/shared/utils'

const TAG_KEYS_TOOLTIP = `Tags and Tag Values are indexed key values \
pairs within a measurement. For SQL users, this is conceptually \
similar to an indexed column and value.`

interface Prop {
  loading: RemoteDataState
  tagKey: string
  tagValues: string[]
}

const TagValues: FC<Prop> = ({loading, tagKey, tagValues}) => {
  const {selectedBucket, selectedMeasurement, selectTagValue} = useContext(
    FluxQueryBuilderContext
  )
  const {getTagValues} = useContext(TagsContext)
  const [valuesToShow, setValuesToShow] = useState([])

  useEffect(() => {
    // Reset
    setValuesToShow(tagValues.slice(0, LOAD_MORE_LIMIT_INITIAL))
  }, [tagValues])

  const handleSelectTagValue = (tagValue: string) => {
    // Inject tag key and value into editor
    selectTagValue(tagKey, tagValue)
  }

  const handleSelectTagKey = (key: string) => {
    if (tagValues.length > 0) {
      // No need to fetch since tag values
      // have already been in front-end memory
      return
    }

    getTagValues(selectedBucket, selectedMeasurement, key)
  }

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
        key={value}
        className="tag-selector-value--list-item--selectable"
        onClick={() => handleSelectTagValue(value)}
      >
        <TextBlock text={value} size={ComponentSize.ExtraSmall} />
      </div>
    ))
  }

  const handleLoadMore = () => {
    const newIndex = valuesToShow.length + LOAD_MORE_LIMIT
    setValuesToShow(tagValues.slice(0, newIndex))
  }

  return useMemo(() => {
    const shouldLoadMore = valuesToShow.length < tagValues.length
    const loadMoreButton = shouldLoadMore && (
      <div className="load-more-button" onClick={handleLoadMore}>
        + Load more
      </div>
    )

    return (
      <Accordion className="tag-selector-value">
        <div onClick={() => handleSelectTagKey(tagKey)}>
          <Accordion.AccordionHeader className="tag-selector-value--header">
            <SelectorTitle title={tagKey} />
          </Accordion.AccordionHeader>
        </div>
        <div className="container-side-bar">
          {list}
          {loadMoreButton}
        </div>
      </Accordion>
    )
  }, [list])
}

const TagSelector: FC = () => {
  const {tags, loadingTagKeys, loadingTagValues} = useContext(TagsContext)

  const tagKeys: string[] = Object.keys(tags)

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
            loading={loadingTagValues[key]}
          />
        </div>
      )
    })
  }

  return useMemo(
    () => (
      <Accordion
        className="tag-selector-key"
        expanded={true}
        testID="tag-selector-key"
      >
        <Accordion.AccordionHeader className="tag-selector-key--header">
          <SelectorTitle title="Tag Keys" info={TAG_KEYS_TOOLTIP} />
        </Accordion.AccordionHeader>
        <div className="container-side-bar">{list}</div>
      </Accordion>
    ),
    [tags, loadingTagKeys, loadingTagValues, list]
  )
}

export default TagSelector
