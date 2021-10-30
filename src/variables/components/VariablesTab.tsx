// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {RouteComponentProps, withRouter} from 'react-router-dom'

// Utils
import {deleteVariable} from 'src/variables/actions/thunks'
import {getVariables} from 'src/variables/selectors'

// Components
import {
  Button,
  ButtonShape,
  ComponentColor,
  ComponentSize,
  Dropdown,
  EmptyState,
  FlexBox,
  FlexDirection,
  IconFont,
  JustifyContent,
  Sort,
} from '@influxdata/clockface'
import SearchWidget from 'src/shared/components/search_widget/SearchWidget'
import TabbedPageHeader from 'src/shared/components/tabbed_page/TabbedPageHeader'
import VariableList from 'src/variables/components/VariableList'
import Filter from 'src/shared/components/FilterList'
import AddResourceDropdown from 'src/shared/components/AddResourceDropdown'
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'
import GetResources from 'src/resources/components/GetResources'

// Types
import {AppState, OverlayState, ResourceType, Variable} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {VariableSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

import 'src/shared/components/cta.scss'

type ReduxProps = ConnectedProps<typeof connector>
type Props = RouteComponentProps<{orgID: string}> & ReduxProps

interface State {
  searchTerm: string
  importOverlayState: OverlayState
  sortKey: VariableSortKey
  sortDirection: Sort
  sortType: SortTypes
  selectedVariables: Variable[]
}

const FilterList = Filter<Variable>()

class VariablesTab extends PureComponent<Props, State> {
  public state: State = {
    searchTerm: '',
    importOverlayState: OverlayState.Closed,
    sortKey: 'name',
    sortDirection: Sort.Ascending,
    sortType: SortTypes.String,
    selectedVariables: [],
  }

  public render() {
    const {variables, onDeleteVariable} = this.props
    const {
      searchTerm,
      sortKey,
      sortDirection,
      sortType,
      selectedVariables,
    } = this.state

    const batchDeleteVariables = async (variables: Variable[]) => {
      await variables.forEach(value => {
        onDeleteVariable(value.id)
      })

      this.setState({selectedVariables: []})
      console.log('batch deleted', variables)
    }

    const leftHeaderItems = (
      <>
        <SearchWidget
          placeholderText="Filter variables..."
          searchTerm={searchTerm}
          onSearch={this.handleFilterChange}
        />
        <ResourceSortDropdown
          onSelect={this.handleSort}
          resourceType={ResourceType.Variables}
          sortDirection={sortDirection}
          sortKey={sortKey}
          sortType={sortType}
        />
        <Dropdown
          style={{width: '40px'}}
          button={(active, onClick) => (
            <Button icon={IconFont.More} active={active} onClick={onClick} />
          )}
          menu={() => (
            <Dropdown.Menu style={{width: '200px'}}>
              <Button
                icon={IconFont.Trash_New}
                text={`${selectedVariables.length} selected`}
                onClick={() => {
                  batchDeleteVariables(selectedVariables)
                }}
              />
              <Button
                text="Select All"
                icon={IconFont.Checkmark_New}
                onClick={() => {
                  this.setState({selectedVariables: variables})
                }}
              />
              <Button
                icon={IconFont.Remove_New}
                color={ComponentColor.Danger}
                onClick={() => {
                  this.setState({selectedVariables: []})
                }}
                shape={ButtonShape.Square}
              />
            </Dropdown.Menu>
          )}
        />
      </>
    )

    const rightHeaderItems = (
      <AddResourceDropdown
        resourceName="Variable"
        onSelectImport={this.handleOpenImportOverlay}
        onSelectNew={this.handleOpenCreateOverlay}
      />
    )

    const updateSelectedVariableList = (variable: Variable) => {
      const list = selectedVariables.concat(variable)
      this.setState({selectedVariables: list})
    }

    return (
      <>
        <TabbedPageHeader
          childrenLeft={leftHeaderItems}
          childrenRight={rightHeaderItems}
        />
        <div className="header-cta--batch-operation">
          <div className="header-cta">
            <FlexBox justifyContent={JustifyContent.SpaceBetween} direction={FlexDirection.Row}>
              <Button
                icon={IconFont.Trash_New}
                text={`${selectedVariables.length} selected`}
                onClick={() => {
                  batchDeleteVariables(selectedVariables)
                }}
              />
              <Button
                text="Select All"
                icon={IconFont.Checkmark_New}
                onClick={() => {
                  this.setState({selectedVariables: variables})
                }}
              />
              <Button
                icon={IconFont.Remove_New}
                color={ComponentColor.Danger}
                onClick={() => {
                  this.setState({selectedVariables: []})
                }}
              />
            </FlexBox>
          </div>
        </div>
        <GetResources resources={[ResourceType.Labels]}>
          <FilterList
            searchTerm={searchTerm}
            searchKeys={['name', 'labels[].name']}
            list={variables}
          >
            {variables => (
              <VariableList
                variables={variables}
                emptyState={this.emptyState}
                onDeleteVariable={this.handleDeleteVariable}
                onFilterChange={this.handleFilterUpdate}
                sortKey={sortKey}
                sortDirection={sortDirection}
                sortType={sortType}
                onSelectVariable={updateSelectedVariableList}
              />
            )}
          </FilterList>
        </GetResources>
      </>
    )
  }

  private handleSort = (
    sortKey: VariableSortKey,
    sortDirection: Sort,
    sortType: SortTypes
  ): void => {
    this.setState({sortKey, sortDirection, sortType})
  }

  private get emptyState(): JSX.Element {
    const {searchTerm} = this.state

    if (!searchTerm) {
      return (
        <EmptyState size={ComponentSize.Large}>
          <EmptyState.Text>
            Looks like there aren't any <b>Variables</b>, why not create one?
          </EmptyState.Text>
          <AddResourceDropdown
            resourceName="Variable"
            onSelectImport={this.handleOpenImportOverlay}
            onSelectNew={this.handleOpenCreateOverlay}
          />
        </EmptyState>
      )
    }

    return (
      <EmptyState size={ComponentSize.Large}>
        <EmptyState.Text>No Variables match your query</EmptyState.Text>
      </EmptyState>
    )
  }

  private handleFilterChange = (searchTerm: string) => {
    this.handleFilterUpdate(searchTerm)
  }

  private handleFilterUpdate = (searchTerm: string) => {
    this.setState({searchTerm})
  }

  private handleOpenImportOverlay = (): void => {
    const {history, match} = this.props

    history.push(`/orgs/${match.params.orgID}/settings/variables/import`)
  }

  private handleOpenCreateOverlay = (): void => {
    const {history, match} = this.props

    history.push(`/orgs/${match.params.orgID}/settings/variables/new`)
  }

  private handleDeleteVariable = (variable: Variable): void => {
    const {onDeleteVariable} = this.props
    onDeleteVariable(variable.id)
  }
}

const mstp = (state: AppState) => {
  const variables = getVariables(state)

  return {variables}
}

const mdtp = {
  onDeleteVariable: deleteVariable,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(VariablesTab))
