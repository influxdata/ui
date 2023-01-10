import React, {FC, useContext, useEffect, useMemo, useState} from 'react'

// Components
import {Accordion} from '@influxdata/clockface'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import WaitingText from 'src/shared/components/WaitingText'
import SelectorList from 'src/timeMachine/components/SelectorList'

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
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

const TAG_KEYS_TOOLTIP = `Tags and Tag Values are indexed key values \
pairs within a measurement. For SQL users, this is conceptually \
similar to an indexed column and value.`

interface TagValuesProps {
  loading: RemoteDataState
  tagKey: string
  tagValues: string[]
}

const TagValues: FC<TagValuesProps> = ({loading, tagKey, tagValues}) => {
  const {
    selectedBucket,
    selectedMeasurement,
    selectedTagValues,
    selectTagValue,
    searchTerm,
  } = useContext(FluxQueryBuilderContext)
  const {getTagValues} = useContext(TagsContext)
  const [valuesToShow, setValuesToShow] = useState([])

  useEffect(() => {
    // Reset
    setValuesToShow(tagValues.slice(0, LOAD_MORE_LIMIT_INITIAL))
  }, [tagValues])

  const handleSelectTagValue = (tagValue: string) => {
    // Inject tag key and value into editor
    event('handleSelectTagValue', {searchTerm: searchTerm.length})
    selectTagValue(tagKey, tagValue)
  }

  const handleSelectTagKey = (key: string) => {
    if (tagValues.length > 0) {
      // No need to fetch since tag values
      // have already been in front-end memory
      return
    }

    event('handleSelectTagKey', {searchTerm: searchTerm.length})
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
    list = (
      <div className="tag-selector-value--list-item">
        <WaitingText text="Loading tag values" />
      </div>
    )
  } else if (loading === RemoteDataState.Done && valuesToShow.length) {
    if (isFlagEnabled('schemaComposition')) {
      list = (
        <SelectorList
          items={valuesToShow}
          selectedItems={selectedTagValues[tagKey] ?? []}
          onSelectItem={handleSelectTagValue}
          multiSelect={true}
        />
      )
    } else {
      list = valuesToShow.map(value => (
        <dd
          key={value}
          className="tag-selector-value--list-item--selectable"
          onClick={() => handleSelectTagValue(value)}
          data-testid="tag-selector-value--list-item--selectable"
        >
          <code>{value}</code>
        </dd>
      ))
    }
  }

  const handleLoadMore = () => {
    const newIndex = valuesToShow.length + LOAD_MORE_LIMIT
    setValuesToShow(tagValues.slice(0, newIndex))
  }

  return useMemo(() => {
    const shouldLoadMore =
      valuesToShow.length < tagValues.length && loading === RemoteDataState.Done
    const loadMoreButton = shouldLoadMore && (
      <button
        className="tag-selector-value--load-more-button"
        data-testid="tag-selector-value--load-more-button"
        onClick={handleLoadMore}
      >
        + Load more
      </button>
    )

    return (
      <Accordion className="tag-selector-value">
        <div
          onClick={() => handleSelectTagKey(tagKey)}
          data-testid="tag-selector-value--header-wrapper"
        >
          <Accordion.AccordionHeader className="tag-selector-value--header">
            <SelectorTitle label={tagKey} />
          </Accordion.AccordionHeader>
        </div>
        <div
          className="container-side-bar--tag-values"
          data-testid="container-side-bar--tag-values"
        >
          {list}
          {loadMoreButton}
        </div>
      </Accordion>
    )
  }, [list, selectedTagValues])
}

const TagSelector: FC = () => {
  const {tags, loadingTagKeys, loadingTagValues} = useContext(TagsContext)

  const tagKeys: string[] = Object.keys(tags)

  let list: JSX.Element | JSX.Element[] = (
    <div className="tag-selector--list-item">No Tags Found</div>
  )

  if (loadingTagKeys === RemoteDataState.Error) {
    list = <div className="tag-selector--list-item">Failed to load tags</div>
  } else if (
    loadingTagKeys === RemoteDataState.Loading ||
    loadingTagKeys === RemoteDataState.NotStarted
  ) {
    list = <WaitingText text="Loading tags" />
  } else if (loadingTagKeys === RemoteDataState.Done && tagKeys.length) {
    list = tagKeys.map(key => {
      return (
        <div key={key}>
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
      <Accordion className="tag-selector" expanded={true} testID="tag-selector">
        <Accordion.AccordionHeader className="tag-selector--header">
          <SelectorTitle label="Tag Keys" tooltipContents={TAG_KEYS_TOOLTIP} />
        </Accordion.AccordionHeader>
        <div
          className="container-side-bar--tag-keys"
          data-testid="container-side-bar--tag-keys"
        >
          {list}
        </div>
      </Accordion>
    ),
    [tags, loadingTagKeys, loadingTagValues, list]
  )
}

export default TagSelector
