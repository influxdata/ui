// Libraries
import React, {PureComponent, ChangeEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  AlignItems,
  ComponentSize,
  FlexBox,
  FlexDirection,
  Input,
  List,
} from '@influxdata/clockface'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'
import WaitingText from 'src/shared/components/WaitingText'
import SelectorList from 'src/timeMachine/components/SelectorList'
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

// Actions
import {
  addTagSelector,
  searchTagKeys,
  searchTagValues,
  selectTagKey,
  selectTagValue,
  loadTagSelector,
  removeTagSelector,
} from 'src/timeMachine/actions/queryBuilderThunks'
import {setBuilderTagValuesSelection} from 'src/timeMachine/actions/queryBuilder'

import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import {
  setBuilderAggregateFunctionType,
  setKeysSearchTerm,
  setValuesSearchTerm,
} from 'src/timeMachine/actions/queryBuilder'

// Utils
import DefaultDebouncer from 'src/shared/utils/debouncer'
import {toComponentStatus} from 'src/shared/utils/toComponentStatus'
import {
  getActiveQuery,
  getActiveTimeMachine,
  getIsInCheckOverlay,
} from 'src/timeMachine/selectors'
import {event} from 'src/cloud/utils/reporting'

// Types
import {
  AppState,
  BuilderAggregateFunctionType,
  RemoteDataState,
} from 'src/types'
import TagSelectorCount from 'src/shared/components/TagSelectorCount'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

const SEARCH_DEBOUNCE_MS = 500

// We don't show these columns in results but they're able to be grouped on for most queries
const ADDITIONAL_GROUP_BY_COLUMNS = ['_start', '_stop', '_time']

interface OwnProps {
  index: number
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

@ErrorHandling
class TagSelector extends PureComponent<Props> {
  private debouncer = new DefaultDebouncer()

  private renderAggregateFunctionType(
    aggregateFunctionType: BuilderAggregateFunctionType
  ) {
    if (aggregateFunctionType === 'group') {
      return 'Group'
    }
    return 'Filter'
  }

  public render() {
    return <BuilderCard>{this.body}</BuilderCard>
  }

  private get isCompliant() {
    const {
      index,
      selectedKey,
      selectedValues,
      aggregateFunctionType,
    } = this.props

    return (
      isFlagEnabled('newQueryBuilder') &&
      index === 0 &&
      (selectedKey === '' || selectedKey === '_measurement') &&
      aggregateFunctionType !== 'group' &&
      (isFlagEnabled('measurementMultiselect') || selectedValues.length <= 1)
    )
  }

  private get body() {
    const {
      aggregateFunctionType,
      index,
      keys,
      keysStatus,
      selectedKey,
      emptyText,
      valuesSearchTerm,
      keysSearchTerm,
    } = this.props

    if (keysStatus === RemoteDataState.NotStarted) {
      return <BuilderCard.Empty>{emptyText}</BuilderCard.Empty>
    }

    if (keysStatus === RemoteDataState.Error) {
      return <BuilderCard.Empty>Failed to load tag keys</BuilderCard.Empty>
    }

    if (keysStatus === RemoteDataState.Done && !keys.length) {
      return (
        <BuilderCard.Empty testID="empty-tag-keys">
          No tag keys found <small>in the current time range</small>
        </BuilderCard.Empty>
      )
    }

    let tag = selectedKey

    if (tag === '' && index === 0) {
      tag = '_measurement'
    }

    let placeholderValue = `${tag} tag values`

    if (isFlagEnabled('newQueryBuilder')) {
      if (tag === '_measurement') {
        placeholderValue = 'measurements'
      } else if (tag === '_field') {
        placeholderValue = 'fields'
      }
    }

    const placeholderText =
      aggregateFunctionType === 'group'
        ? 'Search group column values'
        : `Search ${placeholderValue}`

    return (
      <>
        {!this.isCompliant && (
          <BuilderCard.DropdownHeader
            options={['filter', 'group']}
            selectedOption={this.renderAggregateFunctionType(
              aggregateFunctionType
            )}
            onDelete={index !== 0 && this.handleRemoveTagSelector}
            onSelect={this.handleAggregateFunctionSelect}
            isInCheckOverlay={this.props.isInCheckOverlay}
          />
        )}
        {this.isCompliant && <BuilderCard.Header title="Measurement" />}
        <BuilderCard.Menu testID={`tag-selector--container ${index}`}>
          {!this.isCompliant && (
            <>
              {aggregateFunctionType !== 'group' && (
                <FlexBox
                  direction={FlexDirection.Row}
                  alignItems={AlignItems.Center}
                  margin={ComponentSize.Small}
                >
                  <ErrorBoundary>
                    {!this.isCompliant && (
                      <SearchableDropdown
                        searchTerm={keysSearchTerm}
                        emptyText="No Tags Found"
                        searchPlaceholder="Search keys"
                        buttonStatus={toComponentStatus(keysStatus)}
                        selectedOption={selectedKey}
                        onSelect={this.handleSelectTag}
                        onChangeSearchTerm={this.handleKeysSearch}
                        testID="tag-selector--dropdown"
                        buttonTestID="tag-selector--dropdown-button"
                        menuTestID="tag-selector--dropdown-menu"
                        options={keys}
                      />
                    )}
                  </ErrorBoundary>
                  {this.selectedCounter}
                </FlexBox>
              )}
            </>
          )}
          <Input
            value={valuesSearchTerm}
            placeholder={placeholderText}
            className="tag-selector--search"
            onChange={this.handleValuesSearch}
            onClear={this.clearSearch}
          />
        </BuilderCard.Menu>
        {this.values}
      </>
    )
  }

