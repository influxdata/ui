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
import {getPinnedItems} from 'src/shared/contexts/pinneditems'

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
  onImportTask: () => void
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
    getPinnedItems()
      .then(res => res.json())
      .then(res => this.setState(prev => ({...prev, pinnedItems: res})))
      .catch(err => console.error(err))
  }

  public render() {
    const {searchTerm, onCreate, totalCount, onImportTask} = this.props

    const creater = () => {
      event('Task Created From Dropdown', {source: 'list'})
      onCreate()
    }
    const importer = () => {
      event('Task Imported From Dropdown', {source: 'list'})
      onImportTask()
    }

    return (
      <>
        <ResourceList>
          <ResourceList.Body
            emptyState={
              <EmptyTasksList
                searchTerm={searchTerm}
                onCreate={creater}
                totalCount={totalCount}
                onImportTask={importer}
              />
            }
          >
            {this.rows}
          </ResourceList.Body>
        </ResourceList>
      </>
    )
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
          !!this.state.pinnedItems.find(
            item => item?.metadata[0].taskID === task.id
          )
        }
      />
    ))
  }
}
