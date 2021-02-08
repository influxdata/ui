import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'
import {
  ComponentSize,
  IconFont,
  TechnoSpinner,
  Dropdown,
} from '@influxdata/clockface'
import {Context} from 'src/flows/pipes/ToBucket/ExportTaskOverlay/context'
import {getAllTasks as getAllTasksSelector} from 'src/resources/selectors'

const TaskDropdown: FC = () => {
  const {handleSetTask, selectedTask} = useContext(Context)

  const tasks = useSelector(getAllTasksSelector)

  let buttonText = 'Loading tasks...'

  let menuItems = (
    <Dropdown.ItemEmpty>
      <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
    </Dropdown.ItemEmpty>
  )

  if (tasks.length) {
    menuItems = (
      <>
        {tasks.map(task => (
          <Dropdown.Item
            key={task.name}
            value={task}
            onClick={task => handleSetTask(task)}
            selected={task.name === selectedTask?.name}
            title={task.name}
            wrapText={true}
          >
            {task.name}
          </Dropdown.Item>
        ))}
      </>
    )
  }

  if (!selectedTask?.name) {
    buttonText = 'Choose a task'
  } else if (selectedTask?.name) {
    buttonText = selectedTask.name
  }

  const button = (active, onClick) => (
    <Dropdown.Button
      onClick={onClick}
      active={active}
      icon={IconFont.Calendar}
      size={ComponentSize.Medium}
    >
      {buttonText}
    </Dropdown.Button>
  )

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
  )

  return <Dropdown button={button} menu={menu} style={{width: '100%'}} />
}

export default TaskDropdown