  private toggleSelectAll() {
    const {
      selectedValues,
      onSetBuilderTagValuesSelection,
      onAddTagSelector,
      onRemoveTagSelector,
      index,
      isLast,
      shouldClearLast,
      onLoadTagSelector,
    } = this.props

    if (selectedValues.length === 1 && selectedValues[0] === '_all') {
      onSetBuilderTagValuesSelection(0, [])

      if (shouldClearLast) {
        onRemoveTagSelector(index + 1)
      }
    } else {
      onSetBuilderTagValuesSelection(0, ['_all'])

      if (isLast) {
        onAddTagSelector()
      } else {
        onLoadTagSelector(index + 1)
      }
    }
  }

  private get values() {
    const {selectedKey, values, valuesStatus, selectedValues} = this.props

    if (valuesStatus === RemoteDataState.Error) {
      return (
        <BuilderCard.Empty>
          {`Failed to load tag values for ${selectedKey}`}
        </BuilderCard.Empty>
      )
    }

    if (
      valuesStatus === RemoteDataState.Loading ||
      valuesStatus === RemoteDataState.NotStarted
    ) {
      return (
        <BuilderCard.Empty>
          <WaitingText text="Loading tag values" />
        </BuilderCard.Empty>
      )
    }

    if (valuesStatus === RemoteDataState.Done && !values.length) {
      return (
        <BuilderCard.Empty>
          No values found <small>in the current time range</small>
        </BuilderCard.Empty>
      )
    }

    // underscore values are not allowed for user data
    // so there shouldn't be collisions
    const selectedAll =
      selectedValues.length === 1 && selectedValues[0] === '_all'

    return (
      <SelectorList
        items={values.filter(t => t !== '_all')}
        selectedItems={selectedValues}
        onSelectItem={this.handleSelectValue}
        multiSelect={
          !this.props.isInCheckOverlay ||
          (this.isCompliant && isFlagEnabled('measurementMultiselect'))
        }
        disabled={selectedAll}
      >
        {this.isCompliant && isFlagEnabled('measurementMultiselect') && (
          <List.Item
            className="selector-list--item select-all"
            testID="selector-list --select-all"
            key="_all"
            value="_all"
            onClick={() => this.toggleSelectAll()}
            title="Select All"
            selected={selectedAll}
            size={ComponentSize.ExtraSmall}
          >
            <List.Indicator type="checkbox" />
            All Measurements
          </List.Item>
        )}
      </SelectorList>
    )
  }

  private get selectedCounter(): JSX.Element {
    const {selectedValues} = this.props

    if (selectedValues.length > 0) {
      return <TagSelectorCount count={selectedValues.length} />
    }
  }

  private handleSelectTag = (tag: string): void => {
    const {index, keysSearchTerm, onSelectTag} = this.props
    event('handleSelectTag', {searchTerm: keysSearchTerm.length})

    onSelectTag(index, tag)
  }

