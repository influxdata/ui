import {patchTask} from 'src/client'

const removeFlowTasks = (tasks = []) => {
  tasks.forEach(task => {
    patchTask({
      taskID: task.id,
      data: {
        status: 'inactive',
      },
    })
  })
}

export default removeFlowTasks
