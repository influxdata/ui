// Libraries
import React, {PureComponent} from 'react'
import memoizeOne from 'memoize-one'

// Components
import {ResourceList} from '@influxdata/clockface'
import TaskCard from 'src/tasks/components/TaskCard'

// Types
import EmptyTasksList from 'src/tasks/components/EmptyTasksList'
import {Task} from 'src/types'
import {SortTypes} from 'src/shared/utils/sort'
import {Sort} from '@influxdata/clockface'
import {TaskSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

// Selectors
import {getSortedResources} from 'src/shared/utils/sort'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {CLOUD} from 'src/shared/constants'

let getPinnedItems
if (CLOUD) {
  getPinnedItems = require('src/shared/contexts/pinneditems').getPinnedItems
}

interface Props {
  tasks: Task[]
  searchTerm: string
  onActivate: (task: Task) => void
  onDelete: (task: Task) => void
  onCreate: () => void
  onClone: (task: Task) => void
  onFilterChange: (searchTerm: string) => void
  totalCount: number
  onAddTaskLabel: any
  onRunTask: any
  onUpdate: (name: string, taskID: string) => void
  filterComponent?: JSX.Element
  sortKey: TaskSortKey
  sortDirection: Sort
  sortType: SortTypes
  checkTaskLimits: any
}

interface State {
  taskLabelsEdit: Task
  isEditingTaskLabels: boolean
  pinnedItems: any[]
}

export default class TasksList extends PureComponent<Props, State> {
  private memGetSortedResources = memoizeOne<typeof getSortedResources>(
    getSortedResources
  )

  constructor(props) {
    super(props)
    this.state = {
      taskLabelsEdit: null,
      isEditingTaskLabels: false,
      pinnedItems: [],
    }
  }

  public componentDidMount() {
    this.props.checkTaskLimits()
    if (CLOUD && isFlagEnabled('pinnedItems')) {
      getPinnedItems()
        .then(res => this.setState(prev => ({...prev, pinnedItems: res})))
        .catch(err => console.error(err))
    }
  }

  public render() {
    const {searchTerm, totalCount} = this.props

    return (
      <>
        <ResourceList>
          <ResourceList.Body
            emptyState={
              <EmptyTasksList
                searchTerm={searchTerm}
                onCreate={this.onCreate}
                totalCount={totalCount}
              />
            }
          >
            {this.rows}
          </ResourceList.Body>
        </ResourceList>
      </>
    )
  }

  private onCreate = () => {
    event('Task Created From Dropdown', {source: 'list'})
    this.props.onCreate()
  }

  private get rows(): JSX.Element[] {
    const {
      tasks,
      sortKey,
      sortDirection,
      sortType,
      onActivate,
      onDelete,
      onClone,
      onUpdate,
      onRunTask,
      onFilterChange,
    } = this.props

    const sortedTasks = this.memGetSortedResources(
      tasks,
      sortKey,
      sortDirection,
      sortType
    )

    return sortedTasks.map(task => (
      <TaskCard
        key={`task-id--${task.id}`}
        task={task}
        onActivate={onActivate}
        onDelete={onDelete}
        onClone={onClone}
        onUpdate={onUpdate}
        onRunTask={onRunTask}
        onFilterChange={onFilterChange}
        isPinned={
          this.state.pinnedItems?.length &&
          !!this.state.pinnedItems.find(
            item => item?.metadata.taskID === task.id
          )
        }
      />
    ))
  }
}