  private handleSelectValue = (value: string): void => {
    const {index, valuesSearchTerm, onSelectValue} = this.props
    event('handleSelectValue', {searchTerm: valuesSearchTerm.length})

    onSelectValue(index, value)
  }

  private handleRemoveTagSelector = (): void => {
    const {index, onRemoveTagSelector} = this.props
    event('tagKeyRemoved')

    onRemoveTagSelector(index)
  }

  private handleKeysSearch = (value: string) => {
    const {onSetKeysSearchTerm, index} = this.props

    onSetKeysSearchTerm(index, value)
    this.debouncer.call(this.emitKeysSearch, SEARCH_DEBOUNCE_MS)
  }

  private emitKeysSearch = () => {
    const {index, onSearchKeys} = this.props

    onSearchKeys(index)
  }

  private handleValuesSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    this.doSearch(value)
  }

  private clearSearch = () => {
    this.doSearch('')
  }

  private doSearch = (searchTerm: string) => {
    const {onSetValuesSearchTerm, index} = this.props

    onSetValuesSearchTerm(index, searchTerm)
    this.debouncer.call(this.emitValuesSearch, SEARCH_DEBOUNCE_MS)
  }

  private emitValuesSearch = () => {
    const {index, onSearchValues} = this.props

    onSearchValues(index)
  }

  private handleAggregateFunctionSelect = (
    option: BuilderAggregateFunctionType
  ) => {
    const {index, onSetBuilderAggregateFunctionType} = this.props
    onSetBuilderAggregateFunctionType(option, index)
  }
}

const mstp = (state: AppState, ownProps: OwnProps) => {
  const activeQueryBuilder = getActiveTimeMachine(state).queryBuilder
  let keys = []
  let keysSearchTerm = ''
  let keysStatus = RemoteDataState.NotStarted
  let valuesSearchTerm = ''
  let valuesStatus = RemoteDataState.NotStarted
  let values = []
  if (activeQueryBuilder?.tags[ownProps?.index]) {
    const currentTags = activeQueryBuilder.tags[ownProps.index]
    keys = currentTags.keys
    keysSearchTerm = currentTags.keysSearchTerm
    keysStatus = currentTags.keysStatus
    valuesSearchTerm = currentTags.valuesSearchTerm
    valuesStatus = currentTags.valuesStatus
    values = currentTags.values
  }

  const tags = getActiveQuery(state).builderConfig.tags

  let emptyText: string = ''
  const previousTagSelector = tags[ownProps.index - 1]
  if (previousTagSelector && previousTagSelector.key) {
    emptyText = `Select a ${previousTagSelector.key} value first`
  }

  const {
    key: selectedKey,
    values: selectedValues,
    aggregateFunctionType,
  } = tags[ownProps.index]

  if (aggregateFunctionType === 'group') {
    values = [...ADDITIONAL_GROUP_BY_COLUMNS, ...tags.map(tag => tag.key)]
  }
  const isInCheckOverlay = getIsInCheckOverlay(state)
  const isLast = ownProps.index === tags.length - 1
  const shouldClearLast =
    ownProps.index === tags.length - 2 && !tags[tags.length - 1].values.length

  return {
    aggregateFunctionType,
    emptyText,
    keys,
    keysStatus,
    selectedKey,
    values,
    valuesStatus,
    selectedValues,
    valuesSearchTerm,
    keysSearchTerm,
    isInCheckOverlay,
    isLast,
    shouldClearLast,
  }
}

const mdtp = {
  onRemoveTagSelector: removeTagSelector,
  onSearchKeys: searchTagKeys,
  onSearchValues: searchTagValues,
  onSelectTag: selectTagKey,
  onSelectValue: selectTagValue,
  onSetBuilderAggregateFunctionType: setBuilderAggregateFunctionType,
  onSetKeysSearchTerm: setKeysSearchTerm,
  onSetValuesSearchTerm: setValuesSearchTerm,
  onSetBuilderTagValuesSelection: setBuilderTagValuesSelection,
  onAddTagSelector: addTagSelector,
  onLoadTagSelector: loadTagSelector,
}

const connector = connect(mstp, mdtp)

export default connector(TagSelector)
