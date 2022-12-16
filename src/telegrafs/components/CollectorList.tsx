// Libraries
import React, {PureComponent, FC, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {ResourceList} from '@influxdata/clockface'
import CollectorRow from 'src/telegrafs/components/CollectorCard'
import {FilterListContainer} from 'src/shared/components/FilterList'

// Types
import {Sort} from '@influxdata/clockface'
import {SortTypes, getSortedResources} from 'src/shared/utils/sort'
import {AppState, Telegraf, ResourceType} from 'src/types'
import {updateTelegraf, deleteTelegraf} from 'src/telegrafs/actions/thunks'

// Selectors
import {getAll} from 'src/resources/selectors'

interface OwnProps {
  emptyState: JSX.Element
  sortKey: string
  sortDirection: Sort
  sortType: SortTypes
  onFilterChange: (searchTerm: string) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const CollectorList: FC<Props> = React.memo(
  ({
    collectors,
    emptyState,
    sortKey,
    sortDirection,
    sortType,
    onFilterChange,
    onDeleteTelegraf,
    onUpdateTelegraf,
  }) => {
    const sortedCollectors = useMemo(
      () => getSortedResources(collectors, sortKey, sortDirection, sortType),
      [collectors, sortKey, sortDirection, sortType]
    )

    const collectorsList = (): JSX.Element[] => {
      if (collectors !== undefined) {
        return sortedCollectors.map(collector => (
          <CollectorRow
            key={collector.id}
            collector={collector}
            onDelete={(telegraf: Telegraf) =>
              onDeleteTelegraf(telegraf.id, telegraf.name)
            }
            onUpdate={onUpdateTelegraf}
            onFilterChange={onFilterChange}
          />
        ))
      }
    }

    return (
      <ResourceList>
        <ResourceList.Body emptyState={emptyState}>
          {collectorsList()}
        </ResourceList.Body>
      </ResourceList>
    )
  }
)

const mstp = (state: AppState) => ({
  collectors: getAll<Telegraf>(state, ResourceType.Telegrafs),
})

const mdtp = {
  onUpdateTelegraf: updateTelegraf,
  onDeleteTelegraf: deleteTelegraf,
}

type FilteredOwnProps = OwnProps & {
  searchTerm: string
}

type FilteredProps = Props & FilteredOwnProps

const FilterTelegrafs = FilterListContainer<Telegraf>()
class FilteredCollectorList extends PureComponent<FilteredProps> {
  render() {
    const {
      searchTerm,
      collectors,
      emptyState,
      onFilterChange,
      sortKey,
      sortDirection,
      sortType,
      onUpdateTelegraf,
      onDeleteTelegraf,
    } = this.props
    return (
      <FilterTelegrafs
        searchTerm={searchTerm}
        searchKeys={['metadata.buckets[]', 'name', 'labels[].name']}
        list={collectors}
      >
        {cs => (
          <CollectorList
            collectors={cs}
            emptyState={emptyState}
            onFilterChange={onFilterChange}
            sortKey={sortKey}
            sortDirection={sortDirection}
            sortType={sortType}
            onUpdateTelegraf={onUpdateTelegraf}
            onDeleteTelegraf={onDeleteTelegraf}
          />
        )}
      </FilterTelegrafs>
    )
  }
}

const connector = connect(mstp, mdtp)

const FilteredList = connector(FilteredCollectorList)

export {FilteredCollectorList, FilteredList}
