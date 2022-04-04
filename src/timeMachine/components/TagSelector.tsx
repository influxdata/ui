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
} from '@influxdata/clockface'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'
import WaitingText from 'src/shared/components/WaitingText'
import SelectorList from 'src/timeMachine/components/SelectorList'
import BuilderCard from 'src/timeMachine/components/builderCard/BuilderCard'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

// Actions
import {
  removeTagSelector,
  searchTagKeys,
  searchTagValues,
  selectTagKey,
  selectTagValue,
} from 'src/timeMachine/actions/queryBuilderThunks'

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
    return (
      <BuilderCard>
        {this.header}
        {this.body}
      </BuilderCard>
    )
  }

  private get header() {
    const {aggregateFunctionType, index, isInCheckOverlay} = this.props

    return (
      <BuilderCard.DropdownHeader
        options={['filter', 'group']}
        selectedOption={this.renderAggregateFunctionType(aggregateFunctionType)}
        onDelete={index !== 0 && this.handleRemoveTagSelector}
        onSelect={this.handleAggregateFunctionSelect}
        isInCheckOverlay={isInCheckOverlay}
      />
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

    const placeholderText =
      aggregateFunctionType === 'group'
        ? 'Search group column values'
        : `Search ${selectedKey} tag values`
    return (
      <>
        <BuilderCard.Menu testID={`tag-selector--container ${index}`}>
          {aggregateFunctionType !== 'group' && (
            <FlexBox
              direction={FlexDirection.Row}
              alignItems={AlignItems.Center}
              margin={ComponentSize.Small}
            >
              <ErrorBoundary>
                <SearchableDropdown
                  searchTerm={keysSearchTerm}
                  emptyText="No Tags Found"
                  searchPlaceholder="Search keys..."
                  buttonStatus={toComponentStatus(keysStatus)}
                  selectedOption={selectedKey}
                  onSelect={this.handleSelectTag}
                  onChangeSearchTerm={this.handleKeysSearch}
                  testID="tag-selector--dropdown"
                  buttonTestID="tag-selector--dropdown-button"
                  menuTestID="tag-selector--dropdown-menu"
                  options={keys}
                />
              </ErrorBoundary>
              {this.selectedCounter}
            </FlexBox>
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

    return (
      <SelectorList
        items={values}
        selectedItems={selectedValues}
        onSelectItem={this.handleSelectValue}
        multiSelect={!this.props.isInCheckOverlay}
      />
    )
  }

  private get selectedCounter(): JSX.Element {
    const {selectedValues} = this.props

    if (selectedValues.length > 0) {
      return <TagSelectorCount count={selectedValues.length} />
    }
  }

  private handleSelectTag = (tag: string): void => {
    const {index, onSelectTag} = this.props

    onSelectTag(index, tag)
  }

  private handleSelectValue = (value: string): void => {
    const {index, onSelectValue} = this.props

    onSelectValue(index, value)
  }

  private handleRemoveTagSelector = (): void => {
    const {index, onRemoveTagSelector} = this.props

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
}

const connector = connect(mstp, mdtp)

export default connector(TagSelector)
