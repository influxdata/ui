// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {AutoSizer} from 'react-virtualized'

import {Page, SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'

// Components
import TasksHeader from 'src/tasks/components/TasksHeader'
import TasksList from 'src/tasks/components/TasksList'
import {ErrorHandling} from 'src/shared/decorators/errors'
import {FilterListContainer} from 'src/shared/components/FilterList'
import GetAssetLimits from 'src/cloud/components/GetAssetLimits'
import AssetLimitAlert from 'src/cloud/components/AssetLimitAlert'

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Actions
import {
  updateTaskStatus,
  updateTaskName,
  deleteTask,
  cloneTask,
  addTaskLabel,
  runTask,
} from 'src/tasks/actions/thunks'

import {
  setSearchTerm as setSearchTermAction,
  setShowInactive as setShowInactiveAction,
} from 'src/tasks/actions/creators'

import {checkTaskLimits as checkTasksLimitsAction} from 'src/cloud/actions/limits'

// Types
import {AppState, Task, ResourceType} from 'src/types'
import {RouteComponentProps} from 'react-router-dom'
import {Sort} from '@influxdata/clockface'
import {SortTypes} from 'src/shared/utils/sort'
import {extractTaskLimits} from 'src/cloud/utils/limits'
import {TaskSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getResourcesStatus} from 'src/resources/selectors/getResourcesStatus'

import {getAllTasks} from 'src/tasks/actions/thunks'
import {getLabels} from 'src/labels/actions/thunks'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & RouteComponentProps<{orgID: string}>

interface State {
  isImporting: boolean
  taskLabelsEdit: Task
  sortKey: TaskSortKey
  sortDirection: Sort
  sortType: SortTypes
}

const Filter = FilterListContainer<Task>()

@ErrorHandling
class TasksPage extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      isImporting: false,
      taskLabelsEdit: null,
      sortKey: 'name',
      sortDirection: Sort.Ascending,
      sortType: SortTypes.String,
    }
  }

  public componentDidMount() {
    this.props.getAllTasks()
    this.props.getLabels()

    let sortType: SortTypes = this.state.sortType
    const params = new URLSearchParams(window.location.search)

    let sortKey: TaskSortKey = 'name'
    if (params.get('sortKey') === 'status') {
      sortKey = 'status'
    } else if (params.get('sortKey') === 'latestCompleted') {
      sortKey = 'latestCompleted'
      sortType = SortTypes.Date
    } else if (params.get('sortKey') === 'every') {
      sortKey = 'every'
      sortType = SortTypes.String
    }

    let sortDirection: Sort = this.state.sortDirection
    if (params.get('sortDirection') === Sort.Ascending) {
      sortDirection = Sort.Ascending
    } else if (params.get('sortDirection') === Sort.Descending) {
      sortDirection = Sort.Descending
    }

    let searchTerm: string = ''
    if (params.get('searchTerm') !== null) {
      searchTerm = params.get('searchTerm')
      this.props.setSearchTerm(searchTerm)
    }

    this.setState({sortKey, sortDirection, sortType})
  }

  public render(): JSX.Element {
    const {sortKey, sortDirection, sortType} = this.state
    const {
      checkTaskLimits,
      limitStatus,
      onAddTaskLabel,
      onRunTask,
      remoteDataState,
      searchTerm,
      setSearchTerm,
      setShowInactive,
      showInactive,
      updateTaskName,
    } = this.props

    return (
      <SpinnerContainer
        loading={remoteDataState}
        spinnerComponent={<TechnoSpinner />}
      >
        <Page titleTag={pageTitleSuffixer(['Tasks'])}>
          <TasksHeader
            onCreateTask={this.handleCreateTask}
            onImportTask={this.onHandleOpenImportOverlay}
            setShowInactive={setShowInactive}
            showInactive={showInactive}
            searchTerm={searchTerm}
            setSearchTerm={this.onSetSearchTerm}
            sortKey={sortKey}
            sortDirection={sortDirection}
            sortType={sortType}
            onSort={this.handleSort}
          />
          <Page.Contents fullWidth={true} scrollable={false}>
            <AutoSizer>
              {({width, height}) => {
                return (
                  <GetAssetLimits>
                    <Filter
                      list={this.filteredTasks}
                      searchTerm={searchTerm}
                      searchKeys={['name', 'labels[].name', 'id']}
                    >
                      {ts => (
                        <TasksList
                          pageWidth={width}
                          pageHeight={height}
                          searchTerm={searchTerm}
                          tasks={ts}
                          totalCount={this.totalTaskCount}
                          onActivate={this.handleActivate}
                          onDelete={this.handleDelete}
                          onCreate={this.handleCreateTask}
                          onClone={this.handleClone}
                          onAddTaskLabel={onAddTaskLabel}
                          onRunTask={onRunTask}
                          onFilterChange={setSearchTerm}
                          onUpdate={updateTaskName}
                          sortKey={sortKey}
                          sortDirection={sortDirection}
                          sortType={sortType}
                          checkTaskLimits={checkTaskLimits}
                        />
                      )}
                    </Filter>
                    {this.hiddenTaskAlert}
                    <AssetLimitAlert
                      resourceName="tasks"
                      limitStatus={limitStatus}
                    />
                  </GetAssetLimits>
                )
              }}
            </AutoSizer>
          </Page.Contents>
        </Page>
      </SpinnerContainer>
    )
  }

  private onSetSearchTerm = (searchTerm: string) => {
    const {setSearchTerm} = this.props

    const url = new URL(location.href)
    url.searchParams.set('searchTerm', searchTerm)
    history.replaceState(null, '', url.toString())

    return setSearchTerm(searchTerm)
  }
  private handleSort = (
    sortKey: TaskSortKey,
    sortDirection: Sort,
    sortType: SortTypes
  ) => {
    const url = new URL(location.href)
    url.searchParams.set('sortKey', sortKey)
    url.searchParams.set('sortDirection', sortDirection)
    history.replaceState(null, '', url.toString())

    this.setState({sortKey, sortDirection, sortType})
  }

  private handleActivate = (task: Task) => {
    this.props.updateTaskStatus(task)
  }

  private handleDelete = (task: Task) => {
    this.props.deleteTask(task.id)
  }

  private handleClone = (task: Task) => {
    this.props.cloneTask(task)
  }

  private handleCreateTask = () => {
    const {
      history,
      match: {
        params: {orgID},
      },
    } = this.props

    if (isFlagEnabled('createWithFlows')) {
      history.push(`/notebook/from/task`)
    } else {
      history.push(`/orgs/${orgID}/tasks/new`)
    }
  }

  private onHandleOpenImportOverlay = () => {
    const {
      history,
      match: {
        params: {orgID},
      },
    } = this.props

    history.push(`/orgs/${orgID}/tasks/import`)
  }

  private get filteredTasks(): Task[] {
    const {tasks, showInactive} = this.props
    const matchingTasks = tasks.filter(t => {
      let activeFilter = true
      if (!showInactive) {
        activeFilter = t.status === 'active'
      }

      return activeFilter
    })

    return matchingTasks
  }

  private get totalTaskCount(): number {
    return this.props.tasks.length
  }

  private get hiddenTaskAlert(): JSX.Element {
    const {showInactive, tasks} = this.props

    const hiddenCount = tasks.filter(t => t.status === 'inactive').length

    const allTasksAreHidden = hiddenCount === tasks.length

    if (allTasksAreHidden || showInactive) {
      return null
    }

    if (hiddenCount) {
      const pluralizer = hiddenCount === 1 ? '' : 's'
      const verb = hiddenCount === 1 ? 'is' : 'are'

      return (
        <div className="hidden-tasks-alert">{`${hiddenCount} inactive task${pluralizer} ${verb} hidden from view`}</div>
      )
    }
  }
}

const mstp = (state: AppState) => {
  const {resources} = state
  const {status, searchTerm, showInactive} = resources.tasks

  const remoteDataState = getResourcesStatus(state, [
    ResourceType.Tasks,
    ResourceType.Labels,
  ])

  return {
    tasks: getAll<Task>(state, ResourceType.Tasks),
    status: status,
    searchTerm,
    showInactive,
    limitStatus: extractTaskLimits(state),
    remoteDataState,
  }
}

const mdtp = {
  checkTaskLimits: checkTasksLimitsAction,
  cloneTask,
  deleteTask,
  getAllTasks,
  getLabels,
  onAddTaskLabel: addTaskLabel,
  onRunTask: runTask,
  setSearchTerm: setSearchTermAction,
  setShowInactive: setShowInactiveAction,
  updateTaskName,
  updateTaskStatus,
}

const connector = connect(mstp, mdtp)

export default connector(TasksPage)
